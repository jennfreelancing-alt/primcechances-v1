
import React from 'react';
import { motion } from 'framer-motion';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Badge } from '@/components/ui/badge';
import { Button } from '@/components/ui/button';
import { Progress } from '@/components/ui/progress';
import { CheckCircle2, Circle, Clock, FileText, Lightbulb, Calendar, Target } from 'lucide-react';

interface ApplicationStep {
  step: number;
  title: string;
  description: string;
  documents: string[];
  timeEstimate: string;
  tips: string[];
}

interface ApplicationStepsProps {
  steps: ApplicationStep[];
  timeline: string;
  checklist: string[];
  onStepComplete?: (stepNumber: number) => void;
  completedSteps?: number[];
}

export const ApplicationSteps: React.FC<ApplicationStepsProps> = ({
  steps,
  timeline,
  checklist,
  onStepComplete,
  completedSteps = []
}) => {
  const progressPercentage = (completedSteps.length / steps.length) * 100;

  return (
    <div className="space-y-8">
      {/* Professional Header */}
      <div className="text-center space-y-2">
        <h2 className="text-2xl font-bold text-gray-900">Application Guide</h2>
        <p className="text-gray-600">Follow these personalized steps to complete your application</p>
      </div>

      {/* Enhanced Progress Card */}
      <Card className="border-0 shadow-lg bg-gradient-to-br from-blue-50 to-indigo-50">
        <CardHeader className="pb-4">
          <div className="flex items-center justify-between">
            <CardTitle className="text-xl font-semibold text-gray-900 flex items-center gap-2">
              <Target className="w-5 h-5 text-blue-600" />
              Progress Overview
            </CardTitle>
            <Badge 
              variant="secondary" 
              className="bg-blue-100 text-blue-800 font-medium px-3 py-1"
            >
              {Math.round(progressPercentage)}% Complete
            </Badge>
          </div>
        </CardHeader>
        <CardContent className="space-y-6">
          <div className="space-y-3">
            <div className="flex justify-between items-center text-sm">
              <span className="font-medium text-gray-700">
                {completedSteps.length} of {steps.length} steps completed
              </span>
              <span className="text-gray-500">{Math.round(progressPercentage)}%</span>
            </div>
            <Progress 
              value={progressPercentage} 
              className="h-3 bg-blue-100"
            />
          </div>
          
          <div className="flex items-center gap-3 p-4 bg-white/60 rounded-lg border border-blue-100">
            <div className="p-2 bg-blue-100 rounded-full">
              <Calendar className="w-4 h-4 text-blue-600" />
            </div>
            <div>
              <p className="text-sm font-medium text-gray-900">Estimated Timeline</p>
              <p className="text-sm text-gray-600">{timeline}</p>
            </div>
          </div>
        </CardContent>
      </Card>

      {/* Professional Step Cards */}
      <div className="space-y-6">
        {steps.map((step, index) => {
          const isCompleted = completedSteps.includes(step.step);
          const isCurrent = !isCompleted && completedSteps.length === step.step - 1;
          
          return (
            <motion.div
              key={step.step}
              initial={{ opacity: 0, y: 20 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ delay: index * 0.1 }}
            >
              <Card className={`border-0 shadow-md transition-all duration-300 ${
                isCompleted 
                  ? 'bg-gradient-to-r from-green-50 to-emerald-50 border-l-4 border-l-green-500' 
                  : isCurrent 
                    ? 'bg-gradient-to-r from-blue-50 to-indigo-50 border-l-4 border-l-blue-500 shadow-lg' 
                    : 'bg-white hover:shadow-lg border border-gray-100'
              }`}>
                <CardHeader className="pb-4">
                  <div className="flex items-start gap-4">
                    <Button
                      variant="ghost"
                      size="sm"
                      onClick={() => onStepComplete?.(step.step)}
                      className={`p-2 rounded-full transition-colors ${
                        isCompleted 
                          ? 'text-green-600 hover:text-green-700 bg-green-100' 
                          : 'text-gray-400 hover:text-blue-600 hover:bg-blue-50'
                      }`}
                    >
                      {isCompleted ? (
                        <CheckCircle2 className="w-6 h-6" />
                      ) : (
                        <Circle className="w-6 h-6" />
                      )}
                    </Button>
                    
                    <div className="flex-1 space-y-2">
                      <div className="flex items-center gap-3">
                        <CardTitle className="text-lg font-semibold text-gray-900">
                          Step {step.step}: {step.title}
                        </CardTitle>
                        {isCurrent && (
                          <Badge className="bg-blue-600 text-white text-xs font-medium">
                            Current
                          </Badge>
                        )}
                      </div>
                      
                      <div className="flex items-center gap-2">
                        <Badge 
                          variant="outline" 
                          className="text-xs font-medium bg-gray-50 text-gray-700 border-gray-200"
                        >
                          <Clock className="w-3 h-3 mr-1" />
                          {step.timeEstimate}
                        </Badge>
                        {isCompleted && (
                          <Badge className="bg-green-100 text-green-800 text-xs font-medium">
                            ✓ Completed
                          </Badge>
                        )}
                      </div>
                    </div>
                  </div>
                </CardHeader>
                
                <CardContent className="space-y-6">
                  <p className="text-gray-700 leading-relaxed font-medium">
                    {step.description}
                  </p>
                  
                  {step.documents.length > 0 && (
                    <div className="space-y-3">
                      <h4 className="font-semibold text-gray-900 flex items-center gap-2">
                        <FileText className="w-4 h-4 text-blue-600" />
                        Required Documents
                      </h4>
                      <div className="grid grid-cols-1 sm:grid-cols-2 gap-2">
                        {step.documents.map((doc, docIndex) => (
                          <div 
                            key={docIndex}
                            className="flex items-center gap-2 p-3 bg-blue-50 rounded-lg border border-blue-100"
                          >
                            <FileText className="w-4 h-4 text-blue-600 flex-shrink-0" />
                            <span className="text-sm font-medium text-blue-900">{doc}</span>
                          </div>
                        ))}
                      </div>
                    </div>
                  )}
                  
                  {step.tips.length > 0 && (
                    <div className="space-y-3">
                      <h4 className="font-semibold text-gray-900 flex items-center gap-2">
                        <Lightbulb className="w-4 h-4 text-amber-500" />
                        Pro Tips
                      </h4>
                      <div className="space-y-2">
                        {step.tips.map((tip, tipIndex) => (
                          <div 
                            key={tipIndex}
                            className="flex items-start gap-3 p-3 bg-amber-50 rounded-lg border border-amber-100"
                          >
                            <div className="w-2 h-2 bg-amber-500 rounded-full mt-2 flex-shrink-0"></div>
                            <span className="text-sm text-amber-900 font-medium">{tip}</span>
                          </div>
                        ))}
                      </div>
                    </div>
                  )}
                </CardContent>
              </Card>
            </motion.div>
          );
        })}
      </div>

      {/* Professional Final Checklist */}
      {checklist.length > 0 && (
        <Card className="border-0 shadow-lg bg-gradient-to-br from-gray-50 to-slate-50">
          <CardHeader>
            <CardTitle className="text-xl font-semibold text-gray-900 flex items-center gap-2">
              <CheckCircle2 className="w-5 h-5 text-green-600" />
              Final Submission Checklist
            </CardTitle>
            <p className="text-gray-600">Review these items before submitting your application</p>
          </CardHeader>
          <CardContent>
            <div className="grid gap-3">
              {checklist.map((item, index) => (
                <div 
                  key={index}
                  className="flex items-center gap-3 p-3 bg-white rounded-lg border border-gray-100 hover:border-gray-200 transition-colors"
                >
                  <Circle className="w-4 h-4 text-gray-400" />
                  <span className="text-gray-700 font-medium">{item}</span>
                </div>
              ))}
            </div>
          </CardContent>
        </Card>
      )}
    </div>
  );
};
