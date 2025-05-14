
'use client';

import { useState, useEffect } from 'react';
import Image from 'next/image';
import type { Character } from '@/lib/types'; // Changed from PartyMember to Character
import { Card, CardContent } from '@/components/ui/card';
import { Avatar, AvatarFallback, AvatarImage } from '@/components/ui/avatar';
import { Progress } from '@/components/ui/progress';
import { ScrollArea } from '@/components/ui/scroll-area';
import { useCampaignContext } from '@/contexts/campaign-context';
import { Shield as ShieldIcon, Heart } from 'lucide-react'; // Added Heart for consistency

export function PartySheet() {
  const { activeCampaign, characters, isLoading: isCampaignLoading } = useCampaignContext();
  const [partyMembers, setPartyMembers] = useState<Character[]>([]);

  useEffect(() => {
    if (activeCampaign && characters) {
      setPartyMembers(characters.filter(char => char.campaignId === activeCampaign.id));
    } else {
      setPartyMembers([]); 
    }
  }, [activeCampaign, characters]);

  if (isCampaignLoading) {
    return <p className="text-sm text-muted-foreground text-center py-4">Loading party...</p>;
  }

  return (
    <ScrollArea className="h-full">
      <div className="space-y-3 pr-1">
        {partyMembers.map((member) => (
          <Card key={member.id} className="shadow-sm relative">
            <CardContent className="p-3">
              <div className="flex items-center space-x-3 mb-2">
                <Avatar className="h-12 w-12">
                  <AvatarImage 
                    src={member.imageUrl || `https://placehold.co/64x64.png`} 
                    alt={member.name} 
                    data-ai-hint={`${member.race || ''} ${member.class || ''} portrait`} 
                  />
                  <AvatarFallback>{member.name.substring(0, 1).toUpperCase()}</AvatarFallback>
                </Avatar>
                <div>
                  <p className="font-semibold text-md">{member.name}</p>
                  <p className="text-xs text-muted-foreground">
                    Lvl {member.level || 1} {member.race || 'N/A'} {member.class || 'N/A'}
                  </p>
                </div>
              </div>
              
              {/* AC Display in top right */}
              {member.armorClass !== undefined && (
                <div className="absolute top-2 right-2 flex items-center justify-center bg-background/70 backdrop-blur-sm p-1 rounded-full shadow-sm w-8 h-8">
                  <ShieldIcon className="h-4 w-4 text-muted-foreground" />
                  <span className="absolute text-xs font-bold text-foreground" style={{ fontSize: '0.6rem', top: '50%', left: '50%', transform: 'translate(-50%, -50%)' }}>
                    {member.armorClass}
                  </span>
                </div>
              )}

              <div>
                <div className="flex justify-between text-xs text-muted-foreground mb-0.5 items-center">
                  <span className="flex items-center">
                    <Heart className="h-3 w-3 mr-1 text-red-500" />
                    {member.currentHp ?? 'N/A'} / {member.maxHp ?? 'N/A'}
                  </span>
                  {member.maxHp && member.maxHp > 0 && member.currentHp !== undefined && (
                     <span>{Math.round((member.currentHp / member.maxHp) * 100)}%</span>
                  )}
                </div>
                {member.maxHp && member.maxHp > 0 && member.currentHp !== undefined && (
                    <Progress value={(member.currentHp / member.maxHp) * 100} className="h-1.5" />
                )}
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
