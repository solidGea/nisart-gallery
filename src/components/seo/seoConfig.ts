// SEO configurations for each page type

export interface PageSEOConfig {
  title?: string;
  description?: string;
  keywords?: string[];
  type?: 'website' | 'article' | 'profile';
  noIndex?: boolean;
}

// Homepage SEO Configuration
export const homeSEO: PageSEOConfig = {
  title: 'Discover Amazing Digital Art',
  description: 'Explore a curated collection of stunning digital artwork from talented artists worldwide. Join our vibrant creative community and discover your next favorite piece.',
  keywords: [
    'digital art gallery',
    'online art collection',
    'digital artists',
    'creative community',
    'art discovery',
    'visual art platform',
    'contemporary art',
    'digital illustrations',
    'art showcase',
    'creative inspiration'
  ],
  type: 'website'
};

// Gallery Page SEO Configuration
export const gallerySEO: PageSEOConfig = {
  title: 'Art Gallery Collection',
  description: 'Browse through our extensive collection of digital artwork organized by categories, styles, and themes. Find the perfect piece that speaks to you.',
  keywords: [
    'art gallery',
    'digital art collection',
    'browse artwork',
    'art categories',
    'visual art browser',
    'art discovery',
    'creative showcase',
    'digital art browse'
  ],
  type: 'website'
};

// Search Page SEO Configuration
export const searchSEO: PageSEOConfig = {
  title: 'Search Artwork',
  description: 'Search through thousands of digital artworks by title, artist, category, or tags. Discover new art and artists that match your interests.',
  keywords: [
    'art search',
    'find artwork',
    'discover artists',
    'art finder',
    'creative search',
    'art explorer'
  ],
  type: 'website'
};

// Upload Page SEO Configuration  
export const uploadSEO: PageSEOConfig = {
  title: 'Upload Your Artwork',
  description: 'Share your creative work with our community. Upload your digital art and connect with art enthusiasts from around the world.',
  keywords: [
    'upload art',
    'share artwork',
    'artist platform',
    'creative sharing',
    'art community',
    'showcase art'
  ],
  type: 'website',
  noIndex: true // Private page for authenticated users
};

// Profile Setup SEO Configuration
export const profileSetupSEO: PageSEOConfig = {
  title: 'Complete Your Artist Profile',
  description: 'Set up your artist profile to showcase your creative work and connect with the art community.',
  keywords: [
    'artist profile',
    'creative profile',
    'art portfolio setup'
  ],
  type: 'profile',
  noIndex: true // Private page
};

// Login Page SEO Configuration
export const loginSEO: PageSEOConfig = {
  title: 'Sign In to NisArt Gallery',
  description: 'Sign in to your NisArt Gallery account to upload artwork, create collections, and connect with the creative community.',
  keywords: [
    'sign in',
    'login',
    'artist account',
    'creative platform access'
  ],
  type: 'website',
  noIndex: true // Don't index auth pages
};

// Dynamic SEO generators
export function generateImageSEO(image: {
  title: string;
  description?: string;
  category?: string;
  tags?: string[];
  artist?: string;
  uploadDate?: string;
}): PageSEOConfig {
  const artistText = image.artist ? ` by ${image.artist}` : '';
  const categoryText = image.category ? ` - ${image.category} Art` : '';
  
  return {
    title: `${image.title}${artistText}${categoryText}`,
    description: image.description || 
      `View ${image.title}${artistText} on NisArt Gallery. ${image.category ? `Beautiful ${image.category.toLowerCase()} artwork` : 'Stunning digital art'} shared by our creative community.`,
    keywords: [
      ...(image.tags || []),
      image.category?.toLowerCase() || '',
      'digital art',
      'artwork',
      'creative',
      'visual art',
      ...(image.artist ? [image.artist.toLowerCase()] : [])
    ].filter(Boolean),
    type: 'article'
  };
}

export function generateCategorySEO(category: string, imageCount?: number): PageSEOConfig {
  const countText = imageCount ? ` - ${imageCount} artworks` : '';
  
  return {
    title: `${category} Art Gallery${countText}`,
    description: `Discover amazing ${category.toLowerCase()} digital artwork from talented artists. Browse our curated collection of ${category.toLowerCase()} art and find your next inspiration.`,
    keywords: [
      `${category.toLowerCase()} art`,
      `${category.toLowerCase()} artwork`,
      `${category.toLowerCase()} gallery`,
      `${category.toLowerCase()} digital art`,
      `${category.toLowerCase()} artists`,
      'digital art collection',
      'creative gallery',
      'visual art'
    ],
    type: 'website'
  };
}

export function generateArtistSEO(artist: {
  name: string;
  bio?: string;
  artworkCount?: number;
  location?: string;
}): PageSEOConfig {
  const countText = artist.artworkCount ? ` - ${artist.artworkCount} artworks` : '';
  const locationText = artist.location ? ` from ${artist.location}` : '';
  
  return {
    title: `${artist.name} - Digital Artist${countText}`,
    description: artist.bio || 
      `Discover amazing digital artwork by ${artist.name}${locationText}. View their portfolio and creative work on NisArt Gallery.`,
    keywords: [
      artist.name.toLowerCase(),
      'digital artist',
      'artist portfolio',
      'creative work',
      'digital art',
      'artwork collection',
      ...(artist.location ? [artist.location.toLowerCase()] : [])
    ].filter(Boolean),
    type: 'profile'
  };
}

export function generateSearchSEO(query?: string, category?: string): PageSEOConfig {
  if (query) {
    return {
      title: `Search Results for "${query}"`,
      description: `Find digital artwork related to "${query}". Discover artists and creative work that match your search on NisArt Gallery.`,
      keywords: [
        query.toLowerCase(),
        'art search',
        'find artwork',
        'digital art',
        'search results'
      ],
      type: 'website',
      noIndex: true // Don't index search result pages
    };
  }
  
  if (category) {
    return {
      title: `${category} Art Search`,
      description: `Search for ${category.toLowerCase()} digital artwork. Find the perfect ${category.toLowerCase()} art piece from our talented artist community.`,
      keywords: [
        `${category.toLowerCase()} search`,
        `find ${category.toLowerCase()} art`,
        'art search',
        'digital art'
      ],
      type: 'website'
    };
  }
  
  return searchSEO;
}