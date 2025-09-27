import React, { useState, useEffect } from 'react';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Badge } from '@/components/ui/badge';
import { Bookmark, BookmarkCheck, MapPin, Calendar, Building, ExternalLink, ChevronLeft, ChevronRight } from 'lucide-react';
import { supabase } from '@/integrations/supabase/client';
import { useAuth } from '@/hooks/useAuth';
import { toast } from '@/hooks/use-toast';
import { format } from 'date-fns';
import { Link } from 'react-router-dom';
import { motion } from 'framer-motion';
import {
  Pagination,
  PaginationContent,
  PaginationItem,
  PaginationLink,
  PaginationNext,
  PaginationPrevious,
} from "@/components/ui/pagination";

interface Opportunity {
  id: string;
  title: string;
  description: string;
  organization: string;
  location?: string;
  is_remote?: boolean;
  application_deadline?: string;
  created_at: string;
  category: {
    name: string;
    color?: string;
  };
}

interface OpportunitiesListProps {
  categoryFilter?: string;
  searchQuery?: string;
  limit?: number;
  showBookmarksOnly?: boolean;
  showApplicationsOnly?: boolean;
}

const OpportunitiesList = ({
  categoryFilter = '',
  searchQuery = '',
  limit = 10,
  showBookmarksOnly = false,
  showApplicationsOnly = false
}: OpportunitiesListProps) => {
  const { user } = useAuth();
  const [opportunities, setOpportunities] = useState<Opportunity[]>([]);
  const [bookmarks, setBookmarks] = useState<Set<string>>(new Set());
  const [loading, setLoading] = useState(true);
  const [currentPage, setCurrentPage] = useState(1);
  const [totalPages, setTotalPages] = useState(1);
  const [totalCount, setTotalCount] = useState(0);

  useEffect(() => {
    setCurrentPage(1);
    fetchOpportunities(1);
  }, [categoryFilter, searchQuery, showBookmarksOnly, showApplicationsOnly]);

  useEffect(() => {
    if (user) {
      fetchBookmarks();
    }
  }, [user]);

  const fetchOpportunities = async (page = 1) => {
    try {
      setLoading(true);

      const from = (page - 1) * limit;
      const to = from + limit - 1;

      let query = supabase
        .from('opportunities')
        .select(`
          id,
          title,
          description,
          organization,
          location,
          is_remote,
          application_deadline,
          created_at,
          category:categories(name, color)
        `, { count: 'exact' })
        .eq('status', 'approved')
        .order('created_at', { ascending: false })
        .range(from, to);

      // Apply category filter
      if (categoryFilter) {
        const { data: categoryData } = await supabase
          .from('categories')
          .select('id')
          .eq('name', categoryFilter)
          .single();

        if (categoryData) {
          query = query.eq('category_id', categoryData.id);
        }
      }

      // Apply search query - search across title, description, organization, and category
      if (searchQuery) {
        // First get categories that match the search
        const { data: matchingCategories } = await supabase
          .from('categories')
          .select('id')
          .ilike('name', `%${searchQuery}%`);

        const categoryIds = matchingCategories?.map(cat => cat.id) || [];

        if (categoryIds.length > 0) {
          query = query.or(`title.ilike.%${searchQuery}%,description.ilike.%${searchQuery}%,organization.ilike.%${searchQuery}%,category_id.in.(${categoryIds.join(',')})`);
        } else {
          query = query.or(`title.ilike.%${searchQuery}%,description.ilike.%${searchQuery}%,organization.ilike.%${searchQuery}%`);
        }
      }

      // Handle bookmarks-only filter
      if (showBookmarksOnly && user) {
        const { data: userBookmarks } = await supabase
          .from('user_bookmarks')
          .select('opportunity_id')
          .eq('user_id', user.id);

        const bookmarkedIds = userBookmarks?.map(b => b.opportunity_id) || [];

        if (bookmarkedIds.length === 0) {
          setOpportunities([]);
          setTotalPages(1);
          setTotalCount(0);
          return;
        }

        query = query.in('id', bookmarkedIds);
      }

      // Handle applications-only filter
      if (showApplicationsOnly && user) {
        const { data: userApplications } = await supabase
          .from('user_applications')
          .select('opportunity_id')
          .eq('user_id', user.id);

        const appliedIds = userApplications?.map(a => a.opportunity_id) || [];

        if (appliedIds.length === 0) {
          setOpportunities([]);
          setTotalPages(1);
          setTotalCount(0);
          return;
        }

        query = query.in('id', appliedIds);
      }

      const { data, error, count } = await query;

      if (error) throw error;

      setOpportunities(data || []);
      setTotalCount(count || 0);
      setTotalPages(Math.ceil((count || 0) / limit));
      setCurrentPage(page);
    } catch (error) {
      console.error('Error fetching opportunities:', error);
      toast({
        title: "Error",
        description: "Failed to load opportunities.",
        variant: "destructive",
      });
    } finally {
      setLoading(false);
    }
  };

  const fetchBookmarks = async () => {
    if (!user) return;

    try {
      const { data, error } = await supabase
        .from('user_bookmarks')
        .select('opportunity_id')
        .eq('user_id', user.id);

      if (error) throw error;

      const bookmarkIds = new Set(data?.map(b => b.opportunity_id) || []);
      setBookmarks(bookmarkIds);
    } catch (error) {
      console.error('Error fetching bookmarks:', error);
    }
  };

  const toggleBookmark = async (opportunityId: string) => {
    if (!user) {
      toast({
        title: "Sign in required",
        description: "Please sign in to bookmark opportunities.",
        variant: "destructive",
      });
      return;
    }

    try {
      const isBookmarked = bookmarks.has(opportunityId);

      if (isBookmarked) {
        const { error } = await supabase
          .from('user_bookmarks')
          .delete()
          .eq('user_id', user.id)
          .eq('opportunity_id', opportunityId);

        if (error) throw error;

        setBookmarks(prev => {
          const newBookmarks = new Set(prev);
          newBookmarks.delete(opportunityId);
          return newBookmarks;
        });

        toast({
          title: "Bookmark removed",
          description: "Opportunity removed from bookmarks.",
        });
      } else {
        const { error } = await supabase
          .from('user_bookmarks')
          .insert({
            user_id: user.id,
            opportunity_id: opportunityId
          });

        if (error) throw error;

        setBookmarks(prev => new Set([...prev, opportunityId]));

        toast({
          title: "Bookmarked!",
          description: "Opportunity saved to bookmarks.",
        });
      }
    } catch (error) {
      console.error('Error toggling bookmark:', error);
      toast({
        title: "Error",
        description: "Failed to update bookmark.",
        variant: "destructive",
      });
    }
  };

  const handlePageChange = (page: number) => {
    if (page >= 1 && page <= totalPages) {
      fetchOpportunities(page);
    }
  };

  if (loading && opportunities.length === 0) {
    return (
      <div className="space-y-4">
        {[...Array(3)].map((_, i) => (
          <Card key={i} className="animate-pulse">
            <CardContent className="p-6">
              <div className="h-4 bg-gray-200 rounded w-3/4 mb-2"></div>
              <div className="h-3 bg-gray-200 rounded w-1/2 mb-4"></div>
              <div className="h-3 bg-gray-200 rounded w-full mb-2"></div>
              <div className="h-3 bg-gray-200 rounded w-2/3"></div>
            </CardContent>
          </Card>
        ))}
      </div>
    );
  }

  if (opportunities.length === 0) {
    return (
      <Card className="bg-white/80 backdrop-blur-sm border-[#e6f5ec]/30 shadow-lg rounded-2xl">
        <CardContent className="p-8 text-center">
          <h3 className="text-lg font-medium text-gray-900 mb-2">No opportunities found</h3>
          <p className="text-gray-600">
            {showBookmarksOnly
              ? "You haven't bookmarked any opportunities yet."
              : searchQuery
                ? `No opportunities match "${searchQuery}"`
                : categoryFilter
                  ? `No opportunities found in ${categoryFilter}`
                  : "No opportunities are currently available."
            }
          </p>
        </CardContent>
      </Card>
    );
  }

  return (
    <div className="space-y-6">
      {/* Results info */}
      <div className="text-sm text-gray-600">
        Showing {((currentPage - 1) * limit) + 1}-{Math.min(currentPage * limit, totalCount)} of {totalCount} opportunities
      </div>

      {/* Opportunities list */}
      {opportunities.map((opportunity, index) => (
        <motion.div
          key={opportunity.id}
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.2, delay: index * 0.05 }}
          className="group bg-white/80 backdrop-blur-sm border border-[#e6f5ec]/30 rounded-2xl shadow-lg hover:shadow-xl hover:border-[#008000]/30 transition-all duration-300"
        >
          <CardHeader>
            <div className="flex items-start justify-between">
              <div className="flex-1">
                <CardTitle className="text-xl mb-2">
                  <Link
                    to={`/opportunity/${opportunity.id}`}
                    className="hover:text-[#008000] transition-colors"
                  >
                    {opportunity.title}
                  </Link>
                </CardTitle>
                <CardDescription className="flex items-center gap-4 text-base">
                  <span className="flex items-center">
                    <Building className="w-4 h-4 mr-1 text-[#008000]" />
                    {opportunity.organization}
                  </span>
                  {opportunity.location && (
                    <span className="flex items-center">
                      <MapPin className="w-4 h-4 mr-1 text-[#008000]" />
                      {opportunity.location}
                    </span>
                  )}
                  {opportunity.is_remote && (
                    <Badge variant="secondary" className="bg-green-100 text-green-800">
                      Remote
                    </Badge>
                  )}
                </CardDescription>
              </div>
              <div className="flex items-center gap-2">
                <Badge
                  variant="outline"
                  className="border-[#008000] text-[#008000] bg-[#008000]/10"
                >
                  {opportunity.category.name}
                </Badge>
                <Button
                  variant="ghost"
                  size="sm"
                  onClick={() => toggleBookmark(opportunity.id)}
                  className="text-[#008000] hover:bg-[#008000]/10"
                >
                  {bookmarks.has(opportunity.id) ? (
                    <BookmarkCheck className="w-4 h-4" />
                  ) : (
                    <Bookmark className="w-4 h-4" />
                  )}
                </Button>
              </div>
            </div>
          </CardHeader>

          <CardContent>
            <p className="text-gray-700 mb-4 line-clamp-3">
              {opportunity.description.substring(0, 200)}...
            </p>

            <div className="flex items-center justify-between">
              <div className="flex items-center gap-4 text-sm text-gray-500">
                <span className="flex items-center">
                  <Calendar className="w-4 h-4 mr-1 text-[#008000]" />
                  Posted {format(new Date(opportunity.created_at), 'MMM dd, yyyy')}
                </span>
                {opportunity.application_deadline && (
                  <span className="flex items-center">
                    <Calendar className="w-4 h-4 mr-1 text-red-500" />
                    Deadline {format(new Date(opportunity.application_deadline), 'MMM dd, yyyy')}
                  </span>
                )}
              </div>

              <Link to={`/opportunity/${opportunity.id}`}>
                <Button variant="outline" size="sm" className="border-[#008000] text-[#008000] hover:bg-[#008000] hover:text-white">
                  <ExternalLink className="w-4 h-4 mr-1" />
                  View Details
                </Button>
              </Link>
            </div>
          </CardContent>
        </motion.div>
      ))}

      {/* Pagination */}
      {totalPages > 1 && (
        <div className="flex justify-center">
          <Pagination>
            <PaginationContent>
              <PaginationItem>
                <PaginationPrevious
                  onClick={() => handlePageChange(currentPage - 1)}
                  className={currentPage === 1 ? 'pointer-events-none opacity-50' : 'cursor-pointer'}
                />
              </PaginationItem>

              {/* Show page numbers */}
              {Array.from({ length: Math.min(5, totalPages) }, (_, i) => {
                const page = Math.max(1, Math.min(totalPages - 4, currentPage - 2)) + i;
                if (page <= totalPages) {
                  return (
                    <PaginationItem key={page}>
                      <PaginationLink
                        onClick={() => handlePageChange(page)}
                        isActive={currentPage === page}
                        className="cursor-pointer"
                      >
                        {page}
                      </PaginationLink>
                    </PaginationItem>
                  );
                }
                return null;
              })}

              <PaginationItem>
                <PaginationNext
                  onClick={() => handlePageChange(currentPage + 1)}
                  className={currentPage === totalPages ? 'pointer-events-none opacity-50' : 'cursor-pointer'}
                />
              </PaginationItem>
            </PaginationContent>
          </Pagination>
        </div>
      )}
    </div>
  );
};

export default OpportunitiesList;
