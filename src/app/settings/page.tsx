
'use client';

import { PageHeader } from '@/components/shared/page-header';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { useCampaignContext } from '@/contexts/campaign-context';
import { Breadcrumbs } from '@/components/shared/breadcrumbs';

export default function SettingsPage() {
  const { activeCampaign } = useCampaignContext();
  return (
    <>
      {activeCampaign && <Breadcrumbs activeCampaign={activeCampaign} />}
      <PageHeader
        title="Settings"
        description="Manage your application settings and preferences."
      />
      <Card>
        <CardHeader>
          <CardTitle>Application Settings</CardTitle>
          <CardDescription>
            This section is under construction. Settings will be available here soon.
          </CardDescription>
        </CardHeader>
        <CardContent>
          <p>Thank you for your patience!</p>
        </CardContent>
      </Card>
    </>
  );
}
