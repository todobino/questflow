
'use client';

import type { Campaign, Character } from '@/lib/types'; // Added Character
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
  characters: Character[]; // Added characters state
  addCharacter: (characterData: Omit<Character, 'id' | 'campaignId'>) => void; // Added addCharacter
  updateCharacter: (character: Character) => void; // Added updateCharacter
  deleteCharacter: (characterId: string) => void; // Added deleteCharacter
}

const CampaignContext = createContext<CampaignContextType | undefined>(undefined);

const initialMockCampaigns: Campaign[] = [
  { id: '1', name: 'The Whispering Peaks', description: 'An adventure into the mysterious mountains where ancient secrets lie.', isActive: true, bannerImageUrl: `https://picsum.photos/seed/peakbanner/800/200` },
  { id: '2', name: 'Curse of the Sunken City', description: 'Explore the ruins of a city lost beneath the waves.', isActive: false, bannerImageUrl: `https://picsum.photos/seed/sunkenbanner/800/200` },
  { id: '3', name: 'Shadows over Riverwood', description: 'A darkness looms over a quaint village, and heroes must rise.', isActive: false, bannerImageUrl: `https://picsum.photos/seed/riverwoodbanner/800/200` },
];

// Mock characters, some linked to campaigns
const initialMockCharacters: Character[] = [
    { id: 'char1', campaignId: '1', name: 'Elara', race: 'Elf', class: 'Wizard', subclass: 'School of Evocation', background: 'Sage', level: 5, backstory: 'A curious elf seeking ancient lore.', imageUrl: `https://placehold.co/400x400.png` },
    { id: 'char2', campaignId: '1', name: 'Grom', race: 'Orc', class: 'Barbarian', subclass: 'Path of the Totem Warrior', background: 'Outlander', level: 5, backstory: 'A fierce warrior from the wilds.', imageUrl: `https://placehold.co/400x400.png`},
    { id: 'char3', campaignId: '2', name: 'Seraphina', race: 'Human', class: 'Cleric', subclass: 'Life Domain', background: 'Acolyte', level: 4, backstory: 'A devout healer on a holy mission.', imageUrl: `https://placehold.co/400x400.png`},
];


export const CampaignProvider = ({ children }: { children: ReactNode }) => {
  const [campaigns, setCampaignsState] = useState<Campaign[]>([]);
  const [activeCampaign, setActiveCampaignState] = useState<Campaign | null>(null);
  const [characters, setCharactersState] = useState<Character[]>([]); // Character state
  const [isLoading, setIsLoading] = useState(true);
  const { toast } = useToast();

  useEffect(() => {
    setCampaignsState(initialMockCampaigns);
    setCharactersState(initialMockCharacters); // Load mock characters
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
      id: String(Date.now()),
      bannerImageUrl: campaignData.bannerImageUrl || `https://picsum.photos/seed/${Date.now()}banner/800/200`,
    };
    setCampaignsState(prev => {
      let newCampaigns = [newCampaign, ...prev];
      if (newCampaign.isActive) {
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
      if (updatedCampaign.isActive) {
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

  // Character management functions
  const addCharacter = useCallback((characterData: Omit<Character, 'id' | 'campaignId'>) => {
    if (!activeCampaign) {
      toast({ title: "Error", description: "No active campaign selected.", variant: "destructive" });
      return;
    }
    const newCharacter: Character = {
      ...characterData,
      id: String(Date.now() + Math.random()), // Ensure unique ID
      campaignId: activeCampaign.id,
      level: characterData.level || 1, // Default level
    };
    setCharactersState(prev => [newCharacter, ...prev]);
    toast({ title: "Character Added", description: `${newCharacter.name} has joined the party.` });
  }, [activeCampaign, toast]);

  const updateCharacter = useCallback((updatedCharacter: Character) => {
    setCharactersState(prev => prev.map(c => c.id === updatedCharacter.id ? updatedCharacter : c));
    toast({ title: "Character Updated", description: `${updatedCharacter.name}'s details have been updated.` });
  }, [toast]);

  const deleteCharacter = useCallback((characterId: string) => {
    setCharactersState(prev => prev.filter(c => c.id !== characterId));
    toast({ title: "Character Removed", description: "The character has been removed.", variant: "destructive" });
  }, [toast]);


  if (isLoading) {
    return null; 
  }

  return (
    <CampaignContext.Provider value={{ 
      campaigns, activeCampaign, setCampaignActive, addCampaign, updateCampaign, deleteCampaign, isLoading,
      characters, addCharacter, updateCharacter, deleteCharacter // Expose character functions
    }}>
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
