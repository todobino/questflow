
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

interface BreadcrumbsProps {
  activeCampaign: Campaign | null;
  campaigns: Campaign[];
  setCampaignActive: (campaignId: string) => void;
}

export function Breadcrumbs({ activeCampaign, campaigns, setCampaignActive }: BreadcrumbsProps) {
  const pathname = usePathname();
  const router = useRouter();
  const [popoverOpen, setPopoverOpen] = useState(false);

  const pathSegments = pathname.split('/').filter(segment => segment);

  const handleCampaignSelect = (campaignId: string) => {
    setCampaignActive(campaignId);
    setPopoverOpen(false);
    // Optionally, navigate to the campaign's default page or refresh
    // For now, just setting active campaign, assuming pages will react.
  };

  const formatSegment = (segment: string) => {
    return segment
      .split('-')
      .map(word => word.charAt(0).toUpperCase() + word.slice(1))
      .join(' ');
  };

  return (
    <nav aria-label="Breadcrumb" className="flex items-center text-sm h-full">
      <ol className="flex items-center space-x-1.5">
        {activeCampaign && (
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
                  <span>{activeCampaign.name}</span>
                  <ChevronDown
                    className={cn(
                      "h-4 w-4 text-neutral-600 dark:text-neutral-400 opacity-0 group-hover:opacity-100 transition-opacity",
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
        )}

        {pathSegments.map((segment, index) => {
          const href = `/${pathSegments.slice(0, index + 1).join('/')}`;
          const isLastSegment = index === pathSegments.length - 1;
          const segmentTitle = formatSegment(segment);

          // If no active campaign, and we are on the /campaigns page, don't show further segments.
          if (!activeCampaign && pathname === '/campaigns' && segment === 'campaigns') {
            return (
              <Fragment key={href}>
                <ChevronRight className="h-4 w-4 text-muted-foreground" />
                <li>
                  <span className="px-2 py-1 font-semibold text-foreground">
                    Campaign Manager
                  </span>
                </li>
              </Fragment>
            );
          }
           // If no active campaign, don't render path segments other than campaign manager
          if (!activeCampaign && segment !== 'campaigns') return null;


          return (
            <Fragment key={href}>
              <ChevronRight className="h-4 w-4 text-muted-foreground" />
              <li>
                {isLastSegment ? (
                  <span className="px-2 py-1 font-semibold text-foreground">
                    {segmentTitle}
                  </span>
                ) : (
                  <Button
                    asChild
                    variant="ghost"
                    size="sm"
                    className="h-auto px-2 py-1 font-semibold text-muted-foreground hover:bg-muted hover:text-foreground"
                  >
                    <Link href={href}>{segmentTitle}</Link>
                  </Button>
                )}
              </li>
            </Fragment>
          );
        })}
         {/* Handle root / or /campaigns when no other segments exist but campaign is active */}
         {(pathname === '/' || pathname === '/campaigns') && pathSegments.length === 0 && activeCampaign && (
            <>
                <ChevronRight className="h-4 w-4 text-muted-foreground" />
                <li>
                    <span className="px-2 py-1 font-semibold text-foreground">
                        Campaign Manager
                    </span>
                </li>
            </>
         )}
      </ol>
    </nav>
  );
}
