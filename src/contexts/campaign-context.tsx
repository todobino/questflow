
'use client';

import type { Campaign, Character } from '@/lib/types';
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
  characters: Character[];
  addCharacter: (characterData: Omit<Character, 'id' | 'campaignId'>) => void;
  updateCharacter: (character: Character) => void;
  deleteCharacter: (characterId: string) => void;
  selectedCharacterForProfile: Character | null;
  isProfileOpen: boolean;
  openProfileDialog: (character: Character) => void;
  closeProfileDialog: () => void;
}

const CampaignContext = createContext<CampaignContextType | undefined>(undefined);

const initialMockCampaigns: Campaign[] = [
  { id: '1', name: 'The Whispering Peaks', description: 'An adventure into the mysterious mountains where ancient secrets lie.', isActive: true, bannerImageUrl: `https://picsum.photos/seed/peakbanner/800/200` },
  { id: '2', name: 'Curse of the Sunken City', description: 'Explore the ruins of a city lost beneath the waves.', isActive: false, bannerImageUrl: `https://picsum.photos/seed/sunkenbanner/800/200` },
  { id: '3', name: 'Shadows over Riverwood', description: 'A darkness looms over a quaint village, and heroes must rise.', isActive: false, bannerImageUrl: `https://picsum.photos/seed/riverwoodbanner/800/200` },
];

const initialMockCharacters: Character[] = [
    {
      id: 'char1',
      campaignId: '1',
      name: 'Elara Meadowlight',
      race: 'Elf',
      class: 'Wizard',
      subclass: 'School of Evocation',
      background: 'Sage',
      level: 5,
      backstory: 'A curious elf seeking ancient lore. She has a keen mind and a quicker wit, often finding herself in trouble due to her insatiable thirst for knowledge.',
      imageUrl: `https://placehold.co/400x400.png`,
      currentHp: 28,
      maxHp: 28,
      armorClass: 12,
      initiativeModifier: 2,
      currentExp: 7200, // EXP towards level 6 (level 5 starts at 6500, level 6 at 14000)
      nextLevelExp: 14000,
    },
    {
      id: 'char2',
      campaignId: '1',
      name: 'Grom Stonefist',
      race: 'Orc',
      class: 'Barbarian',
      subclass: 'Path of the Totem Warrior',
      background: 'Outlander',
      level: 5,
      backstory: 'A fierce warrior from the wilds, driven by a primal connection to nature and a desire to protect his kin.',
      imageUrl: `https://placehold.co/400x400.png`,
      currentHp: 52,
      maxHp: 52,
      armorClass: 15,
      initiativeModifier: 1,
      currentExp: 8500, // EXP towards level 6
      nextLevelExp: 14000,
    },
    {
      id: 'char3',
      campaignId: '2',
      name: 'Seraphina Moonwhisper',
      race: 'Human',
      class: 'Cleric',
      subclass: 'Life Domain',
      background: 'Acolyte',
      level: 4,
      backstory: 'A devout healer on a holy mission to bring light to the darkest corners of the world.',
      imageUrl: `https://placehold.co/400x400.png`,
      currentHp: 30,
      maxHp: 30,
      armorClass: 16,
      initiativeModifier: 0,
      currentExp: 3000, // EXP towards level 5 (level 4 starts at 2700, level 5 at 6500)
      nextLevelExp: 6500,
    },
];


export const CampaignProvider = ({ children }: { children: ReactNode }) => {
  const [campaigns, setCampaignsState] = useState<Campaign[]>([]);
  const [activeCampaign, setActiveCampaignState] = useState<Campaign | null>(null);
  const [characters, setCharactersState] = useState<Character[]>([]);
  const [isLoading, setIsLoading] = useState(true);
  const { toast } = useToast();

  const [selectedCharacterForProfile, setSelectedCharacterForProfile] = useState<Character | null>(null);
  const [isProfileOpen, setIsProfileOpen] = useState(false);

  useEffect(() => {
    const storedCampaigns = localStorage.getItem('campaigns');
    const storedCharacters = localStorage.getItem('characters');

    if (storedCampaigns) {
      setCampaignsState(JSON.parse(storedCampaigns));
    } else {
      setCampaignsState(initialMockCampaigns);
    }

    if (storedCharacters) {
      setCharactersState(JSON.parse(storedCharacters));
    } else {
      setCharactersState(initialMockCharacters);
    }
    setIsLoading(false);
  }, []);

  useEffect(() => {
    if (!isLoading) {
      localStorage.setItem('campaigns', JSON.stringify(campaigns));
      const currentActive = campaigns.find(c => c.isActive) || campaigns[0] || null;
      setActiveCampaignState(currentActive);
    }
  }, [campaigns, isLoading]);

  useEffect(() => {
    if (!isLoading) {
      localStorage.setItem('characters', JSON.stringify(characters));
    }
  }, [characters, isLoading]);

  const setCampaignActive = useCallback((campaignId: string) => {
    const selectedCampaign = campaigns.find(c => c.id === campaignId);
    if (selectedCampaign) {
      setCampaignsState(prevCampaigns =>
        prevCampaigns.map(c => ({ ...c, isActive: c.id === campaignId }))
      );
    }
  }, [campaigns]);

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
    // Removed informational toast
  }, []);

  const updateCampaign = useCallback((updatedCampaign: Campaign) => {
    setCampaignsState(prev => {
      let newCampaigns = prev.map(c => c.id === updatedCampaign.id ? updatedCampaign : c);
      if (updatedCampaign.isActive) {
         newCampaigns = newCampaigns.map(c => c.id === updatedCampaign.id ? c : {...c, isActive: false});
      }
      return newCampaigns;
    });
    // Removed informational toast
  }, []);

  const deleteCampaign = useCallback((campaignId: string) => {
    setCampaignsState(prev => prev.filter(c => c.id !== campaignId));
    setCharactersState(prevChars => prevChars.filter(char => char.campaignId !== campaignId));
    toast({
      title: "Campaign Deleted",
      description: "The campaign and its characters have been successfully deleted.",
      variant: "destructive",
    });
  }, [toast]);

  const addCharacter = useCallback((characterData: Omit<Character, 'id' | 'campaignId'>) => {
    if (!activeCampaign) {
      toast({ title: "Error", description: "No active campaign selected.", variant: "destructive" });
      return;
    }
    const newCharacter: Character = {
      ...characterData,
      id: String(Date.now() + Math.random()),
      campaignId: activeCampaign.id,
      level: characterData.level || 1,
      currentHp: characterData.currentHp !== undefined ? characterData.currentHp : (characterData.maxHp || 10),
      maxHp: characterData.maxHp || 10,
      armorClass: characterData.armorClass || 10,
      initiativeModifier: characterData.initiativeModifier || 0,
      currentExp: characterData.currentExp || 0,
      nextLevelExp: characterData.nextLevelExp || 1000, // Default to 1000 for next level
      imageUrl: characterData.imageUrl || `https://placehold.co/400x400.png`,
    };
    setCharactersState(prev => [newCharacter, ...prev]);
    // Removed informational toast
  }, [activeCampaign, toast]);

  const updateCharacter = useCallback((updatedCharacter: Character) => {
    setCharactersState(prev => prev.map(c => c.id === updatedCharacter.id ? updatedCharacter : c));
    // Removed informational toast
  }, []);

  const deleteCharacter = useCallback((characterId: string) => {
    setCharactersState(prev => prev.filter(c => c.id !== characterId));
    toast({ title: "Character Removed", description: "The character has been removed.", variant: "destructive" });
  }, [toast]);

  const openProfileDialog = useCallback((character: Character) => {
    setSelectedCharacterForProfile(character);
    setIsProfileOpen(true);
  }, []);

  const closeProfileDialog = useCallback(() => {
    setSelectedCharacterForProfile(null);
    setIsProfileOpen(false);
  }, []);

  if (isLoading && typeof window === 'undefined') {
    return null;
  }

  return (
    <CampaignContext.Provider value={{
      campaigns, activeCampaign, setCampaignActive, addCampaign, updateCampaign, deleteCampaign, isLoading,
      characters, addCharacter, updateCharacter, deleteCharacter,
      selectedCharacterForProfile, isProfileOpen, openProfileDialog, closeProfileDialog
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

