import { useEffect, useState } from 'react';

/** Current time in ms, refreshed every `intervalMs` so "is this over yet" stays true. */
export const useNow = (intervalMs = 60000) => {
  const [now, setNow] = useState(() => Date.now());
  useEffect(() => {
    const id = setInterval(() => setNow(Date.now()), intervalMs);
    return () => clearInterval(id);
  }, [intervalMs]);
  return now;
};
