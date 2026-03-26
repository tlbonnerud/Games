import { Dispatch, SetStateAction, useEffect, useState } from "react";

export function usePersistentState<T>(
  key: string,
  fallback: T,
): [T, Dispatch<SetStateAction<T>>] {
  const [value, setValue] = useState<T>(fallback);

  useEffect(() => {
    if (typeof window === "undefined") {
      return;
    }

    try {
      const raw = window.localStorage.getItem(key);
      if (raw === null) {
        return;
      }
      setValue(JSON.parse(raw) as T);
    } catch {
      // Ignore malformed values and use fallback.
    }
  }, [key]);

  useEffect(() => {
    if (typeof window === "undefined") {
      return;
    }

    try {
      window.localStorage.setItem(key, JSON.stringify(value));
    } catch {
      // Ignore storage quota or serialization failures.
    }
  }, [key, value]);

  return [value, setValue];
}
