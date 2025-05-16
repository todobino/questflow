
'use client';

import { useEffect, useState } from 'react';
import { Button } from '@/components/ui/button';
import { useCampaignContext } from '@/contexts/campaign-context';
import { format, parseISO, differenceInSeconds } from 'date-fns';
import { PlayCircle, StopCircle, TimerIcon, PauseCircle, Play } from 'lucide-react';

export function SessionTools() {
  const { activeCampaign, currentSession, sessionLogs, startNewSession, endCurrentSession, pauseCurrentSession, resumeSession } = useCampaignContext();
  const [elapsedTime, setElapsedTime] = useState<string>('00:00:00');
  const [timerIntervalId, setTimerIntervalId] = useState<NodeJS.Timeout | null>(null);

  useEffect(() => {
    if (currentSession && currentSession.status === 'active') {
      const updateTimer = () => {
        const startTime = parseISO(currentSession.startTime);
        const secondsElapsed = differenceInSeconds(new Date(), startTime);
        
        const hours = Math.floor(secondsElapsed / 3600);
        const minutes = Math.floor((secondsElapsed % 3600) / 60);
        const seconds = secondsElapsed % 60;
        
        setElapsedTime(
          `${String(hours).padStart(2, '0')}:${String(minutes).padStart(2, '0')}:${String(seconds).padStart(2, '0')}`
        );
      };

      updateTimer(); 
      const intervalId = setInterval(updateTimer, 1000);
      setTimerIntervalId(intervalId);

      return () => {
        clearInterval(intervalId);
        setTimerIntervalId(null);
      };
    } else if (currentSession && currentSession.status === 'paused' && currentSession.pausedTime) {
        if (timerIntervalId) clearInterval(timerIntervalId);
        const startTime = parseISO(currentSession.startTime);
        const pausedAt = parseISO(currentSession.pausedTime);
        const secondsElapsed = differenceInSeconds(pausedAt, startTime);

        const hours = Math.floor(secondsElapsed / 3600);
        const minutes = Math.floor((secondsElapsed % 3600) / 60);
        const seconds = secondsElapsed % 60;
        
        setElapsedTime(
          `${String(hours).padStart(2, '0')}:${String(minutes).padStart(2, '0')}:${String(seconds).padStart(2, '0')}`
        );
    } else {
      if (timerIntervalId) {
        clearInterval(timerIntervalId);
        setTimerIntervalId(null);
      }
      setElapsedTime('00:00:00');
    }
  // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [currentSession]);

  const lastCompletedSessionForActiveCampaign = activeCampaign
    ? sessionLogs
        .filter(log => log.campaignId === activeCampaign.id && log.status === 'completed')
        .sort((a, b) => b.sessionNumber - a.sessionNumber)[0]
    : null;

  const handleStartSession = () => {
    if (activeCampaign) {
      startNewSession();
    }
  };

  const handleEndSession = () => {
    endCurrentSession();
  };

  const handlePauseSession = () => {
    pauseCurrentSession();
  };

  const handleResumeSession = () => {
    resumeSession();
  };
  
  if (!activeCampaign) {
      return <div className="text-xs text-muted-foreground">No active campaign.</div>;
  }

  return (
    <div className="flex items-center gap-3 text-xs">
      {currentSession && currentSession.campaignId === activeCampaign.id ? (
        currentSession.status === 'active' ? (
          <>
            <div className="flex items-center gap-1 text-foreground">
              <TimerIcon className="h-3.5 w-3.5 text-success animate-pulse" />
              <span>Session {currentSession.sessionNumber}: {elapsedTime}</span>
            </div>
            <Button onClick={handlePauseSession} variant="outline" size="xs" className="px-2 py-1 h-auto">
              <PauseCircle className="mr-1.5 h-3.5 w-3.5" />
              Pause
            </Button>
            <Button onClick={handleEndSession} variant="destructive" size="xs" className="px-2 py-1 h-auto">
              <StopCircle className="mr-1.5 h-3.5 w-3.5" />
              End Session
            </Button>
          </>
        ) : currentSession.status === 'paused' ? (
          <>
            <div className="flex items-center gap-1 text-foreground">
              <PauseCircle className="h-3.5 w-3.5 text-yellow-500" />
              <span>Session {currentSession.sessionNumber} Paused: {elapsedTime}</span>
            </div>
            <Button onClick={handleResumeSession} variant="outline" size="xs" className="px-2 py-1 h-auto hover:bg-success hover:text-success-foreground hover:border-success">
              <Play className="mr-1.5 h-3.5 w-3.5" />
              Resume
            </Button>
             <Button onClick={handleEndSession} variant="destructive" size="xs" className="px-2 py-1 h-auto">
              <StopCircle className="mr-1.5 h-3.5 w-3.5" />
              End Session
            </Button>
          </>
        ) : null 
      ) : (
        <>
          {lastCompletedSessionForActiveCampaign && (
            <div className="text-muted-foreground">
              Last: S{lastCompletedSessionForActiveCampaign.sessionNumber} - {format(parseISO(lastCompletedSessionForActiveCampaign.startTime), 'MMM d, yyyy')}
            </div>
          )}
          {!lastCompletedSessionForActiveCampaign && <div className="text-muted-foreground">No sessions logged.</div>}
          <Button 
            onClick={handleStartSession} 
            variant="outline" 
            size="xs" 
            className="px-2 py-1 h-auto border-success text-success bg-success/20 hover:bg-success hover:text-success-foreground hover:border-success"
            disabled={!!sessionLogs.find(log => log.campaignId === activeCampaign.id && (log.status === 'active' || log.status === 'paused'))} 
          >
            <PlayCircle className="mr-1.5 h-3.5 w-3.5" />
            Start Session
          </Button>
        </>
      )}
    </div>
  );
}
