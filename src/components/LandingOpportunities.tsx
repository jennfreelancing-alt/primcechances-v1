import React, { useState, useEffect } from "react";
import { motion } from "framer-motion";
import { Button } from "@/components/ui/button";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import {
  ExternalLink,
  MapPin,
  Calendar,
  Building,
  ArrowRight,
  Eye,
  BookOpen,
  Users,
  Clock,
  TrendingUp,
} from "lucide-react";
import { useNavigate } from "react-router-dom";
import { supabase } from "@/integrations/supabase/client";
import { Tables } from "@/integrations/supabase/types";
import { useAuth } from "@/hooks/useAuth";

type Opportunity = Tables<"opportunities">;

const LandingOpportunities = () => {
  const [opportunities, setOpportunities] = useState<Opportunity[]>([]);
  const [loading, setLoading] = useState(true);
  const [expandedOpportunities, setExpandedOpportunities] = useState<
    Set<string>
  >(new Set());
  const navigate = useNavigate();
  const { user } = useAuth();

  useEffect(() => {
    fetchOpportunities();
  }, []);

  const fetchOpportunities = async () => {
    try {
      setLoading(true);

      const today = new Date().toISOString();

      const { data, error } = await supabase
        .from("opportunities")
        .select(
          `
          *,
          categories (
          name,
          color
        )`
        )
        .eq("is_published", true)
        .eq("status", "approved")
        .or(`application_deadline.is.null,application_deadline.gte.${today}`)
        .order("is_featured", { ascending: false })
        .order("created_at", { ascending: false })
        .limit(12);

      if (error) {
        console.error("Error fetching opportunities:", error);
        return;
      }

      setOpportunities(data || []);
    } catch (error) {
      console.error("Error fetching opportunities:", error);
    } finally {
      setLoading(false);
    }
  };

  const toggleExpanded = (opportunityId: string) => {
    const newExpanded = new Set(expandedOpportunities);
    if (newExpanded.has(opportunityId)) {
      newExpanded.delete(opportunityId);
    } else {
      newExpanded.add(opportunityId);
    }
    setExpandedOpportunities(newExpanded);
  };

  const truncateText = (text: string, maxLength: number) => {
    if (text.length <= maxLength) return text;
    return text.substring(0, maxLength).trim() + "...";
  };

  const formatDate = (dateString: string | null) => {
    if (!dateString) return "No deadline";
    return new Date(dateString).toLocaleDateString("en-US", {
      year: "numeric",
      month: "short",
      day: "numeric",
    });
  };

  const getCategoryColor = (color: string | null) => {
    if (!color) return "bg-blue-100 text-blue-800";

    const colorMap: { [key: string]: string } = {
      blue: "bg-blue-100 text-blue-800",
      green: "bg-green-100 text-green-800",
      red: "bg-red-100 text-red-800",
      yellow: "bg-yellow-100 text-yellow-800",
      purple: "bg-purple-100 text-purple-800",
      pink: "bg-pink-100 text-pink-800",
      indigo: "bg-indigo-100 text-indigo-800",
      gray: "bg-gray-100 text-gray-800",
    };

    return colorMap[color] || "bg-blue-100 text-blue-800";
  };

  const handleOpportunityClick = (opportunityId: string) => {
    // Always allow viewing opportunity details, regardless of auth status
    navigate(`/opportunity/${opportunityId}`);
  };

  const handleViewDetails = (opportunityId: string) => {
    // Always allow viewing opportunity details, regardless of auth status
    navigate(`/opportunity/${opportunityId}`);
  };

  if (loading) {
    return (
      <div className="py-16">
        <div className="max-w-7xl mx-auto px-6">
          <div className="text-center mb-12">
            <h2 className="text-4xl md:text-5xl font-bold text-[#384040] mb-6">
              Latest Opportunities
            </h2>
            <p className="text-xl text-gray-600 max-w-3xl mx-auto">
              Discover the most recent opportunities from top organizations
              worldwide
            </p>
          </div>
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
            {[...Array(6)].map((_, i) => (
              <div key={i} className="animate-pulse">
                <div className="bg-gray-200 h-64 rounded-lg"></div>
              </div>
            ))}
          </div>
        </div>
      </div>
    );
  }

  return (
    <section className="py-16 bg-gradient-to-b from-white to-[#e6f5ec]/10">
      <div className="max-w-7xl mx-auto px-6">
        <motion.div
          initial={{ opacity: 0, y: 30 }}
          whileInView={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.8 }}
          viewport={{ once: true }}
          className="text-center mb-12">
          <h2 className="text-4xl md:text-5xl font-bold text-[#384040] mb-6">
            Latest Opportunities
          </h2>
          <p className="text-xl text-gray-600 max-w-3xl mx-auto">
            Discover the most recent opportunities from top organizations
            worldwide. Click on any opportunity to view full details. External
            opportunities can be applied to directly.
          </p>
        </motion.div>

        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
          {opportunities.map((opportunity, index) => (
            <motion.div
              key={opportunity.id}
              initial={{ opacity: 0, y: 30 }}
              whileInView={{ opacity: 1, y: 0 }}
              transition={{ duration: 0.5, delay: index * 0.1 }}
              viewport={{ once: true }}
              whileHover={{ y: -5, scale: 1.02 }}
              whileTap={{ scale: 0.98 }}>
              <Card
                className="h-full bg-white/80 backdrop-blur-sm border border-[#e6f5ec]/30 shadow-lg hover:shadow-xl hover:border-[#008000]/50 transition-all duration-300 group cursor-pointer relative overflow-hidden"
                onClick={() => handleOpportunityClick(opportunity.id)}>
                {/* Hover overlay effect */}
                <div className="absolute inset-0 bg-gradient-to-r from-[#008000]/5 to-[#e6f5ec]/5 opacity-0 group-hover:opacity-100 transition-opacity duration-300"></div>
                <div className="relative z-10">
                  <CardHeader className="pb-4">
                    <div className="flex items-start justify-between mb-3">
                      <div className="flex-1">
                        <CardTitle className="text-lg font-bold text-[#384040] line-clamp-2 group-hover:text-[#008000] transition-colors">
                          {opportunity.title}
                        </CardTitle>
                      </div>
                      <div className="flex flex-col items-end space-y-1">
                        {opportunity.is_featured && (
                          <Badge className="bg-gradient-to-r from-[#008000] to-[#008000]/80 text-white text-xs">
                            Featured
                          </Badge>
                        )}
                        {opportunity.application_deadline &&
                          new Date(opportunity.application_deadline) >
                            new Date() && (
                            <Badge
                              variant="outline"
                              className={`text-xs ${
                                new Date(opportunity.application_deadline) <
                                new Date(Date.now() + 7 * 24 * 60 * 60 * 1000)
                                  ? "text-orange-600 border-orange-200"
                                  : "text-green-600 border-green-200"
                              }`}>
                              {new Date(opportunity.application_deadline) <
                              new Date(Date.now() + 7 * 24 * 60 * 60 * 1000)
                                ? "Expiring Soon"
                                : "Active"}
                            </Badge>
                          )}
                      </div>
                    </div>

                    <div className="flex items-center text-sm text-gray-600 mb-3">
                      <Building className="w-4 h-4 mr-1" />
                      <span className="truncate">
                        {opportunity.organization}
                      </span>
                    </div>

                    <div className="flex flex-wrap gap-2 mb-3">
                      {opportunity.location && (
                        <div className="flex items-center text-xs text-gray-500 bg-gray-50 px-2 py-1 rounded-full">
                          <MapPin className="w-3 h-3 mr-1" />
                          <span>
                            {opportunity.is_remote
                              ? "Remote"
                              : opportunity.location}
                          </span>
                        </div>
                      )}
                      {opportunity.application_deadline && (
                        <div className="flex items-center text-xs text-gray-500 bg-gray-50 px-2 py-1 rounded-full">
                          <Calendar className="w-3 h-3 mr-1" />
                          <span>
                            {formatDate(opportunity.application_deadline)}
                          </span>
                        </div>
                      )}
                      {opportunity.salary_range && (
                        <div className="flex items-center text-xs text-gray-500 bg-gray-50 px-2 py-1 rounded-full">
                          <TrendingUp className="w-3 h-3 mr-1" />
                          <span>{opportunity.salary_range}</span>
                        </div>
                      )}
                    </div>

                    {opportunity.tags && opportunity.tags.length > 0 && (
                      <div className="flex flex-wrap gap-1 mb-3">
                        {opportunity.tags.slice(0, 3).map((tag, tagIndex) => (
                          <Badge
                            key={tagIndex}
                            variant="secondary"
                            className="text-xs">
                            {tag}
                          </Badge>
                        ))}
                        {opportunity.tags.length > 3 && (
                          <Badge variant="secondary" className="text-xs">
                            +{opportunity.tags.length - 3}
                          </Badge>
                        )}
                      </div>
                    )}
                  </CardHeader>

                  <CardContent className="pt-0">
                    <div className="mb-4">
                      <p className="text-sm text-gray-700 leading-relaxed">
                        {expandedOpportunities.has(opportunity.id)
                          ? opportunity.description
                          : truncateText(opportunity.description, 150)}
                      </p>

                      {opportunity.description.length > 150 && (
                        <button
                          onClick={() => toggleExpanded(opportunity.id)}
                          className="text-[#008000] hover:text-[#008000]/80 text-sm font-medium mt-2 flex items-center group">
                          {expandedOpportunities.has(opportunity.id) ? (
                            <>
                              <Eye className="w-4 h-4 mr-1 group-hover:scale-110 transition-transform" />
                              Show Less
                            </>
                          ) : (
                            <>
                              <BookOpen className="w-4 h-4 mr-1 group-hover:scale-110 transition-transform" />
                              Read More
                            </>
                          )}
                        </button>
                      )}
                    </div>

                    <div className="flex items-center justify-between pt-4 border-t border-[#e6f5ec]/30">
                      {/* <div className="flex items-center space-x-2">
                      {opportunity.source && (
                        <Badge 
                          variant="outline" 
                          className={`text-xs ${getCategoryColor(opportunity.source === 'scraped' ? 'blue' : 'green')}`}
                        >
                          {opportunity.source === 'scraped' ? 'Scraped' : 'Submitted'}
                        </Badge>
                      )}
                      {opportunity.view_count && (
                        <span className="text-xs text-gray-500 flex items-center">
                          <Eye className="w-3 h-3 mr-1" />
                          {opportunity.view_count}
                        </span>
                      )}
                      {opportunity.application_count && (
                        <span className="text-xs text-gray-500 flex items-center">
                          <Users className="w-3 h-3 mr-1" />
                          {opportunity.application_count}
                        </span>
                      )}
                    </div> */}

                      <Button
                        size="sm"
                        className="bg-[#008000] hover:bg-[#008000]/90 text-white rounded-lg px-3 py-1 text-xs font-medium transition-all duration-300 group"
                        onClick={(e) => {
                          e.stopPropagation();
                          handleViewDetails(opportunity.id);
                        }}>
                        View Details
                        <ArrowRight className="w-3 h-3 ml-1 group-hover:scale-110 transition-transform" />
                      </Button>
                    </div>
                  </CardContent>
                </div>
              </Card>
            </motion.div>
          ))}
        </div>

        {opportunities.length > 0 && (
          <motion.div
            initial={{ opacity: 0, y: 30 }}
            whileInView={{ opacity: 1, y: 0 }}
            transition={{ duration: 0.8, delay: 0.5 }}
            viewport={{ once: true }}
            className="text-center mt-12">
            <Button
              size="lg"
              variant="outline"
              className="border-2 border-[#e6f5ec] text-[#384040] hover:bg-[#e6f5ec]/30 hover:border-[#008000] px-8 py-3 rounded-xl transition-all duration-300 group"
              onClick={() =>
                user ? navigate("/dashboard") : navigate("/auth")
              }>
              {user ? "View All Opportunities" : "Sign In for More Features"}
              <ArrowRight className="ml-2 w-5 h-5 group-hover:translate-x-1 transition-transform" />
            </Button>
          </motion.div>
        )}

        {opportunities.length === 0 && !loading && (
          <motion.div
            initial={{ opacity: 0, y: 30 }}
            whileInView={{ opacity: 1, y: 0 }}
            transition={{ duration: 0.8 }}
            viewport={{ once: true }}
            className="text-center py-12">
            <div className="text-gray-500 text-lg">
              No opportunities available at the moment. Check back soon!
            </div>
          </motion.div>
        )}
      </div>
    </section>
  );
};

export default LandingOpportunities;
