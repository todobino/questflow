'use client';

import Link from 'next/link';
import { usePathname } from 'next/navigation';
import { Tabs, TabsList, TabsTrigger } from '@/components/ui/tabs';
import type { ReactNode } from 'react';

const creatorNavItems = [
  { title: 'Characters', href: '/creator/characters' },
  { title: 'Encounters (Soon)', href: '/creator/encounters', disabled: true },
  // Add more creator tools here
];

export default function CreatorLayout({ children }: { children: ReactNode }) {
  const pathname = usePathname();

  return (
    <div className="space-y-6">
      <Tabs value={pathname} className="w-full">
        <TabsList className="grid w-full grid-cols-2 md:w-[300px]">
          {creatorNavItems.map((item) => (
            <TabsTrigger key={item.href} value={item.href} asChild disabled={item.disabled}>
              <Link href={item.href}>{item.title}</Link>
            </TabsTrigger>
          ))}
        </TabsList>
      </Tabs>
      <div>{children}</div>
    </div>
  );
}
