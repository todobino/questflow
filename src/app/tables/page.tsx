import { PageHeader } from '@/components/shared/page-header';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';

export default function TablesPage() {
  return (
    <>
      <PageHeader
        title="Random Tables"
        description="Generate loot, names, events, and more with custom or pre-made random tables."
      />
      <Card>
        <CardHeader>
          <CardTitle>Feature Coming Soon!</CardTitle>
          <CardDescription>
            The Random Tables generator is being crafted. Soon you'll be able to create and roll on various tables to add spice to your game.
          </CardDescription>
        </CardHeader>
        <CardContent>
          <p>Stay tuned for updates!</p>
        </CardContent>
      </Card>
    </>
  );
}
