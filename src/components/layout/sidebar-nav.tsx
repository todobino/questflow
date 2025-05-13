'use client';

import Link from 'next/link';
import { usePathname } from 'next/navigation';
import type { NavItem } from '@/lib/constants';
import { NAV_ITEMS } from '@/lib/constants';
import { cn } from '@/lib/utils';
import {
  Sidebar,
  SidebarHeader,
  SidebarContent,
  SidebarMenu,
  SidebarMenuItem,
  SidebarMenuButton,
  SidebarFooter,
  useSidebar,
} from '@/components/ui/sidebar';
import { Button } from '@/components/ui/button';
import { AppLogo } from '@/components/icons';
import { Separator } from '@/components/ui/separator';
import { ExternalLink } from 'lucide-react';


export function SidebarNav() {
  const pathname = usePathname();
  const { state: sidebarState } = useSidebar();

  return (
    <Sidebar>
      <SidebarHeader>
        <div className="flex items-center gap-2 p-2">
          <AppLogo className={cn("h-8 w-8 text-primary", sidebarState === 'collapsed' && "h-6 w-6")} />
          {sidebarState === 'expanded' && (
            <h1 className="text-xl font-semibold tracking-tight">Campaign Canvas</h1>
          )}
        </div>
      </SidebarHeader>
      <SidebarContent>
        <SidebarMenu>
          {NAV_ITEMS.map((item) => (
            <SidebarMenuItem key={item.href}>
              <SidebarMenuButton
                asChild
                isActive={pathname === item.href || (item.href !== '/' && pathname.startsWith(item.href))}
                tooltip={item.title}
              >
                <Link href={item.href}>
                  <item.icon />
                  <span>{item.title}</span>
                </Link>
              </SidebarMenuButton>
            </SidebarMenuItem>
          ))}
        </SidebarMenu>
      </SidebarContent>
      <SidebarFooter className="mt-auto">
        <Separator className="my-2" />
         <div className="p-2">
            <Button variant="outline" className="w-full justify-start" asChild>
                <Link href="https://firebase.google.com/docs/studio" target="_blank" rel="noopener noreferrer">
                    <ExternalLink className="mr-2 h-4 w-4" />
                    {sidebarState === 'expanded' ? 'Firebase Studio Docs' : ''}
                </Link>
            </Button>
         </div>
      </SidebarFooter>
    </Sidebar>
  );
}
