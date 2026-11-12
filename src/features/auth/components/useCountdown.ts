import { useEffect, useState } from 'react';

// Seconds left, restarts when `key` changes. Formats as m:ss.
export const useCountdown = (seconds: number, key: unknown) => {
  const [left, setLeft] = useState(seconds);
  useEffect(() => {
    setLeft(seconds);
    const id = setInterval(() => setLeft((s) => (s > 0 ? s - 1 : 0)), 1000);
    return () => clearInterval(id);
  }, [seconds, key]);
  const label = `${Math.floor(left / 60)}:${String(left % 60).padStart(2, '0')}`;
  return { left, label, done: left === 0 };
};
