
'use client';

import { usePathname, useRouter } from 'next/navigation';
import Link from 'next/link';
import { ChevronDown, ChevronRight, Check } from 'lucide-react';
import type { Campaign } from '@/lib/types';
import { cn } from '@/lib/utils';
import { Popover, PopoverContent, PopoverTrigger } from '@/components/ui/popover';
import { Button } from '@/components/ui/button';
import { Command, CommandEmpty, CommandGroup, CommandInput, CommandItem, CommandList } from '@/components/ui/command';
import { useState, Fragment } from 'react';
import { SITE_NAV_ITEMS, CAMPAIGN_MENU_NAV_ITEMS } from '@/lib/constants';


interface BreadcrumbsProps {
  activeCampaign: Campaign | null;
  campaigns: Campaign[];
  setCampaignActive: (campaignId: string) => void;
}

export function Breadcrumbs({ activeCampaign, campaigns, setCampaignActive }: BreadcrumbsProps) {
  const pathname = usePathname();
  const router = useRouter();
  const [popoverOpen, setPopoverOpen] = useState(false);

  const handleCampaignSelect = (campaignId: string) => {
    setCampaignActive(campaignId);
    setPopoverOpen(false);
  };

  return (
    <nav aria-label="Campaign Switcher" className="flex items-center text-sm h-full">
      <ol className="flex items-center space-x-1.5">
        {activeCampaign ? (
          <li>
            <Popover open={popoverOpen} onOpenChange={setPopoverOpen}>
              <PopoverTrigger asChild>
                <Button
                  size="sm"
                  className={cn(
                    "group flex items-center gap-1 px-2 py-1 h-auto font-semibold border",
                    "bg-muted text-neutral-600 dark:text-neutral-400 border-border",
                    "hover:bg-muted hover:text-foreground hover:border-primary"
                  )}
                >
                  <span className="truncate max-w-[150px] sm:max-w-[200px] md:max-w-[250px]">{activeCampaign.name}</span>
                  <ChevronDown
                    className={cn(
                      "h-4 w-4 shrink-0 text-neutral-600 dark:text-neutral-400 transition-opacity",
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
          </li>
        ) : (
          <li>
            <Button
                variant="ghost"
                size="sm"
                className="h-auto px-2 py-1 font-semibold text-muted-foreground hover:bg-muted hover:text-foreground"
                onClick={() => router.push('/campaigns')}
            >
                Select Campaign
            </Button>
          </li>
        )}
      </ol>
    </nav>
  );
}
