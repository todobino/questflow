
'use client';

import { useState, useEffect } from 'react';
import { useRouter } from 'next/navigation';
import { ChevronDown, Check } from 'lucide-react';
import type { Campaign } from '@/lib/types';
import { cn } from '@/lib/utils';
import { Popover, PopoverContent, PopoverTrigger } from '@/components/ui/popover';
import { Button } from '@/components/ui/button';
import { Command, CommandEmpty, CommandGroup, CommandInput, CommandItem, CommandList } from '@/components/ui/command';
import { useCampaignContext } from '@/contexts/campaign-context';

interface CampaignSwitcherProps {
  // Props now come from context, so direct props might not be needed
}

export function CampaignSwitcher({ }: CampaignSwitcherProps) {
  const router = useRouter();
  const {
    campaigns,
    activeCampaign,
    requestSwitchCampaign,
  } = useCampaignContext();
  const [popoverOpen, setPopoverOpen] = useState(false);
  const [mounted, setMounted] = useState(false);

  useEffect(() => {
    setMounted(true);
  }, []);

  const handleCampaignSelect = (campaignId: string) => {
    requestSwitchCampaign(campaignId);
    setPopoverOpen(false);
  };

  if (!mounted) {
    return (
       <Button
        variant="outline"
        size="sm"
        className="h-auto px-2 py-1 shadow-md border-neutral-400 dark:border-border"
        disabled
      >
        Loading...
      </Button>
    );
  }

  if (!activeCampaign) {
    return (
      <Button
        variant="success"
        size="sm"
        className="h-auto px-2 py-1 shadow-md"
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
            "group flex items-center gap-1 px-2 py-1 h-auto font-semibold border shadow-md", // Base
            // Light mode defaults
            "bg-muted text-neutral-600 border-neutral-400",
            // Dark mode overrides
            "dark:bg-muted dark:text-primary-foreground dark:border-primary-foreground",
            // Light mode hover
            "hover:bg-muted hover:text-foreground hover:border-primary",
            // Dark mode hover overrides (maintaining dark gray bg, white text/border)
            "dark:hover:bg-secondary dark:hover:text-primary-foreground dark:hover:border-primary-foreground"
          )}
        >
          <span className="truncate max-w-[150px] sm:max-w-[200px] md:max-w-[250px]">{activeCampaign.name}</span>
          <ChevronDown
            className={cn(
              "h-4 w-4 shrink-0", // Chevron always visible
              "text-neutral-600 group-hover:text-foreground", // Light mode text & hover
              "dark:text-primary-foreground dark:group-hover:text-primary-foreground" // Dark mode text & hover (white)
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
                  {activeCampaign && campaign.id === activeCampaign.id && (
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
