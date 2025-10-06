import React, { useState, useEffect } from 'react';
import { useSearchParams } from 'react-router-dom';
import { Search, Filter, Grid, List } from 'lucide-react';
import { getApiBase } from '../../lib/api';
import IconButton from '../ui/IconButton';
import { Input } from '../ui/Input';
import { Badge } from '../ui/Badge';
import type { Image } from '../../types';
import { Button } from '../ui/Button';
import { SEOHead } from '../seo/SEOHead';
import { GallerySchema } from '../seo/StructuredData';
import { Breadcrumb, breadcrumbConfigs } from '../seo/Breadcrumb';
import { gallerySEO, generateCategorySEO } from '../seo/seoConfig';
import { Skeleton } from '../ui/skeleton';

export const GalleryPage: React.FC = () => {
  const [searchParams, setSearchParams] = useSearchParams();
  const [searchQuery, setSearchQuery] = useState(searchParams.get('search') || '');
  const [selectedCategory, setSelectedCategory] = useState(searchParams.get('category') || 'all');
  const [viewMode, setViewMode] = useState<'grid' | 'list'>('grid');
  const [showFilters, setShowFilters] = useState(false);
  const [images, setImages] = useState<Image[]>([]);
  const [categories, setCategories] = useState<any[]>([]);
  const [page, setPage] = useState<number>(parseInt(searchParams.get('page') || '1'));
  const [total, setTotal] = useState<number | null>(null);
  const [isLoading, setIsLoading] = useState(true);
  const LIMIT = 12;

  // Lightweight inline placeholder (SVG) used when thumbnail is missing or fails to load
  const PLACEHOLDER_SVG =
    'data:image/svg+xml;utf8,' +
    `<svg xmlns='http://www.w3.org/2000/svg' viewBox='0 0 400 300'>` +
    `<rect width='100%' height='100%' fill='%23f3f4f6'/>` +
    `<text x='50%' y='50%' dominant-baseline='middle' text-anchor='middle' fill='%23888' font-size='20'>No image</text>` +
    `</svg>`;

  // Resolve a possibly-relative API path to a full URL using getApiBase().
  // This avoids doubling API prefix when thumbnailUrl already contains the /api/v1 prefix.
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

  // Fetch images from backend whenever filters or page change
  useEffect(() => {
    let cancelled = false;

    async function load() {
      try {
        const base = getApiBase();
        const params = new URLSearchParams();
        params.set('page', String(page));
        params.set('limit', String(LIMIT));
        if (selectedCategory && selectedCategory !== 'all') params.set('category', selectedCategory);
        if (searchQuery && searchQuery.trim()) params.set('search', searchQuery.trim());

        const resp = await fetch(`${base}/images?${params.toString()}`);
        if (!resp.ok) throw new Error(`HTTP ${resp.status}`);
        const json = await resp.json();

        if (cancelled) return;

        if (json && json.success) {
          setImages(json.data || []);
          if (json.pagination && typeof json.pagination.total === 'number') {
            setTotal(json.pagination.total);
          } else if (Array.isArray(json.data)) {
            setTotal(null);
          }
        } else {
          setImages([]);
          setTotal(0);
        }
      } catch (err) {
        console.warn('Failed to fetch images', err);
        setImages([]);
        setTotal(0);
      } finally {
        setIsLoading(false);
      }
    }

    load();

    return () => {
      cancelled = true;
    };
  }, [page, selectedCategory, searchQuery]);

  // Derived filtered images (from server) -> show fallback to mockImages
  const filteredImages = images;

  // load categories once
  useEffect(() => {
    let cancelled = false;
    async function loadCats() {
      try {
        const base = getApiBase();
        console.log('Loading categories from:', `${base}/categories`);
        const res = await fetch(`${base}/categories`);
        console.log('Categories response status:', res.status);
        
        if (!res.ok) {
          throw new Error(`HTTP ${res.status}: ${res.statusText}`);
        }
        
        const json = await res.json();
        console.log('Categories response:', json);
        
        if (!cancelled) {
          if (json && json.success && Array.isArray(json.data)) {
            console.log('Setting categories:', json.data);
            // Transform API response to match frontend expectations
            const transformedCategories = json.data.map((cat: any) => ({
              id: String(cat.id), // Convert number to string
              name: cat.name,
              description: cat.description,
              imageCount: cat.image_count || 0, // Map image_count to imageCount
              created_at: cat.created_at
            }));
            setCategories(transformedCategories);
          } else if (json && Array.isArray(json)) {
            // Handle case where API returns array directly
            console.log('Setting categories (direct array):', json);
            const transformedCategories = json.map((cat: any) => ({
              id: String(cat.id),
              name: cat.name,
              description: cat.description,
              imageCount: cat.image_count || 0,
              created_at: cat.created_at
            }));
            setCategories(transformedCategories);
          } else {
            console.warn('Unexpected categories response format:', json);
            setCategories([]);
          }
        }
      } catch (err) {
        console.error('Failed to load categories:', err);
        if (!cancelled) {
          setCategories([]);
        }
      }
    }
    loadCats();
    return () => { cancelled = true };
  }, []);

  const handleSearch = (e: React.FormEvent) => {
    e.preventDefault();
    const params = new URLSearchParams(searchParams);
    if (searchQuery) {
      params.set('search', searchQuery);
    } else {
      params.delete('search');
    }
    params.set('page', '1');
    setSearchParams(params);
    setPage(1);
  };

  const handleCategoryChange = (categoryName: string) => {
    setSelectedCategory(categoryName);
    const params = new URLSearchParams(searchParams);
    if (categoryName !== 'all') {
      params.set('category', categoryName);
    } else {
      params.delete('category');
    }
    params.set('page', '1');
    setSearchParams(params);
    setPage(1);
  };

  const handleDownload = (image: Image) => {
    if (!image.downloadable) return;

    // Resolve the href and only proceed if we have a valid URL
    const href = resolveApiUrl(image.url);
    if (!href) return;

    const link = document.createElement('a');
    link.href = href;
    link.download = `${image.title}.jpg`;
    document.body.appendChild(link);
    link.click();
    document.body.removeChild(link);
  };

  // Generate SEO config based on current filters
  const currentCategory = categories.find(cat => cat.name === selectedCategory);
  const seoConfig = selectedCategory && selectedCategory !== 'all' && currentCategory
    ? generateCategorySEO(currentCategory.name, filteredImages.length)
    : { 
        ...gallerySEO,
        title: searchQuery 
          ? `Search Results for "${searchQuery}" | ${gallerySEO.title}`
          : gallerySEO.title,
        description: searchQuery
          ? `Found ${filteredImages.length} images matching "${searchQuery}". Browse our curated collection of digital art, photography, and creative works.`
          : gallerySEO.description
      };

  // Generate URL for canonical link
  const currentUrl = (() => {
    const params = new URLSearchParams();
    if (selectedCategory && selectedCategory !== 'all') params.set('category', selectedCategory);
    if (searchQuery && searchQuery.trim()) params.set('search', searchQuery.trim());
    if (page > 1) params.set('page', page.toString());
    const queryString = params.toString();
    return `/gallery${queryString ? `?${queryString}` : ''}`;
  })();

  // Generate breadcrumb items
  const breadcrumbItems = (() => {
    if (selectedCategory && selectedCategory !== 'all' && currentCategory) {
      return breadcrumbConfigs.categoryGallery(currentCategory.name);
    }
    if (searchQuery) {
      return breadcrumbConfigs.searchResults(searchQuery);
    }
    return breadcrumbConfigs.gallery;
  })();

  return (
    <>
      <SEOHead 
        {...seoConfig} 
        url={currentUrl}
        tags={searchQuery ? [searchQuery] : undefined}
      />
      <GallerySchema 
        title={seoConfig.title!}
        description={seoConfig.description}
        category={selectedCategory !== 'all' ? selectedCategory : undefined}
        images={filteredImages.map(img => ({
          id: img.id,
          title: img.title,
          imageUrl: resolveApiUrl(img.url || img.imageUrl) || img.url || img.imageUrl || '',
          artist: img.photographer
        }))}
        totalCount={total || filteredImages.length}
      />
      
      <div className="space-y-6">
        <Breadcrumb items={breadcrumbItems} />
        
        {/* Header */}
        <div className="flex flex-col lg:flex-row lg:items-center lg:justify-between gap-4">
        <div>
          <h1 className="text-2xl font-bold text-white">Image Gallery</h1>
          <p className="text-gray-600 mt-1">
            Showing {filteredImages.length}{total ? ` of ${total}` : ''} images
          </p>
        </div>

        {/* View Mode Toggle */}
        <div className="flex items-center space-x-2">
          <Button
            variant={viewMode === 'grid' ? 'default' : 'ghost'}
            size="sm"
            onClick={() => setViewMode('grid')}
            className="touch-manipulation min-h-[44px] min-w-[44px]"
          >
            <Grid className="h-4 w-4" />
          </Button>
          <Button
            variant={viewMode === 'list' ? 'default' : 'ghost'}
            size="sm"
            onClick={() => setViewMode('list')}
            className="touch-manipulation min-h-[44px] min-w-[44px]"
          >
            <List className="h-4 w-4" />
          </Button>
        </div>
      </div>

      {/* Search and Filters */}
      <div className="bg-black/40 backdrop-blur-sm rounded-lg shadow-xl border border-white/10 p-6">
        <div className="flex flex-col lg:flex-row gap-4">
          {/* Search Bar */}
          <form onSubmit={handleSearch} className="flex-1">
            <div className="relative">
              <Search className="absolute left-3 top-1/2 transform -translate-y-1/2 h-4 w-4 text-gray-400" />
              <Input
                type="text"
                placeholder="Search images..."
                value={searchQuery}
                onChange={(e) => setSearchQuery(e.target.value)}
                className="pl-10"
              />
            </div>
          </form>

          {/* Filter Button */}
          <Button
            variant="outline"
            onClick={() => setShowFilters(!showFilters)}
            className="flex items-center space-x-2 touch-manipulation min-h-[44px]"
          >
            <Filter className="h-4 w-4" />
            <span>Filters</span>
          </Button>
        </div>

        {/* Filters Panel */}
        {showFilters && (
          <div className="mt-4 pt-4 border-t">
            <div className="space-y-4">
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-2">
                  Category
                </label>
                <div className="flex flex-wrap gap-2">
                  <button
                    onClick={() => handleCategoryChange('all')}
                    className={`px-3 py-2 rounded-full text-sm font-medium transition-colors touch-manipulation min-h-[44px] ${
                      selectedCategory === 'all'
                        ? 'bg-blue-600 text-white'
                        : 'bg-gray-100 text-gray-700 hover:bg-gray-200'
                    }`}
                  >
                    All
                  </button>
                  {categories.map((category) => (
                    <button
                      key={category.id}
                      onClick={() => handleCategoryChange(category.name)}
                      className={`px-3 py-2 rounded-full text-sm font-medium transition-colors touch-manipulation min-h-[44px] ${
                        selectedCategory === category.name
                          ? 'bg-blue-600 text-white'
                          : 'bg-black/30 text-gray-300 hover:bg-black/50 border border-white/10'
                      }`}
                    >
                      {category.name} ({category.imageCount})
                    </button>
                  ))}
                </div>
              </div>
            </div>
          </div>
        )}
      </div>

      {/* Images Grid/List */}
      <div className={
        viewMode === 'grid'
          ? 'grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4 gap-6'
          : 'space-y-4'
      }>
        {isLoading ? (
          // Skeleton loading state
          Array.from({ length: 12 }).map((_, index) => (
            <div
              key={`skeleton-${index}`}
              className={
                viewMode === 'grid'
                  ? 'bg-black/40 backdrop-blur-sm rounded-lg shadow-xl border border-white/10 overflow-hidden'
                  : 'flex bg-black/40 backdrop-blur-sm rounded-lg shadow-xl border border-white/10 overflow-hidden'
              }
            >
              {/* Image Skeleton */}
              <div 
                className={`relative ${viewMode === 'grid' ? 'aspect-w-1 aspect-h-1' : 'w-48 flex-shrink-0'}`}
              >
                <Skeleton className={`${viewMode === 'grid' ? 'w-full h-48' : 'w-full h-32'}`} />
              </div>

              {/* Content Skeleton */}
              <div className={`p-4 ${viewMode === 'list' ? 'flex-1 flex flex-col justify-between' : ''}`}>
                <div>
                  <Skeleton className="h-4 w-3/4 mb-2" />
                  {viewMode === 'list' && <Skeleton className="h-3 w-full mb-2" />}
                  <div className="flex gap-1 mb-2">
                    <Skeleton className="h-5 w-16" />
                    <Skeleton className="h-5 w-12" />
                  </div>
                  <Skeleton className="h-3 w-1/2" />
                </div>
                {viewMode === 'list' && (
                  <div className="mt-3 pt-3 border-t border-white/10">
                    <Skeleton className="h-8 w-full" />
                  </div>
                )}
              </div>
            </div>
          ))
        ) : (
          // Actual images
          filteredImages.map((image) => (
            <div
              key={image.id}
              className={
                viewMode === 'grid'
                  ? 'group bg-black/40 backdrop-blur-sm rounded-lg shadow-xl border border-white/10 overflow-hidden hover:shadow-2xl transition-all duration-300'
                  : 'flex bg-black/40 backdrop-blur-sm rounded-lg shadow-xl border border-white/10 overflow-hidden hover:shadow-2xl transition-all duration-300'
              }
            >
              {/* Image */}
              <div 
                className={`relative cursor-pointer ${viewMode === 'grid' ? 'aspect-w-1 aspect-h-1' : 'w-48 flex-shrink-0'}`}
                onClick={() => window.location.href = `/image/${image.id}`}
              >
                <img
                  src={resolveApiUrl(image.thumbnailUrl) || PLACEHOLDER_SVG}
                  alt={image.title}
                  onError={(e) => {
                    try {
                      (e.currentTarget as HTMLImageElement).src = PLACEHOLDER_SVG;
                    } catch (err) {
                      // ignore
                    }
                  }}
                  className={`
                    object-cover group-hover:scale-105 transition-transform duration-300
                    ${viewMode === 'grid' ? 'w-full h-48' : 'w-full h-32'}
                  `}
                />
                
                {/* Action Buttons Overlay - Always positioned in top-right */}
                <div className={`absolute top-2 right-2 flex space-x-1 transition-opacity duration-200 ${
                  viewMode === 'list' 
                    ? 'opacity-100' 
                    : 'opacity-0 group-hover:opacity-100'
                }`}>
                  <IconButton to={`/image/${image.id}`} ariaLabel="view image">
                    <svg className="h-4 w-4" viewBox="0 0 24 24" fill="white" xmlns="http://www.w3.org/2000/svg" aria-hidden="true">
                      <path d="M12 5C7 5 3 9 3 12s4 7 9 7 9-4 9-7-4-7-9-7zm0 9a2 2 0 1 1 0-4 2 2 0 0 1 0 4z" />
                    </svg>
                  </IconButton>
                  {image.downloadable && (
                    <IconButton ariaLabel="download" onClick={() => handleDownload(image)}>
                      <svg className="h-4 w-4" viewBox="0 0 24 24" fill="white" xmlns="http://www.w3.org/2000/svg" aria-hidden="true">
                        <path d="M12 16l-4-4h3V4h2v8h3l-4 4z" />
                        <path d="M20 18v2H4v-2h16z" />
                      </svg>
                    </IconButton>
                  )}
                </div>
              </div>

              {/* Content */}
              <div className={`p-4 ${viewMode === 'list' ? 'flex-1 flex flex-col justify-between' : ''}`}>
                <div>
                  <div className="mb-2">
                    <h3 className="font-semibold text-white truncate">{image.title}</h3>
                  </div>

                {viewMode === 'list' && image.description && (
                  <p className="text-sm text-gray-600 mb-2 line-clamp-2">
                    {image.description}
                  </p>
                )}

                <div className="flex flex-wrap gap-1 mb-2">
                  <Badge variant="secondary" className="text-xs">
                    {categories.find(cat => cat.id === image.category)?.name}
                  </Badge>
                  {image.tags.slice(0, 2).map((tag) => (
                    <Badge key={tag} variant="outline" className="text-xs">
                      {tag}
                    </Badge>
                  ))}
                </div>

                  <div className="text-xs text-gray-500">
                    {image.photographer && <span>by {image.photographer}</span>}
                    {image.width && image.height && (
                      <span className="ml-2">
                        {image.width}×{image.height}
                      </span>
                    )}
                  </div>
                </div>
                
                {/* View Details Button for List View */}
                {viewMode === 'list' && (
                  <div className="mt-3 pt-3 border-t border-white/10">
                    <Button 
                      variant="outline" 
                      size="sm" 
                      onClick={(e) => {
                        e.stopPropagation();
                        window.location.href = `/image/${image.id}`;
                      }}
                      className="w-full text-xs"
                    >
                      View Details
                    </Button>
                  </div>
                )}
              </div>
            </div>
          ))
        )}
      </div>

      {/* Empty State */}
      {filteredImages.length === 0 && (
        <div className="text-center py-12">
          <div className="text-gray-400 mb-4">
            <Search className="h-12 w-12 mx-auto" />
          </div>
          <h3 className="text-lg font-medium text-gray-900 mb-2">No images found</h3>
          <p className="text-gray-600">
            Try adjusting your search terms or filters to find what you're looking for.
          </p>
        </div>
      )}
      {/* Pagination controls */}
      <div className="flex items-center justify-center space-x-4 mt-6">
        <Button
          variant="outline"
          onClick={() => setPage((p) => Math.max(1, p - 1))}
          disabled={page <= 1}
          className="touch-manipulation min-h-[44px] px-4"
        >
          Prev
        </Button>

        <div className="text-sm text-gray-700 px-4 py-2 bg-black/20 rounded-lg">
          Page {page}{total ? ` of ${Math.max(1, Math.ceil(total / LIMIT))}` : ''}
        </div>

        <Button
          variant="outline"
          onClick={() => setPage((p) => p + 1)}
          disabled={total !== null && page >= Math.ceil(total / LIMIT)}
          className="touch-manipulation min-h-[44px] px-4"
        >
          Next
        </Button>
      </div>
    </div>
    </>
  );
};