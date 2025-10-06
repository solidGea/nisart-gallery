import { Helmet } from 'react-helmet-async';

export interface SEOProps {
  title?: string;
  description?: string;
  keywords?: string[];
  image?: string;
  url?: string;
  type?: 'website' | 'article' | 'profile';
  author?: string;
  publishedTime?: string;
  modifiedTime?: string;
  section?: string;
  tags?: string[];
  noIndex?: boolean;
  canonicalUrl?: string;
}

interface SEODefaults {
  siteName: string;
  siteUrl: string;
  defaultTitle: string;
  defaultDescription: string;
  defaultImage: string;
  defaultKeywords: string[];
  twitterHandle: string;
}

const SEO_DEFAULTS: SEODefaults = {
  siteName: 'NisArt Gallery',
  siteUrl: 'https://nisart.blockdev.my.id',
  defaultTitle: 'NisArt Gallery - Discover & Share Amazing Digital Art',
  defaultDescription: 'Explore a curated collection of stunning digital artwork from talented artists worldwide. Upload, discover, and share beautiful art in our vibrant community.',
  defaultImage: `https://nisart.blockdev.my.id/api/v1/images/85ac23b9-dfbb-42f2-800c-b0b86baff2ce/thumbnail`,
  defaultKeywords: [
    'digital art',
    'art gallery',
    'artwork',
    'artists',
    'creative',
    'design',
    'illustration',
    'photography',
    'visual art',
    'art community'
  ],
  twitterHandle: '@NisArtGallery'
};

export function SEOHead({
  title,
  description = SEO_DEFAULTS.defaultDescription,
  keywords = [],
  image = SEO_DEFAULTS.defaultImage,
  url,
  type = 'website',
  author,
  publishedTime,
  modifiedTime,
  section,
  tags = [],
  noIndex = false,
  canonicalUrl
}: SEOProps) {
  const fullTitle = title 
    ? `${title} | ${SEO_DEFAULTS.siteName}`
    : SEO_DEFAULTS.defaultTitle;

  const fullUrl = url 
    ? `${SEO_DEFAULTS.siteUrl}${url}`
    : SEO_DEFAULTS.siteUrl;

  const allKeywords = [...SEO_DEFAULTS.defaultKeywords, ...keywords];
  const keywordString = allKeywords.join(', ');

  // Ensure image is absolute URL
  const fullImage = image.startsWith('http') ? image : `${SEO_DEFAULTS.siteUrl}${image}`;

  return (
    <Helmet>
      {/* Basic Meta Tags */}
      <title>{fullTitle}</title>
      <meta name="description" content={description} />
      <meta name="keywords" content={keywordString} />
      
      {/* Canonical URL */}
      <link rel="canonical" href={canonicalUrl || fullUrl} />
      
      {/* Robots */}
      {noIndex && <meta name="robots" content="noindex, nofollow" />}
      
      {/* Open Graph Meta Tags */}
      <meta property="og:title" content={fullTitle} />
      <meta property="og:description" content={description} />
      <meta property="og:image" content={fullImage} />
      <meta property="og:url" content={fullUrl} />
      <meta property="og:type" content={type} />
      <meta property="og:site_name" content={SEO_DEFAULTS.siteName} />
      <meta property="og:locale" content="en_US" />
      
      {/* Twitter Card Meta Tags */}
      <meta name="twitter:card" content="summary_large_image" />
      <meta name="twitter:site" content={SEO_DEFAULTS.twitterHandle} />
      <meta name="twitter:creator" content={author ? `@${author}` : SEO_DEFAULTS.twitterHandle} />
      <meta name="twitter:title" content={fullTitle} />
      <meta name="twitter:description" content={description} />
      <meta name="twitter:image" content={fullImage} />
      
      {/* Article Meta Tags (for image details, profiles) */}
      {type === 'article' && (
        <>
          {author && <meta property="article:author" content={author} />}
          {publishedTime && <meta property="article:published_time" content={publishedTime} />}
          {modifiedTime && <meta property="article:modified_time" content={modifiedTime} />}
          {section && <meta property="article:section" content={section} />}
          {tags.map((tag, index) => (
            <meta key={index} property="article:tag" content={tag} />
          ))}
        </>
      )}
      
      {/* Additional Meta Tags */}
      <meta name="theme-color" content="#8B5CF6" />
      <meta name="msapplication-TileColor" content="#8B5CF6" />
      
      {/* Structured Data - Basic WebSite Schema */}
      <script type="application/ld+json">
        {JSON.stringify({
          "@context": "https://schema.org",
          "@type": "WebSite",
          "name": SEO_DEFAULTS.siteName,
          "url": SEO_DEFAULTS.siteUrl,
          "description": SEO_DEFAULTS.defaultDescription,
          "potentialAction": {
            "@type": "SearchAction",
            "target": {
              "@type": "EntryPoint",
              "urlTemplate": `${SEO_DEFAULTS.siteUrl}/search?q={search_term_string}`
            },
            "query-input": "required name=search_term_string"
          }
        })}
      </script>
    </Helmet>
  );
}

// Utility function to generate SEO-friendly slugs
export function generateSlug(text: string): string {
  return text
    .toLowerCase()
    .replace(/[^\w\s-]/g, '')
    .replace(/\s+/g, '-')
    .replace(/-+/g, '-')
    .trim();
}

// Utility function to truncate text for descriptions
export function truncateText(text: string, maxLength: number = 160): string {
  if (text.length <= maxLength) return text;
  return text.slice(0, maxLength - 3).trim() + '...';
}

// SEO-optimized image alt text generator
export function generateImageAlt(
  title?: string, 
  category?: string, 
  tags?: string[], 
  artist?: string
): string {
  const parts: string[] = [];
  
  if (title) parts.push(title);
  if (artist) parts.push(`by ${artist}`);
  if (category) parts.push(`${category} art`);
  if (tags && tags.length > 0) {
    parts.push(tags.slice(0, 2).join(' '));
  }
  
  return parts.join(' - ').replace(/\s+/g, ' ').trim();
}