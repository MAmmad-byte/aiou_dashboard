"use client";

import React from "react";
import { useOasApplicantTransition } from "./OasApplicantTransitionProvider";

export default function OasApplicantLoadingOverlay() {
  const { isPending } = useOasApplicantTransition();
  if (!isPending) return null;
  return (
    <div className="pointer-events-none absolute inset-0 z-30 flex items-center justify-center">
      <div className="h-9 w-9 animate-spin rounded-full border-3 border-brand-200 border-t-brand-500 dark:border-brand-500/20 dark:border-t-brand-400" />
    </div>
  );
}
