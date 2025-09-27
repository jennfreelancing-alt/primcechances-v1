import React from 'react';
import { motion } from 'framer-motion';
import { Card, CardHeader, CardTitle, CardDescription, CardContent } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Badge } from '@/components/ui/badge';
import { Filter, Crown, Lock, Globe, Briefcase, Plus, Sparkles } from 'lucide-react';
import { useNavigate } from 'react-router-dom';

interface Category {
  id: string;
  name: string;
  icon: any;
  count: number;
  tier_requirement?: string;
}

interface CategoriesSidebarProps {
  categories: Category[];
  selectedCategory: Category | null;
  onCategoryClick: (category: Category | null) => void;
  userTier?: string;
  categoryRestrictionEnabled?: boolean;
}

const CategoriesSidebar = ({
  categories,
  selectedCategory,
  onCategoryClick,
  userTier = 'free',
  categoryRestrictionEnabled = false
}: CategoriesSidebarProps) => {
  const navigate = useNavigate();

  const containerVariants = {
    hidden: { opacity: 0, x: -50 },
    visible: {
      opacity: 1,
      x: 0,
      transition: {
        duration: 0.6,
        staggerChildren: 0.1
      }
    }
  };

  const itemVariants = {
    hidden: { opacity: 0, x: -20 },
    visible: {
      opacity: 1,
      x: 0,
      transition: { duration: 0.4 }
    }
  };

  const allowedCategories = ['Jobs', 'Internships']; // First two categories for free users
  const isRestricted = (categoryName: string) => {
    return categoryRestrictionEnabled && userTier === 'free' && !allowedCategories.includes(categoryName);
  };

  return (
    <motion.div
      initial={{ opacity: 0, x: -50 }}
      animate={{ opacity: 1, x: 0 }}
      transition={{ duration: 0.6 }}
      className="space-y-4"
    >
      {/* Header */}
      <div className="bg-white/80 backdrop-blur-sm rounded-xl sm:rounded-2xl p-4 sm:p-6 border border-[#e6f5ec]/30 shadow-lg">
        <h3 className="text-lg sm:text-xl font-semibold text-[#384040] mb-3 sm:mb-4">
          Categories
        </h3>
        <p className="text-sm text-gray-600 mb-4">
          Filter opportunities by category
        </p>

        {/* All Categories Button */}
        <motion.button
          whileHover={{ scale: 1.02 }}
          whileTap={{ scale: 0.98 }}
          onClick={() => onCategoryClick(null)}
          className={`w-full text-left p-3 sm:p-4 rounded-xl transition-all duration-300 mb-3 ${selectedCategory === null
              ? 'bg-[#008000] text-white shadow-lg'
              : 'bg-[#e6f5ec]/30 text-[#384040] hover:bg-[#218c1b]/20 hover:text-[#008000]'
            }`}
        >
          <div className="flex items-center gap-3">
            <div className={`w-8 h-8 rounded-lg flex items-center justify-center ${selectedCategory === null ? 'bg-white/20' : 'bg-[#008000]/20'
              }`}>
              <Globe className="w-4 h-4" />
            </div>
            <span className="font-medium">All Categories</span>
          </div>
        </motion.button>
      </div>

      {/* Categories List */}
      <div className="bg-white/80 backdrop-blur-sm rounded-xl sm:rounded-2xl p-4 sm:p-6 border border-[#e6f5ec]/30 shadow-lg">
        <div className="space-y-2">
          {categories.map((category) => {
            const isRestricted = categoryRestrictionEnabled &&
              category.tier_requirement &&
              userTier !== category.tier_requirement;

            return (
              <motion.button
                key={category.id}
                whileHover={{ scale: 1.02 }}
                whileTap={{ scale: 0.98 }}
                onClick={() => !isRestricted && onCategoryClick(category)}
                disabled={isRestricted}
                className={`w-full text-left p-3 sm:p-4 rounded-xl transition-all duration-300 ${selectedCategory?.id === category.id
                    ? 'bg-[#008000] text-white shadow-lg'
                    : isRestricted
                      ? 'bg-gray-100 text-gray-400 cursor-not-allowed'
                      : 'bg-[#e6f5ec]/30 text-[#384040] hover:bg-[#218c1b]/20 hover:text-[#008000]'
                  }`}
              >
                <div className="flex items-center justify-between">
                  <div className="flex items-center gap-3">
                    <div className={`w-8 h-8 rounded-lg flex items-center justify-center ${selectedCategory?.id === category.id
                        ? 'bg-white/20'
                        : isRestricted
                          ? 'bg-gray-200'
                          : 'bg-[#008000]/20'
                      }`}>
                      {category.icon ? (
                        <category.icon className="w-4 h-4 text-[#008000]" />
                      ) : (
                        <Briefcase className="w-4 h-4 text-[#008000]" />
                      )}
                    </div>
                    <div className="text-left">
                      <span className="font-medium block">{category.name}</span>
                      {category.tier_requirement && (
                        <span className="text-xs opacity-75">
                          {category.tier_requirement} tier
                        </span>
                      )}
                    </div>
                  </div>

                  {isRestricted && (
                    <div className="flex items-center gap-1 text-xs">
                      <Lock className="w-3 h-3" />
                      <span>Upgrade</span>
                    </div>
                  )}
                </div>
              </motion.button>
            );
          })}
        </div>
      </div>

      {/* Quick Actions */}
      <div className="bg-white/80 backdrop-blur-sm rounded-xl sm:rounded-2xl p-4 sm:p-6 border border-[#e6f5ec]/30 shadow-lg">
        <h4 className="text-sm sm:text-base font-semibold text-[#384040] mb-3">
          Quick Actions
        </h4>
        <div className="space-y-2">
          <motion.button
            whileHover={{ scale: 1.02 }}
            whileTap={{ scale: 0.98 }}
            onClick={() => navigate('/create-opportunity')}
            className="flex items-center gap-2 bg-[#008000] hover:bg-[#218c1b] text-white rounded-xl px-6 py-3 shadow-lg transition-all duration-300 font-semibold text-base w-full"
          >
            <Plus className="w-5 h-5 mr-2" />
            <span className="hidden sm:inline">Create Opportunity</span>
            <span className="sm:hidden">Create</span>
          </motion.button>

          <motion.button
            whileHover={{ scale: 1.02 }}
            whileTap={{ scale: 0.98 }}
            onClick={() => navigate('/ai-assistant')}
            className="flex items-center gap-2 bg-[#008000] hover:bg-[#218c1b] text-white rounded-xl px-6 py-3 shadow-lg transition-all duration-300 font-semibold text-base w-full"
          >
            <Sparkles className="w-5 h-5 mr-2" />
            <span className="hidden sm:inline">AI Recommendations</span>
            <span className="sm:hidden">AI Assistant</span>
          </motion.button>
        </div>
      </div>
    </motion.div>
  );
};

export default CategoriesSidebar;
