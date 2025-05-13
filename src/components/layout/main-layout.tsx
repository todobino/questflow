import type { ReactNode } from 'react';
import { SidebarProvider, SidebarTrigger } from '@/components/ui/sidebar';
import { SidebarNav } from './sidebar-nav';
import { Toaster } from '@/components/ui/toaster';

interface MainLayoutProps {
  children: ReactNode;
}

export function MainLayout({ children }: MainLayoutProps) {
  return (
    <SidebarProvider defaultOpen> {/* Manages left sidebar state and CSS variables */}
      <div className="flex h-screen w-full bg-background text-foreground"> {/* Overall flex container, ensure w-full */}

        {/* Left Sidebar */}
        <SidebarNav /> {/* Renders <Sidebar> which respects CSS variables for width (15vw) */}

        {/* Center Content Column */}
        {/* Adjusted width to 50vw and added flex-shrink-0 */}
        <div className="w-[50vw] flex-shrink-0 flex flex-col overflow-hidden"> 
          {/* Mobile Header for Center Content */}
          <header className="sticky top-0 z-10 flex h-14 items-center justify-between gap-4 border-b bg-background/80 px-4 py-2 backdrop-blur-sm md:hidden">
            <SidebarTrigger /> {/* Controls left sidebar visibility on mobile */}
            <h1 className="text-lg font-semibold">Campaign Canvas</h1>
          </header>
          {/* Main Page Content Area */}
          <main className="flex-1 p-4 md:p-6 overflow-y-auto">
            {children}
          </main>
        </div>

        {/* Right Sidebar Column */}
        {/* Adjusted width to 25vw */}
        <aside className="w-[25vw] flex-shrink-0 border-l border-border bg-card text-card-foreground p-4 overflow-y-auto hidden md:block">
          {/* Placeholder for Right Sidebar Content */}
          <div className="space-y-4">
            <div>
              <h2 className="text-xl font-semibold">Quick Tools</h2>
              <p className="text-sm text-muted-foreground">Contextual actions and info.</p>
            </div>
            {/* Example Content */}
            <div className="border rounded-lg p-3">
              <h3 className="font-medium">Active Character</h3>
              <p className="text-xs text-muted-foreground">Elara, Level 5 Wizard</p>
            </div>
            <div className="border rounded-lg p-3">
              <h3 className="font-medium">Next Session</h3>
              <p className="text-xs text-muted-foreground">Saturday, 7 PM - The Goblin Caves</p>
            </div>
             <div className="border rounded-lg p-3 h-64 bg-muted flex items-center justify-center">
                <p className="text-sm text-muted-foreground">More tools coming soon...</p>
            </div>
          </div>
        </aside>

      </div>
      <Toaster />
    </SidebarProvider>
  );
}
