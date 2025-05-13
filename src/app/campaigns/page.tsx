
'use client';

import { useState, useEffect } from 'react';
import { PageHeader } from '@/components/shared/page-header';
import { Button } from '@/components/ui/button';
import { Card, CardContent, CardDescription, CardFooter, CardTitle } from '@/components/ui/card'; // Removed CardHeader
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
import { useToast } from '@/hooks/use-toast';
import Image from 'next/image';
import { Switch } from '@/components/ui/switch';
import { Label } from '@/components/ui/label';

const initialCampaigns: Campaign[] = [
  { id: '1', name: 'The Whispering Peaks', description: 'An adventure into the mysterious mountains where ancient secrets lie.', isActive: true, bannerImageUrl: `https://picsum.photos/seed/peakbanner/800/200` },
  { id: '2', name: 'Curse of the Sunken City', description: 'Explore the ruins of a city lost beneath the waves.', isActive: false, bannerImageUrl: `https://picsum.photos/seed/sunkenbanner/800/200` },
  { id: '3', name: 'Shadows over Riverwood', description: 'A darkness looms over a quaint village, and heroes must rise.', isActive: false, bannerImageUrl: `https://picsum.photos/seed/riverwoodbanner/800/200` },
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
      const newCampaign = { ...campaign, id: String(Date.now()), bannerImageUrl: campaign.bannerImageUrl || `https://picsum.photos/seed/${Date.now()}banner/800/200` }; // Simple ID generation
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
          <CardContent> {/* Using CardContent directly for simplicity */}
            <CardTitle className="mb-2">No Campaigns Yet</CardTitle>
            <CardDescription className="mb-4">Start your journey by creating your first campaign.</CardDescription>
            <Button onClick={handleCreateCampaign} size="lg">
              <PlusCircle className="mr-2 h-5 w-5" /> Create Your First Campaign
            </Button>
          </CardContent>
        </Card>
      ) : (
        <div className="grid grid-cols-1 gap-6 md:grid-cols-2 lg:grid-cols-3">
          {campaigns.map((campaign) => (
            <Card key={campaign.id} className="group flex flex-col shadow-lg hover:shadow-xl transition-shadow duration-300 rounded-lg overflow-hidden">
              <div className="w-full aspect-[16/9] bg-muted">
                <Image 
                  src={campaign.bannerImageUrl || `https://picsum.photos/seed/${campaign.id}/400/225`} 
                  alt={campaign.name} 
                  width={400} 
                  height={225} 
                  className="w-full h-full object-cover"
                  data-ai-hint="fantasy landscape" 
                />
              </div>

              <CardContent className="p-4 flex-grow space-y-3">
                <CardTitle className="text-xl">{campaign.name}</CardTitle>
                <CardDescription className="text-sm h-20 overflow-y-auto">{campaign.description}</CardDescription>
                
                <div className="flex items-center justify-between pt-2">
                  <Label htmlFor={`active-switch-${campaign.id}`} className="text-sm font-medium text-muted-foreground">
                    Set as Active Campaign
                  </Label>
                  <Switch
                    id={`active-switch-${campaign.id}`}
                    checked={campaign.isActive}
                    onCheckedChange={() => handleSetActive(campaign.id)}
                    aria-label={`Set ${campaign.name} as active campaign`}
                  />
                </div>
              </CardContent>

              <CardFooter className="flex justify-end gap-2 p-4 border-t border-transparent group-hover:border-border transition-colors duration-300">
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
    </>
  );
}
