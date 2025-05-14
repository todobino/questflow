
'use client';

import { useState, useEffect } from 'react';
import Image from 'next/image';
import type { Character } from '@/lib/types'; 
import { Card, CardContent } from '@/components/ui/card';
import { Button } from '@/components/ui/button'; // Import Button
import Link from 'next/link'; // Import Link
import { Avatar, AvatarFallback, AvatarImage } from '@/components/ui/avatar';
import { Progress } from '@/components/ui/progress';
import { ScrollArea } from '@/components/ui/scroll-area';
import { useCampaignContext } from '@/contexts/campaign-context';
import { Shield as ShieldIcon, Heart } from 'lucide-react'; 

export function PartySheet() {
  const { 
    activeCampaign, 
    characters, 
    isLoading: isCampaignLoading,
    openProfileDialog // Get from context
  } = useCampaignContext();
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
    <div className="h-full flex flex-col">
      <ScrollArea className="flex-grow">
        <div className="space-y-3 pr-1">
          {partyMembers.map((member) => (
            <Card 
              key={member.id} 
              className="shadow-sm relative hover:border-primary transition-colors cursor-pointer"
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
                
                {member.armorClass !== undefined && (
                  <div className="absolute top-2 right-2 flex items-center bg-background/70 backdrop-blur-sm px-1.5 py-1 rounded-md shadow-sm text-xs">
                    <ShieldIcon className="h-3.5 w-3.5 mr-1 text-foreground" />
                    <span className="font-semibold text-foreground">{member.armorClass}</span>
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
      <div className="mt-auto pt-3"> {/* Ensure button is at the bottom and has some top margin */}
        <Button asChild className="w-full">
          <Link href="/party">Manage Party</Link>
        </Button>
      </div>
    </div>
  );
}
