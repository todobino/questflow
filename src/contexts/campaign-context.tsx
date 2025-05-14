
'use client';

import type { Campaign } from '@/lib/types';
import { createContext, useContext, useState, useEffect, useCallback, type ReactNode } from 'react';
import { useToast } from '@/hooks/use-toast';

interface CampaignContextType {
  campaigns: Campaign[];
  activeCampaign: Campaign | null;
  setCampaignActive: (campaignId: string) => void;
  addCampaign: (campaign: Omit<Campaign, 'id' | 'bannerImageUrl'> & { bannerImageUrl?: string }) => void;
  updateCampaign: (campaign: Campaign) => void;
  deleteCampaign: (campaignId: string) => void;
  isLoading: boolean;
}

const CampaignContext = createContext<CampaignContextType | undefined>(undefined);

// Moved initial data here to be the single source for the context
const initialMockCampaigns: Campaign[] = [
  { id: '1', name: 'The Whispering Peaks', description: 'An adventure into the mysterious mountains where ancient secrets lie.', isActive: true, bannerImageUrl: `https://picsum.photos/seed/peakbanner/800/200` },
  { id: '2', name: 'Curse of the Sunken City', description: 'Explore the ruins of a city lost beneath the waves.', isActive: false, bannerImageUrl: `https://picsum.photos/seed/sunkenbanner/800/200` },
  { id: '3', name: 'Shadows over Riverwood', description: 'A darkness looms over a quaint village, and heroes must rise.', isActive: false, bannerImageUrl: `https://picsum.photos/seed/riverwoodbanner/800/200` },
];

export const CampaignProvider = ({ children }: { children: ReactNode }) => {
  const [campaigns, setCampaignsState] = useState<Campaign[]>([]);
  const [activeCampaign, setActiveCampaignState] = useState<Campaign | null>(null);
  const [isLoading, setIsLoading] = useState(true); // For initial load simulation
  const { toast } = useToast();

  useEffect(() => {
    // Simulate fetching campaigns
    // In a real app, this would be an API call or local storage retrieval
    setCampaignsState(initialMockCampaigns);
    setIsLoading(false);
  }, []);

  useEffect(() => {
    if (!isLoading) {
      const currentActive = campaigns.find(c => c.isActive) || campaigns[0] || null;
      setActiveCampaignState(currentActive);
    }
  }, [campaigns, isLoading]);

  const setCampaignActive = useCallback((campaignId: string) => {
    const selectedCampaign = campaigns.find(c => c.id === campaignId);
    if (selectedCampaign) {
      setCampaignsState(prevCampaigns =>
        prevCampaigns.map(c => ({ ...c, isActive: c.id === campaignId }))
      );
      toast({
        title: "Active Campaign Set",
        description: `"${selectedCampaign.name}" is now the active campaign.`,
      });
    }
  }, [campaigns, toast]);

  const addCampaign = useCallback((campaignData: Omit<Campaign, 'id' | 'bannerImageUrl'> & { bannerImageUrl?: string }) => {
    const newCampaign: Campaign = {
      ...campaignData,
      id: String(Date.now()), // Simple ID generation
      bannerImageUrl: campaignData.bannerImageUrl || `https://picsum.photos/seed/${Date.now()}banner/800/200`,
    };
    setCampaignsState(prev => {
      let newCampaigns = [newCampaign, ...prev];
      if (newCampaign.isActive) { // If new campaign is set active, deactivate others
        newCampaigns = newCampaigns.map(c => c.id === newCampaign.id ? c : {...c, isActive: false});
      }
      return newCampaigns;
    });
     toast({
      title: "Campaign Created",
      description: `${newCampaign.name} has been created.`,
    });
  }, [toast]);

  const updateCampaign = useCallback((updatedCampaign: Campaign) => {
    setCampaignsState(prev => {
      let newCampaigns = prev.map(c => c.id === updatedCampaign.id ? updatedCampaign : c);
      if (updatedCampaign.isActive) { // If updated campaign is set active, deactivate others
         newCampaigns = newCampaigns.map(c => c.id === updatedCampaign.id ? c : {...c, isActive: false});
      }
      return newCampaigns;
    });
    toast({
      title: "Campaign Updated",
      description: `${updatedCampaign.name} has been updated.`,
    });
  }, [toast]);

  const deleteCampaign = useCallback((campaignId: string) => {
    setCampaignsState(prev => prev.filter(c => c.id !== campaignId));
    toast({
      title: "Campaign Deleted",
      description: "The campaign has been successfully deleted.",
      variant: "destructive",
    });
  }, [toast]);

  if (isLoading) {
    // Optional: Render a loader or null to prevent hydration issues with context values during initial load
    return null; 
  }

  return (
    <CampaignContext.Provider value={{ campaigns, activeCampaign, setCampaignActive, addCampaign, updateCampaign, deleteCampaign, isLoading }}>
      {children}
    </CampaignContext.Provider>
  );
};

export const useCampaignContext = () => {
  const context = useContext(CampaignContext);
  if (context === undefined) {
    throw new Error('useCampaignContext must be used within a CampaignProvider');
  }
  return context;
};
