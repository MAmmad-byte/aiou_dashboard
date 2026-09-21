"use client";

import React, { createContext, useContext, useTransition } from "react";

interface EOfficeTransitionContextValue {
  isPending: boolean;
  startEOfficeTransition: (callback: () => void) => void;
}

const EOfficeTransitionContext = createContext<EOfficeTransitionContextValue | null>(null);

// Same pattern as CmsTransitionProvider: wraps the whole /eoffice page so
// EOfficeFilters' router.push() (via startEOfficeTransition) is visible to
// EOfficeLoadingOverlay and EOfficeFadeWrapper too.
export function EOfficeTransitionProvider({ children }: { children: React.ReactNode }) {
  const [isPending, startTransition] = useTransition();
  return (
    <EOfficeTransitionContext.Provider value={{ isPending, startEOfficeTransition: startTransition }}>
      {children}
    </EOfficeTransitionContext.Provider>
  );
}

export function useEOfficeTransition(): EOfficeTransitionContextValue {
  const ctx = useContext(EOfficeTransitionContext);
  if (!ctx) {
    throw new Error("useEOfficeTransition must be used within an EOfficeTransitionProvider");
  }
  return ctx;
}

export function EOfficeFadeWrapper({ children }: { children: React.ReactNode }) {
  const { isPending } = useEOfficeTransition();
  return (
    <div className={`transition-opacity duration-300 ${isPending ? "opacity-40" : "opacity-100"}`}>
      {children}
    </div>
  );
}
