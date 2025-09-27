
import React from 'react';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Badge } from '@/components/ui/badge';
import { Heart, Save, Loader2 } from 'lucide-react';
import { Category } from '@/types/profile';

interface PreferencesFormProps {
  categories: Category[];
  userPreferences: {[key: string]: number};
  loading: boolean;
  onCategoryToggle: (categoryId: string, priority: number) => void;
  onSubmit: () => void;
}

const PreferencesForm = ({ categories, userPreferences, loading, onCategoryToggle, onSubmit }: PreferencesFormProps) => {
  return (
    <Card>
      <CardHeader>
        <CardTitle className="flex items-center gap-2">
          <Heart className="w-5 h-5" />
          Category Preferences
        </CardTitle>
        <CardDescription>
          Select categories that interest you and set your priority level.
        </CardDescription>
      </CardHeader>
      <CardContent>
        <div className="grid grid-cols-1 md:grid-cols-2 gap-4 mb-6">
          {categories.map((category) => (
            <Card 
              key={category.id} 
              className={`cursor-pointer transition-all ${
                userPreferences[category.id] ? 'ring-2 ring-blue-500 bg-blue-50' : ''
              }`}
            >
              <CardContent className="p-4">
                <div className="flex items-center justify-between">
                  <div>
                    <h3 className="font-medium">{category.name}</h3>
                    {category.description && (
                      <p className="text-sm text-gray-600 mt-1">{category.description}</p>
                    )}
                    {userPreferences[category.id] && (
                      <Badge variant="secondary" className="mt-2">
                        Priority: {userPreferences[category.id] === 1 ? 'High' : 
                                  userPreferences[category.id] === 2 ? 'Medium' : 'Low'}
                      </Badge>
                    )}
                  </div>
                  <div className="flex flex-col gap-2">
                    {[1, 2, 3].map((priority) => (
                      <Button
                        key={priority}
                        size="sm"
                        variant={userPreferences[category.id] === priority ? "default" : "outline"}
                        onClick={() => onCategoryToggle(category.id, priority)}
                      >
                        {priority === 1 ? 'High' : priority === 2 ? 'Med' : 'Low'}
                      </Button>
                    ))}
                  </div>
                </div>
              </CardContent>
            </Card>
          ))}
        </div>

        <Button onClick={onSubmit} disabled={loading} className="w-full">
          {loading ? (
            <Loader2 className="w-4 h-4 mr-2 animate-spin" />
          ) : (
            <Save className="w-4 h-4 mr-2" />
          )}
          Save Preferences
        </Button>
      </CardContent>
    </Card>
  );
};

export default PreferencesForm;
