
'use client';

import { Fragment } from 'react';
import Link from 'next/link';
import { usePathname } from 'next/navigation';
import { ChevronRight } from 'lucide-react';
import type { Campaign } from '@/lib/types';
import { cn } from '@/lib/utils';
import { CAMPAIGN_MENU_NAV_ITEMS, SITE_NAV_ITEMS } from '@/lib/constants';

interface BreadcrumbsProps {
  activeCampaign: Campaign | null;
}

export function Breadcrumbs({ activeCampaign }: BreadcrumbsProps) {
  const pathname = usePathname();
  const segments = pathname.split('/').filter(Boolean); // Remove empty strings

  const capitalize = (s: string) => s.charAt(0).toUpperCase() + s.slice(1);

  const allNavItems = [...CAMPAIGN_MENU_NAV_ITEMS, ...SITE_NAV_ITEMS];

  const breadcrumbItems = segments.map((segment, index) => {
    const href = '/' + segments.slice(0, index + 1).join('/');
    const navItem = allNavItems.find(item => item.href === href);
    const title = navItem?.title || capitalize(segment.replace(/-/g, ' '));
    const isLast = index === segments.length - 1;

    return { title, href, isLast };
  });

  if (segments.length === 0 && pathname === '/') return null; // No breadcrumbs on root if it's just '/'

  return (
    <nav aria-label="Breadcrumb" className="mb-4">
      <ol className="flex items-center space-x-1.5 text-sm">
        {activeCampaign && (
          <li>
            <Link
              href="/campaigns"
              className={cn(
                "font-semibold",
                breadcrumbItems.length > 0 ? "text-muted-foreground hover:text-foreground" : "text-foreground"
              )}
            >
              {activeCampaign.name}
            </Link>
          </li>
        )}
        {activeCampaign && breadcrumbItems.length > 0 && (
           <li><ChevronRight className="h-4 w-4 text-muted-foreground" /></li>
        )}

        {breadcrumbItems.map((item, index) => (
          <Fragment key={item.href}>
            <li>
              {item.isLast ? (
                <span className="font-semibold text-foreground">{item.title}</span>
              ) : (
                <Link
                  href={item.href}
                  className="font-semibold text-muted-foreground hover:text-foreground"
                >
                  {item.title}
                </Link>
              )}
            </li>
            {!item.isLast && (
              <li>
                <ChevronRight className="h-4 w-4 text-muted-foreground" />
              </li>
            )}
          </Fragment>
        ))}
      </ol>
    </nav>
  );
}
