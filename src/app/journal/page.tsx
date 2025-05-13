'use client';

import { useState, useEffect } from 'react';
import { PageHeader } from '@/components/shared/page-header';
import { Button } from '@/components/ui/button';
import { Card, CardContent, CardDescription, CardFooter, CardHeader, CardTitle } from '@/components/ui/card';
import { Textarea } from '@/components/ui/textarea';
import { Input } from '@/components/ui/input';
import { PlusCircle, Edit3, Trash2, Brain, Save, Loader2 } from 'lucide-react';
import type { SessionNote, Campaign } from '@/lib/types'; // Assuming Campaign type is needed for context
import { useToast } from '@/hooks/use-toast';
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select";
import { generateSessionSummary } from '@/ai/flows/generate-session-summary';
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

// Mock data - in a real app, this would come from a database
const mockCampaigns: Campaign[] = [
  { id: '1', name: 'The Whispering Peaks', description: 'An adventure into the mysterious mountains where ancient secrets lie.', isActive: true },
  { id: '2', name: 'Curse of the Sunken City', description: 'Explore the ruins of a city lost beneath the waves.', isActive: false },
];

const mockSessionNotes: SessionNote[] = [
  { id: 's1', campaignId: '1', date: new Date().toISOString(), title: 'First Steps into Gloomwood', notes: 'The party ventured into Gloomwood forest, encountered goblins, and found a mysterious amulet.', summary: 'Party explored Gloomwood, fought goblins, found an amulet.' },
  { id: 's2', campaignId: '1', date: new Date(Date.now() - 86400000).toISOString(), title: 'The Goblin Cave', notes: 'Delved deeper, found the goblin chief, and rescued the merchant.', summary: 'Found goblin chief, rescued merchant.' },
];

export default function JournalPage() {
  const [campaigns, setCampaigns] = useState<Campaign[]>(mockCampaigns);
  const [selectedCampaignId, setSelectedCampaignId] = useState<string | undefined>(mockCampaigns.find(c=>c.isActive)?.id || mockCampaigns[0]?.id);
  const [sessionNotes, setSessionNotes] = useState<SessionNote[]>([]);
  const [currentNote, setCurrentNote] = useState<Partial<SessionNote>>({ title: '', notes: ''});
  const [editingNoteId, setEditingNoteId] = useState<string | null>(null);
  const [isSummarizing, setIsSummarizing] = useState(false);
  const { toast } = useToast();

  useEffect(() => {
    if (selectedCampaignId) {
      // Filter mock notes for selected campaign
      setSessionNotes(mockSessionNotes.filter(note => note.campaignId === selectedCampaignId));
    } else {
      setSessionNotes([]);
    }
    // Reset form when campaign changes
    setCurrentNote({ title: '', notes: '' });
    setEditingNoteId(null);
  }, [selectedCampaignId]);

  const handleSaveNote = () => {
    if (!currentNote.title || !currentNote.notes || !selectedCampaignId) {
      toast({ title: 'Error', description: 'Title and notes are required.', variant: 'destructive' });
      return;
    }

    if (editingNoteId) {
      // Update existing note
      setSessionNotes(prev => prev.map(n => n.id === editingNoteId ? { ...n, ...currentNote, campaignId: selectedCampaignId } as SessionNote : n));
      toast({ title: 'Note Updated', description: `Session note "${currentNote.title}" updated.` });
    } else {
      // Create new note
      const newNote: SessionNote = {
        id: String(Date.now()),
        campaignId: selectedCampaignId,
        date: new Date().toISOString(),
        title: currentNote.title,
        notes: currentNote.notes,
        summary: currentNote.summary,
      };
      setSessionNotes(prev => [newNote, ...prev]);
      toast({ title: 'Note Saved', description: `Session note "${newNote.title}" saved.` });
    }
    setCurrentNote({ title: '', notes: '' });
    setEditingNoteId(null);
  };

  const handleEditNote = (note: SessionNote) => {
    setCurrentNote({ title: note.title, notes: note.notes, summary: note.summary });
    setEditingNoteId(note.id);
  };

  const handleDeleteNote = (noteId: string) => {
    setSessionNotes(prev => prev.filter(n => n.id !== noteId));
    toast({ title: 'Note Deleted', description: 'Session note deleted.', variant: 'destructive' });
    if (editingNoteId === noteId) {
      setCurrentNote({ title: '', notes: '' });
      setEditingNoteId(null);
    }
  };

  const handleGenerateSummary = async () => {
    if (!currentNote.notes) {
      toast({ title: 'Error', description: 'Cannot summarize empty notes.', variant: 'destructive' });
      return;
    }
    setIsSummarizing(true);
    try {
      const result = await generateSessionSummary({ sessionNotes: currentNote.notes });
      setCurrentNote(prev => ({ ...prev, summary: result.summary }));
      toast({ title: 'Summary Generated', description: 'AI summary created for the current notes.' });
    } catch (error) {
      console.error('Error generating summary:', error);
      toast({ title: 'Error', description: 'Could not generate summary.', variant: 'destructive' });
    }
    setIsSummarizing(false);
  };
  
  const handleNewNote = () => {
    setCurrentNote({ title: '', notes: '', summary: '' });
    setEditingNoteId(null);
  };

  return (
    <>
      <PageHeader
        title="Campaign Journal"
        description="Log your session notes, track plot developments, and generate AI-powered summaries."
      />
      <div className="grid grid-cols-1 gap-6 lg:grid-cols-3">
        <div className="lg:col-span-2">
          <Card className="shadow-lg">
            <CardHeader>
              <div className="flex justify-between items-center">
                <CardTitle>{editingNoteId ? 'Edit Session Note' : 'New Session Note'}</CardTitle>
                {editingNoteId && (
                  <Button variant="outline" size="sm" onClick={handleNewNote}>
                    <PlusCircle className="mr-2 h-4 w-4" /> New Note
                  </Button>
                )}
              </div>
              <div className="mt-2">
                <Select
                  value={selectedCampaignId}
                  onValueChange={(value) => setSelectedCampaignId(value)}
                >
                  <SelectTrigger className="w-full md:w-[280px]">
                    <SelectValue placeholder="Select a campaign" />
                  </SelectTrigger>
                  <SelectContent>
                    {campaigns.map(campaign => (
                      <SelectItem key={campaign.id} value={campaign.id}>
                        {campaign.name}
                      </SelectItem>
                    ))}
                  </SelectContent>
                </Select>
              </div>
            </CardHeader>
            <CardContent className="space-y-4">
              <Input
                placeholder="Session Title (e.g., The Dragon's Lair)"
                value={currentNote.title || ''}
                onChange={(e) => setCurrentNote(prev => ({ ...prev, title: e.target.value }))}
                disabled={!selectedCampaignId}
              />
              <Textarea
                placeholder="Start writing your session notes here... What happened? Who did what? Any important clues?"
                className="min-h-[200px] resize-y"
                value={currentNote.notes || ''}
                onChange={(e) => setCurrentNote(prev => ({ ...prev, notes: e.target.value }))}
                disabled={!selectedCampaignId}
              />
              {currentNote.summary && (
                <div>
                  <h4 className="font-semibold text-sm mb-1">AI Summary:</h4>
                  <p className="text-xs p-2 border rounded-md bg-muted/50 whitespace-pre-wrap">{currentNote.summary}</p>
                </div>
              )}
            </CardContent>
            <CardFooter className="flex justify-between">
              <Button onClick={handleGenerateSummary} variant="outline" disabled={isSummarizing || !currentNote.notes || !selectedCampaignId}>
                {isSummarizing ? <Loader2 className="mr-2 h-4 w-4 animate-spin" /> : <Brain className="mr-2 h-4 w-4" />}
                {isSummarizing ? 'Summarizing...' : 'Generate Summary'}
              </Button>
              <Button onClick={handleSaveNote} disabled={!currentNote.title || !currentNote.notes || !selectedCampaignId}>
                <Save className="mr-2 h-4 w-4" /> {editingNoteId ? 'Update Note' : 'Save Note'}
              </Button>
            </CardFooter>
          </Card>
        </div>

        <div className="lg:col-span-1">
          <Card className="shadow-lg">
            <CardHeader>
              <CardTitle>Session Log</CardTitle>
              <CardDescription>Notes for "{campaigns.find(c => c.id === selectedCampaignId)?.name || 'selected campaign'}".</CardDescription>
            </CardHeader>
            <CardContent>
              {sessionNotes.length === 0 && selectedCampaignId ? (
                <p className="text-center text-muted-foreground">No session notes for this campaign yet.</p>
              ) : !selectedCampaignId ? (
                 <p className="text-center text-muted-foreground">Please select a campaign to view notes.</p>
              ) : (
                <ul className="space-y-3 max-h-[400px] overflow-y-auto">
                  {sessionNotes.map(note => (
                    <li key={note.id} className="rounded-md border p-3 hover:bg-muted/50 transition-colors">
                      <h4 className="font-semibold">{note.title}</h4>
                      <p className="text-xs text-muted-foreground mb-1">
                        {new Date(note.date).toLocaleDateString()}
                      </p>
                      <p className="text-sm truncate">{note.summary || note.notes}</p>
                      <div className="mt-2 flex gap-2">
                        <Button variant="ghost" size="xs" onClick={() => handleEditNote(note)}>
                          <Edit3 className="mr-1 h-3 w-3" /> Edit
                        </Button>
                        <AlertDialog>
                          <AlertDialogTrigger asChild>
                             <Button variant="ghost" size="xs" className="text-destructive hover:text-destructive">
                                <Trash2 className="mr-1 h-3 w-3" /> Delete
                              </Button>
                          </AlertDialogTrigger>
                          <AlertDialogContent>
                            <AlertDialogHeader>
                              <AlertDialogTitle>Delete Note "{note.title}"?</AlertDialogTitle>
                              <AlertDialogDescription>
                                This action cannot be undone.
                              </AlertDialogDescription>
                            </AlertDialogHeader>
                            <AlertDialogFooter>
                              <AlertDialogCancel>Cancel</AlertDialogCancel>
                              <AlertDialogAction onClick={() => handleDeleteNote(note.id)}>Delete</AlertDialogAction>
                            </AlertDialogFooter>
                          </AlertDialogContent>
                        </AlertDialog>
                      </div>
                    </li>
                  ))}
                </ul>
              )}
            </CardContent>
          </Card>
        </div>
      </div>
    </>
  );
}
