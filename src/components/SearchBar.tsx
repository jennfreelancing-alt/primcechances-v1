import React, { useState, useEffect } from 'react';
import { Input } from '@/components/ui/input';
import { Button } from '@/components/ui/button';
import { Card, CardContent } from '@/components/ui/card';
import { Badge } from '@/components/ui/badge';
import { Search, Filter, X, Clock, Bookmark, MapPin, Building } from 'lucide-react';
import { supabase } from '@/integrations/supabase/client';
import { motion, AnimatePresence } from 'framer-motion';

interface SearchResult {
  id: string;
  title: string;
  organization: string;
  category: string;
  location?: string;
  application_deadline?: string;
  is_featured: boolean;
  is_remote?: boolean;
}

interface SearchBarProps {
  onResultSelect?: (result: SearchResult) => void;
}

const SearchBar = ({ onResultSelect }: SearchBarProps) => {
  const [query, setQuery] = useState('');
  const [results, setResults] = useState<SearchResult[]>([]);
  const [isLoading, setIsLoading] = useState(false);
  const [showResults, setShowResults] = useState(false);
  const [recentSearches, setRecentSearches] = useState<string[]>([]);

  // Load recent searches from localStorage
  useEffect(() => {
    const saved = localStorage.getItem('recentSearches');
    if (saved) {
      setRecentSearches(JSON.parse(saved));
    }
  }, []);

  // Debounced search
  useEffect(() => {
    const timer = setTimeout(() => {
      if (query.trim()) {
        performSearch(query);
      } else {
        setResults([]);
        setShowResults(false);
      }
    }, 300);

    return () => clearTimeout(timer);
  }, [query]);

  const performSearch = async (searchQuery: string) => {
    setIsLoading(true);
    try {
      // Search opportunities with enhanced category matching
      const { data: opportunities, error: oppError } = await supabase
        .from('opportunities')
        .select(`
          id,
          title,
          organization,
          location,
          application_deadline,
          is_featured,
          is_remote,
          categories!inner(name)
        `)
        .or(`title.ilike.%${searchQuery}%,organization.ilike.%${searchQuery}%,description.ilike.%${searchQuery}%`)
        .eq('status', 'approved')
        .eq('is_published', true)
        .limit(8);

      // Also search by category name
      const { data: categoryResults, error: catError } = await supabase
        .from('opportunities')
        .select(`
          id,
          title,
          organization,
          location,
          application_deadline,
          is_featured,
          is_remote,
          categories!inner(name)
        `)
        .eq('categories.name', searchQuery.toLowerCase())
        .eq('status', 'approved')
        .eq('is_published', true)
        .limit(5);

      if (oppError && catError) throw oppError || catError;

      // Combine and deduplicate results
      const combinedResults = [...(opportunities || []), ...(categoryResults || [])];
      const uniqueResults = combinedResults.filter((item, index, self) =>
        index === self.findIndex(t => t.id === item.id)
      );

      const formattedResults = uniqueResults.map(item => ({
        id: item.id,
        title: item.title,
        organization: item.organization,
        category: (item.categories as any)?.name || 'Unknown',
        location: item.location,
        application_deadline: item.application_deadline,
        is_featured: item.is_featured,
        is_remote: item.is_remote
      })).slice(0, 10);

      setResults(formattedResults);
      setShowResults(true);
    } catch (error) {
      console.error('Search error:', error);
    } finally {
      setIsLoading(false);
    }
  };

  const saveSearch = (searchQuery: string) => {
    const updated = [searchQuery, ...recentSearches.filter(s => s !== searchQuery)].slice(0, 5);
    setRecentSearches(updated);
    localStorage.setItem('recentSearches', JSON.stringify(updated));
  };

  const handleResultClick = (result: SearchResult) => {
    saveSearch(query);
    setShowResults(false);
    onResultSelect?.(result);
  };

  const clearSearch = () => {
    setQuery('');
    setResults([]);
    setShowResults(false);
  };

  const handleRecentSearchClick = (searchTerm: string) => {
    setQuery(searchTerm);
    performSearch(searchTerm);
  };

  return (
    <div className="relative w-full max-w-2xl">
      <motion.div
        className="relative"
        whileFocus={{ scale: 1.02 }}
        transition={{ duration: 0.2 }}
      >
        <Search className="absolute left-4 top-1/2 transform -translate-y-1/2 text-[#008000] w-5 h-5" />
        <Input
          type="text"
          placeholder="Search opportunities, organizations, categories..."
          value={query}
          onChange={(e) => setQuery(e.target.value)}
          onFocus={() => setShowResults(query.trim().length > 0 || recentSearches.length > 0)}
          className="pl-12 pr-12 h-12 rounded-2xl border-[#e6f5ec]/50 bg-white/90 backdrop-blur-sm focus:border-[#008000] focus:ring-[#008000] text-base"
        />
        {query && (
          <Button
            variant="ghost"
            size="sm"
            onClick={clearSearch}
            className="absolute right-3 top-1/2 transform -translate-y-1/2 p-1 h-auto text-[#008000] hover:bg-[#008000]/10"
          >
            <X className="w-4 h-4" />
          </Button>
        )}
      </motion.div>

      <AnimatePresence>
        {showResults && (
          <motion.div
            initial={{ opacity: 0, y: -10 }}
            animate={{ opacity: 1, y: 0 }}
            exit={{ opacity: 0, y: -10 }}
            transition={{ duration: 0.2 }}
          >
            <Card className="absolute top-full left-0 right-0 mt-2 z-50 max-h-96 overflow-y-auto bg-white/95 backdrop-blur-sm border-[#e6f5ec]/50 shadow-xl rounded-2xl">
              <CardContent className="p-0">
                {isLoading ? (
                  <div className="p-6 text-center text-gray-500">
                    <div className="animate-spin rounded-full h-6 w-6 border-b-2 border-[#008000] mx-auto mb-2"></div>
                    Searching...
                  </div>
                ) : results.length > 0 ? (
                  <div className="divide-y divide-gray-100">
                    {results.map((result, index) => (
                      <motion.div
                        key={result.id}
                        initial={{ opacity: 0, x: -10 }}
                        animate={{ opacity: 1, x: 0 }}
                        transition={{ duration: 0.2, delay: index * 0.05 }}
                        onClick={() => handleResultClick(result)}
                        className="p-4 hover:bg-[#008000]/5 cursor-pointer transition-colors"
                      >
                        <div className="flex items-start justify-between">
                          <div className="flex-1">
                            <h4 className="font-medium text-gray-900 text-sm mb-1">{result.title}</h4>
                            <div className="flex items-center gap-2 text-sm text-gray-600 mb-2">
                              <span className="flex items-center">
                                <Building className="w-3 h-3 mr-1 text-[#008000]" />
                                {result.organization}
                              </span>
                              {result.location && (
                                <span className="flex items-center">
                                  <MapPin className="w-3 h-3 mr-1 text-[#008000]" />
                                  {result.location}
                                </span>
                              )}
                            </div>
                            <div className="flex items-center gap-2">
                              <Badge
                                variant="outline"
                                className="text-xs border-[#008000]/30 text-[#008000] bg-[#008000]/5"
                              >
                                {result.category}
                              </Badge>
                              {result.is_remote && (
                                <Badge variant="secondary" className="text-xs bg-green-100 text-green-800">
                                  Remote
                                </Badge>
                              )}
                              {result.is_featured && (
                                <Badge variant="secondary" className="text-xs bg-yellow-100 text-yellow-800">
                                  Featured
                                </Badge>
                              )}
                            </div>
                          </div>
                          <Bookmark className="w-4 h-4 text-[#008000]/60" />
                        </div>
                      </motion.div>
                    ))}
                  </div>
                ) : query.trim() ? (
                  <div className="p-6 text-center text-gray-500">
                    No results found for "{query}"
                  </div>
                ) : recentSearches.length > 0 ? (
                  <div className="p-4">
                    <h5 className="text-sm font-medium text-gray-700 mb-3 flex items-center gap-2">
                      <Clock className="w-4 h-4 text-[#008000]" />
                      Recent Searches
                    </h5>
                    <div className="space-y-1">
                      {recentSearches.map((search, index) => (
                        <motion.div
                          key={index}
                          initial={{ opacity: 0, x: -10 }}
                          animate={{ opacity: 1, x: 0 }}
                          transition={{ duration: 0.2, delay: index * 0.05 }}
                          onClick={() => handleRecentSearchClick(search)}
                          className="text-sm text-gray-600 hover:text-[#008000] cursor-pointer py-2 px-2 rounded-lg hover:bg-[#008000]/5 transition-colors"
                        >
                          {search}
                        </motion.div>
                      ))}
                    </div>
                  </div>
                ) : null}
              </CardContent>
            </Card>
          </motion.div>
        )}
      </AnimatePresence>
    </div>
  );
};

export default SearchBar;
