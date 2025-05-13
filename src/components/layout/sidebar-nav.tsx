// This is an auto-generated file from Firebase Studio.
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
import {
  Popover,
  PopoverContent,
  PopoverTrigger,
} from "@/components/ui/popover";
import { Tooltip, TooltipContent, TooltipTrigger as RadixTooltipTrigger } from "@/components/ui/tooltip";
import { PlusCircle, BookOpen, User, Shield, ScrollText, Users as UsersIcon } from 'lucide-react';


export function SidebarNav() {
  const pathname = usePathname();
  const { state: sidebarState, isMobile } = useSidebar();

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
            <Popover>
              <PopoverTrigger asChild>
                {sidebarState === 'expanded' || isMobile ? (
                  <Button variant="outline" className="w-full justify-start">
                    <PlusCircle className="mr-2 h-4 w-4" />
                    Make New
                  </Button>
                ) : (
                  <Tooltip>
                    <RadixTooltipTrigger asChild>
                      <Button variant="outline" size="icon" className="w-full">
                        <PlusCircle className="h-4 w-4" />
                      </Button>
                    </RadixTooltipTrigger>
                    <TooltipContent side="right" align="center">
                      <p>Make New</p>
                    </TooltipContent>
                  </Tooltip>
                )}
              </PopoverTrigger>
              <PopoverContent
                side="top"
                align={sidebarState === 'expanded' ? "start" : "center"}
                className="w-[var(--radix-popover-trigger-width)] p-1"
              >
                <div className="flex flex-col space-y-1">
                  <Button variant="ghost" className="w-full justify-start text-sm h-auto py-2" asChild>
                    <Link href="/campaigns">
                      <BookOpen className="mr-2 h-4 w-4" /> New Campaign
                    </Link>
                  </Button>
                  <Button variant="ghost" className="w-full justify-start text-sm h-auto py-2" asChild>
                    <Link href="/creator/characters">
                      <User className="mr-2 h-4 w-4" /> New Character
                    </Link>
                  </Button>
                  <Button variant="ghost" className="w-full justify-start text-sm h-auto py-2" asChild disabled>
                    <Link href="/creator/encounters">
                      <Shield className="mr-2 h-4 w-4" /> New Encounter
                    </Link>
                  </Button>
                  <Button variant="ghost" className="w-full justify-start text-sm h-auto py-2" asChild>
                    <Link href="/journal">
                      <ScrollText className="mr-2 h-4 w-4" /> New Journal Entry
                    </Link>
                  </Button>
                  <Button variant="ghost" className="w-full justify-start text-sm h-auto py-2" asChild>
                    <Link href="/creator/characters"> {/* Point to character creator for NPC */}
                      <UsersIcon className="mr-2 h-4 w-4" /> New NPC
                    </Link>
                  </Button>
                </div>
              </PopoverContent>
            </Popover>
         </div>
      </SidebarFooter>
    </Sidebar>
  );
}
