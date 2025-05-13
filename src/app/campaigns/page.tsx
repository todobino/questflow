'use client';

import { useState, useEffect } from 'react';
import { PageHeader } from '@/components/shared/page-header';
import { Button } from '@/components/ui/button';
import { Card, CardContent, CardDescription, CardFooter, CardHeader, CardTitle } from '@/components/ui/card';
import { PlusCircle, Edit3, Trash2, CheckCircle, Circle } from 'lucide-react';
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
import { useToast } from '@/hooks/use-toast';
import Image from 'next/image';

const initialCampaigns: Campaign[] = [
  { id: '1', name: 'The Whispering Peaks', description: 'An adventure into the mysterious mountains where ancient secrets lie.', isActive: true },
  { id: '2', name: 'Curse of the Sunken City', description: 'Explore the ruins of a city lost beneath the waves.', isActive: false },
  { id: '3', name: 'Shadows over Riverwood', description: 'A darkness looms over a quaint village, and heroes must rise.', isActive: false },
];

export default function CampaignsPage() {
  const [campaigns, setCampaigns] = useState<Campaign[]>([]);
  const [isFormOpen, setIsFormOpen] = useState(false);
  const [editingCampaign, setEditingCampaign] = useState<Campaign | null>(null);
  const { toast } = useToast();

  useEffect(() => {
    // Simulate fetching campaigns
    setCampaigns(initialCampaigns);
  }, []);

  const handleCreateCampaign = () => {
    setEditingCampaign(null);
    setIsFormOpen(true);
  };

  const handleEditCampaign = (campaign: Campaign) => {
    setEditingCampaign(campaign);
    setIsFormOpen(true);
  };

  const handleDeleteCampaign = (campaignId: string) => {
    // Simulate API call for deletion
    setCampaigns(prev => prev.filter(c => c.id !== campaignId));
    toast({
      title: "Campaign Deleted",
      description: "The campaign has been successfully deleted.",
      variant: "destructive",
    });
  };

  const handleSaveCampaign = (campaign: Campaign) => {
    if (editingCampaign) {
      // Simulate API call for update
      setCampaigns(prev => prev.map(c => c.id === campaign.id ? campaign : c));
      toast({
        title: "Campaign Updated",
        description: `${campaign.name} has been updated.`,
      });
    } else {
      // Simulate API call for creation
      const newCampaign = { ...campaign, id: String(Date.now()) }; // Simple ID generation
      setCampaigns(prev => [newCampaign, ...prev]);
      toast({
        title: "Campaign Created",
        description: `${campaign.name} has been created.`,
      });
    }
    setIsFormOpen(false);
    setEditingCampaign(null);
  };

  const handleSetActive = (campaignId: string) => {
    setCampaigns(prev => prev.map(c => ({ ...c, isActive: c.id === campaignId })));
     toast({
      title: "Active Campaign Set",
      description: "The active campaign has been updated.",
    });
  };

  return (
    <>
      <PageHeader
        title="Campaign Manager"
        description="Oversee all your adventures. Create new campaigns, edit existing ones, or set your active focus."
        actions={
          <Button onClick={handleCreateCampaign}>
            <PlusCircle className="mr-2 h-4 w-4" /> Create Campaign
          </Button>
        }
      />

      {campaigns.length === 0 ? (
        <Card className="text-center py-12">
          <CardHeader>
            <CardTitle>No Campaigns Yet</CardTitle>
            <CardDescription>Start your journey by creating your first campaign.</CardDescription>
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
            <Card key={campaign.id} className="flex flex-col shadow-lg hover:shadow-xl transition-shadow duration-300">
              <CardHeader>
                <div className="flex justify-between items-start">
                  <CardTitle className="text-xl">{campaign.name}</CardTitle>
                  <Button
                    variant={campaign.isActive ? "default" : "outline"}
                    size="sm"
                    onClick={() => handleSetActive(campaign.id)}
                    className={`transition-all ${campaign.isActive ? 'bg-success text-success-foreground hover:bg-success/90' : ''}`}
                  >
                    {campaign.isActive ? <CheckCircle className="mr-2 h-4 w-4" /> : <Circle className="mr-2 h-4 w-4" />}
                    {campaign.isActive ? 'Active' : 'Set Active'}
                  </Button>
                </div>
                <CardDescription className="h-20 overflow-y-auto text-sm">{campaign.description}</CardDescription>
              </CardHeader>
              <CardContent className="flex-grow">
                {/* Placeholder for campaign image or further details */}
                <div className="aspect-video bg-muted rounded-md flex items-center justify-center">
                   <Image src={`https://picsum.photos/seed/${campaign.id}/400/225`} alt={campaign.name} width={400} height={225} className="rounded-md object-cover" data-ai-hint="fantasy landscape" />
                </div>
              </CardContent>
              <CardFooter className="flex justify-end gap-2">
                <Button variant="outline" size="sm" onClick={() => handleEditCampaign(campaign)}>
                  <Edit3 className="mr-2 h-4 w-4" /> Edit
                </Button>
                <AlertDialog>
                  <AlertDialogTrigger asChild>
                    <Button variant="destructive" size="sm">
                      <Trash2 className="mr-2 h-4 w-4" /> Delete
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
              </CardFooter>
            </Card>
          ))}
        </div>
      )}

      <CampaignForm
        isOpen={isFormOpen}
        onClose={() => {
          setIsFormOpen(false);
          setEditingCampaign(null);
        }}
        onSave={handleSaveCampaign}
        campaign={editingCampaign}
      />
    </>
  );
}
