import { useEffect, useRef, useState } from 'react';
import { socket } from '../services/socket';

// Calls `reload` whenever the server announces a change (and once on mount).
export function useLive(reload) {
  const ref = useRef(reload);
  ref.current = reload;
  useEffect(() => {
    const run = () => ref.current();
    run();
    socket.on('lab:changed', run);
    socket.on('connect', run); // catch up after a dropped connection
    return () => {
      socket.off('lab:changed', run);
      socket.off('connect', run);
    };
  }, []);
}

// Re-renders every second so durations tick.
export function useNow(intervalMs = 1000) {
  const [now, setNow] = useState(Date.now());
  useEffect(() => {
    const t = setInterval(() => setNow(Date.now()), intervalMs);
    return () => clearInterval(t);
  }, [intervalMs]);
  return now;
}
