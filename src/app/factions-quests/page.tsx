
'use client';

import { PageHeader } from '@/components/shared/page-header';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { useCampaignContext } from '@/contexts/campaign-context';
import type { Faction, FactionReputation } from '@/lib/types';
import { Badge } from '@/components/ui/badge';
import { Users } from 'lucide-react';
import { Breadcrumbs } from '@/components/shared/breadcrumbs'; // Import Breadcrumbs

const getReputationMilestone = (score: number): {milestone: string, color: string} => {
  if (score <= -11) return { milestone: 'Hated', color: 'bg-red-700 hover:bg-red-700' };
  if (score <= -6) return { milestone: 'Hostile', color: 'bg-red-500 hover:bg-red-500' };
  if (score <= -1) return { milestone: 'Unfriendly', color: 'bg-orange-500 hover:bg-orange-500' };
  if (score <= 4) return { milestone: 'Neutral', color: 'bg-gray-500 hover:bg-gray-500' };
  if (score <= 9) return { milestone: 'Friendly', color: 'bg-sky-500 hover:bg-sky-500' };
  if (score <= 19) return { milestone: 'Allied', color: 'bg-green-500 hover:bg-green-500' };
  return { milestone: 'Exalted', color: 'bg-green-700 hover:bg-green-700' };
};

export default function FactionsQuestsPage() {
  const { activeCampaign, factions, factionReputations, isLoading } = useCampaignContext();

  if (isLoading) {
    return (
      <div className="text-center py-12">Loading faction data...</div>
    );
  }

  return (
    <>
      {activeCampaign && <Breadcrumbs activeCampaign={activeCampaign} />}
      <PageHeader
        title="Factions & Quests"
        description={activeCampaign ? `Manage faction reputations and track quests for "${activeCampaign.name}".` : "Please select an active campaign."}
      />

      {!activeCampaign ? (
         <Card className="text-center py-12">
          <CardHeader>
            <CardTitle>No Active Campaign</CardTitle>
            <CardDescription>Please select or create an active campaign to view its factions and quests.</CardDescription>
          </CardHeader>
        </Card>
      ) : (
        <>
          <div className="grid grid-cols-1 gap-6 md:grid-cols-2 lg:grid-cols-3">
            {factions.filter(f => f.campaignId === activeCampaign.id).length === 0 ? (
              <Card className="md:col-span-2 lg:col-span-3">
                <CardHeader>
                  <CardTitle>No Factions Defined</CardTitle>
                  <CardDescription>There are no factions set up for this campaign yet.</CardDescription>
                </CardHeader>
              </Card>
            ) : (
              factions.filter(f => f.campaignId === activeCampaign.id).map(faction => {
                const reputation = factionReputations.find(
                  rep => rep.factionId === faction.id && rep.campaignId === activeCampaign.id
                );
                const repScore = reputation ? reputation.score : 0;
                const {milestone, color} = getReputationMilestone(repScore);

                return (
                  <Card key={faction.id} className="shadow-lg flex flex-col">
                    <CardHeader>
                      <div className="flex justify-between items-start">
                        <CardTitle className="text-xl">{faction.name}</CardTitle>
                        <Badge variant="secondary" className={`text-xs ${color} text-white`}>{milestone}</Badge>
                      </div>
                      <CardDescription className="text-sm text-muted-foreground pt-1">
                        Reputation: <span className="font-semibold">{repScore >= 0 ? `+${repScore}` : repScore}</span>
                      </CardDescription>
                    </CardHeader>
                    <CardContent className="flex-grow">
                      <p className="text-sm">{faction.description || 'No description available.'}</p>
                    </CardContent>
                  </Card>
                );
              })
            )}
          </div>

          <Card className="mt-8">
            <CardHeader>
              <CardTitle>Quest Log</CardTitle>
              <CardDescription>Quest tracking is coming soon!</CardDescription>
            </CardHeader>
            <CardContent>
              <p>This section will allow you to create, manage, and track quests linked to factions and locations.</p>
            </CardContent>
          </Card>
        </>
      )}
    </>
  );
}
