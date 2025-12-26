"use client";

import { useEffect, useState } from "react";

export function useLocalStorage<T>(key: string, initialValue: T) {
  const [state, setState] = useState<T>(() => {
    try {
      const raw = typeof window !== "undefined" ? window.localStorage.getItem(key) : null;
      return raw ? (JSON.parse(raw) as T) : initialValue;
    } catch (e) {
      return initialValue;
    }
  });

  useEffect(() => {
    try {
      window.localStorage.setItem(key, JSON.stringify(state));
    } catch (e) {
      // ignore write errors
    }
  }, [key, state]);

  function remove() {
    try {
      window.localStorage.removeItem(key);
    } catch (e) {}
  }

  return { state, setState, remove } as {
    state: T;
    setState: (v: T | ((prev: T) => T)) => void;
    remove: () => void;
  };
}

export default useLocalStorage;
