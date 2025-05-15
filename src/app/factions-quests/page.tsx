
'use client';

import { PageHeader } from '@/components/shared/page-header';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { useCampaignContext } from '@/contexts/campaign-context';
import type { Faction, FactionReputation } from '@/lib/types';
import { Badge } from '@/components/ui/badge';
import { Users, Info } from 'lucide-react';
import { Breadcrumbs } from '@/components/shared/breadcrumbs';
import {
  Accordion,
  AccordionContent,
  AccordionItem,
  AccordionTrigger,
} from "@/components/ui/accordion";

const getReputationMilestone = (score: number): {milestone: string, color: string, description: string} => {
  if (score <= -11) return { milestone: 'Hated', color: 'bg-red-700 hover:bg-red-700', description: 'Actively seeks to harm the party; attacks on sight.' };
  if (score <= -6) return { milestone: 'Hostile', color: 'bg-red-500 hover:bg-red-500', description: 'Uncooperative, may refuse services or aid enemies.' };
  if (score <= -1) return { milestone: 'Unfriendly', color: 'bg-orange-500 hover:bg-orange-500', description: 'Suspicious, higher prices, less likely to offer help or quests.' };
  if (score <= 4) return { milestone: 'Neutral', color: 'bg-gray-500 hover:bg-gray-500', description: 'Indifferent, standard interactions and prices.' };
  if (score <= 9) return { milestone: 'Friendly', color: 'bg-sky-500 hover:bg-sky-500', description: 'Helpful, may offer discounts or minor quests.' };
  if (score <= 19) return { milestone: 'Allied', color: 'bg-green-500 hover:bg-green-500', description: 'Provides significant aid, important quests, and resources.' };
  return { milestone: 'Exalted', color: 'bg-green-700 hover:bg-green-700', description: 'Staunch supporters, offering unique benefits and unwavering loyalty.' };
};

export default function FactionsQuestsPage() {
  const { activeCampaign, factions, factionReputations, isLoading } = useCampaignContext();

  if (isLoading) {
    return (
      <div className="text-center py-12">Loading faction data...</div>
    );
  }

  const reputationMilestones = [
    { score: -20, name: 'Hated', description: '(-20 to -11): Faction actively works against the party, potentially attacking on sight.' },
    { score: -10, name: 'Hostile', description: '(-10 to -6): Uncooperative, may refuse services, aid party enemies.' },
    { score: -5, name: 'Unfriendly', description: '(-5 to -1): Suspicious, higher prices, unlikely to offer help or quests.' },
    { score: 0, name: 'Neutral', description: '(0 to +4): Indifferent, standard interactions and prices.' },
    { score: 5, name: 'Friendly', description: '(+5 to +9): Helpful, may offer discounts, minor quests, or useful information.' },
    { score: 10, name: 'Allied', description: '(+10 to +19): Provides significant aid, access to special quests, and resources.' },
    { score: 20, name: 'Exalted', description: '(+20): Staunch supporters, offering unique benefits and unwavering loyalty.' },
  ];


  return (
    <>
      {activeCampaign && <Breadcrumbs activeCampaign={activeCampaign} />}
      <PageHeader
        title="Factions & Quests"
        description={activeCampaign ? `Manage faction reputations and track quests for "${activeCampaign.name}".` : "Please select an active campaign."}
      />

      <Accordion type="single" collapsible className="w-full mb-6 shadow-lg rounded-lg border">
        <AccordionItem value="item-1" className="border-b-0">
          <AccordionTrigger className="px-6 py-4 hover:no-underline">
            <div className="flex flex-col items-start text-left">
                <CardTitle className="flex items-center text-lg"> 
                    {/* text-lg instead of text-2xl from CardTitle default */}
                    <Info className="mr-2 h-5 w-5 text-primary" />
                    Understanding Faction Reputation
                </CardTitle>
                <CardDescription className="mt-1 text-sm">
                    Faction reputation ranges from -20 (Hated) to +20 (Exalted). Click to learn more.
                </CardDescription>
            </div>
          </AccordionTrigger>
          <AccordionContent className="px-6 pb-6">
            <p className="text-sm text-muted-foreground mb-3">
                Your party's actions and choices can influence these scores, impacting interactions, quest availability, and more.
            </p>
            <ul className="space-y-1 text-sm">
              {reputationMilestones.map(milestone => {
                const { color } = getReputationMilestone(milestone.score);
                return (
                  <li key={milestone.name} className="flex items-start">
                    <Badge variant="secondary" className={`mr-2 mt-0.5 text-xs ${color} text-white shrink-0`}>{milestone.name}</Badge>
                    <span className="text-muted-foreground">{milestone.description}</span>
                  </li>
                );
              })}
            </ul>
            <p className="mt-3 text-sm text-muted-foreground">
              Higher reputation can unlock new quests, better prices from merchants aligned with the faction, and access to restricted areas or resources. Conversely, low reputation can lead to hostility, higher prices, or even outright conflict.
            </p>
          </AccordionContent>
        </AccordionItem>
      </Accordion>


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
