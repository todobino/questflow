
'use client';

import {
  Sheet,
  SheetContent,
  SheetHeader,
  SheetTitle,
  SheetDescription,
  SheetFooter,
  SheetClose,
} from '@/components/ui/sheet';
import { Input } from '@/components/ui/input';
import { Button } from '@/components/ui/button';
import { ScrollArea } from '@/components/ui/scroll-area';
import { Search } from 'lucide-react';

interface SearchSheetProps {
  isOpen: boolean;
  onOpenChange: (isOpen: boolean) => void;
}

export function SearchSheet({ isOpen, onOpenChange }: SearchSheetProps) {
  return (
    <Sheet open={isOpen} onOpenChange={onOpenChange}>
      <SheetContent
        side="left"
        className="w-full p-0 sm:max-w-md md:max-w-lg lg:w-1/2 flex flex-col"
        onOpenAutoFocus={(e) => e.preventDefault()} // Prevent auto-focus on first element
      >
        <SheetHeader className="p-4 border-b">
          <SheetTitle className="flex items-center">
            <Search className="mr-2 h-5 w-5" />
            Search QuestFlow
          </SheetTitle>
          <SheetDescription>
            Find characters, campaigns, notes, and more.
          </SheetDescription>
        </SheetHeader>
        <div className="p-4 border-b">
          <Input
            type="search"
            placeholder="Search anything..."
            className="w-full"
          />
        </div>
        <ScrollArea className="flex-1">
          <div className="p-4">
            {/* Placeholder for search results */}
            <div className="text-center text-muted-foreground py-10">
              <p>Start typing to see results.</p>
              {/* 
              Example of how results might look:
              <ul className="space-y-2 mt-4">
                <li className="p-3 border rounded-md hover:bg-accent cursor-pointer">
                  <p className="font-semibold">Elara Meadowlight</p>
                  <p className="text-xs text-muted-foreground">Character - The Whispering Peaks</p>
                </li>
                <li className="p-3 border rounded-md hover:bg-accent cursor-pointer">
                  <p className="font-semibold">The Goblin Cave (Session Note)</p>
                  <p className="text-xs text-muted-foreground">Journal - The Whispering Peaks</p>
                </li>
              </ul>
              */}
            </div>
          </div>
        </ScrollArea>
        <SheetFooter className="p-4 border-t mt-auto">
          <SheetClose asChild>
            <Button variant="outline">Close</Button>
          </SheetClose>
        </SheetFooter>
      </SheetContent>
    </Sheet>
  );
}
