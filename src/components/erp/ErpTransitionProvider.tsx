"use client";

import React, { createContext, useContext, useTransition } from "react";

interface ErpTransitionContextValue {
  isPending: boolean;
  startErpTransition: (callback: () => void) => void;
}

const ErpTransitionContext = createContext<ErpTransitionContextValue | null>(null);

export function ErpTransitionProvider({ children }: { children: React.ReactNode }) {
  const [isPending, startTransition] = useTransition();
  return (
    <ErpTransitionContext.Provider value={{ isPending, startErpTransition: startTransition }}>
      {children}
    </ErpTransitionContext.Provider>
  );
}

export function useErpTransition(): ErpTransitionContextValue {
  const ctx = useContext(ErpTransitionContext);
  if (!ctx) {
    throw new Error("useErpTransition must be used within an ErpTransitionProvider");
  }
  return ctx;
}

export function ErpFadeWrapper({ children }: { children: React.ReactNode }) {
  const { isPending } = useErpTransition();
  return (
    <div className={`transition-opacity duration-300 ${isPending ? "opacity-40" : "opacity-100"}`}>
      {children}
    </div>
  );
}
