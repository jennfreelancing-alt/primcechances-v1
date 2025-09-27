
import React from 'react';
import { Button } from '@/components/ui/button';
import { 
  BarChart3, 
  Briefcase, 
  FileText, 
  Users, 
  CreditCard, 
  Settings,
  Globe,
  Eye,
  Trash2
} from 'lucide-react';

interface AdminTabsProps {
  activeTab: string;
  onTabChange: (tab: string) => void;
}

const AdminTabs = ({ activeTab, onTabChange }: AdminTabsProps) => {
  const tabs = [
    { id: 'overview', label: 'Overview', icon: BarChart3 },
    { id: 'opportunities', label: 'Opportunities', icon: Briefcase },
    { id: 'submissions', label: 'Submissions', icon: FileText },
    { id: 'applications', label: 'Applications', icon: Eye },
    { id: 'users', label: 'Users', icon: Users },
    { id: 'subscriptions', label: 'Subscriptions', icon: CreditCard },
    { id: 'features', label: 'Features', icon: Settings },
    { id: 'scraping', label: 'Web Scraping', icon: Globe },
    { id: 'bulk-scraping', label: 'Bulk Scraping', icon: Globe },
    { id: 'auto-deletion', label: 'Auto-Deletion', icon: Trash2 }
  ];

  return (
    <div className="border-b border-gray-200 mb-8">
      <nav className="-mb-px flex space-x-8 overflow-x-auto">
        {tabs.map((tab) => {
          const IconComponent = tab.icon;
          return (
            <Button
              key={tab.id}
              variant={activeTab === tab.id ? "default" : "ghost"}
              onClick={() => onTabChange(tab.id)}
              className="flex items-center gap-2 px-4 py-2 whitespace-nowrap"
            >
              <IconComponent className="w-4 h-4" />
              {tab.label}
            </Button>
          );
        })}
      </nav>
    </div>
  );
};

export default AdminTabs;
