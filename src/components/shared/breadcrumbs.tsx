
'use client';

import { usePathname, useRouter } from 'next/navigation';
import Link from 'next/link';
import { ChevronDown, ChevronRight } from 'lucide-react';
import type { Campaign } from '@/lib/types';
import { CAMPAIGN_MENU_NAV_ITEMS, SITE_NAV_ITEMS } from '@/lib/constants';
import { cn } from '@/lib/utils';
import { Popover, PopoverContent, PopoverTrigger } from '@/components/ui/popover';
import { Button } from '@/components/ui/button';
import { Command, CommandEmpty, CommandGroup, CommandInput, CommandItem, CommandList } from '@/components/ui/command';
import { useState } from 'react';

interface BreadcrumbsProps {
  activeCampaign: Campaign | null;
  campaigns: Campaign[];
  setCampaignActive: (campaignId: string) => void;
}

export function Breadcrumbs({ activeCampaign, campaigns, setCampaignActive }: BreadcrumbsProps) {
  const pathname = usePathname();
  const router = useRouter();
  const [popoverOpen, setPopoverOpen] = useState(false);

  const allNavItems = [...CAMPAIGN_MENU_NAV_ITEMS, ...SITE_NAV_ITEMS];
  const currentPage = allNavItems.find(item => item.href === pathname);
  const pageTitle = currentPage?.title || pathname.split('/').pop()?.replace(/-/g, ' ') || 'Page';

  const handleCampaignSelect = (campaignId: string) => {
    setCampaignActive(campaignId);
    setPopoverOpen(false); // Close popover after selection
  };

  return (
    <nav aria-label="Breadcrumb" className="flex items-center text-sm">
      <ol className="flex items-center space-x-1.5">
        {activeCampaign && (
          <li>
            <Popover open={popoverOpen} onOpenChange={setPopoverOpen}>
              <PopoverTrigger asChild>
                <Button
                  variant="ghost"
                  size="sm"
                  className="group flex items-center gap-1 px-2 py-1 h-auto font-semibold text-muted-foreground hover:bg-accent hover:text-foreground"
                >
                  <span>{activeCampaign.name}</span>
                  <ChevronDown className="h-4 w-4 text-muted-foreground" />
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
                          className="cursor-pointer"
                        >
                          {campaign.name}
                          {campaign.id === activeCampaign.id && <span className="ml-auto text-xs text-primary">(Active)</span>}
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
                        View All Campaigns
                       </CommandItem>
                    </CommandGroup>
                  </CommandList>
                </Command>
              </PopoverContent>
            </Popover>
          </li>
        )}

        {activeCampaign && (
          <li className="flex items-center">
            <ChevronRight className="h-4 w-4 text-muted-foreground" />
          </li>
        )}

        <li>
          <span className="px-2 py-1 font-semibold text-foreground capitalize">
            {pageTitle}
          </span>
        </li>
      </ol>
    </nav>
  );
}
