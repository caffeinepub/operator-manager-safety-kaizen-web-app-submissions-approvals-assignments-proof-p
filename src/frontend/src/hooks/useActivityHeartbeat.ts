import { useEffect, useRef } from 'react';
import { useInternetIdentity } from './useInternetIdentity';
import { useActor } from './useActor';

const HEARTBEAT_INTERVAL = 5 * 60 * 1000; // 5 minutes

export function useActivityHeartbeat() {
  const { identity } = useInternetIdentity();
  const { actor } = useActor();
  const intervalRef = useRef<NodeJS.Timeout | null>(null);

  useEffect(() => {
    if (!identity || !actor) {
      if (intervalRef.current) {
        clearInterval(intervalRef.current);
        intervalRef.current = null;
      }
      return;
    }

    const ping = async () => {
      try {
        if (document.visibilityState === 'visible') {
          await actor.pingActivity();
        }
      } catch (error) {
        console.error('Activity ping failed:', error);
      }
    };

    // Ping immediately on login
    ping();

    // Set up interval
    intervalRef.current = setInterval(ping, HEARTBEAT_INTERVAL);

    return () => {
      if (intervalRef.current) {
        clearInterval(intervalRef.current);
      }
    };
  }, [identity, actor]);
}
