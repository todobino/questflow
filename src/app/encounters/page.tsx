
'use client';

import { PageHeader } from '@/components/shared/page-header';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { useCampaignContext } from '@/contexts/campaign-context';

export default function EncountersPage() {
  const { activeCampaign } = useCampaignContext();
  return (
    <>
      <PageHeader
        title="Encounter Builder"
        description="Design and manage combat and social encounters for your campaigns."
      />
      <Card>
        <CardHeader>
          <CardTitle>Encounter Builder - Coming Soon!</CardTitle>
          <CardDescription>
            This section will allow you to design balanced combat encounters, create social interaction scenarios, and manage encounter elements.
          </CardDescription>
        </CardHeader>
        <CardContent>
          <p>We're working on making this a powerful tool for your adventures. Check back later!</p>
        </CardContent>
      </Card>
    </>
  );
}
