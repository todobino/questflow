
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
  let pageHref = pathname;

  const allNavItems = [...SITE_NAV_ITEMS, ...CAMPAIGN_MENU_NAV_ITEMS];
  const currentNavItem = allNavItems.find(
    (item) => item.href === pathname || (item.href !== '/' && pathname.startsWith(item.href))
  );

  if (currentNavItem) {
    pageTitle = currentNavItem.title;
    pageHref = currentNavItem.href;
  } else if (pathname === '/') {
    pageTitle = 'Campaigns'; // Default for root, as it redirects to campaigns
    pageHref = '/campaigns';
  } else {
    // Fallback for dynamic routes or pages not in nav items
    const pathSegments = pathname.split('/').filter(Boolean);
    pageTitle = pathSegments.length > 0 ? pathSegments[pathSegments.length - 1].replace(/-/g, ' ').replace(/\b\w/g, l => l.toUpperCase()) : APP_NAME;
  }

  return (
    <nav aria-label="Breadcrumb">
      <ol className="flex items-center space-x-1.5 text-sm text-muted-foreground">
        {activeCampaign && pathname !== '/campaigns' && (
          <>
            <li>
              <span className="font-medium text-foreground truncate max-w-xs">
                {activeCampaign.name}
              </span>
            </li>
            <li>
              <ChevronRight className="h-4 w-4" />
            </li>
          </>
        )}
        <li>
          {/* Check if current page is the one displayed, if so, not a link */}
          {pathname === pageHref ? (
            <span className="font-medium text-foreground">{pageTitle}</span>
          ) : (
            <Link href={pageHref} className="font-medium text-foreground hover:text-primary">
              {pageTitle}
            </Link>
          )}
        </li>
      </ol>
    </nav>
  );
}
