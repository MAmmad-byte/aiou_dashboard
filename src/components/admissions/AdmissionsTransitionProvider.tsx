"use client";

import React, { createContext, useContext, useTransition } from "react";

interface AdmissionsTransitionContextValue {
  isPending: boolean;
  startAdmissionsTransition: (callback: () => void) => void;
}

const AdmissionsTransitionContext = createContext<AdmissionsTransitionContextValue | null>(null);

export function AdmissionsTransitionProvider({ children }: { children: React.ReactNode }) {
  const [isPending, startTransition] = useTransition();
  return (
    <AdmissionsTransitionContext.Provider value={{ isPending, startAdmissionsTransition: startTransition }}>
      {children}
    </AdmissionsTransitionContext.Provider>
  );
}

export function useAdmissionsTransition(): AdmissionsTransitionContextValue {
  const ctx = useContext(AdmissionsTransitionContext);
  if (!ctx) {
    throw new Error("useAdmissionsTransition must be used within an AdmissionsTransitionProvider");
  }
  return ctx;
}

export function AdmissionsFadeWrapper({ children }: { children: React.ReactNode }) {
  const { isPending } = useAdmissionsTransition();
  return (
    <div className={`transition-opacity duration-300 ${isPending ? "opacity-40" : "opacity-100"}`}>
      {children}
    </div>
  );
}
