import React, { useState, useEffect } from 'react';
import { useSearchParams, Link } from 'react-router-dom';
import { Search as SearchIcon, X, Filter } from 'lucide-react';
import { getApiBase } from '../../lib/api';
import { Button } from '../ui/Button';
import { Input } from '../ui/Input';
import { Badge } from '../ui/Badge';
import type { Image } from '../../types';
import { SEOHead } from '../seo/SEOHead';
import { Breadcrumb, breadcrumbConfigs } from '../seo/Breadcrumb';
import { generateSearchSEO } from '../seo/seoConfig';


export const SearchPage: React.FC = () => {
  const [searchParams, setSearchParams] = useSearchParams();
  const [searchQuery, setSearchQuery] = useState(searchParams.get('q') || '');
  const [selectedCategories, setSelectedCategories] = useState<string[]>([]);
  const [selectedTags, setSelectedTags] = useState<string[]>([]);
  const [searchResults, setSearchResults] = useState<Image[]>([]);
  const [isSearching, setIsSearching] = useState(false);
  const [categories, setCategories] = useState<any[]>([]);
  const [allTags, setAllTags] = useState<string[]>([]);

  // Load categories and initial images
  useEffect(() => {
    let cancelled = false;
    async function load() {
      try {
        const base = getApiBase();
        console.log('Loading categories and images from:', base);
        
        const [catRes, imgRes] = await Promise.all([
          fetch(`${base}/categories`),
          fetch(`${base}/images?limit=12`),
        ]);
        
        console.log('Categories response status:', catRes.status);
        console.log('Images response status:', imgRes.status);
        
        if (!catRes.ok) {
          throw new Error(`Categories API error: ${catRes.status} ${catRes.statusText}`);
        }
        if (!imgRes.ok) {
          throw new Error(`Images API error: ${imgRes.status} ${imgRes.statusText}`);
        }
        
        const catJson = await catRes.json();
        const imgJson = await imgRes.json();
        
        console.log('Categories response:', catJson);
        console.log('Images response:', imgJson);
        
        if (!cancelled) {
          // Handle categories
          if (catJson && catJson.success && Array.isArray(catJson.data)) {
            console.log('Setting categories:', catJson.data);
            // Transform API response to match frontend expectations
            const transformedCategories = catJson.data.map((cat: any) => ({
              id: String(cat.id), // Convert number to string
              name: cat.name,
              description: cat.description,
              imageCount: cat.image_count || 0, // Map image_count to imageCount
              created_at: cat.created_at
            }));
            setCategories(transformedCategories);
          } else if (catJson && Array.isArray(catJson)) {
            console.log('Setting categories (direct array):', catJson);
            const transformedCategories = catJson.map((cat: any) => ({
              id: String(cat.id),
              name: cat.name,
              description: cat.description,
              imageCount: cat.image_count || 0,
              created_at: cat.created_at
            }));
            setCategories(transformedCategories);
          } else {
            console.warn('Unexpected categories format:', catJson);
            setCategories([]);
          }
          
          // Handle images
          if (imgJson && imgJson.success) {
            const imgs: Image[] = (imgJson.data || []).map((img: any) => ({
              ...img,
              thumbnailUrl: img.thumbnailUrl 
                ? (img.thumbnailUrl.startsWith('http') 
                   ? img.thumbnailUrl 
                   : `${base.replace('/api/v1', '')}${img.thumbnailUrl}`)
                : undefined
            }));
            setSearchResults(imgs);
            const tags = Array.from(new Set(imgs.flatMap(i => i.tags || []))).sort();
            setAllTags(tags);
          }
        }
      } catch (err) {
        console.error('Failed to load search initial data:', err);
        if (!cancelled) {
          // Set fallback categories for testing
          setCategories([
            { id: 'digital-art', name: 'Digital Art', imageCount: 0 },
            { id: 'photography', name: 'Photography', imageCount: 0 },
            { id: 'illustration', name: 'Illustration', imageCount: 0 },
            { id: 'design', name: 'Design', imageCount: 0 }
          ]);
          setSearchResults([]);
        }
      }
    }
    load();
    return () => { cancelled = true };
  }, []);

  // Perform search when query or filters change
  useEffect(() => {
    if (!searchQuery.trim() && selectedCategories.length === 0 && selectedTags.length === 0) {
      // no search/filter - keep initial results
      return;
    }

    setIsSearching(true);
    const timer = setTimeout(async () => {
      try {
        const base = getApiBase();
        const params: string[] = [];
        if (searchQuery.trim()) params.push(`search=${encodeURIComponent(searchQuery.trim())}`);
        if (selectedCategories.length > 0) params.push(`categories=${encodeURIComponent(selectedCategories.join(','))}`);
        if (selectedTags.length > 0) params.push(`tags=${encodeURIComponent(selectedTags.join(','))}`);
        params.push('limit=50');
        const url = `${base}/images?${params.join('&')}`;
        const res = await fetch(url);
        const json = await res.json();
        if (json && json.success) {
          const imgs: Image[] = (json.data || []).map((img: any) => ({
            ...img,
            thumbnailUrl: img.thumbnailUrl 
              ? (img.thumbnailUrl.startsWith('http') 
                 ? img.thumbnailUrl 
                 : `${base.replace('/api/v1', '')}${img.thumbnailUrl}`)
              : undefined
          }));
          setSearchResults(imgs);
          const tags = Array.from(new Set(imgs.flatMap(i => i.tags || []))).sort();
          setAllTags(tags);
        }
      } catch (err) {
        console.error('Search failed', err);
      } finally {
        setIsSearching(false);
      }
    }, 300);

    return () => clearTimeout(timer);
  }, [searchQuery, selectedCategories, selectedTags]);

  const handleSearch = (e: React.FormEvent) => {
    e.preventDefault();
    const params = new URLSearchParams();
    if (searchQuery.trim()) {
      params.set('q', searchQuery);
    }
    setSearchParams(params);
  };

  const toggleCategory = (categoryName: string) => {
    setSelectedCategories(prev => 
      prev.includes(categoryName)
        ? prev.filter(name => name !== categoryName)
        : [...prev, categoryName]
    );
  };

  const toggleTag = (tag: string) => {
    setSelectedTags(prev => 
      prev.includes(tag)
        ? prev.filter(t => t !== tag)
        : [...prev, tag]
    );
  };

  const clearFilters = () => {
    setSelectedCategories([]);
    setSelectedTags([]);
  };

  const hasActiveFilters = selectedCategories.length > 0 || selectedTags.length > 0;

  // Generate SEO configuration
  const seoConfig = generateSearchSEO(searchQuery, selectedCategories[0]);
  
  // Generate URL for canonical link
  const searchUrl = (() => {
    const params = new URLSearchParams();
    if (searchQuery) params.set('q', searchQuery);
    if (selectedCategories.length > 0) params.set('categories', selectedCategories.join(','));
    if (selectedTags.length > 0) params.set('tags', selectedTags.join(','));
    const queryString = params.toString();
    return `/search${queryString ? `?${queryString}` : ''}`;
  })();

  // Generate breadcrumb items
  const breadcrumbItems = searchQuery 
    ? breadcrumbConfigs.searchResults(searchQuery)
    : breadcrumbConfigs.search;

  return (
    <>
      <SEOHead 
        {...seoConfig}
        url={searchUrl}
        tags={searchQuery ? [searchQuery, ...selectedTags] : selectedTags}
      />
      
      <div className="space-y-6">
        <Breadcrumb items={breadcrumbItems} />
        
        {/* Header */}
        <div>
        <h1 className="text-3xl font-bold text-white">Search Images</h1>
        <p className="text-gray-300 mt-1">
          Find images by title, description, or tags
        </p>
      </div>

      {/* Search Form */}
      <div className="bg-black/40 backdrop-blur-sm rounded-lg shadow-xl border border-white/10 p-6">
        <form onSubmit={handleSearch} className="space-y-4">
          <div className="relative">
            <SearchIcon className="absolute left-3 top-1/2 transform -translate-y-1/2 h-5 w-5 text-gray-400" />
            <Input
              type="text"
              placeholder="Search for images..."
              value={searchQuery}
              onChange={(e) => setSearchQuery(e.target.value)}
              className="pl-10 text-lg h-12"
            />
          </div>
          
          <div className="flex items-center justify-between">
            <div className="text-sm text-gray-300">
              {searchQuery && (
                <>
                  {isSearching ? 'Searching...' : `${searchResults.length} results found`}
                </>
              )}
            </div>
            <Button type="submit" disabled={!searchQuery.trim()}>
              Search
            </Button>
          </div>
        </form>
      </div>

      {/* Filters */}
      <div className="bg-black/40 backdrop-blur-sm rounded-lg shadow-xl border border-white/10 p-6">
        <div className="flex items-center justify-between mb-4">
          <h3 className="text-lg font-semibold text-white flex items-center">
            <Filter className="h-5 w-5 mr-2" />
            Filters
          </h3>
          {hasActiveFilters && (
            <Button variant="ghost" size="sm" onClick={clearFilters}>
              <X className="h-4 w-4 mr-1" />
              Clear all
            </Button>
          )}
        </div>

        <div className="space-y-6">
          {/* Categories */}
          <div>
            <h4 className="text-sm font-medium text-white mb-3">Categories</h4>
            <div className="flex flex-wrap gap-2">
              {categories.map((category) => (
                <button
                  key={category.id}
                  onClick={() => toggleCategory(category.name)}
                  className={`px-3 py-2 rounded-md text-sm font-medium transition-colors ${
                    selectedCategories.includes(category.name)
                      ? 'bg-blue-600 text-white'
                      : 'bg-black/30 text-gray-300 hover:bg-black/50 border border-white/10'
                  }`}
                >
                  {category.name}
                  <span className="ml-1 text-xs opacity-75">
                    ({category.imageCount || 0})
                  </span>
                </button>
              ))}
            </div>
          </div>

          {/* Tags */}
          <div>
            <h4 className="text-sm font-medium text-white mb-3">Tags</h4>
            <div className="flex flex-wrap gap-2 max-h-32 overflow-y-auto">
              {allTags.map((tag) => (
                <button
                  key={tag}
                  onClick={() => toggleTag(tag)}
                  className={`px-2 py-1 rounded-md text-sm transition-colors ${
                    selectedTags.includes(tag)
                      ? 'bg-blue-600 text-white'
                      : 'bg-black/30 text-gray-300 hover:bg-black/50 border border-white/10'
                  }`}
                >
                  {tag}
                </button>
              ))}
            </div>
          </div>
        </div>
      </div>

      {/* Active Filters Display */}
      {hasActiveFilters && (
        <div className="flex flex-wrap gap-2">
          <span className="text-sm font-medium text-gray-700">Active filters:</span>
          {selectedCategories.map((categoryName) => {
            const category = categories.find(c => c.name === categoryName);
            return (
              <Badge
                key={categoryName}
                variant="default"
                className="cursor-pointer"
                onClick={() => toggleCategory(categoryName)}
              >
                {category?.name}
                <X className="h-3 w-3 ml-1" />
              </Badge>
            );
          })}
          {selectedTags.map((tag) => (
            <Badge
              key={tag}
              variant="secondary"
              className="cursor-pointer"
              onClick={() => toggleTag(tag)}
            >
              {tag}
              <X className="h-3 w-3 ml-1" />
            </Badge>
          ))}
        </div>
      )}

      {/* Search Results */}
      {searchQuery && (
        <div>
          <h2 className="text-xl font-semibold text-white mb-4">
            Search Results
            {!isSearching && (
              <span className="text-base font-normal text-gray-300 ml-2">
                ({searchResults.length} found)
              </span>
            )}
          </h2>

          {isSearching ? (
            <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4 gap-6">
              {/* Loading skeleton */}
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
          ) : searchResults.length > 0 ? (
            <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4 gap-6">
              {searchResults.map((image) => (
                <Link
                  key={image.id}
                  to={`/image/${image.id}`}
                  className="group bg-black/40 backdrop-blur-sm rounded-lg shadow-xl border border-white/10 overflow-hidden hover:shadow-2xl transition-all duration-300"
                >
                  <div className="aspect-w-1 aspect-h-1">
                    <img
                      src={image.thumbnailUrl}
                      alt={image.title}
                      className="w-full h-48 object-cover group-hover:scale-105 transition-transform duration-300"
                    />
                  </div>
                  <div className="p-4">
                    <h3 className="font-semibold text-white truncate mb-1">
                      {image.title}
                    </h3>
                    {image.description && (
                      <p className="text-sm text-gray-300 line-clamp-2 mb-2">
                        {image.description}
                      </p>
                    )}
                    <div className="flex flex-wrap gap-1">
                      <Badge variant="secondary" className="text-xs">
                        {categories.find(cat => cat.id === image.category)?.name}
                      </Badge>
                      {image.tags.slice(0, 2).map((tag) => (
                        <Badge key={tag} variant="outline" className="text-xs">
                          {tag}
                        </Badge>
                      ))}
                    </div>
                  </div>
                </Link>
              ))}
            </div>
          ) : (
            <div className="text-center py-12">
              <SearchIcon className="h-12 w-12 text-gray-400 mx-auto mb-4" />
              <h3 className="text-lg font-medium text-white mb-2">No results found</h3>
              <p className="text-gray-300">
                Try different keywords or adjust your filters.
              </p>
            </div>
          )}
        </div>
      )}

      {/* Suggested Searches */}
          {!searchQuery && (
        <div className="bg-black/40 backdrop-blur-sm rounded-lg shadow-xl border border-white/10 p-6">
          <h3 className="text-lg font-semibold text-white mb-4">Popular Tags</h3>
          <div className="flex flex-wrap gap-2">
            {allTags.slice(0, 10).map((tag) => (
              <button
                key={tag}
                onClick={() => setSearchQuery(tag)}
                className="px-3 py-2 bg-black/30 text-gray-300 rounded-md text-sm hover:bg-black/50 border border-white/10 transition-colors"
              >
                {tag}
              </button>
            ))}
          </div>
        </div>
      )}
    </div>
    </>
  );
};