
'use client';

import {
  AlertDialog,
  AlertDialogAction,
  AlertDialogCancel,
  AlertDialogContent,
  AlertDialogDescription,
  AlertDialogFooter,
  AlertDialogHeader,
  AlertDialogTitle,
} from "@/components/ui/alert-dialog";
import { Button } from "@/components/ui/button";

interface SwitchCampaignDialogProps {
  isOpen: boolean;
  onClose: () => void;
  onPauseAndSwitch: () => void;
  onEndAndSwitch: () => void;
}

export function SwitchCampaignDialog({ 
  isOpen, 
  onClose, 
  onPauseAndSwitch, 
  onEndAndSwitch 
}: SwitchCampaignDialogProps) {
  if (!isOpen) return null;

  return (
    <AlertDialog open={isOpen} onOpenChange={onClose}>
      <AlertDialogContent>
        <AlertDialogHeader>
          <AlertDialogTitle>Active Session Warning</AlertDialogTitle>
          <AlertDialogDescription>
            A session is currently active. To switch campaigns, you need to either pause or end the current session.
          </AlertDialogDescription>
        </AlertDialogHeader>
        <AlertDialogFooter className="gap-2 sm:gap-0">
          <AlertDialogCancel onClick={onClose}>Cancel Switch</AlertDialogCancel>
          <Button variant="outline" onClick={onPauseAndSwitch}>
            Pause Session & Switch
          </Button>
          <AlertDialogAction onClick={onEndAndSwitch}>
            End Session & Switch
          </AlertDialogAction>
        </AlertDialogFooter>
      </AlertDialogContent>
    </AlertDialog>
  );
}
