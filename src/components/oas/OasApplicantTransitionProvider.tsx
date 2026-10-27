"use client";

import React, { createContext, useContext, useTransition } from "react";

interface TransitionContextValue {
  isPending: boolean;
  startOasApplicantTransition: (callback: () => void) => void;
}

const TransitionContext = createContext<TransitionContextValue | null>(null);

export function OasApplicantTransitionProvider({ children }: { children: React.ReactNode }) {
  const [isPending, startTransition] = useTransition();
  return (
    <TransitionContext.Provider value={{ isPending, startOasApplicantTransition: startTransition }}>
      {children}
    </TransitionContext.Provider>
  );
}

export function useOasApplicantTransition() {
  const ctx = useContext(TransitionContext);
  if (!ctx) throw new Error("useOasApplicantTransition must be used within OasApplicantTransitionProvider");
  return ctx;
}

export function OasApplicantFadeWrapper({ children }: { children: React.ReactNode }) {
  const { isPending } = useOasApplicantTransition();
  return (
    <div className={`transition-opacity duration-200 ${isPending ? "opacity-50" : "opacity-100"}`}>{children}</div>
  );
}
