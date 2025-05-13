import { PageHeader } from '@/components/shared/page-header';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';

export default function QuestsPage() {
  return (
    <>
      <PageHeader
        title="Quest Manager"
        description="Track main quests, side quests, and plot hooks for your campaigns."
      />
      <Card>
        <CardHeader>
          <CardTitle>Quest Management - Coming Soon!</CardTitle>
          <CardDescription>
            Organize your adventure's objectives, track progress, and link quests to NPCs, locations, and journal entries.
          </CardDescription>
        </CardHeader>
        <CardContent>
          <p>This feature is under development. Get ready to manage your epic storylines!</p>
        </CardContent>
      </Card>
    </>
  );
}
