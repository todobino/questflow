
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
  let pageTitle = 'Page'; // Default
  if (currentPage) {
    pageTitle = currentPage.title;
  } else if (pathname === '/campaigns') {
    pageTitle = 'Campaign Manager';
  } else if (pathname === '/') {
    pageTitle = 'Dashboard'; // Or whatever your root page title is
  }
  else {
    const pathSegments = pathname.split('/');
    const lastSegment = pathSegments[pathSegments.length - 1];
    if (lastSegment) {
      pageTitle = lastSegment.replace(/-/g, ' ').replace(/\b\w/g, l => l.toUpperCase());
    }
  }


  const handleCampaignSelect = (campaignId: string) => {
    setCampaignActive(campaignId);
    setPopoverOpen(false);
  };

  return (
    <nav aria-label="Breadcrumb" className="flex items-center text-sm">
      <ol className="flex items-center space-x-1.5">
        {activeCampaign && (
          <li>
            <Popover open={popoverOpen} onOpenChange={setPopoverOpen}>
              <PopoverTrigger asChild>
                <Button
                  size="sm"
                  className={cn(
                    "group flex items-center gap-1 px-2 py-1 h-auto font-semibold",
                    "bg-muted text-neutral-600 dark:text-neutral-400 border border-border", 
                    "hover:bg-muted hover:text-foreground hover:border-primary" 
                  )}
                >
                  <span>{activeCampaign.name}</span>
                  <ChevronDown
                    className={cn(
                      "h-4 w-4 text-neutral-600 dark:text-neutral-400 group-hover:text-foreground"
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
                        Manage All Campaigns
                       </CommandItem>
                    </CommandGroup>
                  </CommandList>
                </Command>
              </PopoverContent>
            </Popover>
          </li>
        )}

        {activeCampaign && pathname !== '/campaigns' && (
          <li className="flex items-center">
            <ChevronRight className="h-4 w-4 text-muted-foreground" />
          </li>
        )}

        <li>
          <span className={cn(
            "px-2 py-1 font-semibold capitalize",
            activeCampaign && pathname !== '/campaigns' ? "text-foreground" : "text-foreground" // Ensures current page is always foreground
          )}>
            {pageTitle}
          </span>
        </li>
      </ol>
    </nav>
  );
}
