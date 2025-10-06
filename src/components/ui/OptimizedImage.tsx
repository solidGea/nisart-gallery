import { useState, useEffect } from 'react';
import { generateImageAlt } from '../seo/SEOHead';

interface OptimizedImageProps {
  src: string;
  alt?: string;
  title?: string;
  artist?: string;
  category?: string;
  tags?: string[];
  className?: string;
  loading?: 'lazy' | 'eager';
  sizes?: string;
  onLoad?: () => void;
  onError?: () => void;
  fallbackSrc?: string;
}

export function OptimizedImage({
  src,
  alt,
  title,
  artist,
  category,
  tags,
  className = '',
  loading = 'lazy',
  sizes,
  onLoad,
  onError,
  fallbackSrc = '/placeholder-image.jpg'
}: OptimizedImageProps) {
  const [currentSrc, setCurrentSrc] = useState(src);
  const [isLoading, setIsLoading] = useState(true);
  const [hasError, setHasError] = useState(false);

  // Generate SEO-friendly alt text
  const optimizedAlt = alt || generateImageAlt(title, category, tags, artist);

  useEffect(() => {
    setCurrentSrc(src);
    setHasError(false);
    setIsLoading(true);
  }, [src]);

  const handleLoad = () => {
    setIsLoading(false);
    onLoad?.();
  };

  const handleError = () => {
    setHasError(true);
    setIsLoading(false);
    if (currentSrc !== fallbackSrc) {
      setCurrentSrc(fallbackSrc);
    }
    onError?.();
  };

  // Generate responsive image sizes if not provided
  const responsiveSizes = sizes || '(max-width: 640px) 100vw, (max-width: 1024px) 50vw, 33vw';

  return (
    <div className={`relative overflow-hidden ${className}`}>
      {/* Loading placeholder */}
      {isLoading && (
        <div className="absolute inset-0 bg-gray-800 animate-pulse flex items-center justify-center">
          <div className="w-8 h-8 border-2 border-purple-500 border-t-transparent rounded-full animate-spin" />
        </div>
      )}

      {/* Main image */}
      <img
        src={currentSrc}
        alt={optimizedAlt}
        title={title}
        className={`w-full h-full object-cover transition-opacity duration-300 ${
          isLoading ? 'opacity-0' : 'opacity-100'
        }`}
        loading={loading}
        sizes={responsiveSizes}
        onLoad={handleLoad}
        onError={handleError}
        // SEO attributes
        itemProp="image"
        decoding="async"
      />

      {/* Error state */}
      {hasError && currentSrc === fallbackSrc && (
        <div className="absolute inset-0 bg-gray-800 flex items-center justify-center">
          <div className="text-gray-400 text-center">
            <div className="text-4xl mb-2">🖼️</div>
            <div className="text-sm">Image unavailable</div>
          </div>
        </div>
      )}

      {/* Structured data for image */}
      {title && artist && (
        <script
          type="application/ld+json"
          dangerouslySetInnerHTML={{
            __html: JSON.stringify({
              "@context": "https://schema.org",
              "@type": "ImageObject",
              "name": title,
              "url": src,
              "creator": {
                "@type": "Person",
                "name": artist
              },
              "description": optimizedAlt,
              "keywords": tags?.join(', '),
              "genre": category
            })
          }}
        />
      )}
    </div>
  );
}

// Hook for progressive image loading
export function useProgressiveImage(src: string, fallbackSrc?: string) {
  const [currentSrc, setCurrentSrc] = useState(fallbackSrc || '');
  const [isLoading, setIsLoading] = useState(true);

  useEffect(() => {
    const img = new Image();
    
    img.onload = () => {
      setCurrentSrc(src);
      setIsLoading(false);
    };
    
    img.onerror = () => {
      if (fallbackSrc) {
        setCurrentSrc(fallbackSrc);
      }
      setIsLoading(false);
    };

    img.src = src;
  }, [src, fallbackSrc]);

  return { currentSrc, isLoading };
}

// Utility function to generate responsive image URLs
export function generateImageSources(baseUrl: string, sizes: number[] = [320, 640, 1024, 1280]) {
  return sizes.map(size => ({
    src: `${baseUrl}?w=${size}&q=80`,
    width: size
  }));
}

// WebP support detection
export function supportsWebP(): Promise<boolean> {
  return new Promise((resolve) => {
    const webP = new Image();
    webP.onload = webP.onerror = () => resolve(webP.height === 2);
    webP.src = 'data:image/webp;base64,UklGRjoAAABXRUJQVlA4IC4AAACyAgCdASoCAAIALmk0mk0iIiIiIgBoSygABc6WWgAA/veff/0PP8bA//LwYAAA';
  });
}

// Image compression utility
export function compressImage(file: File, maxWidth: number = 1920, quality: number = 0.8): Promise<Blob> {
  return new Promise((resolve) => {
    const canvas = document.createElement('canvas');
    const ctx = canvas.getContext('2d')!;
    const img = new Image();

    img.onload = () => {
      // Calculate new dimensions
      const { width, height } = calculateAspectRatio(img.width, img.height, maxWidth);
      
      canvas.width = width;
      canvas.height = height;

      // Draw and compress
      ctx.drawImage(img, 0, 0, width, height);
      
      canvas.toBlob((blob) => {
        resolve(blob!);
      }, 'image/jpeg', quality);
    };

    img.src = URL.createObjectURL(file);
  });
}

function calculateAspectRatio(width: number, height: number, maxWidth: number) {
  if (width <= maxWidth) {
    return { width, height };
  }
  
  const ratio = width / height;
  const newWidth = maxWidth;
  const newHeight = Math.round(maxWidth / ratio);
  
  return { width: newWidth, height: newHeight };
}