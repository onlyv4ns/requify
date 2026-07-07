"use client";

import { useEffect, useState } from "react";

export function useLocalStorage<T>(key: string, initial: T) {
  const [value, setValue] = useState<T>(initial);
  const [loaded, setLoaded] = useState(false);

  useEffect(() => {
    const raw = window.localStorage.getItem(key);
    if (raw) setValue(JSON.parse(raw));
    setLoaded(true);
  }, [key]);

  useEffect(() => {
    if (loaded) window.localStorage.setItem(key, JSON.stringify(value));
  }, [key, value, loaded]);

  return [value, setValue] as const;
}
