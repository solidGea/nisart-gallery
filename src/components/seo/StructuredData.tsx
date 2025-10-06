import { Helmet } from 'react-helmet-async';

// Structured Data for Artwork/Image
export interface ArtworkSchemaProps {
  id: string;
  title: string;
  description?: string;
  imageUrl: string;
  artist?: {
    name: string;
    url?: string;
  };
  category?: string;
  tags?: string[];
  uploadDate?: string;
  width?: number;
  height?: number;
  fileSize?: number;
  fileFormat?: string;
}

export function ArtworkSchema({
  id,
  title,
  description,
  imageUrl,
  artist,
  category,
  tags = [],
  uploadDate,
  width,
  height,
  fileSize,
  fileFormat
}: ArtworkSchemaProps) {
  const schema = {
    "@context": "https://schema.org",
    "@type": "ImageObject",
    "@id": `https://nisart.blockdev.my.id/image/${id}`,
    "name": title,
    "description": description,
    "url": imageUrl,
    "contentUrl": imageUrl,
    "thumbnailUrl": imageUrl,
    "dateCreated": uploadDate,
    "encodingFormat": fileFormat,
    "width": width,
    "height": height,
    "contentSize": fileSize,
    "keywords": tags.join(', '),
    "genre": category,
    "creator": artist ? {
      "@type": "Person",
      "name": artist.name,
      "url": artist.url
    } : undefined,
    "publisher": {
      "@type": "Organization",
      "name": "NisArt Gallery",
      "url": "https://nisart.blockdev.my.id"
    },
    "license": "https://creativecommons.org/licenses/by/4.0/",
    "acquireLicensePage": `https://nisart.blockdev.my.id/image/${id}`,
    "creditText": artist ? `${title} by ${artist.name} on NisArt Gallery` : `${title} on NisArt Gallery`
  };

  return (
    <Helmet>
      <script type="application/ld+json">
        {JSON.stringify(schema)}
      </script>
    </Helmet>
  );
}

// Structured Data for Artist Profile
export interface ArtistSchemaProps {
  id: string;
  name: string;
  bio?: string;
  profileImage?: string;
  artworkCount?: number;
  joinDate?: string;
  website?: string;
  socialLinks?: {
    twitter?: string;
    instagram?: string;
    facebook?: string;
    linkedin?: string;
  };
  location?: string;
}

export function ArtistSchema({
  id,
  name,
  bio,
  profileImage,
  artworkCount,
  joinDate,
  website,
  socialLinks = {},
  location
}: ArtistSchemaProps) {
  const sameAs = [];
  if (socialLinks.twitter) sameAs.push(socialLinks.twitter);
  if (socialLinks.instagram) sameAs.push(socialLinks.instagram);
  if (socialLinks.facebook) sameAs.push(socialLinks.facebook);
  if (socialLinks.linkedin) sameAs.push(socialLinks.linkedin);
  if (website) sameAs.push(website);

  const schema = {
    "@context": "https://schema.org",
    "@type": "Person",
    "@id": `https://nisart.blockdev.my.id/artist/${id}`,
    "name": name,
    "description": bio,
    "image": profileImage,
    "url": `https://nisart.blockdev.my.id/artist/${id}`,
    "sameAs": sameAs,
    "jobTitle": "Digital Artist",
    "worksFor": {
      "@type": "Organization",
      "name": "NisArt Gallery"
    },
    "memberOf": {
      "@type": "Organization",
      "name": "NisArt Gallery",
      "url": "https://nisart.blockdev.my.id"
    },
    "address": location ? {
      "@type": "Place",
      "name": location
    } : undefined,
    "dateCreated": joinDate,
    "additionalProperty": [
      {
        "@type": "PropertyValue",
        "name": "Artwork Count",
        "value": artworkCount?.toString()
      }
    ]
  };

  return (
    <Helmet>
      <script type="application/ld+json">
        {JSON.stringify(schema)}
      </script>
    </Helmet>
  );
}

// Structured Data for Gallery Collection
export interface GallerySchemaProps {
  title: string;
  description?: string;
  category?: string;
  images?: Array<{
    id: string;
    title: string;
    imageUrl: string;
    artist?: string;
  }>;
  totalCount?: number;
}

export function GallerySchema({
  title,
  description,
  category,
  images = [],
  totalCount
}: GallerySchemaProps) {
  const schema = {
    "@context": "https://schema.org",
    "@type": "ImageGallery",
    "name": title,
    "description": description,
    "url": `https://nisart.blockdev.my.id/gallery${category ? `?category=${category}` : ''}`,
    "numberOfItems": totalCount || images.length,
    "genre": category,
    "publisher": {
      "@type": "Organization",
      "name": "NisArt Gallery",
      "url": "https://nisart.blockdev.my.id"
    },
    "hasPart": images.slice(0, 10).map((image, index) => ({
      "@type": "ImageObject",
      "@id": `https://nisart.blockdev.my.id/image/${image.id}`,
      "name": image.title,
      "url": image.imageUrl,
      "position": index + 1,
      "creator": image.artist ? {
        "@type": "Person",
        "name": image.artist
      } : undefined
    }))
  };

  return (
    <Helmet>
      <script type="application/ld+json">
        {JSON.stringify(schema)}
      </script>
    </Helmet>
  );
}

// Structured Data for Organization (Homepage)
export function OrganizationSchema() {
  const schema = {
    "@context": "https://schema.org",
    "@type": "Organization",
    "name": "NisArt Gallery",
    "alternateName": "NisArt",
    "url": "https://nisart.blockdev.my.id",
    "logo": "https://nisart.blockdev.my.id/logo.png",
    "description": "A vibrant digital art gallery platform where artists showcase their creativity and art lovers discover amazing artwork from around the world.",
    "foundingDate": "2025",
    "sameAs": [
      "https://twitter.com/nisartgallery",
      "https://instagram.com/nisartgallery"
    ],
    "contactPoint": {
      "@type": "ContactPoint",
      "contactType": "customer service",
      "email": "hello@nisart.blockdev.my.id"
    },
    "address": {
      "@type": "PostalAddress",
      "addressCountry": "ID"
    },
    "areaServed": "Worldwide",
    "serviceType": [
      "Digital Art Gallery",
      "Art Sharing Platform",
      "Creative Community"
    ]
  };

  return (
    <Helmet>
      <script type="application/ld+json">
        {JSON.stringify(schema)}
      </script>
    </Helmet>
  );
}

// Structured Data for Breadcrumbs
export interface BreadcrumbItem {
  name: string;
  url: string;
}

export function BreadcrumbSchema({ items }: { items: BreadcrumbItem[] }) {
  const schema = {
    "@context": "https://schema.org",
    "@type": "BreadcrumbList",
    "itemListElement": items.map((item, index) => ({
      "@type": "ListItem",
      "position": index + 1,
      "name": item.name,
      "item": `https://nisart.blockdev.my.id${item.url}`
    }))
  };

  return (
    <Helmet>
      <script type="application/ld+json">
        {JSON.stringify(schema)}
      </script>
    </Helmet>
  );
}