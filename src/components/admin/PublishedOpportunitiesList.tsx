
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import OpportunitiesList from '@/components/OpportunitiesList';

const PublishedOpportunitiesList = () => {
  return (
    <Card>
      <CardHeader>
        <CardTitle>Published Opportunities</CardTitle>
      </CardHeader>
      <CardContent>
        <OpportunitiesList 
          limit={20}
          showBookmarksOnly={false}
        />
      </CardContent>
    </Card>
  );
};

export default PublishedOpportunitiesList;
