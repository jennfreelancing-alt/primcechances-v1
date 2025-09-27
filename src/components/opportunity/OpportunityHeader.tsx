
import React from 'react';
import { Button } from '@/components/ui/button';
import { ArrowLeft, Share, Bookmark, BookmarkCheck } from 'lucide-react';

interface OpportunityHeaderProps {
  onBack: () => void;
  onShare: () => void;
  onBookmark: () => void;
  isBookmarked: boolean;
  actionLoading: boolean;
  user: any;
}

const OpportunityHeader = ({
  onBack,
  onShare,
  onBookmark,
  isBookmarked,
  actionLoading,
  user
}: OpportunityHeaderProps) => {
  const handleBackClick = () => {
    console.log('Back button clicked');
    onBack();
  };

  const handleShareClick = () => {
    console.log('Share button clicked');
    onShare();
  };

  const handleBookmarkClick = () => {
    console.log('Bookmark button clicked');
    onBookmark();
  };

  return (
    <header className="bg-white border-b border-gray-200">
      <div className="max-w-4xl mx-auto px-4 sm:px-6 lg:px-8">
        <div className="flex justify-between items-center h-16">
          <Button
            variant="ghost"
            size="sm"
            onClick={handleBackClick}
          >
            <ArrowLeft className="w-4 h-4 mr-2" />
            Back
          </Button>
          <div className="flex items-center gap-2">
            <Button
              variant="outline"
              size="sm"
              onClick={handleShareClick}
            >
              <Share className="w-4 h-4 mr-2" />
              Share
            </Button>
            {user && (
              <Button
                variant="outline"
                size="sm"
                onClick={handleBookmarkClick}
                disabled={actionLoading}
              >
                {isBookmarked ? (
                  <BookmarkCheck className="w-4 h-4 mr-2" />
                ) : (
                  <Bookmark className="w-4 h-4 mr-2" />
                )}
                {isBookmarked ? 'Bookmarked' : 'Bookmark'}
              </Button>
            )}
          </div>
        </div>
      </div>
    </header>
  );
};

export default OpportunityHeader;
