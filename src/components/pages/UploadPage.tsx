import React, { useState, useCallback, useEffect } from 'react';
import { Upload as UploadIcon, X, Image as ImageIcon, CheckCircle, AlertCircle } from 'lucide-react';
import { Button } from '../ui/Button';
import { Input } from '../ui/Input';
import { Badge } from '../ui/Badge';
import { 
  validateFile, 
  createImagePreview, 
  formatFileSize, 
  generateImageId,
  ALLOWED_EXTENSIONS,
  MAX_FILE_SIZE 
} from '../../utils/fileUpload';
import { UploadService } from '../../services/uploadService';
import type { UploadProgress } from '../../services/uploadService';
import { toast } from 'sonner';
import { SuccessAnimation } from '../ui/Confetti';
import { SEOHead } from '../seo/SEOHead';
import { Breadcrumb, breadcrumbConfigs } from '../seo/Breadcrumb';
import { uploadSEO } from '../seo/seoConfig';
import { getApiBase } from '../../lib/api';

interface UploadedFile {
  id: string;
  file: File;
  preview: string;
  title: string;
  description: string;
  tags: string[];
  category: string;
  status: 'ready' | 'uploading' | 'success' | 'error' | 'removing';
  error?: string;
  progress?: number;
  uploadedImageId?: string;
}

export const UploadPage: React.FC = () => {
  const [uploadedFiles, setUploadedFiles] = useState<UploadedFile[]>([]);
  const [isDragging, setIsDragging] = useState(false);
  const [showCelebration, setShowCelebration] = useState(false);
  const [categories, setCategories] = useState<any[]>([]);

  // Load categories from API
  useEffect(() => {
    const loadCategories = async () => {
      try {
        const base = getApiBase();
        const response = await fetch(`${base}/categories`);
        
        if (response.ok) {
          const data = await response.json();
          if (data.success && Array.isArray(data.data)) {
            setCategories(data.data);
          } else if (Array.isArray(data)) {
            setCategories(data);
          }
        }
      } catch (error) {
        console.error('Failed to load categories:', error);
        // Fallback to static categories if API fails
        setCategories([
          { id: 1, name: 'Traditional' },
          { id: 2, name: 'Digital' }         
        ]);
      }
    };
    
    loadCategories();
  }, []);

  // Get default category (first available or fallback)
  const getDefaultCategory = () => {
    return categories.length > 0 ? categories[0].name : 'nature';
  };

  const handleDragOver = useCallback((e: React.DragEvent) => {
    e.preventDefault();
    setIsDragging(true);
  }, []);

  const handleDragLeave = useCallback((e: React.DragEvent) => {
    e.preventDefault();
    setIsDragging(false);
  }, []);

  const handleDrop = useCallback(async (e: React.DragEvent) => {
    e.preventDefault();
    setIsDragging(false);
    
    const files = Array.from(e.dataTransfer.files);
    await processFiles(files);
  }, []);

  const handleFileSelect = useCallback(async (e: React.ChangeEvent<HTMLInputElement>) => {
    const files = Array.from(e.target.files || []);
    await processFiles(files);
    // Reset input
    e.target.value = '';
  }, []);

  const processFiles = async (files: File[]) => {
    for (const file of files) {
      const validation = validateFile(file);
      const id = generateImageId();

      if (!validation.isValid) {
        setUploadedFiles(prev => [...prev, {
          id,
          file,
          preview: '',
          title: file.name.split('.')[0],
          description: '',
          tags: [],
          category: getDefaultCategory(),
          status: 'error',
          error: validation.error
        }]);
        continue;
      }

      try {
        const preview = await createImagePreview(file);
        const newFile = {
          id,
          file,
          preview,
          title: file.name.split('.')[0],
          description: '',
          tags: [],
          category: getDefaultCategory(),
          status: 'ready' as const
        };
        
        setUploadedFiles(prev => [...prev, newFile]);

        // File is ready for upload - user can edit metadata and then upload
      } catch (error) {
        setUploadedFiles(prev => [...prev, {
          id,
          file,
          preview: '',
          title: file.name.split('.')[0],
          description: '',
          tags: [],
          category: getDefaultCategory(),
          status: 'error',
          error: 'Failed to process image'
        }]);
      }
    }
  };

  const uploadSingleFileImmediate = async (uploadedFile: UploadedFile) => {
    const id = uploadedFile.id;
    
    // Set status to uploading
    setUploadedFiles(prev => 
      prev.map(f => f.id === id ? { ...f, status: 'uploading' as const, progress: 0 } : f)
    );
    
    try {
      // Progress tracking
      const onProgress = (progress: UploadProgress) => {
        setUploadedFiles(prev => 
          prev.map(f => f.id === id ? { ...f, progress: progress.percentage } : f)
        );
      };

      // Upload the file
      const response = await UploadService.uploadImagesWithProgress(
        [uploadedFile.file],
        [{
          title: uploadedFile.title,
          description: uploadedFile.description,
          tags: uploadedFile.tags,
          category: uploadedFile.category
        }],
        onProgress
      );

      if (response.success && response.data?.uploadedImages?.length) {
        // Upload successful
        const uploadedImage = response.data.uploadedImages[0];
        setUploadedFiles(prev => 
          prev.map(f => f.id === id ? { 
            ...f, 
            status: 'success' as const,
            progress: 100,
            uploadedImageId: uploadedImage.id
          } : f)
        );

        // Show success toast
        toast.success("🎉 Upload successful!", {
          description: `"${uploadedFile.title}" has been uploaded successfully!`,
          duration: 4000,
        });

        // Show celebration animation
        setShowCelebration(true);

        // Clean up completed upload after 3 seconds with fade out
        setTimeout(() => {
          // Add fade-out class first
          setUploadedFiles(prev => 
            prev.map(f => f.id === id ? { ...f, status: 'removing' as const } : f)
          );
          
          // Remove after fade animation
          setTimeout(() => {
            setUploadedFiles(prev => prev.filter(f => f.id !== id));
          }, 500);
        }, 3000);

      } else {
        // Upload failed
        const errorMessage = response.error || response.message || 'Upload failed';
        setUploadedFiles(prev => 
          prev.map(f => f.id === id ? { 
            ...f, 
            status: 'error' as const,
            error: errorMessage
          } : f)
        );

        // Show error toast
        toast.error("❌ Upload failed", {
          description: `Failed to upload "${uploadedFile.title}": ${errorMessage}`,
          duration: 5000,
        });
      }
    } catch (error) {
      console.error('Upload error:', error);
      const errorMessage = error instanceof Error ? error.message : 'Upload failed';
      setUploadedFiles(prev => 
        prev.map(f => f.id === id ? { 
          ...f, 
          status: 'error' as const,
          error: errorMessage
        } : f)
      );

      // Show error toast
      toast.error("❌ Upload error", {
        description: `Network error uploading "${uploadedFile.title}": ${errorMessage}`,
        duration: 5000,
      });
    }
  };



  const removeFile = (id: string) => {
    setUploadedFiles(prev => prev.filter(f => f.id !== id));
  };

  const updateFileInfo = (id: string, field: keyof UploadedFile, value: any) => {
    setUploadedFiles(prev => 
      prev.map(f => f.id === id ? { ...f, [field]: value } : f)
    );
  };

  const addTag = (id: string, tag: string) => {
    if (!tag.trim()) return;
    setUploadedFiles(prev => 
      prev.map(f => f.id === id ? { 
        ...f, 
        tags: [...f.tags, tag.trim().toLowerCase()] 
      } : f)
    );
  };

  const removeTag = (id: string, tagToRemove: string) => {
    setUploadedFiles(prev => 
      prev.map(f => f.id === id ? { 
        ...f, 
        tags: f.tags.filter(tag => tag !== tagToRemove) 
      } : f)
    );
  };

  const successfulUploads = uploadedFiles.filter(f => f.status === 'success').length;
  const failedUploads = uploadedFiles.filter(f => f.status === 'error').length;
  const readyUploads = uploadedFiles.filter(f => f.status === 'ready').length;
  const uploadingFiles = uploadedFiles.filter(f => f.status === 'uploading').length;

  const uploadAllReady = async () => {
    const readyFiles = uploadedFiles.filter(f => f.status === 'ready');
    
    // Show info toast for batch upload
    toast.info("🚀 Starting batch upload", {
      description: `Uploading ${readyFiles.length} image${readyFiles.length !== 1 ? 's' : ''}...`,
      duration: 2000,
    });

    for (const file of readyFiles) {
      await uploadSingleFileImmediate(file);
      // Small delay between uploads to avoid overwhelming the server
      await new Promise(resolve => setTimeout(resolve, 500));
    }
  };

  return (
    <>
      <SEOHead 
        {...uploadSEO}
        url="/upload"
        noIndex={true} // Private page - require authentication
      />
      
      <div className="space-y-6">
        <Breadcrumb items={breadcrumbConfigs.upload} />
        
        {/* Success Animation */}
        <SuccessAnimation 
          show={showCelebration} 
          onComplete={() => setShowCelebration(false)} 
        />

        {/* Header */}
        <div>
        <h1 className="text-2xl font-bold text-white">Upload Images</h1>
        <p className="text-gray-600 mt-1">
          Share your images with the community. Maximum file size: {formatFileSize(MAX_FILE_SIZE)}
        </p>
      </div>

      {/* Upload Restrictions */}
      <div className="bg-blue-50 border border-blue-200 rounded-lg p-4">
        <h3 className="text-sm font-medium text-blue-900 mb-2">Upload Guidelines</h3>
        <div className="text-sm text-blue-800 space-y-1">
          <p><strong>Allowed formats:</strong> {ALLOWED_EXTENSIONS.join(', ').toUpperCase()}</p>
          <p><strong>Maximum file size:</strong> {formatFileSize(MAX_FILE_SIZE)} per image</p>
          <p><strong>Note:</strong> All uploaded images will be publicly visible in the gallery</p>
        </div>
      </div>

      {/* Upload Area */}
      <div
        className={`
          border-2 border-dashed rounded-lg p-6 md:p-8 text-center transition-colors touch-manipulation
          ${isDragging 
            ? 'border-blue-500 bg-blue-50' 
            : 'border-gray-300 hover:border-gray-400'
          }
        `}
        onDragOver={handleDragOver}
        onDragLeave={handleDragLeave}
        onDrop={handleDrop}
      >
        <UploadIcon className="h-10 w-10 md:h-12 md:w-12 text-gray-400 mx-auto mb-4" />
        <h3 className="text-base md:text-lg font-medium text-white mb-2">
          Drop images here or click to upload
        </h3>
        <p className="text-sm md:text-base text-gray-600 mb-4">
          Select multiple images or drag and drop them here
        </p>
        <input
          type="file"
          multiple
          accept={ALLOWED_EXTENSIONS.map(ext => `.${ext}`).join(',')}
          onChange={handleFileSelect}
          className="hidden"
          id="file-upload"
        />
        <Button 
          className="cursor-pointer touch-manipulation"
          onClick={() => document.getElementById('file-upload')?.click()}
        >
          Choose Files
        </Button>
      </div>

      {/* Upload Statistics */}
      {uploadedFiles.length > 0 && (
        <div className="bg-black/40 backdrop-blur-sm rounded-lg shadow-xl border border-white/10 p-4 md:p-6">
          <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between gap-4">
            <h3 className="text-base md:text-lg font-semibold text-white">Upload Status</h3>
            <div className="flex flex-col sm:flex-row items-start sm:items-center gap-3">
              {readyUploads > 0 && (
                <Button
                  onClick={uploadAllReady}
                  className="bg-blue-600 hover:bg-blue-700 text-white w-full sm:w-auto"
                  disabled={uploadingFiles > 0}
                >
                  Upload All ({readyUploads})
                </Button>
              )}
              <div className="flex flex-wrap gap-3 text-sm">
                {readyUploads > 0 && (
                  <span className="text-blue-600">
                    {readyUploads} ready
                  </span>
                )}
                {uploadingFiles > 0 && (
                  <span className="text-orange-600">
                    {uploadingFiles} uploading
                  </span>
                )}
                <span className="text-green-600">
                  <CheckCircle className="inline h-4 w-4 mr-1" />
                  {successfulUploads} successful
                </span>
                {failedUploads > 0 && (
                  <span className="text-red-600">
                    <AlertCircle className="inline h-4 w-4 mr-1" />
                    {failedUploads} failed
                  </span>
                )}
              </div>
            </div>
          </div>
        </div>
      )}

      {/* Uploaded Files */}
      <div className="space-y-4">
        {uploadedFiles.map((uploadedFile) => (
          <div 
            key={uploadedFile.id} 
            className={`
              bg-black/40 backdrop-blur-sm rounded-lg shadow-xl border border-white/10 p-6 transition-all duration-500
              ${uploadedFile.status === 'removing' ? 'opacity-0 scale-95 transform translate-y-2' : 'opacity-100 scale-100'}
              ${uploadedFile.status === 'success' ? 'ring-2 ring-green-200 bg-green-50' : ''}
            `}
          >
            <div className="flex flex-col md:flex-row gap-4 md:gap-6">
              {/* Image Preview */}
              <div className="flex-shrink-0 mx-auto md:mx-0">
                <div className="w-24 h-24 md:w-32 md:h-32 bg-black/30 rounded-lg overflow-hidden border border-white/10">
                  {uploadedFile.preview ? (
                    <img
                      src={uploadedFile.preview}
                      alt={uploadedFile.title}
                      className="w-full h-full object-cover"
                    />
                  ) : (
                    <div className="w-full h-full flex items-center justify-center">
                      <ImageIcon className="h-6 w-6 md:h-8 md:w-8 text-gray-400" />
                    </div>
                  )}
                </div>
              </div>

              {/* File Info */}
              <div className="flex-1 space-y-3 md:space-y-4 min-w-0">
                <div className="flex flex-col sm:flex-row sm:items-start sm:justify-between gap-2">
                  <div className="min-w-0">
                    <h4 className="font-medium text-white truncate text-sm md:text-base">{uploadedFile.file.name}</h4>
                    <p className="text-xs md:text-sm text-gray-600">
                      {formatFileSize(uploadedFile.file.size)}
                    </p>
                  </div>
                  
                  <div className="flex items-center gap-2 flex-shrink-0">
                    {uploadedFile.status === 'ready' && (
                      <div className="flex items-center gap-2">
                        <Button
                          size="sm"
                          onClick={() => uploadSingleFileImmediate(uploadedFile)}
                          className="bg-blue-600 hover:bg-blue-700 text-white text-xs md:text-sm"
                        >
                          Upload
                        </Button>
                        <span className="text-gray-600 text-xs md:text-sm">Ready to upload</span>
                      </div>
                    )}
                    {uploadedFile.status === 'uploading' && (
                      <div className="flex items-center text-blue-600">
                        <div className="animate-spin rounded-full h-3 w-3 md:h-4 md:w-4 border-b-2 border-blue-600 mr-2"></div>
                        <span className="text-xs md:text-sm">Uploading...</span>
                      </div>
                    )}
                    {uploadedFile.status === 'success' && (
                      <div className="flex items-center text-green-600">
                        <CheckCircle className="h-3 w-3 md:h-4 md:w-4 mr-1" />
                        <span className="text-xs md:text-sm">Uploaded</span>
                      </div>
                    )}
                    {uploadedFile.status === 'error' && (
                      <div className="flex items-center text-red-600">
                        <AlertCircle className="h-3 w-3 md:h-4 md:w-4 mr-1" />
                        <span className="text-xs md:text-sm">Failed</span>
                      </div>
                    )}
                    <Button
                      variant="ghost"
                      size="sm"
                      onClick={() => removeFile(uploadedFile.id)}
                      className="p-1 md:p-2"
                    >
                      <X className="h-3 w-3 md:h-4 md:w-4" />
                    </Button>
                  </div>
                </div>

                {uploadedFile.status === 'uploading' && uploadedFile.progress !== undefined && (
                  <div className="bg-blue-50 border border-blue-200 rounded-md p-3">
                    <div className="flex items-center justify-between text-sm text-blue-800 mb-2">
                      <span>Uploading to server...</span>
                      <span>{uploadedFile.progress}%</span>
                    </div>
                    <div className="w-full bg-blue-200 rounded-full h-2">
                      <div 
                        className="bg-blue-600 h-2 rounded-full transition-all duration-300" 
                        style={{ width: `${uploadedFile.progress}%` }}
                      ></div>
                    </div>
                  </div>
                )}

                {uploadedFile.status === 'error' && uploadedFile.error && (
                  <div className="bg-red-50 border border-red-200 rounded-md p-3">
                    <p className="text-sm text-red-800">{uploadedFile.error}</p>
                  </div>
                )}

                {uploadedFile.status !== 'error' && (
                  <div className={`grid grid-cols-1 md:grid-cols-2 gap-3 md:gap-4 ${
                    uploadedFile.status === 'success' ? 'opacity-60' : ''
                  }`}>
                    <div>
                      <label className="block text-xs md:text-sm font-medium text-white mb-1">
                        Title
                      </label>
                      <Input
                        value={uploadedFile.title}
                        onChange={(e) => updateFileInfo(uploadedFile.id, 'title', e.target.value)}
                        placeholder="Enter image title"
                        disabled={uploadedFile.status === 'success' || uploadedFile.status === 'uploading'}
                        className="text-sm md:text-base h-9 md:h-10"
                      />
                    </div>

                    <div>
                      <label className="block text-xs md:text-sm font-medium text-white mb-1">
                        Category
                      </label>
                      <select
                        value={uploadedFile.category}
                        onChange={(e) => updateFileInfo(uploadedFile.id, 'category', e.target.value)}
                        className="w-full h-9 md:h-10 px-3 py-2 border border-white/20 bg-black/30 backdrop-blur-sm text-white rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500 disabled:bg-black/20 disabled:text-gray-400 text-sm md:text-base"
                        disabled={uploadedFile.status === 'success' || uploadedFile.status === 'uploading'}
                      >
                        {categories.map((category) => (
                          <option key={category.id} value={category.name}>
                            {category.name.charAt(0).toUpperCase() + category.name.slice(1)}
                          </option>
                        ))}
                      </select>
                    </div>

                    <div className="md:col-span-2">
                      <label className="block text-xs md:text-sm font-medium text-white mb-1">
                        Description
                      </label>
                      <textarea
                        value={uploadedFile.description}
                        onChange={(e) => updateFileInfo(uploadedFile.id, 'description', e.target.value)}
                        placeholder="Describe your image..."
                        rows={2}
                        className="w-full px-3 py-2 border border-white/20 bg-black/30 backdrop-blur-sm text-white rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500 disabled:bg-black/20 disabled:text-gray-400 text-sm md:text-base"
                        disabled={uploadedFile.status === 'success' || uploadedFile.status === 'uploading'}
                      />
                    </div>

                    <div className="md:col-span-2">
                                            <label className="block text-xs md:text-sm font-medium text-white mb-1">
                        Tags (comma-separated)
                      </label>
                      <div className="flex flex-wrap gap-1 md:gap-2 mb-2">
                        {uploadedFile.tags.map((tag) => (
                          <Badge
                            key={tag}
                            variant="secondary"
                            className={`text-xs ${
                              uploadedFile.status === 'success' || uploadedFile.status === 'uploading' 
                                ? 'cursor-not-allowed opacity-60' 
                                : 'cursor-pointer'
                            }`}
                            onClick={() => {
                              if (uploadedFile.status === 'ready') {
                                removeTag(uploadedFile.id, tag);
                              }
                            }}
                          >
                            {tag}
                            {(uploadedFile.status === 'ready') && <X className="h-2 w-2 md:h-3 md:w-3 ml-1" />}
                          </Badge>
                        ))}
                      </div>
                      <div className="flex gap-2">
                        <Input
                          placeholder="Add a tag"
                          disabled={uploadedFile.status === 'success' || uploadedFile.status === 'uploading'}
                          onKeyPress={(e) => {
                            if (e.key === 'Enter' && uploadedFile.status === 'ready') {
                              const target = e.target as HTMLInputElement;
                              addTag(uploadedFile.id, target.value);
                              target.value = '';
                            }
                          }}
                          className="text-sm md:text-base h-8 md:h-10 flex-1"
                        />
                        <Button
                          variant="outline"
                          size="sm"
                          disabled={uploadedFile.status === 'success' || uploadedFile.status === 'uploading'}
                          onClick={(e) => {
                            if (uploadedFile.status === 'ready') {
                              const input = e.currentTarget.previousSibling as HTMLInputElement;
                              addTag(uploadedFile.id, input.value);
                              input.value = '';
                            }
                          }}
                          className="h-8 md:h-10 px-3 md:px-4 text-xs md:text-sm"
                        >
                          Add
                        </Button>
                      </div>
                    </div>
                  </div>
                )}
              </div>
            </div>
          </div>
        ))}
      </div>

      {/* Success Message */}
      {successfulUploads > 0 && (
        <div className="bg-gradient-to-r from-green-50 to-emerald-50 border border-green-200 rounded-lg p-4 shadow-sm animate-in slide-in-from-top-2 duration-500">
          <div className="flex items-center">
            <div className="flex-shrink-0">
              <CheckCircle className="h-5 w-5 text-green-600 mr-2 animate-pulse" />
            </div>
            <div className="flex-1">
              <p className="text-green-800 font-medium">
                🎉 {successfulUploads} image{successfulUploads !== 1 ? 's' : ''} uploaded successfully!
              </p>
              <p className="text-green-700 text-sm mt-1">
                Your images are now live in the gallery and ready to be discovered.
              </p>
            </div>
          </div>
        </div>
      )}
    </div>
    </>
  );
};