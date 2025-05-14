
'use client';

import * as React from 'react';
import { Moon, Sun } from 'lucide-react';
import { useTheme } from 'next-themes';
import { Button } from '@/components/ui/button';
import { SidebarMenuButton, SidebarMenuItem } from '@/components/ui/sidebar';
import { Tooltip, TooltipContent, TooltipTrigger, TooltipProvider } from "@/components/ui/tooltip";


export function ThemeToggleButton() {
  const { theme, setTheme } = useTheme();
  const [mounted, setMounted] = React.useState(false);

  React.useEffect(() => {
    setMounted(true);
  }, []);

  if (!mounted) {
    // Or a skeleton loader
    return (
        <SidebarMenuItem>
            <SidebarMenuButton
                disabled
                tooltip="Loading theme..."
                className="text-sm"
            >
                <Sun className="h-4 w-4 rotate-0 scale-100 transition-all dark:-rotate-90 dark:scale-0" />
                <Moon className="absolute h-4 w-4 rotate-90 scale-0 transition-all dark:rotate-0 dark:scale-100" />
                <span>Toggle Theme</span>
            </SidebarMenuButton>
      </SidebarMenuItem>
    );
  }

  const toggleTheme = () => {
    setTheme(theme === 'light' ? 'dark' : 'light');
  };
  
  const currentThemeIcon = theme === 'light' ? <Sun /> : <Moon />;
  const currentThemeText = theme === 'light' ? 'Switch to Dark Mode' : 'Switch to Light Mode';


  return (
    <SidebarMenuItem>
        <TooltipProvider>
            <SidebarMenuButton
                onClick={toggleTheme}
                tooltip={currentThemeText}
                className="text-sm"
            >
                {theme === 'dark' ? 
                    <Sun className="h-[1.2rem] w-[1.2rem] rotate-0 scale-100 transition-all" /> : 
                    <Moon className="h-[1.2rem] w-[1.2rem] rotate-0 scale-100 transition-all" />
                }
                <span>{theme === 'light' ? "Dark Mode" : "Light Mode"}</span>
            </SidebarMenuButton>
        </TooltipProvider>
    </SidebarMenuItem>
  );
}
