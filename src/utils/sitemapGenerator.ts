// Sitemap generator for NisArt Gallery
// This should be run periodically to generate/update sitemap.xml

interface SitemapUrl {
  url: string;
  lastmod?: string;
  changefreq?: 'always' | 'hourly' | 'daily' | 'weekly' | 'monthly' | 'yearly' | 'never';
  priority?: number;
}

const SITE_URL = 'https://nisart.blockdev.my.id';

export class SitemapGenerator {
  private urls: SitemapUrl[] = [];

  constructor() {
    // Add static pages
    this.addStaticPages();
  }

  private addStaticPages() {
    // Homepage - highest priority
    this.addUrl({
      url: '/',
      changefreq: 'daily',
      priority: 1.0
    });

    // Gallery page
    this.addUrl({
      url: '/gallery',
      changefreq: 'hourly',
      priority: 0.9
    });

    // Search page
    this.addUrl({
      url: '/search',
      changefreq: 'weekly',
      priority: 0.7
    });
  }

  public addUrl(urlData: SitemapUrl) {
    const fullUrl = urlData.url.startsWith('http') 
      ? urlData.url 
      : `${SITE_URL}${urlData.url}`;

    this.urls.push({
      ...urlData,
      url: fullUrl,
      lastmod: urlData.lastmod || new Date().toISOString().split('T')[0]
    });
  }

  public addImages(images: Array<{
    id: string;
    title: string;
    updatedAt?: string;
  }>) {
    images.forEach(image => {
      this.addUrl({
        url: `/image/${image.id}`,
        lastmod: image.updatedAt,
        changefreq: 'weekly',
        priority: 0.8
      });
    });
  }

  public addCategories(categories: Array<{
    name: string;
    slug: string;
    updatedAt?: string;
  }>) {
    categories.forEach(category => {
      this.addUrl({
        url: `/gallery?category=${encodeURIComponent(category.slug)}`,
        lastmod: category.updatedAt,
        changefreq: 'daily',
        priority: 0.7
      });
    });
  }

  public addArtists(artists: Array<{
    id: string;
    name: string;
    updatedAt?: string;
  }>) {
    artists.forEach(artist => {
      this.addUrl({
        url: `/artist/${artist.id}`,
        lastmod: artist.updatedAt,
        changefreq: 'weekly',
        priority: 0.6
      });
    });
  }

  public generateXML(): string {
    const xmlHeader = `<?xml version="1.0" encoding="UTF-8"?>
<urlset xmlns="http://www.sitemaps.org/schemas/sitemap/0.9">`;

    const xmlUrls = this.urls.map(url => {
      const changefreq = url.changefreq ? `
    <changefreq>${url.changefreq}</changefreq>` : '';
      
      const priority = url.priority ? `
    <priority>${url.priority}</priority>` : '';
      
      const lastmod = url.lastmod ? `
    <lastmod>${url.lastmod}</lastmod>` : '';

      return `  <url>
    <loc>${url.url}</loc>${lastmod}${changefreq}${priority}
  </url>`;
    }).join('\n');

    const xmlFooter = `
</urlset>`;

    return xmlHeader + '\n' + xmlUrls + xmlFooter;
  }

  public generateRobotsTxt(): string {
    return `User-agent: *
Allow: /

# Disallow private/auth pages
Disallow: /login
Disallow: /profile/
Disallow: /upload

# Sitemap
Sitemap: ${SITE_URL}/sitemap.xml

# Crawl delay (optional)
Crawl-delay: 1`;
  }
}

// Example usage in a Node.js script or API endpoint
export async function generateSitemapFiles() {
  const generator = new SitemapGenerator();

  try {
    // Fetch data from your API/database
    // const images = await fetchAllImages();
    // const categories = await fetchAllCategories();
    // const artists = await fetchAllArtists();

    // generator.addImages(images);
    // generator.addCategories(categories);
    // generator.addArtists(artists);

    const sitemapXML = generator.generateXML();
    const robotsTxt = generator.generateRobotsTxt();

    return {
      sitemap: sitemapXML,
      robots: robotsTxt
    };
  } catch (error) {
    console.error('Error generating sitemap:', error);
    throw error;
  }
}

// For manual testing/generation
if (typeof window === 'undefined') {
  // Node.js environment - can be run as a script
  generateSitemapFiles().then(({ sitemap, robots }) => {
    console.log('Generated sitemap.xml:');
    console.log(sitemap);
    console.log('\nGenerated robots.txt:');
    console.log(robots);
  }).catch(console.error);
}