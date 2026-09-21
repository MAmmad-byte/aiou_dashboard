"use client";

import React, { createContext, useContext, useTransition } from "react";

interface CmsTransitionContextValue {
  isPending: boolean;
  startCmsTransition: (callback: () => void) => void;
}

const CmsTransitionContext = createContext<CmsTransitionContextValue | null>(null);

// Wraps the whole /cms page (see app/cms/page.tsx). CmsFilters calls
// startCmsTransition() instead of its own local useTransition() so that the
// pending state is visible to CmsLoadingOverlay and CmsFadeWrapper too —
// one router.push() from a filter, one shared "is this page currently
// refetching" flag.
export function CmsTransitionProvider({ children }: { children: React.ReactNode }) {
  const [isPending, startTransition] = useTransition();
  return (
    <CmsTransitionContext.Provider value={{ isPending, startCmsTransition: startTransition }}>
      {children}
    </CmsTransitionContext.Provider>
  );
}

export function useCmsTransition(): CmsTransitionContextValue {
  const ctx = useContext(CmsTransitionContext);
  if (!ctx) {
    throw new Error("useCmsTransition must be used within a CmsTransitionProvider");
  }
  return ctx;
}

// Fades the (server-rendered) dashboard content while a filter change is in
// flight, rather than yanking it away — the old numbers stay legible but
// dimmed until the new SQL results stream in and replace them.
export function CmsFadeWrapper({ children }: { children: React.ReactNode }) {
  const { isPending } = useCmsTransition();
  return (
    <div className={`transition-opacity duration-300 ${isPending ? "opacity-40" : "opacity-100"}`}>
      {children}
    </div>
  );
}
