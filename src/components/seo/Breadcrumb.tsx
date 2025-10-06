import { Link, useLocation } from 'react-router-dom';
import { ChevronRight, Home } from 'lucide-react';
import { BreadcrumbSchema } from './StructuredData';

export interface BreadcrumbItem {
  name: string;
  url: string;
  current?: boolean;
}

interface BreadcrumbProps {
  items?: BreadcrumbItem[];
  className?: string;
}

export function Breadcrumb({ items: customItems, className = '' }: BreadcrumbProps) {
  const location = useLocation();
  
  // Auto-generate breadcrumbs from current path if no custom items provided
  const breadcrumbItems = customItems || generateBreadcrumbsFromPath(location.pathname);
  
  if (breadcrumbItems.length <= 1) {
    return null; // Don't show breadcrumbs for single-level pages
  }

  return (
    <>
      {/* Structured Data for SEO */}
      <BreadcrumbSchema items={breadcrumbItems} />
      
      {/* Visual Breadcrumb Navigation */}
      <nav 
        className={`flex items-center space-x-1 text-sm text-gray-400 mb-6 ${className}`}
        aria-label="Breadcrumb"
      >
        <ol className="flex items-center space-x-1">
          {breadcrumbItems.map((item, index) => (
            <li key={index} className="flex items-center">
              {index > 0 && (
                <ChevronRight className="w-4 h-4 mx-1 text-gray-500" />
              )}
              
              {index === 0 && (
                <Home className="w-4 h-4 mr-2 text-gray-500" />
              )}
              
              {item.current || index === breadcrumbItems.length - 1 ? (
                <span 
                  className="text-white font-medium"
                  aria-current="page"
                >
                  {item.name}
                </span>
              ) : (
                <Link
                  to={item.url}
                  className="text-gray-400 hover:text-white transition-colors duration-200"
                >
                  {item.name}
                </Link>
              )}
            </li>
          ))}
        </ol>
      </nav>
    </>
  );
}

// Auto-generate breadcrumbs from current URL path
function generateBreadcrumbsFromPath(pathname: string): BreadcrumbItem[] {
  const items: BreadcrumbItem[] = [
    { name: 'Home', url: '/' }
  ];

  // Remove leading/trailing slashes and split
  const pathSegments = pathname.replace(/^\/+|\/+$/g, '').split('/').filter(Boolean);
  
  if (pathSegments.length === 0) {
    return []; // Homepage - no breadcrumbs needed
  }

  let currentPath = '';
  
  for (let i = 0; i < pathSegments.length; i++) {
    const segment = pathSegments[i];
    currentPath += `/${segment}`;
    
    // Generate human-readable names for common paths
    const name = generateBreadcrumbName(segment, pathSegments, i);
    
    items.push({
      name,
      url: currentPath,
      current: i === pathSegments.length - 1
    });
  }

  return items;
}

function generateBreadcrumbName(segment: string, allSegments: string[], index: number): string {
  // Handle specific route patterns
  switch (segment) {
    case 'gallery':
      return 'Gallery';
    case 'search':
      return 'Search';
    case 'upload':
      return 'Upload Artwork';
    case 'profile':
      if (allSegments[index + 1] === 'setup') return 'Profile Setup';
      if (allSegments[index + 1] === 'edit') return 'Edit Profile';
      if (allSegments[index + 1] === 'images') return 'My Images';
      return 'Profile';
    case 'setup':
      return 'Setup';
    case 'edit':
      return 'Edit';
    case 'image':
      return 'Artwork';
    case 'artist':
      return 'Artist';
    case 'category':
      return 'Category';
    default:
      // Capitalize and format IDs/slugs
      return segment
        .split('-')
        .map(word => word.charAt(0).toUpperCase() + word.slice(1))
        .join(' ');
  }
}

// Predefined breadcrumb configurations for specific pages
export const breadcrumbConfigs = {
  gallery: [
    { name: 'Home', url: '/' },
    { name: 'Gallery', url: '/gallery', current: true }
  ],
  
  search: [
    { name: 'Home', url: '/' },
    { name: 'Search', url: '/search', current: true }
  ],
  
  upload: [
    { name: 'Home', url: '/' },
    { name: 'Upload Artwork', url: '/upload', current: true }
  ],
  
  profileSetup: [
    { name: 'Home', url: '/' },
    { name: 'Profile Setup', url: '/profile/setup', current: true }
  ],
  
  profileEdit: [
    { name: 'Home', url: '/' },
    { name: 'Profile', url: '/profile' },
    { name: 'Edit Profile', url: '/profile/edit', current: true }
  ],
  
  profileImages: [
    { name: 'Home', url: '/' },
    { name: 'My Profile', url: '/profile' },
    { name: 'My Images', url: '/profile/images', current: true }
  ],
  
  login: [
    { name: 'Home', url: '/' },
    { name: 'Sign In', url: '/login', current: true }
  ],

  // Dynamic breadcrumb generators
  imageDetail: (imageTitle: string, imageId: string): BreadcrumbItem[] => [
    { name: 'Home', url: '/' },
    { name: 'Gallery', url: '/gallery' },
    { name: imageTitle || 'Artwork', url: `/image/${imageId}`, current: true }
  ],

  categoryGallery: (category: string): BreadcrumbItem[] => [
    { name: 'Home', url: '/' },
    { name: 'Gallery', url: '/gallery' },
    { name: `${category} Art`, url: `/gallery?category=${category}`, current: true }
  ],

  artistProfile: (artistName: string, artistId: string): BreadcrumbItem[] => [
    { name: 'Home', url: '/' },
    { name: 'Artists', url: '/artists' },
    { name: artistName, url: `/artist/${artistId}`, current: true }
  ],

  searchResults: (query: string): BreadcrumbItem[] => [
    { name: 'Home', url: '/' },
    { name: 'Search', url: '/search' },
    { name: `"${query}"`, url: `/search?q=${encodeURIComponent(query)}`, current: true }
  ]
};