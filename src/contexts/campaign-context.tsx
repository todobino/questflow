
'use client';

import type { Campaign, Character, Faction, FactionReputation, SessionLog } from '@/lib/types';
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
  factions: Faction[];
  factionReputations: FactionReputation[];
  sessionLogs: SessionLog[];
  currentSession: SessionLog | null;
  startNewSession: () => void;
  endCurrentSession: () => void;
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
      currentExp: 7200,
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
      currentExp: 8500,
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
      currentExp: 3000,
      nextLevelExp: 6500,
    },
];

const initialMockFactions: Faction[] = [
  { id: 'fac1', campaignId: '1', name: 'The Silver Hand', description: 'A noble order dedicated to protecting the innocent and upholding justice in the Whispering Peaks.' },
  { id: 'fac2', campaignId: '1', name: 'The Shadow Syndicate', description: 'A clandestine organization involved in smuggling, extortion, and other illicit activities.' },
  { id: 'fac3', campaignId: '2', name: 'The Deepguard Order', description: 'Ancient protectors of the sunken city, wary of outsiders and its forgotten secrets.' },
  { id: 'fac4', campaignId: '2', name: 'The Coral Reavers', description: 'Ruthless pirates who prey on ships and settlements along the coast near the Sunken City.' },
  { id: 'fac5', campaignId: '3', name: 'The Riverwood Guard', description: 'The local militia of Riverwood, generally helpful but stretched thin.' },
  { id: 'fac6', campaignId: '3', name: 'The Nightwood Cult', description: 'A secretive cult operating in the shadows of the Nightwood, with unsettling goals.' },
];

const initialMockFactionReputations: FactionReputation[] = [
  { factionId: 'fac1', campaignId: '1', score: 5 }, // Silver Hand - Friendly
  { factionId: 'fac2', campaignId: '1', score: -10 }, // Shadow Syndicate - Hostile
  { factionId: 'fac3', campaignId: '2', score: 0 },  // Deepguard Order - Neutral
  { factionId: 'fac4', campaignId: '2', score: -15 }, // Coral Reavers - Hated
  { factionId: 'fac5', campaignId: '3', score: 2 },   // Riverwood Guard - Neutral (leaning Friendly)
  { factionId: 'fac6', campaignId: '3', score: -5 },  // Nightwood Cult - Unfriendly
];

const initialMockSessionLogs: SessionLog[] = [
    { id: 'log1', campaignId: '1', sessionNumber: 1, startTime: new Date(Date.now() - 86400000 * 7).toISOString(), endTime: new Date(Date.now() - 86400000 * 7 + 3 * 3600000).toISOString(), status: 'completed' },
    { id: 'log2', campaignId: '1', sessionNumber: 2, startTime: new Date(Date.now() - 86400000 * 3).toISOString(), endTime: new Date(Date.now() - 86400000 * 3 + 4 * 3600000).toISOString(), status: 'completed' },
];


export const CampaignProvider = ({ children }: { children: ReactNode }) => {
  const [campaigns, setCampaignsState] = useState<Campaign[]>([]);
  const [activeCampaign, setActiveCampaignState] = useState<Campaign | null>(null);
  const [characters, setCharactersState] = useState<Character[]>([]);
  const [factions, setFactionsState] = useState<Faction[]>([]);
  const [factionReputations, setFactionReputationsState] = useState<FactionReputation[]>([]);
  const [sessionLogs, setSessionLogsState] = useState<SessionLog[]>([]);
  const [currentSession, setCurrentSessionState] = useState<SessionLog | null>(null);
  const [isLoading, setIsLoading] = useState(true);
  const { toast } = useToast();

  const [selectedCharacterForProfile, setSelectedCharacterForProfile] = useState<Character | null>(null);
  const [isProfileOpen, setIsProfileOpen] = useState(false);

  useEffect(() => {
    const storedCampaigns = localStorage.getItem('campaigns');
    const storedCharacters = localStorage.getItem('characters');
    const storedFactions = localStorage.getItem('factions');
    const storedFactionReputations = localStorage.getItem('factionReputations');
    const storedSessionLogs = localStorage.getItem('sessionLogs');

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

    if (storedFactions) {
      setFactionsState(JSON.parse(storedFactions));
    } else {
      setFactionsState(initialMockFactions);
    }

    if (storedFactionReputations) {
      setFactionReputationsState(JSON.parse(storedFactionReputations));
    } else {
      setFactionReputationsState(initialMockFactionReputations);
    }

    if (storedSessionLogs) {
      const parsedLogs = JSON.parse(storedSessionLogs) as SessionLog[];
      setSessionLogsState(parsedLogs);
      const activeLog = parsedLogs.find(log => log.status === 'active' && log.campaignId === (activeCampaign?.id || ''));
      setCurrentSessionState(activeLog || null);
    } else {
      setSessionLogsState(initialMockSessionLogs);
    }


    setIsLoading(false);
  }, []);

  useEffect(() => {
    if (!isLoading) {
      localStorage.setItem('campaigns', JSON.stringify(campaigns));
      const currentActive = campaigns.find(c => c.isActive) || campaigns[0] || null;
      setActiveCampaignState(currentActive);
      
      // When active campaign changes, find if there's an active session for it
      if (currentActive) {
          const activeLogForNewCampaign = sessionLogs.find(log => log.status === 'active' && log.campaignId === currentActive.id);
          setCurrentSessionState(activeLogForNewCampaign || null);
      } else {
          setCurrentSessionState(null); // No active campaign, no active session
      }

    }
  }, [campaigns, isLoading]); // Removed sessionLogs from dep array to avoid loop

   useEffect(() => {
    // This effect ensures that if activeCampaign changes, currentSession updates accordingly.
    if (!isLoading && activeCampaign) {
      const activeLogForCurrentCampaign = sessionLogs.find(log => log.status === 'active' && log.campaignId === activeCampaign.id);
      setCurrentSessionState(activeLogForCurrentCampaign || null);
    } else if (!isLoading && !activeCampaign) {
       setCurrentSessionState(null);
    }
  }, [activeCampaign, sessionLogs, isLoading]);


  useEffect(() => {
    if (!isLoading) {
      localStorage.setItem('characters', JSON.stringify(characters));
    }
  }, [characters, isLoading]);

  useEffect(() => {
    if (!isLoading) {
      localStorage.setItem('factions', JSON.stringify(factions));
    }
  }, [factions, isLoading]);

  useEffect(() => {
    if (!isLoading) {
      localStorage.setItem('factionReputations', JSON.stringify(factionReputations));
    }
  }, [factionReputations, isLoading]);

  useEffect(() => {
    if (!isLoading) {
      localStorage.setItem('sessionLogs', JSON.stringify(sessionLogs));
    }
  }, [sessionLogs, isLoading]);


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
  }, []);

  const updateCampaign = useCallback((updatedCampaign: Campaign) => {
    setCampaignsState(prev => {
      let newCampaigns = prev.map(c => c.id === updatedCampaign.id ? updatedCampaign : c);
      if (updatedCampaign.isActive) {
         newCampaigns = newCampaigns.map(c => c.id === updatedCampaign.id ? c : {...c, isActive: false});
      }
      return newCampaigns;
    });
  }, []);

  const deleteCampaign = useCallback((campaignId: string) => {
    setCampaignsState(prev => prev.filter(c => c.id !== campaignId));
    setCharactersState(prevChars => prevChars.filter(char => char.campaignId !== campaignId));
    setFactionsState(prevFactions => prevFactions.filter(f => f.campaignId !== campaignId));
    setFactionReputationsState(prevReps => prevReps.filter(r => r.campaignId !== campaignId));
    setSessionLogsState(prevLogs => prevLogs.filter(log => log.campaignId !== campaignId)); // Also clear session logs for deleted campaign
    toast({
      title: "Campaign Deleted",
      description: "The campaign and its associated data have been successfully deleted.",
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
      nextLevelExp: characterData.nextLevelExp || 1000,
      imageUrl: characterData.imageUrl || `https://placehold.co/400x400.png`,
    };
    setCharactersState(prev => [newCharacter, ...prev]);
  }, [activeCampaign, toast]);

  const updateCharacter = useCallback((updatedCharacter: Character) => {
    setCharactersState(prev => prev.map(c => c.id === updatedCharacter.id ? updatedCharacter : c));
  }, []);

  const deleteCharacter = useCallback((characterId: string) => {
    setCharactersState(prev => prev.filter(c => c.id !== characterId));
  }, []);

  const openProfileDialog = useCallback((character: Character) => {
    setSelectedCharacterForProfile(character);
    setIsProfileOpen(true);
  }, []);

  const closeProfileDialog = useCallback(() => {
    setSelectedCharacterForProfile(null);
    setIsProfileOpen(false);
  }, []);

  const startNewSession = useCallback(() => {
    if (!activeCampaign) {
      toast({ title: "Error", description: "No active campaign to start a session for.", variant: "destructive" });
      return;
    }
    if (currentSession && currentSession.campaignId === activeCampaign.id && currentSession.status === 'active') {
      toast({ title: "Info", description: "A session is already active for this campaign.", variant: "default" }); // Use default or a specific info variant
      return;
    }

    // End any other active session for potentially different campaign
    if (currentSession && currentSession.status === 'active') {
        setSessionLogsState(prevLogs =>
        prevLogs.map(log =>
            log.id === currentSession.id
            ? { ...log, endTime: new Date().toISOString(), status: 'completed' }
            : log
        )
        );
    }

    const campaignSessionLogs = sessionLogs.filter(log => log.campaignId === activeCampaign.id);
    const lastSessionNumber = campaignSessionLogs.reduce((max, log) => Math.max(max, log.sessionNumber), 0);

    const newSession: SessionLog = {
      id: String(Date.now()),
      campaignId: activeCampaign.id,
      sessionNumber: lastSessionNumber + 1,
      startTime: new Date().toISOString(),
      status: 'active',
    };
    setSessionLogsState(prevLogs => [newSession, ...prevLogs]);
    setCurrentSessionState(newSession);
  }, [activeCampaign, currentSession, sessionLogs, toast]);

  const endCurrentSession = useCallback(() => {
    if (!currentSession || currentSession.status !== 'active') {
      toast({ title: "Error", description: "No active session to end.", variant: "destructive" });
      return;
    }
    const endedSession = {
      ...currentSession,
      endTime: new Date().toISOString(),
      status: 'completed' as 'completed',
    };
    setSessionLogsState(prevLogs =>
      prevLogs.map(log => (log.id === currentSession.id ? endedSession : log))
    );
    setCurrentSessionState(null);
  }, [currentSession, toast]);


  if (isLoading && typeof window === 'undefined') {
    return null;
  }

  return (
    <CampaignContext.Provider value={{
      campaigns, activeCampaign, setCampaignActive, addCampaign, updateCampaign, deleteCampaign, isLoading,
      characters, addCharacter, updateCharacter, deleteCharacter,
      selectedCharacterForProfile, isProfileOpen, openProfileDialog, closeProfileDialog,
      factions, factionReputations,
      sessionLogs, currentSession, startNewSession, endCurrentSession
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
