import React, { useState, useEffect } from 'react';
import { useAuth } from '../../contexts/AuthContext';
import { Navigate } from 'react-router-dom';
import { Edit, Trash2, Search, Filter, CheckSquare, Square, Eye } from 'lucide-react';
import { getApiBase } from '../../lib/api';
import { Button } from '../ui/Button';
import { Input } from '../ui/Input';
import { Badge } from '../ui/Badge';
import { SEOHead } from '../seo/SEOHead';
import { Breadcrumb } from '../seo/Breadcrumb';
import type { Image } from '../../types';
import { EditImageModal } from '../ui/EditImageModal';
import { DeleteConfirmModal } from '../ui/DeleteConfirmModal';
import IconButton from '../ui/IconButton';

export const MyImagesPage: React.FC = () => {
  const { user, loading } = useAuth();
  const [images, setImages] = useState<Image[]>([]);
  const [filteredImages, setFilteredImages] = useState<Image[]>([]);
  const [isLoading, setIsLoading] = useState(true);
  const [searchQuery, setSearchQuery] = useState('');
  const [selectedCategory, setSelectedCategory] = useState('all');
  const [selectedImages, setSelectedImages] = useState<Set<string>>(new Set());
  const [categories, setCategories] = useState<any[]>([]);
  
  // Modal states
  const [editingImage, setEditingImage] = useState<Image | null>(null);
  const [showDeleteModal, setShowDeleteModal] = useState(false);
  const [deletingImages, setDeletingImages] = useState<string[]>([]);

  // Placeholder for missing images
  const PLACEHOLDER_SVG = `data:image/svg+xml;utf8,<svg xmlns='http://www.w3.org/2000/svg' viewBox='0 0 400 300'><rect width='100%' height='100%' fill='%23f3f4f6'/><text x='50%' y='50%' dominant-baseline='middle' text-anchor='middle' fill='%23888' font-size='18'>No image</text></svg>`;

  // Resolve API URLs
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

  // Redirect if not logged in
  if (loading) {
    return (
      <div className="min-h-screen bg-gradient-to-br from-gray-900 via-gray-800 to-black flex items-center justify-center">
        <div className="text-white text-center">
          <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-purple-500 mx-auto mb-4"></div>
          <p>Loading...</p>
        </div>
      </div>
    );
  }

  if (!user) {
    return <Navigate to="/login" replace />;
  }

  // Load user's images and categories
  useEffect(() => {
    let cancelled = false;
    
    async function loadData() {
      try {
        const base = getApiBase();
        
        const [imagesRes, categoriesRes] = await Promise.all([
          fetch(`${base}/user/images`, {
            credentials: 'include',
            headers: {
              'Content-Type': 'application/json'
            }
          }),
          fetch(`${base}/categories`)
        ]);

        if (!cancelled) {
          // Load user images
          if (imagesRes.ok) {
            const imagesJson = await imagesRes.json();
            if (imagesJson.success) {
              setImages(imagesJson.data || []);
              setFilteredImages(imagesJson.data || []);
            }
          }

          // Load categories
          if (categoriesRes.ok) {
            const categoriesJson = await categoriesRes.json();
            if (categoriesJson.success) {
              const transformedCategories = categoriesJson.data.map((cat: any) => ({
                id: String(cat.id),
                name: cat.name,
                description: cat.description,
                imageCount: cat.image_count || 0
              }));
              setCategories(transformedCategories);
            }
          }
        }
      } catch (error) {
        console.error('Failed to load user images:', error);
      } finally {
        if (!cancelled) {
          setIsLoading(false);
        }
      }
    }

    loadData();
    return () => { cancelled = true; };
  }, []);

  // Filter images based on search and category
  useEffect(() => {
    let filtered = images;

    if (searchQuery.trim()) {
      const query = searchQuery.toLowerCase();
      filtered = filtered.filter(img => 
        img.title.toLowerCase().includes(query) ||
        (img.description && img.description.toLowerCase().includes(query)) ||
        (img.tags && img.tags.some(tag => tag.toLowerCase().includes(query)))
      );
    }

    if (selectedCategory !== 'all') {
      filtered = filtered.filter(img => img.category === selectedCategory);
    }

    setFilteredImages(filtered);
  }, [images, searchQuery, selectedCategory]);

  // Selection handlers
  const toggleImageSelection = (imageId: string) => {
    const newSelected = new Set(selectedImages);
    if (newSelected.has(imageId)) {
      newSelected.delete(imageId);
    } else {
      newSelected.add(imageId);
    }
    setSelectedImages(newSelected);
  };

  const selectAllImages = () => {
    if (selectedImages.size === filteredImages.length) {
      setSelectedImages(new Set());
    } else {
      setSelectedImages(new Set(filteredImages.map(img => img.id)));
    }
  };

  // Edit image handler
  const handleEditImage = (image: Image) => {
    setEditingImage(image);
  };

  const handleSaveEdit = async (imageId: string, updates: { title: string; description: string; category: string; tags: string[] }) => {
    try {
      const base = getApiBase();
      
      const response = await fetch(`${base}/images/${imageId}`, {
        method: 'PUT',
        credentials: 'include',
        headers: {
          'Content-Type': 'application/json'
        },
        body: JSON.stringify(updates)
      });

      if (response.ok) {
        const result = await response.json();
        if (result.success) {
          // Update local state
          setImages(prevImages => 
            prevImages.map(img => 
              img.id === imageId ? { ...img, ...updates } : img
            )
          );
          setEditingImage(null);
        }
      }
    } catch (error) {
      console.error('Failed to update image:', error);
    }
  };

  // Delete handlers
  const handleDeleteSelected = () => {
    setDeletingImages(Array.from(selectedImages));
    setShowDeleteModal(true);
  };

  const handleDeleteSingle = (imageId: string) => {
    setDeletingImages([imageId]);
    setShowDeleteModal(true);
  };

  const confirmDelete = async () => {
    try {
      const base = getApiBase();
      
      const deletePromises = deletingImages.map(imageId =>
        fetch(`${base}/images/${imageId}`, {
          method: 'DELETE',
          credentials: 'include',
          headers: {
            'Content-Type': 'application/json'
          }
        })
      );

      const results = await Promise.all(deletePromises);
      const successfulDeletes = results.filter(res => res.ok);

      if (successfulDeletes.length > 0) {
        // Update local state
        setImages(prevImages => 
          prevImages.filter(img => !deletingImages.includes(img.id))
        );
        setSelectedImages(new Set());
      }

      setShowDeleteModal(false);
      setDeletingImages([]);
    } catch (error) {
      console.error('Failed to delete images:', error);
    }
  };

  const seoConfig = {
    title: 'My Images - Manage Your Artwork',
    description: 'View, edit, and manage your uploaded images on NisArt Gallery. Update titles, tags, categories, and delete images as needed.',
    noIndex: true // Private user page
  };

  const breadcrumbItems = [
    { name: 'Home', url: '/' },
    { name: 'My Profile', url: '/profile' },
    { name: 'My Images', url: '/profile/images', current: true }
  ];

  return (
    <>
      <SEOHead 
        {...seoConfig}
        url="/profile/images"
      />
      
      <div className="space-y-6">
        <Breadcrumb items={breadcrumbItems} />
        
        {/* Header */}
        <div className="flex flex-col lg:flex-row lg:items-center lg:justify-between gap-4">
          <div>
            <h1 className="text-3xl font-bold text-white">My Images</h1>
            <p className="text-gray-300 mt-1">
              Manage your uploaded artwork - {filteredImages.length} image{filteredImages.length !== 1 ? 's' : ''}
            </p>
          </div>

          {selectedImages.size > 0 && (
            <div className="flex items-center gap-3">
              <span className="text-gray-300 text-sm">
                {selectedImages.size} selected
              </span>
              <Button
                variant="destructive"
                size="sm"
                onClick={handleDeleteSelected}
                className="flex items-center gap-2"
              >
                <Trash2 className="h-4 w-4" />
                Delete Selected
              </Button>
            </div>
          )}
        </div>

        {/* Search and Filters */}
        <div className="bg-black/40 backdrop-blur-sm rounded-lg shadow-xl border border-white/10 p-6">
          <div className="flex flex-col lg:flex-row gap-4 mb-4">
            {/* Search Bar */}
            <div className="flex-1 relative">
              <Search className="absolute left-3 top-1/2 transform -translate-y-1/2 h-4 w-4 text-gray-400" />
              <Input
                type="text"
                placeholder="Search your images..."
                value={searchQuery}
                onChange={(e) => setSearchQuery(e.target.value)}
                className="pl-10"
              />
            </div>

            {/* Category Filter */}
            <div className="flex items-center gap-2">
              <Filter className="h-4 w-4 text-gray-400" />
              <select
                value={selectedCategory}
                onChange={(e) => setSelectedCategory(e.target.value)}
                className="bg-black/30 border border-white/10 text-white rounded-md px-3 py-2 text-sm"
              >
                <option value="all">All Categories</option>
                {categories.map((category) => (
                  <option key={category.id} value={category.name}>
                    {category.name}
                  </option>
                ))}
              </select>
            </div>
          </div>

          {/* Select All */}
          {filteredImages.length > 0 && (
            <div className="flex items-center gap-2">
              <button
                onClick={selectAllImages}
                className="flex items-center gap-2 text-sm text-gray-300 hover:text-white"
              >
                {selectedImages.size === filteredImages.length ? (
                  <CheckSquare className="h-4 w-4" />
                ) : (
                  <Square className="h-4 w-4" />
                )}
                Select All
              </button>
            </div>
          )}
        </div>

        {/* Images Grid */}
        {isLoading ? (
          <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4 gap-6">
            {[...Array(8)].map((_, i) => (
              <div key={i} className="bg-black/40 backdrop-blur-sm rounded-lg shadow-xl border border-white/10 overflow-hidden">
                <div className="w-full h-48 bg-gray-700 animate-pulse" />
                <div className="p-4">
                  <div className="h-4 bg-gray-600 rounded animate-pulse mb-2" />
                  <div className="h-3 bg-gray-600 rounded animate-pulse w-2/3" />
                </div>
              </div>
            ))}
          </div>
        ) : filteredImages.length > 0 ? (
          <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4 gap-6">
            {filteredImages.map((image) => (
              <div
                key={image.id}
                className="group bg-black/40 backdrop-blur-sm rounded-lg shadow-xl border border-white/10 overflow-hidden hover:shadow-2xl transition-all duration-300"
              >
                {/* Selection Checkbox */}
                <div className="absolute top-2 left-2 z-10">
                  <button
                    onClick={(e) => {
                      e.stopPropagation();
                      toggleImageSelection(image.id);
                    }}
                    className="p-1 bg-black/50 rounded border border-white/20 hover:bg-black/70"
                  >
                    {selectedImages.has(image.id) ? (
                      <CheckSquare className="h-4 w-4 text-blue-400" />
                    ) : (
                      <Square className="h-4 w-4 text-white" />
                    )}
                  </button>
                </div>

                {/* Image */}
                <div className="relative">
                  <img
                    src={resolveApiUrl(image.thumbnailUrl) || PLACEHOLDER_SVG}
                    alt={image.title}
                    onError={(e) => {
                      (e.currentTarget as HTMLImageElement).src = PLACEHOLDER_SVG;
                    }}
                    className="w-full h-48 object-cover group-hover:scale-105 transition-transform duration-300"
                  />
                  
                  {/* Action Buttons */}
                  <div className="absolute top-2 right-2 flex space-x-1 opacity-0 group-hover:opacity-100 transition-opacity duration-200">
                    <IconButton to={`/image/${image.id}`} ariaLabel="view image">
                      <Eye className="h-4 w-4" />
                    </IconButton>
                    <IconButton 
                      ariaLabel="edit image" 
                      onClick={() => handleEditImage(image)}
                    >
                      <Edit className="h-4 w-4" />
                    </IconButton>
                    <IconButton 
                      ariaLabel="delete image" 
                      onClick={() => handleDeleteSingle(image.id)}
                    >
                      <Trash2 className="h-4 w-4" />
                    </IconButton>
                  </div>
                </div>

                {/* Content */}
                <div className="p-4">
                  <h3 className="font-semibold text-white truncate mb-2">{image.title}</h3>
                  
                  {image.description && (
                    <p className="text-sm text-gray-300 line-clamp-2 mb-2">
                      {image.description}
                    </p>
                  )}

                  <div className="flex flex-wrap gap-1 mb-2">
                    <Badge variant="secondary" className="text-xs">
                      {categories.find(cat => cat.name === image.category)?.name || image.category}
                    </Badge>
                    {image.tags?.slice(0, 2).map((tag) => (
                      <Badge key={tag} variant="outline" className="text-xs">
                        {tag}
                      </Badge>
                    ))}
                  </div>

                  <div className="text-xs text-gray-500">
                    Uploaded: {new Date(image.created_at || image.upload_date || image.dateCreated || new Date()).toLocaleDateString()}
                  </div>
                </div>
              </div>
            ))}
          </div>
        ) : (
          <div className="text-center py-12">
            <div className="text-gray-400 mb-4">
              <Search className="h-12 w-12 mx-auto" />
            </div>
            <h3 className="text-lg font-medium text-white mb-2">No images found</h3>
            <p className="text-gray-300">
              {searchQuery || selectedCategory !== 'all' 
                ? 'Try adjusting your search or filters.' 
                : 'Start by uploading your first image!'
              }
            </p>
          </div>
        )}
      </div>

      {/* Edit Image Modal */}
      {editingImage && (
        <EditImageModal
          image={editingImage}
          categories={categories}
          onSave={handleSaveEdit}
          onClose={() => setEditingImage(null)}
        />
      )}

      {/* Delete Confirmation Modal */}
      {showDeleteModal && (
        <DeleteConfirmModal
          imageCount={deletingImages.length}
          onConfirm={confirmDelete}
          onCancel={() => {
            setShowDeleteModal(false);
            setDeletingImages([]);
          }}
        />
      )}
    </>
  );
};