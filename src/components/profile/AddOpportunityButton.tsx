import { Link } from 'react-router-dom';
import { Button } from '@/components/ui/button';
import { Plus } from 'lucide-react';
import { useFeatureToggle } from '@/hooks/useFeatureToggle';

const AddOpportunityButton = () => {
  const { isEnabled: canCreatePosts, loading } = useFeatureToggle('user_opportunity_posts');

  if (loading) {
    return (
      <Button disabled className="bg-[#90EE90] hover:bg-[#32CD32] w-full sm:w-auto">
        <Plus className="w-4 h-4 mr-2" />
        <span className="hidden sm:inline">Loading...</span>
        <span className="sm:hidden">Loading</span>
      </Button>
    );
  }

  if (!canCreatePosts) {
    return (
      <Button disabled className="bg-gray-400 cursor-not-allowed w-full sm:w-auto">
        <Plus className="w-4 h-4 mr-2" />
        <span className="hidden sm:inline">Create Disabled</span>
        <span className="sm:hidden">Disabled</span>
      </Button>
    );
  }

  return (
    <Link to="/create-opportunity" className="w-full sm:w-auto">
      <Button className="bg-[#90EE90] hover:bg-[#32CD32] w-full sm:w-auto shadow-lg hover:shadow-[#90EE90]/30 transition-all duration-300">
        <Plus className="w-4 h-4 mr-2" />
        <span className="hidden sm:inline">Create Opportunity</span>
        <span className="sm:hidden">Create</span>
      </Button>
    </Link>
  );
};

export default AddOpportunityButton;
