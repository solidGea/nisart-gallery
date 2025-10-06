import React, { useState, useEffect } from 'react';
import { X, Save, Tag } from 'lucide-react';
import { Button } from './Button';
import { Input } from './Input';
import type { Image } from '../../types';

interface EditImageModalProps {
  image: Image;
  categories: Array<{ id: string; name: string; description?: string }>;
  onSave: (imageId: string, updates: { 
    title: string; 
    description: string; 
    category: string; 
    tags: string[] 
  }) => Promise<void>;
  onClose: () => void;
}

export const EditImageModal: React.FC<EditImageModalProps> = ({
  image,
  categories,
  onSave,
  onClose
}) => {
  const [formData, setFormData] = useState({
    title: image.title || '',
    description: image.description || '',
    category: image.category || '',
    tags: image.tags?.join(', ') || ''
  });
  const [isLoading, setIsLoading] = useState(false);
  const [errors, setErrors] = useState<Record<string, string>>({});

  // Handle escape key
  useEffect(() => {
    const handleEscape = (e: KeyboardEvent) => {
      if (e.key === 'Escape') {
        onClose();
      }
    };

    document.addEventListener('keydown', handleEscape);
    return () => document.removeEventListener('keydown', handleEscape);
  }, [onClose]);

  // Handle backdrop click
  const handleBackdropClick = (e: React.MouseEvent) => {
    if (e.target === e.currentTarget) {
      onClose();
    }
  };

  // Validate form
  const validateForm = () => {
    const newErrors: Record<string, string> = {};

    if (!formData.title.trim()) {
      newErrors.title = 'Title is required';
    }

    if (!formData.category) {
      newErrors.category = 'Category is required';
    }

    setErrors(newErrors);
    return Object.keys(newErrors).length === 0;
  };

  // Handle form submission
  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    
    if (!validateForm()) {
      return;
    }

    setIsLoading(true);
    
    try {
      const tags = formData.tags
        .split(',')
        .map(tag => tag.trim())
        .filter(tag => tag.length > 0);

      await onSave(image.id, {
        title: formData.title.trim(),
        description: formData.description.trim(),
        category: formData.category,
        tags
      });
    } catch (error) {
      console.error('Failed to save image:', error);
    } finally {
      setIsLoading(false);
    }
  };

  // Handle input changes
  const handleInputChange = (field: keyof typeof formData) => (
    e: React.ChangeEvent<HTMLInputElement | HTMLTextAreaElement | HTMLSelectElement>
  ) => {
    setFormData(prev => ({ ...prev, [field]: e.target.value }));
    // Clear error when user starts typing
    if (errors[field]) {
      setErrors(prev => ({ ...prev, [field]: '' }));
    }
  };

  return (
    <div 
      className="fixed inset-0 bg-black/50 backdrop-blur-sm z-50 flex items-center justify-center p-4"
      onClick={handleBackdropClick}
    >
      <div className="bg-gray-900 rounded-lg shadow-2xl border border-white/10 w-full max-w-md max-h-[90vh] overflow-y-auto">
        {/* Header */}
        <div className="flex items-center justify-between p-6 border-b border-white/10">
          <h2 className="text-xl font-semibold text-white flex items-center gap-2">
            <Tag className="h-5 w-5" />
            Edit Image
          </h2>
          <button
            onClick={onClose}
            className="text-gray-400 hover:text-white transition-colors p-1"
            disabled={isLoading}
          >
            <X className="h-5 w-5" />
          </button>
        </div>

        {/* Form */}
        <form onSubmit={handleSubmit} className="p-6 space-y-4">
          {/* Title */}
          <div>
            <label htmlFor="title" className="block text-sm font-medium text-gray-300 mb-2">
              Title *
            </label>
            <Input
              id="title"
              type="text"
              value={formData.title}
              onChange={handleInputChange('title')}
              placeholder="Enter image title..."
              className={errors.title ? 'border-red-500' : ''}
              disabled={isLoading}
              maxLength={100}
            />
            {errors.title && (
              <p className="mt-1 text-sm text-red-400">{errors.title}</p>
            )}
          </div>

          {/* Description */}
          <div>
            <label htmlFor="description" className="block text-sm font-medium text-gray-300 mb-2">
              Description
            </label>
            <textarea
              id="description"
              value={formData.description}
              onChange={handleInputChange('description')}
              placeholder="Enter image description..."
              rows={3}
              maxLength={500}
              disabled={isLoading}
              className="w-full px-3 py-2 bg-black/30 border border-white/10 rounded-md text-white placeholder-gray-400 focus:outline-none focus:ring-2 focus:ring-purple-500 focus:border-transparent resize-none"
            />
            <p className="mt-1 text-xs text-gray-500">
              {formData.description.length}/500 characters
            </p>
          </div>

          {/* Category */}
          <div>
            <label htmlFor="category" className="block text-sm font-medium text-gray-300 mb-2">
              Category *
            </label>
            <select
              id="category"
              value={formData.category}
              onChange={handleInputChange('category')}
              className={`w-full px-3 py-2 border rounded-md focus:outline-none focus:ring-2 focus:ring-purple-500 focus:border-transparent ${
                errors.category ? 'border-red-500' : 'border-white/10'
              }`}
              style={{
                backgroundColor: 'rgba(0, 0, 0, 0.8)',
                color: 'white'
              }}
              disabled={isLoading}
            >
              <option value="" style={{ backgroundColor: 'rgba(0, 0, 0, 0.9)', color: 'white' }}>Select a category</option>
              {categories.map((category) => (
                <option 
                  key={category.id} 
                  value={category.name}
                  style={{ backgroundColor: 'rgba(0, 0, 0, 0.9)', color: 'white' }}
                >
                  {category.name}
                </option>
              ))}
            </select>
            {errors.category && (
              <p className="mt-1 text-sm text-red-400">{errors.category}</p>
            )}
          </div>

          {/* Tags */}
          <div>
            <label htmlFor="tags" className="block text-sm font-medium text-gray-300 mb-2">
              Tags
            </label>
            <Input
              id="tags"
              type="text"
              value={formData.tags}
              onChange={handleInputChange('tags')}
              placeholder="art, digital, fantasy (separate with commas)"
              disabled={isLoading}
              maxLength={200}
            />
            <p className="mt-1 text-xs text-gray-500">
              Separate multiple tags with commas. Maximum 10 tags.
            </p>
          </div>

          {/* Actions */}
          <div className="flex items-center justify-end gap-3 pt-4 border-t border-white/10">
            <Button
              type="button"
              variant="ghost"
              onClick={onClose}
              disabled={isLoading}
            >
              Cancel
            </Button>
            <Button
              type="submit"
              disabled={isLoading}
              className="flex items-center gap-2"
            >
              {isLoading ? (
                <>
                  <div className="animate-spin rounded-full h-4 w-4 border-b-2 border-white" />
                  Saving...
                </>
              ) : (
                <>
                  <Save className="h-4 w-4" />
                  Save Changes
                </>
              )}
            </Button>
          </div>
        </form>
      </div>
    </div>
  );
};