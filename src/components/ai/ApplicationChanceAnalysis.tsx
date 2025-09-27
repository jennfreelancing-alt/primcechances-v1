
import React from 'react';
import { motion } from 'framer-motion';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Badge } from '@/components/ui/badge';
import { Progress } from '@/components/ui/progress';
import { TrendingUp, TrendingDown, Target, Lightbulb, ArrowRight, Star } from 'lucide-react';

interface ApplicationChanceProps {
  score: number;
  percentage: number;
  strengths: string[];
  weaknesses: string[];
  improvements: string[];
  recommendations: string[];
  similarOpportunities: string[];
}

export const ApplicationChanceAnalysis: React.FC<ApplicationChanceProps> = ({
  score,
  percentage,
  strengths,
  weaknesses,
  improvements,
  recommendations
}) => {
  const getScoreColor = (score: number) => {
    if (score >= 8) return 'text-green-600';
    if (score >= 6) return 'text-amber-600';
    return 'text-red-600';
  };

  const getScoreBackground = (score: number) => {
    if (score >= 8) return 'from-green-50 to-emerald-50';
    if (score >= 6) return 'from-amber-50 to-orange-50';
    return 'from-red-50 to-rose-50';
  };

  const getScoreBadge = (score: number) => {
    if (score >= 8) return { text: 'Excellent Match', color: 'bg-green-100 text-green-800' };
    if (score >= 6) return { text: 'Good Match', color: 'bg-amber-100 text-amber-800' };
    return { text: 'Needs Improvement', color: 'bg-red-100 text-red-800' };
  };

  const badge = getScoreBadge(score);

  return (
    <div className="space-y-8">
      {/* Professional Header */}
      <div className="text-center space-y-2">
        <h2 className="text-2xl font-bold text-gray-900">Success Analysis</h2>
        <p className="text-gray-600">AI-powered evaluation of your application potential</p>
      </div>

      {/* Main Score Card - Enhanced */}
      <Card className={`border-0 shadow-xl bg-gradient-to-br ${getScoreBackground(score)}`}>
        <CardHeader className="text-center pb-6">
          <CardTitle className="text-2xl font-bold text-gray-900 mb-6">
            Application Success Probability
          </CardTitle>
          
          <motion.div
            initial={{ scale: 0 }}
            animate={{ scale: 1 }}
            transition={{ delay: 0.2, type: "spring", stiffness: 200 }}
            className="relative w-40 h-40 mx-auto mb-6"
          >
            {/* Circular Progress */}
            <svg className="w-40 h-40 transform -rotate-90" viewBox="0 0 100 100">
              <circle
                cx="50"
                cy="50"
                r="40"
                stroke="currentColor"
                strokeWidth="8"
                fill="none"
                className="text-gray-200"
              />
              <circle
                cx="50"
                cy="50"
                r="40"
                stroke="currentColor"
                strokeWidth="8"
                fill="none"
                strokeDasharray={`${percentage * 2.51} 251`}
                className={score >= 8 ? 'text-green-500' : score >= 6 ? 'text-amber-500' : 'text-red-500'}
                strokeLinecap="round"
              />
            </svg>
            
            <div className="absolute inset-0 flex items-center justify-center">
              <div className="text-center">
                <div className={`text-4xl font-bold ${getScoreColor(score)}`}>
                  {score.toFixed(1)}
                </div>
                <div className="text-sm text-gray-500 font-medium">out of 10</div>
              </div>
            </div>
          </motion.div>
          
          <div className="space-y-3">
            <Badge className={`text-lg px-6 py-2 font-semibold ${badge.color}`}>
              {percentage}% Success Rate
            </Badge>
            <Badge variant="outline" className="text-sm px-4 py-1 font-medium">
              {badge.text}
            </Badge>
          </div>
        </CardHeader>
      </Card>

      <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
        {/* Strengths - Enhanced */}
        <Card className="border-0 shadow-lg bg-gradient-to-br from-green-50 to-emerald-50">
          <CardHeader className="pb-4">
            <CardTitle className="flex items-center gap-3 text-green-800">
              <div className="p-2 bg-green-100 rounded-full">
                <TrendingUp className="w-5 h-5 text-green-600" />
              </div>
              Your Strengths
            </CardTitle>
          </CardHeader>
          <CardContent>
            <div className="space-y-3">
              {strengths.map((strength, index) => (
                <motion.div
                  key={index}
                  initial={{ opacity: 0, x: -20 }}
                  animate={{ opacity: 1, x: 0 }}
                  transition={{ delay: index * 0.1 }}
                  className="flex items-start gap-3 p-3 bg-white/60 rounded-lg border border-green-100"
                >
                  <div className="p-1 bg-green-100 rounded-full mt-1">
                    <Star className="w-3 h-3 text-green-600" />
                  </div>
                  <span className="text-green-800 font-medium text-sm">{strength}</span>
                </motion.div>
              ))}
            </div>
          </CardContent>
        </Card>

        {/* Areas for Improvement - Enhanced */}
        <Card className="border-0 shadow-lg bg-gradient-to-br from-orange-50 to-red-50">
          <CardHeader className="pb-4">
            <CardTitle className="flex items-center gap-3 text-orange-800">
              <div className="p-2 bg-orange-100 rounded-full">
                <TrendingDown className="w-5 h-5 text-orange-600" />
              </div>
              Areas to Improve
            </CardTitle>
          </CardHeader>
          <CardContent>
            <div className="space-y-3">
              {weaknesses.map((weakness, index) => (
                <motion.div
                  key={index}
                  initial={{ opacity: 0, x: -20 }}
                  animate={{ opacity: 1, x: 0 }}
                  transition={{ delay: index * 0.1 }}
                  className="flex items-start gap-3 p-3 bg-white/60 rounded-lg border border-orange-100"
                >
                  <div className="w-2 h-2 bg-orange-500 rounded-full mt-2 flex-shrink-0"></div>
                  <span className="text-orange-800 font-medium text-sm">{weakness}</span>
                </motion.div>
              ))}
            </div>
          </CardContent>
        </Card>
      </div>

      {/* Improvement Suggestions - Enhanced */}
      <Card className="border-0 shadow-lg bg-gradient-to-br from-blue-50 to-indigo-50">
        <CardHeader className="pb-4">
          <CardTitle className="flex items-center gap-3 text-blue-800">
            <div className="p-2 bg-blue-100 rounded-full">
              <Target className="w-5 h-5 text-blue-600" />
            </div>
            Improvement Recommendations
          </CardTitle>
          <p className="text-blue-600 text-sm font-medium">Actions to boost your success rate</p>
        </CardHeader>
        <CardContent>
          <div className="space-y-4">
            {improvements.map((improvement, index) => (
              <motion.div
                key={index}
                initial={{ opacity: 0, y: 20 }}
                animate={{ opacity: 1, y: 0 }}
                transition={{ delay: index * 0.1 }}
                className="flex items-start gap-4 p-4 bg-white/70 rounded-xl border border-blue-100 hover:border-blue-200 transition-colors"
              >
                <div className="p-2 bg-blue-100 rounded-full">
                  <ArrowRight className="w-4 h-4 text-blue-600" />
                </div>
                <div className="flex-1">
                  <span className="text-blue-900 font-medium">{improvement}</span>
                </div>
              </motion.div>
            ))}
          </div>
        </CardContent>
      </Card>

      {/* Personalized Recommendations - Enhanced */}
      <Card className="border-0 shadow-lg bg-gradient-to-br from-purple-50 to-indigo-50">
        <CardHeader className="pb-4">
          <CardTitle className="flex items-center gap-3 text-purple-800">
            <div className="p-2 bg-purple-100 rounded-full">
              <Lightbulb className="w-5 h-5 text-purple-600" />
            </div>
            Expert Recommendations
          </CardTitle>
          <p className="text-purple-600 text-sm font-medium">Tailored advice for your profile</p>
        </CardHeader>
        <CardContent>
          <div className="space-y-3">
            {recommendations.map((recommendation, index) => (
              <motion.div
                key={index}
                initial={{ opacity: 0, x: -20 }}
                animate={{ opacity: 1, x: 0 }}
                transition={{ delay: index * 0.1 }}
                className="flex items-start gap-3 p-3 bg-white/60 rounded-lg border border-purple-100"
              >
                <div className="w-2 h-2 bg-purple-500 rounded-full mt-2 flex-shrink-0"></div>
                <span className="text-purple-800 font-medium text-sm">{recommendation}</span>
              </motion.div>
            ))}
          </div>
        </CardContent>
      </Card>
    </div>
  );
};
