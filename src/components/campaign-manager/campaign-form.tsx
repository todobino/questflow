'use client';

import { zodResolver } from '@hookform/resolvers/zod';
import { useForm } from 'react-hook-form';
import * as z from 'zod';
import type { Campaign } from '@/lib/types';
import { Button } from '@/components/ui/button';
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogFooter,
  DialogHeader,
  DialogTitle,
} from '@/components/ui/dialog';
import { Input } from '@/components/ui/input';
import { Textarea } from '@/components/ui/textarea';
import { Label } from '@/components/ui/label';
import { Switch } from '@/components/ui/switch';
import { useEffect } from 'react';
import {
  Form,
  FormControl,
  FormField,
  FormItem,
  FormLabel,
  FormMessage,
} from '@/components/ui/form';

const campaignSchema = z.object({
  name: z.string().min(1, 'Campaign name is required').max(100, 'Campaign name is too long'),
  description: z.string().min(1, 'Description is required').max(500, 'Description is too long'),
  isActive: z.boolean().default(false),
});

type CampaignFormData = z.infer<typeof campaignSchema>;

interface CampaignFormProps {
  isOpen: boolean;
  onClose: () => void;
  onSave: (campaign: Campaign) => void;
  campaign?: Campaign | null;
}

export function CampaignForm({ isOpen, onClose, onSave, campaign }: CampaignFormProps) {
  const form = useForm<CampaignFormData>({
    resolver: zodResolver(campaignSchema),
    defaultValues: {
      name: '',
      description: '',
      isActive: false,
    },
  });

  useEffect(() => {
    if (campaign) {
      form.reset({
        name: campaign.name,
        description: campaign.description,
        isActive: campaign.isActive,
      });
    } else {
      form.reset({
        name: '',
        description: '',
        isActive: false,
      });
    }
  }, [campaign, form, isOpen]);

  const onSubmit = (data: CampaignFormData) => {
    onSave({
      id: campaign?.id || '', // ID will be handled by parent for new campaigns
      ...data,
    });
    form.reset();
  };

  return (
    <Dialog open={isOpen} onOpenChange={onClose}>
      <DialogContent className="sm:max-w-[425px]">
        <DialogHeader>
          <DialogTitle>{campaign ? 'Edit Campaign' : 'Create New Campaign'}</DialogTitle>
          <DialogDescription>
            {campaign ? 'Update the details of your campaign.' : 'Fill in the details for your new campaign.'}
          </DialogDescription>
        </DialogHeader>
        <Form {...form}>
          <form onSubmit={form.handleSubmit(onSubmit)} className="space-y-4 py-4">
            <FormField
              control={form.control}
              name="name"
              render={({ field }) => (
                <FormItem>
                  <FormLabel>Campaign Name</FormLabel>
                  <FormControl>
                    <Input placeholder="e.g., The Dragon's Demise" {...field} />
                  </FormControl>
                  <FormMessage />
                </FormItem>
              )}
            />
            <FormField
              control={form.control}
              name="description"
              render={({ field }) => (
                <FormItem>
                  <FormLabel>Description</FormLabel>
                  <FormControl>
                    <Textarea
                      placeholder="A brief summary of the campaign's theme and plot."
                      className="resize-none"
                      rows={4}
                      {...field}
                    />
                  </FormControl>
                  <FormMessage />
                </FormItem>
              )}
            />
            <FormField
              control={form.control}
              name="isActive"
              render={({ field }) => (
                <FormItem className="flex flex-row items-center justify-between rounded-lg border p-3 shadow-sm">
                  <div className="space-y-0.5">
                    <FormLabel>Set as Active Campaign</FormLabel>
                    <p className="text-xs text-muted-foreground">
                      Only one campaign can be active at a time.
                    </p>
                  </div>
                  <FormControl>
                    <Switch
                      checked={field.value}
                      onCheckedChange={field.onChange}
                    />
                  </FormControl>
                </FormItem>
              )}
            />
            <DialogFooter>
              <Button type="button" variant="outline" onClick={onClose}>
                Cancel
              </Button>
              <Button type="submit">{campaign ? 'Save Changes' : 'Create Campaign'}</Button>
            </DialogFooter>
          </form>
        </Form>
      </DialogContent>
    </Dialog>
  );
}
