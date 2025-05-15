
'use client';

import { useState } from 'react';
import { useRouter } from 'next/navigation';
import { ChevronDown, Check } from 'lucide-react';
import type { Campaign } from '@/lib/types';
import { cn } from '@/lib/utils';
import { Popover, PopoverContent, PopoverTrigger } from '@/components/ui/popover';
import { Button } from '@/components/ui/button';
import { Command, CommandEmpty, CommandGroup, CommandInput, CommandItem, CommandList } from '@/components/ui/command';

interface CampaignSwitcherProps {
  activeCampaign: Campaign | null;
  campaigns: Campaign[];
  setCampaignActive: (campaignId: string) => void;
}

export function CampaignSwitcher({ activeCampaign, campaigns, setCampaignActive }: CampaignSwitcherProps) {
  const router = useRouter();
  const [popoverOpen, setPopoverOpen] = useState(false);

  const handleCampaignSelect = (campaignId: string) => {
    setCampaignActive(campaignId);
    setPopoverOpen(false);
  };

  if (!activeCampaign) {
    return (
      <Button
        variant="ghost"
        size="sm"
        className="h-auto px-2 py-1 text-muted-foreground hover:bg-muted hover:text-foreground" // Removed font-semibold
        onClick={() => router.push('/campaigns')}
      >
        Select Campaign
      </Button>
    );
  }

  return (
    <Popover open={popoverOpen} onOpenChange={setPopoverOpen}>
      <PopoverTrigger asChild>
        <Button
          size="sm"
          className={cn(
            "group flex items-center gap-1 px-2 py-1 h-auto border", // Removed font-semibold
            "bg-muted text-neutral-600 dark:text-neutral-400 border-border",
            "hover:bg-muted hover:text-foreground hover:border-primary"
          )}
        >
          <span className="truncate max-w-[150px] sm:max-w-[200px] md:max-w-[250px]">{activeCampaign.name}</span>
          <ChevronDown
            className={cn(
              "h-4 w-4 shrink-0 text-neutral-600 dark:text-neutral-400",
              "group-hover:text-foreground" 
            )}
          />
        </Button>
      </PopoverTrigger>
      <PopoverContent className="w-[250px] p-0">
        <Command>
          <CommandInput placeholder="Search campaigns..." />
          <CommandList>
            <CommandEmpty>No campaigns found.</CommandEmpty>
            <CommandGroup>
              {campaigns.map((campaign) => (
                <CommandItem
                  key={campaign.id}
                  value={campaign.name}
                  onSelect={() => handleCampaignSelect(campaign.id)}
                  className="cursor-pointer flex justify-between items-center"
                >
                  <span>{campaign.name}</span>
                  {campaign.id === activeCampaign.id && (
                     <span className="ml-auto flex items-center justify-center h-5 w-5 rounded-full bg-success">
                        <Check className="h-3.5 w-3.5 text-success-foreground" />
                      </span>
                  )}
                </CommandItem>
              ))}
            </CommandGroup>
            <CommandGroup>
              <CommandItem
                onSelect={() => {
                  router.push('/campaigns');
                  setPopoverOpen(false);
                }}
                className="cursor-pointer"
              >
                Manage All Campaigns
              </CommandItem>
            </CommandGroup>
          </CommandList>
        </Command>
      </PopoverContent>
    </Popover>
  );
}

