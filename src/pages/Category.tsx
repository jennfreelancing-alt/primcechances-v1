import React, { useState, useEffect } from 'react';
import { useParams, useNavigate } from 'react-router-dom';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Badge } from '@/components/ui/badge';
import { ArrowLeft, Filter, SortAsc, MapPin, Calendar } from 'lucide-react';
import { supabase } from '@/integrations/supabase/client';
import OpportunitiesList from '@/components/OpportunitiesList';
import SearchBar from '@/components/SearchBar';
import { motion } from 'framer-motion';

interface CategoryData {
  id: string;
  name: string;
  description?: string;
  color?: string;
  icon?: string;
  opportunities_count: number;
}

const Category = () => {
  const { id } = useParams<{ id: string }>();
  const navigate = useNavigate();
  const [category, setCategory] = useState<CategoryData | null>(null);
  const [loading, setLoading] = useState(true);
  const [searchQuery, setSearchQuery] = useState('');

  useEffect(() => {
    if (id) {
      fetchCategoryData();
    }
  }, [id]);

  const fetchCategoryData = async () => {
    console.log('Fetching category data for ID:', id);
    try {
      // First try to get category by ID
      let { data: categoryData, error: categoryError } = await supabase
        .from('categories')
        .select('id, name, description, color, icon')
        .eq('id', id)
        .eq('is_active', true)
        .single();

      console.log('Category query by ID response:', { categoryData, categoryError });

      // If not found by ID, try by name (for backward compatibility)
      if (categoryError && categoryError.code === 'PGRST116') {
        console.log('Category not found by ID, trying by name:', id);
        const { data: categoryByName, error: nameError } = await supabase
          .from('categories')
          .select('id, name, description, color, icon')
          .eq('name', id)
          .eq('is_active', true)
          .single();

        console.log('Category query by name response:', { categoryByName, nameError });

        if (nameError) {
          console.error('Category query by name error:', nameError);
          throw nameError;
        }

        categoryData = categoryByName;
        categoryError = null;
      } else if (categoryError) {
        console.error('Category query by ID error:', categoryError);
        throw categoryError;
      }

      // Count approved opportunities in this category
      const { count, error: countError } = await supabase
        .from('opportunities')
        .select('*', { count: 'exact', head: true })
        .eq('category_id', categoryData.id)
        .eq('status', 'approved');

      console.log('Opportunities count query response:', { count, countError });

      if (countError) {
        console.error('Count query error:', countError);
        throw countError;
      }

      setCategory({
        ...categoryData,
        opportunities_count: count || 0
      });
    } catch (error) {
      console.error('Error fetching category:', error);
    } finally {
      setLoading(false);
    }
  };

  const handleSearchResult = (result: any) => {
    console.log('Selected search result:', result);
    navigate(`/opportunity/${result.id}`);
  };

  if (loading) {
    return (
      <div className="min-h-screen bg-gray-50 flex items-center justify-center">
        <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-[#17cfcf]"></div>
      </div>
    );
  }

  if (!category) {
    return (
      <div className="min-h-screen bg-gray-50">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-8">
          <Card className="bg-white/80 backdrop-blur-sm border-[#e6f5ec]/30 shadow-lg rounded-2xl">
            <CardContent className="p-8 text-center">
              <h1 className="text-2xl font-bold text-gray-900 mb-2">Category Not Found</h1>
              <p className="text-gray-600 mb-4">
                The category "{id}" doesn't exist or is not active.
              </p>
              <Button onClick={() => navigate('/dashboard')} className="bg-[#17cfcf] hover:bg-[#17cfcf]/90">
                <ArrowLeft className="w-4 h-4 mr-2" />
                Back to Dashboard
              </Button>
            </CardContent>
          </Card>
        </div>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-gray-50">
      {/* Header */}
      <header className="bg-white border-b border-gray-200">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="flex justify-between items-center h-16">
            <div className="flex items-center space-x-4">
              <Button
                variant="ghost"
                size="sm"
                onClick={() => navigate('/dashboard')}
                className="text-[#17cfcf] hover:bg-[#17cfcf]/10"
              >
                <ArrowLeft className="w-4 h-4 mr-2" />
                Back
              </Button>
              <div className="h-6 w-px bg-gray-300" />
              <h1 className="text-xl font-semibold text-gray-900">
                {category.name}
              </h1>
              <Badge 
                variant="outline"
                className="border-[#17cfcf] text-[#17cfcf] bg-[#17cfcf]/10"
              >
                {category.opportunities_count} opportunities
              </Badge>
            </div>
            <SearchBar onResultSelect={handleSearchResult} />
          </div>
        </div>
      </header>

      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-8">
        {/* Category Header */}
        <motion.div 
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.5 }}
          className="mb-8"
        >
          <Card className="bg-white/80 backdrop-blur-sm border-[#e6f5ec]/30 shadow-lg rounded-2xl overflow-hidden">
            <CardHeader className="bg-gradient-to-r from-[#17cfcf]/10 to-[#e6f5ec]/20">
              <div className="flex items-center justify-between">
                <div>
                  <CardTitle className="text-3xl text-[#384040] mb-2">{category.name}</CardTitle>
                  {category.description && (
                    <CardDescription className="text-base text-gray-600">
                      {category.description}
                    </CardDescription>
                  )}
                </div>
                <div className="text-right">
                  <motion.p 
                    initial={{ scale: 0 }}
                    animate={{ scale: 1 }}
                    transition={{ duration: 0.5, delay: 0.2 }}
                    className="text-4xl font-bold text-[#17cfcf]"
                  >
                    {category.opportunities_count}
                  </motion.p>
                  <p className="text-sm text-gray-600">opportunities</p>
                </div>
              </div>
            </CardHeader>
          </Card>
        </motion.div>

        {/* Filters and Search */}
        <motion.div 
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.5, delay: 0.1 }}
          className="mb-6"
        >
          <Card className="bg-white/80 backdrop-blur-sm border-[#e6f5ec]/30 shadow-lg rounded-2xl">
            <CardContent className="p-4">
              <div className="flex items-center justify-between">
                <div className="flex items-center gap-4">
                  <div className="flex items-center gap-2">
                    <Filter className="w-4 h-4 text-[#17cfcf]" />
                    <span className="text-sm font-medium text-gray-700">Filters:</span>
                  </div>
                  <Button variant="outline" size="sm" className="border-[#17cfcf]/30 text-[#17cfcf] hover:bg-[#17cfcf]/10">
                    <MapPin className="w-4 h-4 mr-1" />
                    Location
                  </Button>
                  <Button variant="outline" size="sm" className="border-[#17cfcf]/30 text-[#17cfcf] hover:bg-[#17cfcf]/10">
                    <Calendar className="w-4 h-4 mr-1" />
                    Deadline
                  </Button>
                </div>
                <Button variant="outline" size="sm" className="border-[#17cfcf]/30 text-[#17cfcf] hover:bg-[#17cfcf]/10">
                  <SortAsc className="w-4 h-4 mr-1" />
                  Sort by Date
                </Button>
              </div>
            </CardContent>
          </Card>
        </motion.div>

        {/* Opportunities List */}
        <motion.div
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.5, delay: 0.2 }}
        >
          <OpportunitiesList 
            categoryFilter={category.name}
            searchQuery={searchQuery}
            limit={20}
          />
        </motion.div>
      </div>
    </div>
  );
};

export default Category;
