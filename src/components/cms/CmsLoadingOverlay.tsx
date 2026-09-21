"use client";

import React from "react";
import { useCmsTransition } from "./CmsTransitionProvider";

// Renders nothing until a filter change kicks off a transition (see
// CmsTransitionProvider) — then shows a shimmering progress bar plus a
// centered pulsing spinner over the (still-visible, dimmed) dashboard below.
export default function CmsLoadingOverlay() {
  const { isPending } = useCmsTransition();

  if (!isPending) return null;

  return (
    <>
      <div className="absolute -top-1 left-0 right-0 z-[60] h-1 overflow-hidden rounded-full bg-brand-100 dark:bg-brand-500/15">
        <div className="cms-shimmer-bar h-full w-1/3 rounded-full bg-gradient-to-r from-brand-400 via-brand-600 to-brand-400" />
      </div>

      <div className="pointer-events-none absolute inset-0 z-50 flex items-start justify-center pt-24">
        <div className="flex flex-col items-center gap-3 rounded-2xl border border-gray-200 bg-white/90 px-6 py-5 shadow-theme-lg backdrop-blur-sm dark:border-gray-800 dark:bg-gray-900/90">
          <span className="relative flex h-10 w-10 items-center justify-center">
            <span className="absolute inline-flex h-full w-full animate-ping rounded-full bg-brand-400 opacity-40" />
            <span className="relative inline-flex h-10 w-10 items-center justify-center rounded-full bg-brand-500">
              <svg className="h-5 w-5 animate-spin text-white" viewBox="0 0 24 24" fill="none">
                <circle className="opacity-25" cx="12" cy="12" r="10" stroke="currentColor" strokeWidth="4" />
                <path
                  className="opacity-90"
                  fill="currentColor"
                  d="M4 12a8 8 0 0 1 8-8V0C5.4 0 0 5.4 0 12h4Z"
                />
              </svg>
            </span>
          </span>
          <p className="text-sm font-medium text-gray-700 dark:text-gray-300">Updating dashboard…</p>
        </div>
      </div>

      {/* Next.js ships styled-jsx zero-config, so this scoped keyframe works
         without touching globals.css. If your project has styled-jsx
         disabled, move this into a regular CSS file instead. */}
      <style jsx>{`
        .cms-shimmer-bar {
          animation: cms-shimmer 1.1s ease-in-out infinite;
        }
        @keyframes cms-shimmer {
          0% {
            transform: translateX(-100%);
          }
          100% {
            transform: translateX(300%);
          }
        }
      `}</style>
    </>
  );
}
