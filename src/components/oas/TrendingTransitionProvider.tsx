"use client";

import React, { createContext, useContext, useTransition } from "react";

interface TrendingTransitionContextValue {
  isPending: boolean;
  startTrendingTransition: (callback: () => void) => void;
}

const TrendingTransitionContext = createContext<TrendingTransitionContextValue | null>(null);

export function TrendingTransitionProvider({ children }: { children: React.ReactNode }) {
  const [isPending, startTransition] = useTransition();
  return (
    <TrendingTransitionContext.Provider value={{ isPending, startTrendingTransition: startTransition }}>
      {children}
    </TrendingTransitionContext.Provider>
  );
}

export function useTrendingTransition(): TrendingTransitionContextValue {
  const ctx = useContext(TrendingTransitionContext);
  if (!ctx) {
    throw new Error("useTrendingTransition must be used within a TrendingTransitionProvider");
  }
  return ctx;
}

export function TrendingFadeWrapper({ children }: { children: React.ReactNode }) {
  const { isPending } = useTrendingTransition();
  return (
    <div className={`transition-opacity duration-300 ${isPending ? "opacity-40" : "opacity-100"}`}>
      {children}
    </div>
  );
}
