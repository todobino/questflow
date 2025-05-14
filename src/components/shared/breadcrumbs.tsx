
'use client';

import { usePathname } from 'next/navigation';
import Link from 'next/link';
import { ChevronRight } from 'lucide-react';
import type { Campaign } from '@/lib/types';
import { SITE_NAV_ITEMS, CAMPAIGN_MENU_NAV_ITEMS, APP_NAME } from '@/lib/constants';

interface BreadcrumbsProps {
  activeCampaign: Campaign | null;
}

export function Breadcrumbs({ activeCampaign }: BreadcrumbsProps) {
  const pathname = usePathname();

  let pageTitle = '';
  let pageHref = pathname; // Default to current path for non-nav items

  const allNavItems = [...SITE_NAV_ITEMS, ...CAMPAIGN_MENU_NAV_ITEMS];
  const currentNavItem = allNavItems.find(
    (item) => item.href === pathname || (item.href !== '/' && pathname.startsWith(item.href))
  );

  if (currentNavItem) {
    pageTitle = currentNavItem.title;
    pageHref = currentNavItem.href; // Use nav item's href for canonical link if it's a main nav page
  } else if (pathname === '/') {
    // HomePage redirects to /campaigns, so breadcrumb should reflect that target
    pageTitle = 'Campaigns';
    pageHref = '/campaigns';
  } else {
    // Fallback for dynamic routes or pages not explicitly in nav items
    const pathSegments = pathname.split('/').filter(Boolean);
    // Make a more readable title from the last segment
    pageTitle = pathSegments.length > 0 ? pathSegments[pathSegments.length - 1].replace(/-/g, ' ').replace(/\b\w/g, l => l.toUpperCase()) : APP_NAME;
  }

  return (
    <nav aria-label="Breadcrumb">
      <ol className="flex items-center space-x-1.5 text-sm">
        {activeCampaign && pathname !== '/campaigns' && (
          <>
            <li>
              {/* Active campaign name is a preceding item, so muted. Still links to /campaigns for context. */}
              <Link href="/campaigns" className="font-medium text-muted-foreground hover:text-foreground truncate max-w-xs">
                {activeCampaign.name}
              </Link>
            </li>
            <li>
              <ChevronRight className="h-4 w-4 text-muted-foreground" />
            </li>
          </>
        )}
        <li>
          {/* The current page title is the last item, so it's more prominent. */}
          <span className="font-medium text-foreground">{pageTitle}</span>
        </li>
      </ol>
    </nav>
  );
}
