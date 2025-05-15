
'use client';

import { useEffect, useState } from 'react';
import { Button } from '@/components/ui/button';
import { useCampaignContext } from '@/contexts/campaign-context';
import { format, formatDistanceToNowStrict, parseISO } from 'date-fns';
import { PlayCircle, StopCircle, TimerIcon } from 'lucide-react';

export function SessionTools() {
  const { activeCampaign, currentSession, sessionLogs, startNewSession, endCurrentSession } = useCampaignContext();
  const [elapsedTime, setElapsedTime] = useState<string>('00:00:00');
  const [timerIntervalId, setTimerIntervalId] = useState<NodeJS.Timeout | null>(null);

  useEffect(() => {
    if (currentSession && currentSession.status === 'active') {
      const updateTimer = () => {
        const startTime = parseISO(currentSession.startTime);
        const duration = formatDistanceToNowStrict(startTime, { unit: 'second' });
        // duration will be like "X seconds", we need to parse and format
        const secondsElapsed = parseInt(duration.split(' ')[0]);
        
        const hours = Math.floor(secondsElapsed / 3600);
        const minutes = Math.floor((secondsElapsed % 3600) / 60);
        const seconds = secondsElapsed % 60;
        
        setElapsedTime(
          `${String(hours).padStart(2, '0')}:${String(minutes).padStart(2, '0')}:${String(seconds).padStart(2, '0')}`
        );
      };

      updateTimer(); // Initial call
      const intervalId = setInterval(updateTimer, 1000);
      setTimerIntervalId(intervalId);

      return () => {
        clearInterval(intervalId);
        setTimerIntervalId(null);
      };
    } else if (timerIntervalId) {
      clearInterval(timerIntervalId);
      setTimerIntervalId(null);
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
  
  if (!activeCampaign) {
      return <div className="text-xs text-muted-foreground">No active campaign.</div>;
  }

  return (
    <div className="flex items-center gap-3 text-xs">
      {currentSession && currentSession.status === 'active' && currentSession.campaignId === activeCampaign.id ? (
        <>
          <div className="flex items-center gap-1 text-foreground">
            <TimerIcon className="h-3.5 w-3.5 text-green-500 animate-pulse" />
            <span>Session {currentSession.sessionNumber}: {elapsedTime}</span>
          </div>
          <Button onClick={handleEndSession} variant="destructive" size="xs" className="px-2 py-1 h-auto">
            <StopCircle className="mr-1.5 h-3.5 w-3.5" />
            End Session
          </Button>
        </>
      ) : (
        <>
          {lastCompletedSessionForActiveCampaign && (
            <div className="text-muted-foreground">
              Last: S{lastCompletedSessionForActiveCampaign.sessionNumber} - {format(parseISO(lastCompletedSessionForActiveCampaign.startTime), 'MMM d, yyyy')}
            </div>
          )}
          {!lastCompletedSessionForActiveCampaign && <div className="text-muted-foreground">No sessions logged.</div>}
          <Button onClick={handleStartSession} variant="outline" size="xs" className="px-2 py-1 h-auto">
            <PlayCircle className="mr-1.5 h-3.5 w-3.5" />
            Start Session
          </Button>
        </>
      )}
    </div>
  );
}
