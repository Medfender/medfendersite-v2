"use client";

import React, {
  createContext,
  useCallback,
  useContext,
  useEffect,
  useMemo,
  useState,
} from "react";

const STORAGE_KEY = "medfender-academy-subscribed";

interface AcademyAccessValue {
  subscribed: boolean;
  setSubscribed: (value: boolean) => void;
  activate: () => void;
  deactivate: () => void;
}

const AcademyAccessContext = createContext<AcademyAccessValue | null>(null);

export function AcademyAccessProvider({ children }: { children: React.ReactNode }) {
  const [subscribed, setSubscribedState] = useState(false);

  useEffect(() => {
    try {
      setSubscribedState(window.localStorage.getItem(STORAGE_KEY) === "1");
    } catch {
      setSubscribedState(false);
    }
    // React to membership activation coming back from checkout.
    const params = new URLSearchParams(window.location.search);
    if (params.get("academy") === "subscribed") {
      try {
        window.localStorage.setItem(STORAGE_KEY, "1");
        setSubscribedState(true);
      } catch {
        /* ignore */
      }
    }
  }, []);

  const setSubscribed = useCallback((value: boolean) => {
    setSubscribedState(value);
    try {
      window.localStorage.setItem(STORAGE_KEY, value ? "1" : "0");
    } catch {
      /* ignore */
    }
  }, []);

  const value = useMemo(
    () => ({
      subscribed,
      setSubscribed,
      activate: () => setSubscribed(true),
      deactivate: () => setSubscribed(false),
    }),
    [subscribed, setSubscribed]
  );

  return (
    <AcademyAccessContext.Provider value={value}>
      {children}
    </AcademyAccessContext.Provider>
  );
}

export function useAcademyAccess(): AcademyAccessValue {
  const ctx = useContext(AcademyAccessContext);
  if (!ctx) {
    throw new Error("useAcademyAccess must be used inside <AcademyAccessProvider>");
  }
  return ctx;
}
