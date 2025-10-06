import React, { useState, useEffect } from 'react';
import { Link } from 'react-router-dom';
import { ArrowRight, Grid, Camera, Sparkles, Zap, Star } from 'lucide-react';
import { Button } from '../ui/Button';
import Stats from '../ui/Stats';
import { SEOHead } from '../seo/SEOHead';
import { OrganizationSchema } from '../seo/StructuredData';
import { homeSEO } from '../seo/seoConfig';
import { getApiBase } from '../../lib/api';

export const HomePage: React.FC = () => {
  const [featuredImage, setFeaturedImage] = useState<string | null>(null);

  // Fetch a featured image for social sharing
  useEffect(() => {
    async function fetchFeaturedImage() {
      try {
        const base = getApiBase();
        const response = await fetch(`${base}/images?limit=1`);
        const data = await response.json();
        
        if (data.success && data.data.length > 0) {
          const image = data.data[0];
          const imageUrl = `https://nisart.blockdev.my.id${image.url}`;
          setFeaturedImage(imageUrl);
        }
      } catch (error) {
        console.log('Failed to fetch featured image:', error);
      }
    }

    fetchFeaturedImage();
  }, []);

  return (
    <>
      {/* SEO Meta Tags */}
      <SEOHead
        title={homeSEO.title}
        description={homeSEO.description}
        keywords={homeSEO.keywords}
        type={homeSEO.type}
        url="/"
        image={featuredImage || undefined}
      />
      
      {/* Organization Structured Data */}
      <OrganizationSchema />
      
      <div className="space-y-12">
      {/* Hero Section */}
      <section className="relative text-center py-20 px-4 overflow-hidden">
        {/* Animated background elements */}
        <div className="absolute inset-0 -z-10">
          <div className="absolute top-20 left-10 w-32 h-32 bg-gradient-to-r from-pink-400 to-purple-500 rounded-full opacity-20 animate-pulse"></div>
          <div className="absolute top-40 right-20 w-20 h-20 bg-gradient-to-r from-cyan-400 to-blue-500 rounded-full opacity-30 animate-bounce"></div>
          <div className="absolute bottom-20 left-1/4 w-16 h-16 bg-gradient-to-r from-green-400 to-emerald-500 rounded-full opacity-25 animate-pulse delay-300"></div>
          <div className="absolute bottom-32 right-1/3 w-24 h-24 bg-gradient-to-r from-yellow-400 to-orange-500 rounded-full opacity-20 animate-bounce delay-700"></div>
        </div>

        <div className="relative">
          {/* Main heading with gradient */}
          <div className="mb-6">
            <h1 className="text-5xl md:text-7xl font-black mb-4">
              <span className="bg-gradient-to-r from-pink-400 via-purple-500 to-cyan-400 bg-clip-text text-transparent">
                NisArt
              </span>
              <br />
              <span className="bg-gradient-to-r from-cyan-400 via-blue-500 to-purple-500 bg-clip-text text-transparent">
                Gallery
              </span>
            </h1>
            <div className="flex justify-center items-center space-x-2 mt-2">
              <Sparkles className="h-6 w-6 text-yellow-400 animate-pulse" />
              <span className="text-lg font-semibold bg-gradient-to-r from-pink-500 to-violet-500 bg-clip-text text-transparent">
                Where Art Meets Future
              </span>
              <Sparkles className="h-6 w-6 text-yellow-400 animate-pulse delay-500" />
            </div>
          </div>

          {/* Subtitle */}
          <p className="text-xl md:text-2xl text-gray-300 mb-12 max-w-3xl mx-auto leading-relaxed">
            🚀 Discover mind-blowing visuals, share your creativity, and join the coolest art community in the galaxy! 
            <span className="inline-block ml-2">
              <Zap className="h-5 w-5 text-yellow-400 animate-pulse inline" />
            </span>
          </p>

          {/* Action buttons */}
          <div className="flex flex-col sm:flex-row gap-4 md:gap-6 justify-center items-center max-w-lg mx-auto">
            <Link to="/gallery" className="group w-full sm:w-auto">
              <div className="relative">
                <div className="absolute inset-0 bg-gradient-to-r from-pink-500 to-purple-600 rounded-full blur-lg opacity-70 group-hover:opacity-100 transition-all duration-300 animate-pulse"></div>
                <Button size="lg" className="relative bg-gradient-to-r from-pink-500 to-purple-600 hover:from-pink-600 hover:to-purple-700 text-white border-0 px-8 md:px-12 lg:px-16 py-4 md:py-5 lg:py-6 rounded-full shadow-2xl transform hover:scale-105 transition-all duration-300 w-full sm:w-auto min-w-[200px] md:min-w-[280px] lg:min-w-[320px]">
                  <Grid className="h-5 w-5 md:h-6 md:w-6 mr-3 md:mr-4" />
                  <span className="font-bold text-base md:text-lg lg:text-xl whitespace-nowrap">Explore Gallery</span>
                  <ArrowRight className="h-5 w-5 md:h-6 md:w-6 ml-3 md:ml-4 group-hover:translate-x-1 transition-transform" />
                </Button>
              </div>
            </Link>
            
            <Link to="/upload" className="group w-full sm:w-auto">
              <div className="relative">
                <div className="absolute inset-0 bg-gradient-to-r from-cyan-500 to-blue-600 rounded-full blur-lg opacity-70 group-hover:opacity-100 transition-all duration-300"></div>
                <Button variant="outline" size="lg" className="relative bg-black/20 border-2 border-cyan-400 text-cyan-300 hover:bg-cyan-500/20 hover:text-white px-8 md:px-12 lg:px-16 py-4 md:py-5 lg:py-6 rounded-full transform hover:scale-105 transition-all duration-300 w-full sm:w-auto min-w-[200px] md:min-w-[280px] lg:min-w-[320px]">
                  <Camera className="h-5 w-5 md:h-6 md:w-6 mr-3 md:mr-4" />
                  <span className="font-bold text-base md:text-lg lg:text-xl whitespace-nowrap">Share Your Art</span>
                  <Star className="h-4 w-4 md:h-5 md:w-5 ml-3 md:ml-4 group-hover:rotate-180 transition-transform duration-500" />
                </Button>
              </div>
            </Link>

          </div>

          {/* Dynamic stats */}
          <Stats />
        </div>
      </section>

      {/* Featured Albums (temporarily removed)
          Album management is not implemented yet, so the featured albums
          section was using mock data. Keeping this commented out until
          a proper album management feature exists. To restore, uncomment
          the original JSX and ensure `getFeaturedAlbums` provides real data.
      */}

      {/* Categories (removed)
          The categories section previously used `mockCategories` mock data.
          Since `Stats` now surfaces site-wide metrics and categories are
          not managed via backend, this section is commented out to avoid
          showing stale mock content. To restore, uncomment the JSX and
          ensure `mockCategories` is provided with live data.
      */}


    </div>
    </>
  );
};