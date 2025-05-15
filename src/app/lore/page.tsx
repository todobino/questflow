
'use client';

import { PageHeader } from '@/components/shared/page-header';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { useCampaignContext } from '@/contexts/campaign-context';
import { Breadcrumbs } from '@/components/shared/breadcrumbs';

export default function LorePage() {
  const { activeCampaign } = useCampaignContext();
  return (
    <>
      {activeCampaign && <Breadcrumbs activeCampaign={activeCampaign} />}
      <PageHeader
        title="Lore Compendium"
        description="Build and manage your campaign world's history, deities, factions, and important details."
      />
      <Card>
        <CardHeader>
          <CardTitle>World Anvil - Coming Soon!</CardTitle>
          <CardDescription>
            This section will be your personal wiki for all campaign lore. Create articles, link concepts, and build a rich world for your players to explore.
          </CardDescription>
        </CardHeader>
        <CardContent>
          <p>Prepare to document the sagas of your world!</p>
        </CardContent>
      </Card>
    </>
  );
}
