import React from 'react';
import { AlertTriangle, Trash2 } from 'lucide-react';
import { Button } from './Button';

interface DeleteConfirmModalProps {
  imageCount: number;
  onConfirm: () => void;
  onCancel: () => void;
}

export const DeleteConfirmModal: React.FC<DeleteConfirmModalProps> = ({
  imageCount,
  onConfirm,
  onCancel
}) => {
  // Handle backdrop click
  const handleBackdropClick = (e: React.MouseEvent) => {
    if (e.target === e.currentTarget) {
      onCancel();
    }
  };

  return (
    <div 
      className="fixed inset-0 bg-black/50 backdrop-blur-sm z-50 flex items-center justify-center p-4"
      onClick={handleBackdropClick}
    >
      <div className="bg-gray-900 rounded-lg shadow-2xl border border-white/10 w-full max-w-md">
        {/* Header */}
        <div className="flex items-center gap-3 p-6 border-b border-white/10">
          <div className="flex-shrink-0 w-10 h-10 rounded-full bg-red-500/20 flex items-center justify-center">
            <AlertTriangle className="h-5 w-5 text-red-400" />
          </div>
          <div>
            <h2 className="text-lg font-semibold text-white">
              Delete Image{imageCount > 1 ? 's' : ''}
            </h2>
            <p className="text-sm text-gray-400">
              This action cannot be undone
            </p>
          </div>
        </div>

        {/* Content */}
        <div className="p-6">
          <p className="text-gray-300 mb-4">
            {imageCount === 1 
              ? 'Are you sure you want to delete this image? This will permanently remove the image from your gallery and cannot be undone.'
              : `Are you sure you want to delete these ${imageCount} images? This will permanently remove all selected images from your gallery and cannot be undone.`
            }
          </p>

          <div className="bg-red-500/10 border border-red-500/20 rounded-lg p-3 mb-6">
            <div className="flex items-start gap-2">
              <AlertTriangle className="h-4 w-4 text-red-400 mt-0.5 flex-shrink-0" />
              <div className="text-sm text-red-200">
                <strong>Warning:</strong> The image file{imageCount > 1 ? 's' : ''} will be permanently deleted from the server and cannot be recovered.
              </div>
            </div>
          </div>
        </div>

        {/* Actions */}
        <div className="flex items-center justify-end gap-3 p-6 border-t border-white/10">
          <Button
            variant="ghost"
            onClick={onCancel}
          >
            Cancel
          </Button>
          <Button
            variant="destructive"
            onClick={onConfirm}
            className="flex items-center gap-2"
          >
            <Trash2 className="h-4 w-4" />
            Delete {imageCount > 1 ? `${imageCount} Images` : 'Image'}
          </Button>
        </div>
      </div>
    </div>
  );
};