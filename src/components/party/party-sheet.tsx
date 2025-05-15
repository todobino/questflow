
'use client';

import { useState, useEffect } from 'react';
import Image from 'next/image';
import type { Character } from '@/lib/types';
import { Card, CardContent } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import Link from 'next/link';
import { Avatar, AvatarFallback, AvatarImage } from '@/components/ui/avatar';
import { Progress } from '@/components/ui/progress';
import { ScrollArea } from '@/components/ui/scroll-area';
import { useCampaignContext } from '@/contexts/campaign-context';
import { Shield as ShieldIcon, Award, Users, Heart } from 'lucide-react';

export function PartySheet() {
  const {
    activeCampaign,
    characters,
    isLoading: isCampaignLoading,
    openProfileDialog
  } = useCampaignContext();
  const [partyMembers, setPartyMembers] = useState<Character[]>([]);

  useEffect(() => {
    if (activeCampaign && characters) {
      setPartyMembers(characters.filter(char => char.campaignId === activeCampaign.id));
    } else {
      setPartyMembers([]);
    }
  }, [activeCampaign, characters]);

  const totalCurrentHp = partyMembers.reduce((sum, member) => sum + (member.currentHp ?? 0), 0);
  const totalMaxHp = partyMembers.reduce((sum, member) => sum + (member.maxHp ?? 1), 0); 
  const partyStrengthPercentage = totalMaxHp > 0 ? (totalCurrentHp / totalMaxHp) * 100 : 0;

  if (isCampaignLoading) {
    return <p className="text-sm text-muted-foreground text-center py-4">Loading party...</p>;
  }

  return (
    <div className="h-full flex flex-col">
      <ScrollArea className="flex-grow">
        <div className="space-y-3 pr-1">
          {partyMembers.map((member) => {
            const expPercentage = (member.nextLevelExp && member.nextLevelExp > 0 && member.currentExp !== undefined)
              ? (member.currentExp / member.nextLevelExp) * 100
              : 0;
            return (
              <Card
                key={member.id}
                className="shadow-lg relative hover:border-primary transition-colors cursor-pointer"
                onClick={() => openProfileDialog(member)}
              >
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

                  <div className="absolute top-2 right-2 flex flex-col items-end space-y-1">
                    {member.armorClass !== undefined && (
                      <div className="flex items-center bg-background/70 backdrop-blur-sm px-1.5 py-0.5 rounded-md shadow-sm text-xs">
                        <ShieldIcon className="h-3.5 w-3.5 mr-1 text-foreground" />
                        <span className="font-semibold text-foreground">{member.armorClass}</span>
                      </div>
                    )}
                    {member.currentHp !== undefined && member.maxHp !== undefined && (
                      <div className="flex items-center bg-background/70 backdrop-blur-sm px-1.5 py-0.5 rounded-md shadow-sm text-xs">
                        <Heart className="h-3.5 w-3.5 mr-1 text-red-500" />
                        <span className="font-semibold text-foreground">{member.currentHp}/{member.maxHp}</span>
                      </div>
                    )}
                  </div>


                  <div>
                    <div className="flex justify-between text-xs text-muted-foreground mb-0.5 items-center">
                      <span className="flex items-center">
                        <Award className="h-3 w-3 mr-1 text-amber-500" />
                        EXP: {member.currentExp ?? '0'} / {member.nextLevelExp ?? '?'}
                      </span>
                      {member.nextLevelExp && member.nextLevelExp > 0 && member.currentExp !== undefined && (
                         <span>{Math.round(expPercentage)}%</span>
                      )}
                    </div>
                    {member.nextLevelExp && member.nextLevelExp > 0 && member.currentExp !== undefined && (
                        <Progress value={expPercentage} className="h-2" />
                    )}
                  </div>
                </CardContent>
              </Card>
            );
          })}
           {partyMembers.length === 0 && activeCampaign && (
              <p className="text-sm text-muted-foreground text-center py-4">No party members for this campaign.</p>
          )}
          {!activeCampaign && (
              <p className="text-sm text-muted-foreground text-center py-4">Select a campaign to view party.</p>
          )}
        </div>
      </ScrollArea>
      
      {activeCampaign && partyMembers.length > 0 && (
        <div className="flex-shrink-0 mt-auto pt-3 mb-3 p-3 border rounded-lg bg-card shadow-sm">
          <div className="flex justify-between items-center mb-1">
            <p className="text-sm font-semibold flex items-center">
              <Users className="h-4 w-4 mr-2 text-primary" />
              Party Strength
            </p>
            <p className="text-xs text-muted-foreground">{Math.round(partyStrengthPercentage)}%</p>
          </div>
          <Progress value={partyStrengthPercentage} className="h-2 [&>div]:bg-primary dark:[&>div]:bg-primary-foreground" />
        </div>
      )}

      <div className="flex-shrink-0 pt-0"> {/* Removed mt-auto, added pt-0 to ensure button is at the very bottom of its allocated space */}
        <Button asChild className="w-full">
          <Link href="/party">Manage Party</Link>
        </Button>
      </div>
    </div>
  );
}
