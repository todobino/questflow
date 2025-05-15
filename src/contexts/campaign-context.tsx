
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
  pauseCurrentSession: () => void;
  resumeSession: () => void;
  requestSwitchCampaign: (targetCampaignId: string) => void;
  confirmSwitchCampaign: () => void;
  cancelSwitchCampaign: () => void;
  isSwitchCampaignDialogVisible: boolean;
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
      imageUrl: `https://images.unsplash.com/photo-1529626455594-4ff0802cfb7e?crop=entropy&cs=tinysrgb&fit=max&fm=jpg&ixid=M3w3NDE5ODJ8MHwxfHNlYXJjaHwxMHx8RWxmJTIwV2l6YXJkJTIwcG9ydHJhaXR8ZW58MHx8fHwxNzQ3MzQzOTg3fDA&ixlib=rb-4.1.0&q=80&w=1080`,
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
      imageUrl: `https://images.unsplash.com/photo-1534528741775-53994a69daeb?crop=entropy&cs=tinysrgb&fit=max&fm=jpg&ixid=M3w3NDE5ODJ8MHwxfHNlYXJjaHwzfHxPcmMlMjBCYXJiYXJpYW4lMjBwb3J0cmFpdHxlbnwwfHx8fDE3NDczNDM5ODd8MA&ixlib=rb-4.1.0&q=80&w=1080`,
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

  // State for campaign switch confirmation
  const [isSwitchCampaignDialogVisible, setIsSwitchCampaignDialogVisible] = useState(false);
  const [targetCampaignIdToSwitch, setTargetCampaignIdToSwitch] = useState<string | null>(null);

  useEffect(() => {
    const storedCampaigns = localStorage.getItem('campaigns');
    const storedCharacters = localStorage.getItem('characters');
    const storedFactions = localStorage.getItem('factions');
    const storedFactionReputations = localStorage.getItem('factionReputations');
    const storedSessionLogs = localStorage.getItem('sessionLogs');

    let initialActiveCampaignId: string | null = null;

    if (storedCampaigns) {
      const parsedCampaigns: Campaign[] = JSON.parse(storedCampaigns);
      setCampaignsState(parsedCampaigns);
      initialActiveCampaignId = parsedCampaigns.find(c => c.isActive)?.id || parsedCampaigns[0]?.id || null;
    } else {
      setCampaignsState(initialMockCampaigns);
      initialActiveCampaignId = initialMockCampaigns.find(c => c.isActive)?.id || initialMockCampaigns[0]?.id || null;
    }
    
    if (initialActiveCampaignId) {
        setActiveCampaignState(campaigns.find(c => c.id === initialActiveCampaignId) || null);
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
      if (initialActiveCampaignId) {
        const activeOrPausedLog = parsedLogs
          .filter(log => log.campaignId === initialActiveCampaignId && (log.status === 'active' || log.status === 'paused'))
          .sort((a,b) => new Date(b.startTime).getTime() - new Date(a.startTime).getTime()) // latest first
          .sort((a,b) => (a.status === 'active' ? -1 : 1) - (b.status === 'active' ? -1 : 1)); // 'active' before 'paused'
        setCurrentSessionState(activeOrPausedLog[0] || null);
      }
    } else {
      setSessionLogsState(initialMockSessionLogs);
    }

    setIsLoading(false);
  // eslint-disable-next-line react-hooks/exhaustive-deps
  }, []); // Ran once on mount


  useEffect(() => {
    if (!isLoading) {
      localStorage.setItem('campaigns', JSON.stringify(campaigns));
      // Active campaign is set by setCampaignActive or initial load
    }
  }, [campaigns, isLoading]);

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
      setActiveCampaignState(selectedCampaign);

      // Find latest active or paused session for the new campaign
      const relevantLogs = sessionLogs
        .filter(log => log.campaignId === campaignId && (log.status === 'active' || log.status === 'paused'))
        .sort((a,b) => new Date(b.startTime).getTime() - new Date(a.startTime).getTime()) // latest first
        .sort((a,b) => (a.status === 'active' ? -1 : 1) - (b.status === 'active' ? -1 : 1)); // 'active' before 'paused'
      setCurrentSessionState(relevantLogs[0] || null);
    }
  }, [campaigns, sessionLogs]);

  const requestSwitchCampaign = useCallback((targetId: string) => {
    if (currentSession && currentSession.status === 'active' && currentSession.campaignId === activeCampaign?.id) {
      setTargetCampaignIdToSwitch(targetId);
      setIsSwitchCampaignDialogVisible(true);
    } else {
      setCampaignActive(targetId);
    }
  }, [currentSession, activeCampaign, setCampaignActive]);

  const confirmSwitchCampaign = useCallback(() => {
    if (targetCampaignIdToSwitch) {
      setCampaignActive(targetCampaignIdToSwitch);
    }
    setIsSwitchCampaignDialogVisible(false);
    setTargetCampaignIdToSwitch(null);
  }, [targetCampaignIdToSwitch, setCampaignActive]);

  const cancelSwitchCampaign = useCallback(() => {
    setIsSwitchCampaignDialogVisible(false);
    setTargetCampaignIdToSwitch(null);
  }, []);


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
        setActiveCampaignState(newCampaign); // Also set as active
      }
      return newCampaigns;
    });
  }, []);

  const updateCampaign = useCallback((updatedCampaign: Campaign) => {
    setCampaignsState(prev => {
      let newCampaigns = prev.map(c => c.id === updatedCampaign.id ? updatedCampaign : c);
      if (updatedCampaign.isActive) {
         newCampaigns = newCampaigns.map(c => c.id === updatedCampaign.id ? c : {...c, isActive: false});
         setActiveCampaignState(updatedCampaign); // Update active campaign state
      } else if (activeCampaign?.id === updatedCampaign.id && !updatedCampaign.isActive) {
          // If the currently active campaign is being deactivated, find a new one or set to null
          const nextActive = newCampaigns.find(c => c.isActive) || newCampaigns[0] || null;
          setActiveCampaignState(nextActive);
          if(nextActive) { // Ensure isActive flag is consistent
             newCampaigns = newCampaigns.map(c => ({...c, isActive: c.id === nextActive.id}));
          }
      }
      return newCampaigns;
    });
  }, [activeCampaign]);

  const deleteCampaign = useCallback((campaignId: string) => {
    setCampaignsState(prev => prev.filter(c => c.id !== campaignId));
    setCharactersState(prevChars => prevChars.filter(char => char.campaignId !== campaignId));
    setFactionsState(prevFactions => prevFactions.filter(f => f.campaignId !== campaignId));
    setFactionReputationsState(prevReps => prevReps.filter(r => r.campaignId !== campaignId));
    setSessionLogsState(prevLogs => prevLogs.filter(log => log.campaignId !== campaignId));
    if (activeCampaign?.id === campaignId) {
        const remainingCampaigns = campaigns.filter(c => c.id !== campaignId);
        const newActive = remainingCampaigns.find(c=>c.isActive) || remainingCampaigns[0] || null;
        setActiveCampaignState(newActive);
        if(newActive) {
             setCampaignsState(prev => prev.map(c => ({...c, isActive: c.id === newActive.id})));
        }
    }
  }, [activeCampaign, campaigns]);

  const addCharacter = useCallback((characterData: Omit<Character, 'id' | 'campaignId'>) => {
    if (!activeCampaign) {
      toast({ title: "Error", description: "No active campaign to save character to.", variant: "destructive" });
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
      toast({ title: "No Campaign Active", description: "Please select an active campaign.", variant: "destructive" });
      return;
    }
    // Check for existing active or paused session for THIS campaign
    const existingSessionForCampaign = sessionLogs.find(log => log.campaignId === activeCampaign.id && (log.status === 'active' || log.status === 'paused'));
    if (existingSessionForCampaign) {
        if (existingSessionForCampaign.status === 'active') {
            toast({ title: "Session Already Active", description: "A session is already running for this campaign.", variant: "destructive" });
            return;
        }
        // If paused, the resume button should be used. Starting a new one here might be an option with further prompting,
        // for now, prevent starting a new one if one is paused.
        toast({ title: "Paused Session Exists", description: "Please resume or end the paused session for this campaign.", variant: "destructive" });
        return;
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
  }, [activeCampaign, sessionLogs, toast, currentSession]);

  const endCurrentSession = useCallback(() => {
    if (!currentSession || currentSession.status !== 'active') {
      toast({ title: "No Active Session", description: "There is no active session to end.", variant: "destructive" });
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

  const pauseCurrentSession = useCallback(() => {
    if (!currentSession || currentSession.status !== 'active') {
        toast({ title: "No Active Session", description: "No active session to pause.", variant: "destructive" });
        return;
    }
    const pausedSession: SessionLog = {
        ...currentSession,
        status: 'paused',
        pausedTime: new Date().toISOString(),
    };
    setSessionLogsState(prevLogs => 
        prevLogs.map(log => log.id === currentSession.id ? pausedSession : log)
    );
    setCurrentSessionState(pausedSession); // Keep currentSession pointing to it, but status is 'paused'
  }, [currentSession, toast]);

  const resumeSession = useCallback(() => {
    if (!currentSession || currentSession.status !== 'paused') {
        toast({ title: "No Paused Session", description: "No session is currently paused for this campaign.", variant: "destructive" });
        return;
    }
    const resumedSession: SessionLog = {
        ...currentSession,
        status: 'active',
        pausedTime: undefined, // Clear pausedTime
    };
    setSessionLogsState(prevLogs => 
        prevLogs.map(log => log.id === currentSession.id ? resumedSession : log)
    );
    setCurrentSessionState(resumedSession);
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
      sessionLogs, currentSession, startNewSession, endCurrentSession, pauseCurrentSession, resumeSession,
      requestSwitchCampaign, confirmSwitchCampaign, cancelSwitchCampaign, isSwitchCampaignDialogVisible
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

