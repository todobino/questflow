import { PageHeader } from '@/components/shared/page-header';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';

export default function SearchPage() {
  return (
    <>
      <PageHeader
        title="Search"
        description="This feature is coming soon. Find anything across your campaigns."
      />
      <Card>
        <CardHeader>
          <CardTitle>Under Construction</CardTitle>
          <CardDescription>
            The global search functionality is currently under development. 
            Soon you'll be able to search for characters, locations, notes, and more.
          </CardDescription>
        </CardHeader>
        <CardContent>
          <p>Thank you for your patience!</p>
        </CardContent>
      </Card>
    </>
  );
}
