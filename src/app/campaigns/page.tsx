
'use client';

import { useState, useEffect } from 'react';
import Image from 'next/image';
import { PageHeader } from '@/components/shared/page-header';
import { Button } from '@/components/ui/button';
import { Card, CardContent, CardDescription, CardFooter, CardHeader, CardTitle } from '@/components/ui/card';
import { PlusCircle, Edit3, Trash2 } from 'lucide-react';
import type { Campaign } from '@/lib/types';
import { CampaignForm } from '@/components/campaign-manager/campaign-form';
import {
  AlertDialog,
  AlertDialogAction,
  AlertDialogCancel,
  AlertDialogContent,
  AlertDialogDescription,
  AlertDialogFooter,
  AlertDialogHeader,
  AlertDialogTitle,
  AlertDialogTrigger,
} from "@/components/ui/alert-dialog";
import { Switch } from '@/components/ui/switch';
import { Label } from '@/components/ui/label';
import { useCampaignContext } from '@/contexts/campaign-context'; // Import the context hook

export default function CampaignsPage() {
  const { 
    campaigns, 
    activeCampaign, 
    setCampaignActive, 
    addCampaign, 
    updateCampaign, 
    deleteCampaign: deleteCampaignFromContext,
    isLoading 
  } = useCampaignContext();
  
  const [isFormOpen, setIsFormOpen] = useState(false);
  const [editingCampaign, setEditingCampaign] = useState<Campaign | null>(null);

  const handleCreateCampaign = () => {
    setEditingCampaign(null);
    setIsFormOpen(true);
  };

  const handleEditCampaign = (campaign: Campaign) => {
    setEditingCampaign(campaign);
    setIsFormOpen(true);
  };

  const handleDeleteCampaign = (campaignId: string) => {
    deleteCampaignFromContext(campaignId);
  };

  const handleSaveCampaign = (campaignData: Campaign) => { // campaignData from form doesn't have full ID if new
    if (editingCampaign) {
      updateCampaign({ ...campaignData, id: editingCampaign.id }); // Ensure ID is correct for update
    } else {
      // For new campaigns, addCampaign in context will assign ID and banner
      const { id, bannerImageUrl, ...dataToSave } = campaignData; // Exclude dummy id/banner from form
      addCampaign(dataToSave);
    }
    setIsFormOpen(false);
    setEditingCampaign(null);
  };

  const handleSetActiveSwitch = (campaignId: string) => {
    setCampaignActive(campaignId);
  };

  if (isLoading) {
    return (
      <PageHeader
        title="Campaign Manager"
      >
        <div className="text-center py-12">Loading campaigns...</div>
      </PageHeader>
    );
  }

  return (
    <>
      <PageHeader
        title="Campaign Manager"
        actions={
          <Button onClick={handleCreateCampaign}>
            <PlusCircle className="mr-2 h-4 w-4" /> New Campaign
          </Button>
        }
      />

      <CampaignForm
        isOpen={isFormOpen}
        onClose={() => {
          setIsFormOpen(false);
          setEditingCampaign(null);
        }}
        onSave={handleSaveCampaign}
        campaign={editingCampaign}
      />

      {campaigns.length === 0 ? (
        <Card className="text-center py-12">
          <CardHeader>
            <CardTitle>No Campaigns Yet</CardTitle>
            <CardDescription className="mb-4">Start your journey by creating your first campaign.</CardDescription>
          </CardHeader>
          <CardContent>
            <Button onClick={handleCreateCampaign} size="lg">
              <PlusCircle className="mr-2 h-5 w-5" /> Create Your First Campaign
            </Button>
          </CardContent>
        </Card>
      ) : (
        <div className="grid grid-cols-1 gap-6 md:grid-cols-2 lg:grid-cols-3">
          {campaigns.map((campaign) => (
            <Card key={campaign.id} className="group flex flex-col shadow-lg hover:shadow-xl transition-shadow duration-300 rounded-lg overflow-hidden relative">
              <div className="w-full aspect-[16/9] bg-muted">
                <Image 
                  src={campaign.bannerImageUrl || `https://picsum.photos/seed/${campaign.id}/400/225`} 
                  alt={campaign.name} 
                  width={400} 
                  height={225} 
                  className="w-full h-full object-cover"
                  data-ai-hint="fantasy landscape" 
                />
                 <div className="absolute top-3 right-3 p-1.5 bg-background/70 backdrop-blur-sm rounded-md shadow-lg opacity-0 group-hover:opacity-100 transition-opacity duration-200 flex gap-1.5 z-10">
                  <Button variant="outline" size="icon" className="h-8 w-8" onClick={() => handleEditCampaign(campaign)}>
                    <Edit3 className="h-4 w-4" />
                    <span className="sr-only">Edit Campaign</span>
                  </Button>
                  <AlertDialog>
                    <AlertDialogTrigger asChild>
                      <Button variant="destructive" size="icon" className="h-8 w-8">
                        <Trash2 className="h-4 w-4" />
                        <span className="sr-only">Delete Campaign</span>
                      </Button>
                    </AlertDialogTrigger>
                    <AlertDialogContent>
                      <AlertDialogHeader>
                        <AlertDialogTitle>Are you sure?</AlertDialogTitle>
                        <AlertDialogDescription>
                          This action cannot be undone. This will permanently delete the campaign "{campaign.name}".
                        </AlertDialogDescription>
                      </AlertDialogHeader>
                      <AlertDialogFooter>
                        <AlertDialogCancel>Cancel</AlertDialogCancel>
                        <AlertDialogAction onClick={() => handleDeleteCampaign(campaign.id)}>
                          Delete
                        </AlertDialogAction>
                      </AlertDialogFooter>
                    </AlertDialogContent>
                  </AlertDialog>
                </div>
              </div>

              <CardContent className="p-4 flex-grow space-y-2">
                <CardTitle className="text-xl">{campaign.name}</CardTitle>
                <CardDescription className="text-sm min-h-[auto]">{campaign.description}</CardDescription>
              </CardContent>

              <CardFooter className="flex items-center justify-between gap-2 p-3 border-t border-border bg-muted/50">
                 <Label htmlFor={`active-switch-${campaign.id}`} className="text-sm font-medium text-muted-foreground flex-grow">
                    Active Campaign
                  </Label>
                  <Switch
                    id={`active-switch-${campaign.id}`}
                    checked={campaign.id === activeCampaign?.id}
                    onCheckedChange={() => handleSetActiveSwitch(campaign.id)}
                    aria-label={`Set ${campaign.name} as active campaign`}
                  />
              </CardFooter>
            </Card>
          ))}
        </div>
      )}
    </>
  );
}
