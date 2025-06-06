
'use client';

import type { Campaign, Character, Faction, FactionReputation, SessionLog } from '@/lib/types';
import { createContext, useContext, useState, useEffect, useCallback, type ReactNode } from 'react';

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
  updateCharacterCurrentHp: (characterId: string, newCurrentHp: number) => void; // New function
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
  editingCharacterForForm: Character | null;
  isCharacterFormOpen: boolean;
  openCharacterForm: (characterToEdit?: Character) => void;
  closeCharacterForm: () => void;
  isCombatActive: boolean;
  setIsCombatActive: (isActive: boolean) => void;
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
      abilities: { strength: 8, dexterity: 14, constitution: 12, intelligence: 17, wisdom: 10, charisma: 13 },
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
      abilities: { strength: 18, dexterity: 12, constitution: 16, intelligence: 8, wisdom: 10, charisma: 9 },
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
      abilities: { strength: 10, dexterity: 10, constitution: 14, intelligence: 12, wisdom: 16, charisma: 13 },
    },
     {
      id: 'char4',
      campaignId: '3',
      name: 'Roric Ironhew',
      race: 'Dwarf',
      class: 'Fighter',
      subclass: 'Battle Master',
      background: 'Soldier',
      level: 3,
      backstory: 'A stern dwarf warrior, veteran of many battles, seeking a worthy cause.',
      imageUrl: `https://placehold.co/400x400.png`,
      currentHp: 25,
      maxHp: 25,
      armorClass: 18,
      initiativeModifier: 1,
      currentExp: 1000,
      nextLevelExp: 2700,
      abilities: { strength: 16, dexterity: 10, constitution: 15, intelligence: 9, wisdom: 12, charisma: 8 },
    }
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
  { factionId: 'fac1', campaignId: '1', score: 5 }, 
  { factionId: 'fac2', campaignId: '1', score: -10 }, 
  { factionId: 'fac3', campaignId: '2', score: 0 },  
  { factionId: 'fac4', campaignId: '2', score: -15 }, 
  { factionId: 'fac5', campaignId: '3', score: 2 },  
  { factionId: 'fac6', campaignId: '3', score: -5 },  
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

  const [selectedCharacterForProfile, setSelectedCharacterForProfile] = useState<Character | null>(null);
  const [isProfileOpen, setIsProfileOpen] = useState(false);

  const [editingCharacterForForm, setEditingCharacterForForm] = useState<Character | null>(null);
  const [isCharacterFormOpen, setIsCharacterFormOpen] = useState(false);

  const [isSwitchCampaignDialogVisible, setIsSwitchCampaignDialogVisible] = useState(false);
  const [targetCampaignIdToSwitch, setTargetCampaignIdToSwitch] = useState<string | null>(null);

  const [isCombatActive, setIsCombatActive] = useState(false);

  useEffect(() => {
    const loadItem = <T,>(key: string, fallback: T[]): T[] => {
      try {
        const stored = localStorage.getItem(key);
        if (stored) {
          const parsed = JSON.parse(stored);
          if (Array.isArray(parsed)) return parsed;
        }
      } catch (e) {
        console.warn(`Failed to parse ${key} from localStorage, using mock data.`, e);
      }
      localStorage.setItem(key, JSON.stringify(fallback)); // Save fallback if nothing was loaded
      return fallback;
    };

    const loadedCampaigns = loadItem('campaigns', initialMockCampaigns);
    setCampaignsState(loadedCampaigns);
    
    let active = loadedCampaigns.find(c => c.isActive);
    if (!active && loadedCampaigns.length > 0) {
        active = { ...loadedCampaigns[0], isActive: true };
        setCampaignsState(prev => prev.map(c => (c.id === active!.id ? active! : { ...c, isActive: false })));
    }
    setActiveCampaignState(active || null);
    
    setCharactersState(loadItem('characters', initialMockCharacters));
    setFactionsState(loadItem('factions', initialMockFactions));
    setFactionReputationsState(loadItem('factionReputations', initialMockFactionReputations));
    setSessionLogsState(loadItem('sessionLogs', initialMockSessionLogs));

    setIsLoading(false);
  }, []);


  useEffect(() => {
    if (!isLoading) {
      localStorage.setItem('campaigns', JSON.stringify(campaigns));
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

  useEffect(() => {
    if (activeCampaign) { 
      const activeOrPausedLogs = sessionLogs
        .filter(log => log.campaignId === activeCampaign.id && (log.status === 'active' || log.status === 'paused'))
        .sort((a,b) => new Date(b.startTime).getTime() - new Date(a.startTime).getTime());
      
      const runningSession = activeOrPausedLogs.find(log => log.status === 'active') || activeOrPausedLogs.find(log => log.status === 'paused');
      setCurrentSessionState(runningSession || null);
    } else {
      setCurrentSessionState(null); 
    }
  }, [activeCampaign, sessionLogs]);


  const setCampaignActive = useCallback((campaignId: string) => {
    const campaignToActivate = campaigns.find(c => c.id === campaignId);
    if (campaignToActivate) {
      setCampaignsState(prevCampaigns =>
        prevCampaigns.map(c => ({ ...c, isActive: c.id === campaignId }))
      );
      setActiveCampaignState({...campaignToActivate, isActive: true});
    }
  }, [campaigns]);

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
      let newCampaignsList = [newCampaign, ...prev];
      if (newCampaign.isActive) {
        newCampaignsList = newCampaignsList.map(c => c.id === newCampaign.id ? c : {...c, isActive: false});
        setActiveCampaignState(newCampaign); 
      } else if (newCampaignsList.length === 1) { 
        const firstActiveCampaign = { ...newCampaign, isActive: true };
        newCampaignsList = [firstActiveCampaign];
        setActiveCampaignState(firstActiveCampaign);
      }
      return newCampaignsList;
    });
  }, []);

  const updateCampaign = useCallback((updatedCampaign: Campaign) => {
    setCampaignsState(prev => {
      let newCampaignsList = prev.map(c => c.id === updatedCampaign.id ? updatedCampaign : c);
      if (updatedCampaign.isActive) {
         newCampaignsList = newCampaignsList.map(c => c.id === updatedCampaign.id ? c : {...c, isActive: false});
         setActiveCampaignState(updatedCampaign); 
      } else if (activeCampaign?.id === updatedCampaign.id && !updatedCampaign.isActive) {
          const nextActive = newCampaignsList.find(c => c.isActive) || newCampaignsList.find(c => c.id !== updatedCampaign.id) || null;
          if(nextActive) { 
             setActiveCampaignState({...nextActive, isActive: true});
             newCampaignsList = newCampaignsList.map(c => ({...c, isActive: c.id === nextActive.id}));
          } else {
            setActiveCampaignState(null); 
          }
      }
      return newCampaignsList;
    });
  }, [activeCampaign]);

  const deleteCampaign = useCallback((campaignId: string) => {
    const updatedCampaigns = campaigns.filter(c => c.id !== campaignId);
    setCampaignsState(updatedCampaigns);
    setCharactersState(prevChars => prevChars.filter(char => char.campaignId !== campaignId));
    setFactionsState(prevFactions => prevFactions.filter(f => f.campaignId !== campaignId));
    setFactionReputationsState(prevReps => prevReps.filter(r => r.campaignId !== campaignId));
    setSessionLogsState(prevLogs => prevLogs.filter(log => log.campaignId !== campaignId));

    if (activeCampaign?.id === campaignId) {
      let newActive: Campaign | null = null;
      if (updatedCampaigns.length > 0) {
        newActive = { ...updatedCampaigns[0], isActive: true };
        setCampaignsState(prev => prev.map(c => c.id === newActive!.id ? newActive! : { ...c, isActive: false }));
      }
      setActiveCampaignState(newActive);
    }
  }, [activeCampaign, campaigns]);

  const addCharacter = useCallback((characterData: Omit<Character, 'id' | 'campaignId'>) => {
    if (!activeCampaign) {
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
      abilities: characterData.abilities || { strength: 10, dexterity: 10, constitution: 10, intelligence: 10, wisdom: 10, charisma: 10 },
    };
    setCharactersState(prev => [newCharacter, ...prev]);
  }, [activeCampaign]);

  const updateCharacter = useCallback((updatedCharacter: Character) => {
    setCharactersState(prev => prev.map(c => c.id === updatedCharacter.id ? updatedCharacter : c));
    if (selectedCharacterForProfile?.id === updatedCharacter.id) {
      setSelectedCharacterForProfile(updatedCharacter);
    }
     if (editingCharacterForForm?.id === updatedCharacter.id) {
      setEditingCharacterForForm(updatedCharacter);
    }
  }, [selectedCharacterForProfile, editingCharacterForForm]);

  const updateCharacterCurrentHp = useCallback((characterId: string, newCurrentHp: number) => {
    setCharactersState(prev =>
      prev.map(c =>
        c.id === characterId ? { ...c, currentHp: Math.max(0, Math.min(c.maxHp ?? newCurrentHp, newCurrentHp)) } : c
      )
    );
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

  const openCharacterForm = useCallback((characterToEdit?: Character) => {
    setEditingCharacterForForm(characterToEdit || null);
    setIsCharacterFormOpen(true);
    closeProfileDialog(); 
  }, [closeProfileDialog]);

  const closeCharacterForm = useCallback(() => {
    setEditingCharacterForForm(null);
    setIsCharacterFormOpen(false);
  }, []);

  const startNewSession = useCallback(() => {
    if (!activeCampaign) {
      return;
    }
    const existingSessionForCampaign = sessionLogs.find(log => log.campaignId === activeCampaign.id && (log.status === 'active' || log.status === 'paused'));
    if (existingSessionForCampaign) {
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
  }, [activeCampaign, sessionLogs]);

  const endCurrentSession = useCallback(() => {
     if (!currentSession || (currentSession.status !== 'active' && currentSession.status !== 'paused')) {
      return;
    }
    const endedSession = {
      ...currentSession,
      endTime: new Date().toISOString(),
      status: 'completed' as 'completed',
      pausedTime: undefined,
    };
    setSessionLogsState(prevLogs =>
      prevLogs.map(log => (log.id === currentSession.id ? endedSession : log))
    );
    setCurrentSessionState(null);
  }, [currentSession]);

  const pauseCurrentSession = useCallback(() => {
    if (!currentSession || currentSession.status !== 'active') {
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
    setCurrentSessionState(pausedSession); 
  }, [currentSession]);

  const resumeSession = useCallback(() => {
    if (!currentSession || currentSession.status !== 'paused') {
        return;
    }
    const resumedSession: SessionLog = {
        ...currentSession,
        status: 'active',
        pausedTime: undefined, 
    };
    setSessionLogsState(prevLogs => 
        prevLogs.map(log => log.id === currentSession.id ? resumedSession : log)
    );
    setCurrentSessionState(resumedSession);
  }, [currentSession]);

  return (
    <CampaignContext.Provider value={{
      campaigns, activeCampaign, setCampaignActive, addCampaign, updateCampaign, deleteCampaign, isLoading,
      characters, addCharacter, updateCharacter, updateCharacterCurrentHp, deleteCharacter,
      selectedCharacterForProfile, isProfileOpen, openProfileDialog, closeProfileDialog,
      factions, factionReputations,
      sessionLogs, currentSession, startNewSession, endCurrentSession, pauseCurrentSession, resumeSession,
      requestSwitchCampaign, confirmSwitchCampaign, cancelSwitchCampaign, isSwitchCampaignDialogVisible,
      editingCharacterForForm, isCharacterFormOpen, openCharacterForm, closeCharacterForm,
      isCombatActive, setIsCombatActive
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
