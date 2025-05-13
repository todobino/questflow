import type { ReactNode } from 'react';
import { SidebarProvider, SidebarInset, SidebarTrigger, SidebarRail } from '@/components/ui/sidebar';
import { SidebarNav } from './sidebar-nav';
import { Toaster } from '@/components/ui/toaster';

interface MainLayoutProps {
  children: ReactNode;
}

export function MainLayout({ children }: MainLayoutProps) {
  return (
    <SidebarProvider defaultOpen>
      <SidebarNav />
      <SidebarRail />
      <SidebarInset>
        <header className="sticky top-0 z-10 flex h-14 items-center justify-between gap-4 border-b bg-background/80 px-4 py-2 backdrop-blur-sm md:hidden">
          <SidebarTrigger />
          {/* Mobile Header Content (e.g., App Name or Current Page Title) */}
          <h1 className="text-lg font-semibold">Campaign Canvas</h1>
        </header>
        <main className="flex-1 p-4 md:p-6">
          {children}
        </main>
      </SidebarInset>
      <Toaster />
    </SidebarProvider>
  );
}
