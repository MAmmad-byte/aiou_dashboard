"use client";

import React, { createContext, useContext, useTransition } from "react";

interface TmsTransitionContextValue {
  isPending: boolean;
  startTmsTransition: (callback: () => void) => void;
}

const TmsTransitionContext = createContext<TmsTransitionContextValue | null>(null);

export function TmsTransitionProvider({ children }: { children: React.ReactNode }) {
  const [isPending, startTransition] = useTransition();
  return (
    <TmsTransitionContext.Provider value={{ isPending, startTmsTransition: startTransition }}>
      {children}
    </TmsTransitionContext.Provider>
  );
}

export function useTmsTransition(): TmsTransitionContextValue {
  const ctx = useContext(TmsTransitionContext);
  if (!ctx) {
    throw new Error("useTmsTransition must be used within a TmsTransitionProvider");
  }
  return ctx;
}

export function TmsFadeWrapper({ children }: { children: React.ReactNode }) {
  const { isPending } = useTmsTransition();
  return (
    <div className={`transition-opacity duration-300 ${isPending ? "opacity-40" : "opacity-100"}`}>
      {children}
    </div>
  );
}
