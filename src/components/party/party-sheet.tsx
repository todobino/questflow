
'use client';

import { useState, useEffect } from 'react';
import Image from 'next/image';
import type { PartyMember } from '@/lib/types';
import { Card, CardContent } from '@/components/ui/card';
import { Avatar, AvatarFallback, AvatarImage } from '@/components/ui/avatar';
import { Progress } from '@/components/ui/progress';
import { ScrollArea } from '@/components/ui/scroll-area';
import { useCampaignContext } from '@/contexts/campaign-context';

// Mock data for party members - keyed by campaignId
const campaignPartyMembersData: Record<string, PartyMember[]> = {
  '1': [ // The Whispering Peaks
    { id: 'pm1', name: 'Elara', avatarUrl: 'https://picsum.photos/seed/elara/64/64', level: 5, race: 'Elf', class: 'Wizard', currentHp: 22, maxHp: 22, dataAiHint: "elf wizard" },
    { id: 'pm2', name: 'Grom', avatarUrl: 'https://picsum.photos/seed/grom/64/64', level: 5, race: 'Orc', class: 'Barbarian', currentHp: 45, maxHp: 58, dataAiHint: "orc barbarian" },
  ],
  '2': [ // Curse of the Sunken City
    { id: 'pm3', name: 'Seraphina', avatarUrl: 'https://picsum.photos/seed/seraphina/64/64', level: 4, race: 'Human', class: 'Cleric', currentHp: 30, maxHp: 30, dataAiHint: "human cleric" },
    { id: 'pm4', name: 'Roric', avatarUrl: 'https://picsum.photos/seed/roric/64/64', level: 5, race: 'Dwarf', class: 'Fighter', currentHp: 38, maxHp: 42, dataAiHint: "dwarf fighter" },
  ],
  '3': [ // Shadows over Riverwood
    // No party members yet for this campaign
  ],
};


export function PartySheet() {
  const { activeCampaign, isLoading: isCampaignLoading } = useCampaignContext();
  const [partyMembers, setPartyMembers] = useState<PartyMember[]>([]);

  useEffect(() => {
    if (activeCampaign?.id && campaignPartyMembersData[activeCampaign.id]) {
      setPartyMembers(campaignPartyMembersData[activeCampaign.id]);
    } else if (activeCampaign?.id) {
      setPartyMembers([]); // Campaign exists but has no members in mock
    }
    else {
      setPartyMembers([]); // No active campaign
    }
  }, [activeCampaign]);

  if (isCampaignLoading) {
    return <p className="text-sm text-muted-foreground text-center py-4">Loading party...</p>;
  }

  return (
    <ScrollArea className="h-full">
      <div className="space-y-3 pr-1">
        {partyMembers.map((member) => (
          <Card key={member.id} className="shadow-sm">
            <CardContent className="p-3">
              <div className="flex items-center space-x-3 mb-2">
                <Avatar className="h-12 w-12">
                  <AvatarImage src={member.avatarUrl} alt={member.name} data-ai-hint={member.dataAiHint || "character portrait"} />
                  <AvatarFallback>{member.name.substring(0, 1).toUpperCase()}</AvatarFallback>
                </Avatar>
                <div>
                  <p className="font-semibold text-md">{member.name}</p>
                  <p className="text-xs text-muted-foreground">
                    Lvl {member.level} {member.race} {member.class}
                  </p>
                </div>
              </div>
              <div>
                <div className="flex justify-between text-xs text-muted-foreground mb-0.5">
                  <span>HP: {member.currentHp} / {member.maxHp}</span>
                  <span>{Math.round((member.currentHp / member.maxHp) * 100)}%</span>
                </div>
                <Progress value={(member.currentHp / member.maxHp) * 100} className="h-1.5" />
              </div>
            </CardContent>
          </Card>
        ))}
         {partyMembers.length === 0 && activeCampaign && (
            <p className="text-sm text-muted-foreground text-center py-4">No party members for this campaign.</p>
        )}
        {!activeCampaign && (
            <p className="text-sm text-muted-foreground text-center py-4">Select a campaign to view party.</p>
        )}
      </div>
    </ScrollArea>
  );
}
