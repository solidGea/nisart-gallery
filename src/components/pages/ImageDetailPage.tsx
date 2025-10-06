import React from 'react';
import { useParams, Link, useNavigate } from 'react-router-dom';
import { ArrowLeft, Download, Share2, Calendar, Camera, Maximize, X } from 'lucide-react';
import { format } from 'date-fns';
import { getApiBase } from '../../lib/api';
import { Button } from '../ui/Button';
import { Badge } from '../ui/Badge';
import {
  Dialog,
  DialogContent,
  DialogTrigger,
} from '../ui/dialog';
import { SEOHead } from '../seo/SEOHead';
import { ArtworkSchema } from '../seo/StructuredData';
import { Breadcrumb, breadcrumbConfigs } from '../seo/Breadcrumb';
import { generateImageSEO } from '../seo/seoConfig';
import { OptimizedImage } from '../ui/OptimizedImage';

export const ImageDetailPage: React.FC = () => {
  const { id } = useParams<{ id: string }>();
  const navigate = useNavigate();
  
  console.log('ImageDetailPage rendered with ID:', id);
  
  const [image, setImage] = React.useState<any | null>(null);
  const [isLoading, setIsLoading] = React.useState<boolean>(true);
  const [errorMessage, setErrorMessage] = React.useState<string | null>(null);
  const [relatedImages, setRelatedImages] = React.useState<any[]>([]);
  const [isModalOpen, setIsModalOpen] = React.useState(false);
  const mountedRef = React.useRef(true);
  
  // Resolve a possibly-relative API path to a full URL using getApiBase().
  // This avoids doubling API prefix when imageUrl already contains the /api/v1 prefix.
  const resolveApiUrl = (u?: string | null) => {
    if (!u) return undefined;
    if (u.startsWith('http')) return u;

    const base = getApiBase().replace(/\/$/, '');

    // If the URL already begins with the base, return as-is
    if (u.startsWith(base)) return u;

    // If both base and u include the API prefix (/api/v1), avoid doubling it.
    const apiPrefix = '/api/v1';
    if (base.endsWith(apiPrefix) && u.startsWith(apiPrefix)) {
      return base + u.replace(apiPrefix, '');
    }

    // Otherwise join cleanly
    if (u.startsWith('/')) return base + u;
    return base + '/' + u;
  };
  
  // Handle keyboard events for modal
  React.useEffect(() => {
    const handleKeyDown = (event: KeyboardEvent) => {
      if (event.key === 'Escape' && isModalOpen) {
        setIsModalOpen(false);
      }
    };

    if (isModalOpen) {
      document.addEventListener('keydown', handleKeyDown);
      // Prevent body scroll when modal is open
      document.body.style.overflow = 'hidden';
    }

    return () => {
      document.removeEventListener('keydown', handleKeyDown);
      document.body.style.overflow = 'unset';
    };
  }, [isModalOpen]);
  const PLACEHOLDER_SVG =
    'data:image/svg+xml;utf8,' +
    `<svg xmlns='http://www.w3.org/2000/svg' viewBox='0 0 400 300'>` +
    `<rect width='100%' height='100%' fill='%23f3f4f6'/>` +
    `<text x='50%' y='50%' dominant-baseline='middle' text-anchor='middle' fill='%23888' font-size='18'>No image</text>` +
    `</svg>`;

  // Safely parse the image date for formatting - MOVED TO TOP TO FIX HOOKS VIOLATION
  const parsedDate = React.useMemo(() => {
    if (!image || !image.dateCreated) return null;
    const d = new Date(image.dateCreated);
    if (Number.isNaN(d.getTime())) return null;
    return d;
  }, [image]);

  // Keep a mounted ref to avoid setting state after unmount
  React.useEffect(() => {
    mountedRef.current = true;
    return () => { mountedRef.current = false; };
  }, []);

  const fetchImage = React.useCallback(async () => {
    if (!id) {
      console.log('No ID provided');
      return;
    }
    try {
      const base = getApiBase();
      console.log('API Base:', base);
      console.log('Fetching image with ID:', id);
      console.log('Full URL:', `${base}/images/${id}`);
      
      if (mountedRef.current) {
        setIsLoading(true);
        setErrorMessage(null);
      }

      const res = await fetch(`${base}/images/${id}`);
      console.log('Response status:', res.status);
      const json = await res.json().catch(() => null);
      console.log('Response JSON:', json);

      // Handle non-200 or server error messages gracefully
      if (!res.ok) {
        const msg = json && json.message ? String(json.message) : `Server returned ${res.status}`;
        if (mountedRef.current) setErrorMessage(msg);
        return;
      }

      if (json && json.success) {
        if (mountedRef.current) {
          // Transform the API response to match component expectations
          const transformedImage = {
            ...json.data,
            // Map field names to component expectations
            dateCreated: json.data.created_at,
            downloadable: Boolean(json.data.downloadable),
            // Create size object from individual fields
            size: {
              width: json.data.width,
              height: json.data.height,
              fileSize: json.data.file_size
            },
            // Construct full URL - extract domain from base to avoid double /api/v1
            url: json.data.url.startsWith('http') 
              ? json.data.url 
              : `${base.replace('/api/v1', '')}${json.data.url}`,
            // Use the provided thumbnailUrl from API
            thumbnailUrl: json.data.thumbnailUrl 
              ? (json.data.thumbnailUrl.startsWith('http') 
                 ? json.data.thumbnailUrl 
                 : `${base.replace('/api/v1', '')}${json.data.thumbnailUrl}`)
              : undefined
          };
          console.log('Transformed image:', transformedImage);
          setImage(transformedImage);
          setErrorMessage(null);
        }
      } else if (json && !json.success && json.message) {
        console.log('API returned error:', json.message);
        if (mountedRef.current) setErrorMessage(String(json.message));
      } else {
        console.log('Unexpected response format:', json);
        if (mountedRef.current) setErrorMessage('Unexpected response format');
      }
    } catch (err) {
      console.error('Failed to fetch image:', err);
      if (mountedRef.current) setErrorMessage('Failed to fetch image. Please check your connection.');
    } finally {
      console.log('Setting loading to false');
      if (mountedRef.current) setIsLoading(false);
    }
  }, [id]);

  React.useEffect(() => {
    fetchImage();
  }, [fetchImage]);

  // Handle missing ID case after all hooks are defined
  if (!id) {
    return (
      <div className="text-center py-12 text-black bg-red-200 min-h-screen">
        <div>DEBUG: No ID in URL params!</div>
        <div>URL Params: {JSON.stringify({id})}</div>
      </div>
    );
  }

  // Fetch related images when image is loaded
  React.useEffect(() => {
    let cancelled = false;
    async function loadRelated() {
      if (!image || !image.category) return;
      try {
        const base = getApiBase();
        const res = await fetch(`${base}/images?category=${encodeURIComponent(image.category)}&limit=8`);
        const json = await res.json();
        if (!cancelled && json && json.success) {
          const others = (json.data || []).filter((i: any) => i.id !== image.id).slice(0, 4);
          // Transform related images to match expected structure
          const transformedRelated = others.map((img: any) => ({
            ...img,
            thumbnailUrl: img.thumbnailUrl 
              ? (img.thumbnailUrl.startsWith('http') 
                 ? img.thumbnailUrl 
                 : `${base.replace('/api/v1', '')}${img.thumbnailUrl}`)
              : undefined
          }));
          setRelatedImages(transformedRelated);
        }
      } catch (err) {
        console.error('Failed to fetch related images', err);
      }
    }
    loadRelated();
    return () => { cancelled = true; };
  }, [image]);
  
  if (isLoading) {
    return (
      <div className="text-center py-16 text-white bg-black/20 backdrop-blur-sm min-h-screen">
        <div>DEBUG: Loading state - ID: {id}</div>
        <div
          role="status"
          aria-label="Loading"
          className="mx-auto mb-4 w-12 h-12 rounded-full border-4 border-gray-300 border-t-blue-600 animate-spin"
        />
        <div className="text-lg font-medium">Loading image…</div>
      </div>
    );
  }

  if (errorMessage) {
    return (
      <div className="text-center py-12 text-white bg-black/20 backdrop-blur-sm min-h-screen">
        <div>DEBUG: Error state - ID: {id}</div>
        <h1 className="text-2xl font-bold mb-4">Server Error</h1>
        <p className="text-red-300 mb-6" role="alert" aria-live="polite">{errorMessage}</p>
        <div className="flex items-center justify-center space-x-3">
          <Button onClick={() => fetchImage()}>Retry</Button>
          <Link to="/gallery">
            <Button variant="outline">Back to Gallery</Button>
          </Link>
        </div>
      </div>
    );
  }

  if (!image) {
    return (
      <div className="text-center py-12 text-white bg-black/20 backdrop-blur-sm min-h-screen">
        <div>DEBUG: No image state - ID: {id}, Loading: {isLoading}, Error: {errorMessage}</div>
        <h1 className="text-2xl font-bold mb-4">Image Not Found</h1>
        <p className="text-gray-300 mb-6">The image you're looking for doesn't exist.</p>
        <Link to="/gallery">
          <Button>Back to Gallery</Button>
        </Link>
      </div>
    );
  }

  // prev/next navigation removed - data now comes from backend

  const handleDownload = () => {
    if (image.downloadable) {
      const link = document.createElement('a');
      link.href = image.url;
      link.download = `${image.title}.jpg`;
      document.body.appendChild(link);
      link.click();
      document.body.removeChild(link);
    }
  };

  const handleShare = async () => {
    if (navigator.share) {
      try {
        await navigator.share({
          title: image.title,
          text: image.description,
          url: window.location.href,
        });
      } catch (err) {
        console.log('Error sharing:', err);
      }
    } else {
      // Fallback: copy to clipboard
      navigator.clipboard.writeText(window.location.href);
      alert('Link copied to clipboard!');
    }
  };

  const formatFileSize = (bytes: number) => {
    const sizes = ['Bytes', 'KB', 'MB', 'GB'];
    if (bytes === 0) return '0 Bytes';
    const i = Math.floor(Math.log(bytes) / Math.log(1024));
    return Math.round(bytes / Math.pow(1024, i) * 100) / 100 + ' ' + sizes[i];
  };

  // Generate SEO configuration
  const seoConfig = generateImageSEO(image);
  const breadcrumbItems = breadcrumbConfigs.imageDetail(image.title, image.id);

  return (
    <>
      <SEOHead 
        {...seoConfig}
        url={`/image/${id}`}
        image={resolveApiUrl(image.url)}
        publishedTime={image.created_at || image.createdAt}
        author={image.photographer}
        tags={image.tags}
      />
      <ArtworkSchema 
        id={image.id}
        title={image.title}
        description={image.description}
        imageUrl={resolveApiUrl(image.url)!}
        artist={image.photographer ? { name: image.photographer } : undefined}
        category={image.category}
        tags={image.tags}
        uploadDate={image.created_at || image.createdAt}
        width={image.width}
        height={image.height}
        fileSize={image.file_size}
      />
      
      <div className="space-y-6">
        <Breadcrumb items={breadcrumbItems} />
        
        {/* Navigation Header */}
        <div className="flex items-center justify-between">
        <Button
          variant="ghost"
          onClick={() => navigate(-1)}
          className="flex items-center space-x-2"
        >
          <ArrowLeft className="h-4 w-4" />
          <span>Back</span>
        </Button>
        <div />
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-3 gap-8">
        {/* Main Image */}
        <div className="lg:col-span-2">
          <div className="bg-gradient-to-br from-black/60 to-black/20 backdrop-blur-sm rounded-2xl shadow-2xl border border-white/20 overflow-hidden">
            {/* Image Header */}
            <div className="p-4 border-b border-white/10">
              <h1 className="text-2xl font-bold text-white mb-1">{image.title}</h1>
              {image.description && (
                <p className="text-gray-300 text-sm leading-relaxed">{image.description}</p>
              )}
              
              {/* Tags */}
              {(image.tags && image.tags.length > 0) && (
                <div className="flex flex-wrap gap-2 mt-3">
                  {image.tags.map((tag: string) => (
                    <Badge key={tag} variant="secondary" className="bg-white/10 text-white border-white/20 hover:bg-white/20 transition-colors">
                      #{tag}
                    </Badge>
                  ))}
                </div>
              )}
            </div>
            
            <div className="relative group">
              <OptimizedImage
                src={image.url}
                title={image.title}
                artist={image.photographer || image.artist?.name}
                category={image.category}
                tags={image.tags}
                className="w-full h-auto max-h-[65vh] object-contain bg-gradient-to-br from-gray-900/50 to-black/50"
              />
              
              {/* Image Actions Overlay */}
              <div className="absolute inset-0 bg-black/0 group-hover:bg-black/10 transition-all duration-300">
                <div className="absolute top-4 right-4 opacity-0 group-hover:opacity-100 transition-all duration-300 transform translate-y-2 group-hover:translate-y-0">
                  <div className="flex space-x-3">
                    <button
                      onClick={handleShare}
                      className="bg-black/70 backdrop-blur-sm border border-white/20 rounded-lg p-3 hover:bg-black/80 transition-all duration-200 hover:scale-105"
                      aria-label="Share image"
                    >
                      <Share2 className="h-5 w-5 text-white" />
                    </button>
                    <Dialog open={isModalOpen} onOpenChange={setIsModalOpen}>
                      <DialogTrigger asChild>
                        <button
                          className="bg-black/70 backdrop-blur-sm border border-white/20 rounded-lg p-3 hover:bg-black/80 transition-all duration-200 hover:scale-105"
                          aria-label="Open full size"
                        >
                          <Maximize className="h-5 w-5 text-white" />
                        </button>
                      </DialogTrigger>
                      <DialogContent className="max-w-[95vw] max-h-[95vh] w-fit h-fit p-0 border-0 bg-black/95 backdrop-blur-sm">
                        <div className="relative flex items-center justify-center min-h-[50vh]">
                          {/* Close button */}
                          <button
                            onClick={() => setIsModalOpen(false)}
                            className="absolute top-4 right-4 z-10 bg-black/70 backdrop-blur-sm border border-white/20 rounded-lg p-2 hover:bg-black/80 transition-all duration-200 hover:scale-105"
                            aria-label="Close modal"
                          >
                            <X className="h-5 w-5 text-white" />
                          </button>
                          
                          {/* Full-size image */}
                          <img
                            src={image.url}
                            alt={image.title}
                            className="max-w-full max-h-[90vh] object-contain"
                            style={{ maxWidth: '90vw', maxHeight: '90vh' }}
                          />
                          
                          {/* Image info overlay */}
                          <div className="absolute bottom-4 left-4 right-4 bg-black/70 backdrop-blur-sm border border-white/20 rounded-lg p-4">
                            <h3 className="text-lg font-semibold text-white mb-1">{image.title}</h3>
                            {image.description && (
                              <p className="text-gray-300 text-sm">{image.description}</p>
                            )}
                            <div className="flex items-center justify-between mt-2">
                              <div className="text-xs text-gray-400">
                                {image.width || image.size?.width} × {image.height || image.size?.height} pixels
                              </div>
                              {image.downloadable && (
                                <button
                                  onClick={handleDownload}
                                  className="bg-gradient-to-r from-purple-600 to-pink-600 hover:from-purple-700 hover:to-pink-700 transition-all duration-200 rounded-lg px-3 py-1 flex items-center space-x-2 text-sm"
                                >
                                  <Download className="h-4 w-4 text-white" />
                                  <span className="text-white font-medium">Download</span>
                                </button>
                              )}
                            </div>
                          </div>
                        </div>
                      </DialogContent>
                    </Dialog>
                  </div>
                </div>
                
                {/* Download Button - Bottom Left */}
                {image.downloadable && (
                  <div className="absolute bottom-4 left-4 opacity-0 group-hover:opacity-100 transition-all duration-300 transform translate-y-2 group-hover:translate-y-0">
                    <button
                      onClick={handleDownload}
                      className="bg-gradient-to-r from-purple-600 to-pink-600 backdrop-blur-sm border border-purple-400/30 rounded-lg px-4 py-3 hover:from-purple-700 hover:to-pink-700 transition-all duration-200 hover:scale-105 flex items-center space-x-2"
                    >
                      <Download className="h-5 w-5 text-white" />
                      <span className="text-white font-medium">Download</span>
                    </button>
                  </div>
                )}
              </div>
            </div>
          </div>
        </div>

        {/* Image Information */}
        <div className="space-y-6">
          {/* Creator Information */}
          <div className="bg-gradient-to-br from-black/60 to-black/30 backdrop-blur-sm rounded-xl shadow-2xl border border-white/20 p-6">
            <div className="flex items-center space-x-2 mb-4">
              <div className="w-8 h-8 bg-gradient-to-br from-purple-500 to-pink-500 rounded-lg flex items-center justify-center">
                <Camera className="h-4 w-4 text-white" />
              </div>
              <h3 className="text-lg font-semibold text-white">Creator</h3>
            </div>
            
            <div className="space-y-4">
              {/* Uploader */}
              <div className="flex items-center space-x-4 p-3 bg-black/20 rounded-lg border border-white/10">
                <div className="w-10 h-10 flex items-center justify-center">
                  {image.uploader?.profile_picture ? (
                    <img 
                      src={image.uploader.profile_picture} 
                      alt={image.uploader.name}
                      className="w-10 h-10 rounded-full border-2 border-purple-500/50"
                    />
                  ) : (
                    <div className="w-10 h-10 bg-gradient-to-br from-gray-600 to-gray-700 rounded-full flex items-center justify-center border-2 border-gray-500/50">
                      <span className="text-sm font-semibold text-gray-200">
                        {image.uploader?.name?.charAt(0)?.toUpperCase() || '?'}
                      </span>
                    </div>
                  )}
                </div>
                <div className="flex-1">
                  <div className="text-xs font-medium text-gray-400 uppercase tracking-wider">Uploaded by</div>
                  <div className="text-base font-semibold text-white">
                    {image.uploader?.name || 'Unknown User'}
                  </div>
                </div>
              </div>

              {/* Photographer (if different) */}
              {image.photographer && image.photographer !== image.uploader?.name && (
                <div className="flex items-center space-x-4 p-3 bg-black/20 rounded-lg border border-white/10">
                  <div className="w-10 h-10 bg-gradient-to-br from-blue-600 to-blue-700 rounded-full flex items-center justify-center">
                    <Camera className="h-5 w-5 text-white" />
                  </div>
                  <div className="flex-1">
                    <div className="text-xs font-medium text-gray-400 uppercase tracking-wider">Photographer</div>
                    <div className="text-base font-semibold text-white">{image.photographer}</div>
                  </div>
                </div>
              )}
            </div>
          </div>

          {/* Image Details */}
          <div className="bg-gradient-to-br from-black/60 to-black/30 backdrop-blur-sm rounded-xl shadow-2xl border border-white/20 p-6">
            <div className="flex items-center space-x-2 mb-4">
              <div className="w-8 h-8 bg-gradient-to-br from-blue-500 to-cyan-500 rounded-lg flex items-center justify-center">
                <Maximize className="h-4 w-4 text-white" />
              </div>
              <h3 className="text-lg font-semibold text-white">Image Details</h3>
            </div>

            <div className="grid grid-cols-1 gap-4">
              {/* Dimensions & File Size */}
              {image.size && (
                <div className="grid grid-cols-2 gap-4">
                  <div className="bg-black/20 rounded-lg p-4 border border-white/10">
                    <div className="text-xs font-medium text-gray-400 uppercase tracking-wider mb-1">Dimensions</div>
                    <div className="text-lg font-bold text-white">{image.width || image.size?.width} × {image.height || image.size?.height}</div>
                    <div className="text-xs text-gray-300">pixels</div>
                  </div>
                  <div className="bg-black/20 rounded-lg p-4 border border-white/10">
                    <div className="text-xs font-medium text-gray-400 uppercase tracking-wider mb-1">File Size</div>
                    <div className="text-lg font-bold text-white">{formatFileSize(image.file_size || image.size?.fileSize)}</div>
                    <div className="text-xs text-gray-300">compressed</div>
                  </div>
                </div>
              )}

              {/* Date & Category */}
              <div className="grid grid-cols-2 gap-4">
                <div className="bg-black/20 rounded-lg p-4 border border-white/10">
                  <div className="flex items-center space-x-2 mb-2">
                    <Calendar className="h-4 w-4 text-gray-400" />
                    <div className="text-xs font-medium text-gray-400 uppercase tracking-wider">Upload</div>
                  </div>
                  <div className="text-sm font-semibold text-white">
                    {parsedDate ? format(parsedDate, 'MMM d, yyyy') : 'Unknown'}
                  </div>
                  {parsedDate && (
                    <div className="text-xs text-gray-300">
                      {format(parsedDate, 'h:mm a')}
                    </div>
                  )}
                </div>
                <div className="bg-black/20 rounded-lg p-4 border border-white/10">
                  <div className="text-xs font-medium text-gray-400 uppercase tracking-wider mb-2">Category</div>
                  <div className="inline-flex items-center px-3 py-1 bg-gradient-to-r from-purple-500/20 to-pink-500/20 border border-purple-500/30 rounded-full">
                    <div className="text-sm font-semibold text-purple-200 capitalize">{image.category}</div>
                  </div>
                </div>
              </div>

              {/* Download Status */}
              <div className="bg-black/20 rounded-lg p-4 border border-white/10">
                <div className="flex items-center justify-between">
                  <div>
                    <div className="text-xs font-medium text-gray-400 uppercase tracking-wider mb-1">Download</div>
                    <div className="text-sm font-semibold text-white">
                      {image.downloadable ? 'Available' : 'Not Available'}
                    </div>
                  </div>
                  <div className={`w-3 h-3 rounded-full ${image.downloadable ? 'bg-green-500' : 'bg-red-500'}`}></div>
                </div>
              </div>
            </div>
          </div>

          {/* Related Images */}
          <div className="bg-gradient-to-br from-black/60 to-black/30 backdrop-blur-sm rounded-xl shadow-2xl border border-white/20 p-6">
            <h3 className="text-lg font-semibold text-white mb-4 flex items-center space-x-2">
              <div className="w-6 h-6 bg-gradient-to-br from-indigo-500 to-purple-500 rounded-lg"></div>
              <span>More from this category</span>
            </h3>
            <div className="grid grid-cols-2 gap-4">
              {relatedImages.map((relatedImage: any) => (
                <Link
                  key={relatedImage.id}
                  to={`/image/${relatedImage.id}`}
                  className="group block relative aspect-square overflow-hidden rounded-lg border border-white/10 bg-black/20 hover:border-purple-500/50 transition-all duration-200"
                >
                  <img
                    src={relatedImage.thumbnailUrl || PLACEHOLDER_SVG}
                    alt={relatedImage.title}
                    onError={(e) => (e.currentTarget as HTMLImageElement).src = PLACEHOLDER_SVG}
                    className="w-full h-full object-cover group-hover:scale-110 transition-transform duration-300"
                  />
                  <div className="absolute inset-0 bg-gradient-to-t from-black/60 via-transparent to-transparent opacity-0 group-hover:opacity-100 transition-opacity duration-200">
                    <div className="absolute bottom-2 left-2 right-2">
                      <div className="text-white text-xs font-medium truncate">{relatedImage.title}</div>
                    </div>
                  </div>
                </Link>
              ))}
            </div>
          </div>
        </div>
      </div>
    </div>
    </>
  );
};