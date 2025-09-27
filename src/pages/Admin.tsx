import React, { useState } from 'react';
import AdminLayout from '@/components/admin/AdminLayout';
import AdminTabs from '@/components/admin/AdminTabs';
import EnhancedSubmissionManager from '@/components/admin/EnhancedSubmissionManager';
import OpportunityManager from '@/components/admin/OpportunityManager';
import UserRoleManager from '@/components/admin/UserRoleManager';
import UserManagement from '@/components/admin/UserManagement';
import UserSubscriptionManager from '@/components/admin/UserSubscriptionManager';
import FeatureTogglePanel from '@/components/admin/FeatureTogglePanel';
import PlatformSettings from '@/components/admin/PlatformSettings';
import ScrapingDashboard from '@/components/admin/ScrapingDashboard';
import BulkScrapingManager from '@/components/admin/BulkScrapingManager';
import ApplicationDetailsManager from '@/components/admin/ApplicationDetailsManager';
import ListingsSubmissionsManager from '@/components/admin/ListingsSubmissionsManager';
import PublishedOpportunitiesList from '@/components/admin/PublishedOpportunitiesList';
import AutoDeletionManager from '@/components/admin/AutoDeletionManager';
import EmailManager from '@/components/admin/EmailManager';

import SavedOpportunitiesManager from '@/components/admin/SavedOpportunitiesManager';
import AdminOpportunityForm from '@/components/admin/AdminOpportunityForm';

const Admin = () => {
  const [activeSection, setActiveSection] = useState('listings-submissions');
  const [showCreateModal, setShowCreateModal] = useState(false);
  const [createLoading, setCreateLoading] = useState(false);

  const handleCreateOpportunity = async (formData: any, isDraft: boolean = false) => {
    setCreateLoading(true);
    try {
      // This will be handled by the AdminOpportunityForm component
      // The form component handles the actual submission
      console.log('Admin handleCreateOpportunity called with:', { formData, isDraft });
    } catch (error) {
      console.error('Error in admin create opportunity:', error);
    } finally {
      setCreateLoading(false);
    }
  };
  const handleCancelCreate = () => setShowCreateModal(false);

  const renderContent = () => {
    switch (activeSection) {
      case 'listings-submissions':
        return <ListingsSubmissionsManager />;
      case 'scraping':
        return <ScrapingDashboard />;
      case 'bulk-scraping':
        return <BulkScrapingManager />;
      case 'opportunities':
        return <OpportunityManager />;
      case 'discover':
        return <PublishedOpportunitiesList />;
      case 'submissions':
        return <EnhancedSubmissionManager />;
      case 'applications':
        return <ApplicationDetailsManager />;
      case 'users':
        return <UserManagement />;
      case 'user-roles':
        return <UserRoleManager />;
      case 'subscriptions':
        return <UserSubscriptionManager />;
      case 'email-manager':
        return <EmailManager />;
      case 'features':
        return <FeatureTogglePanel />;
      case 'auto-deletion':
        return <AutoDeletionManager />;
      case 'settings':
        return <PlatformSettings />;
      default:
        return <ListingsSubmissionsManager />;
    }
  };

  return (
    <>
      <AdminLayout 
        activeSection={activeSection} 
        onSectionChange={setActiveSection}
        onCreateOpportunity={() => setShowCreateModal(true)}
      >
        <div className="space-y-6">
          {renderContent()}
        </div>
      </AdminLayout>
      <AdminOpportunityForm
        isOpen={showCreateModal}
        onClose={handleCancelCreate}
        onSuccess={() => {
          setShowCreateModal(false);
          // Force a page refresh to show the new opportunity
          window.location.reload();
        }}
        mode="create"
      />
    </>
  );
};

export default Admin;
