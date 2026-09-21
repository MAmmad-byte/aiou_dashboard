"use client";

import React from "react";

interface DateRangeFilterProps {
  from: string;
  to: string;
  minDate: string;
  maxDate: string;
  onChangeFrom: (value: string) => void;
  onChangeTo: (value: string) => void;
}

export default function DateRangeFilter({ from, to, minDate, maxDate, onChangeFrom, onChangeTo }: DateRangeFilterProps) {
  return (
    <div className="flex items-center gap-2 rounded-lg border border-gray-200 bg-white px-3 py-2 shadow-theme-xs dark:border-gray-800 dark:bg-white/[0.03]">
      <label className="text-xs font-medium text-gray-500 dark:text-gray-400">From</label>
      <input
        type="date"
        value={from}
        min={minDate || undefined}
        max={to || maxDate || undefined}
        onChange={(e) => onChangeFrom(e.target.value)}
        className="rounded-md border-0 bg-transparent text-sm text-gray-700 outline-none dark:text-gray-300 [color-scheme:light] dark:[color-scheme:dark]"
      />
      <span className="text-gray-300 dark:text-gray-700">–</span>
      <label className="text-xs font-medium text-gray-500 dark:text-gray-400">To</label>
      <input
        type="date"
        value={to}
        min={from || minDate || undefined}
        max={maxDate || undefined}
        onChange={(e) => onChangeTo(e.target.value)}
        className="rounded-md border-0 bg-transparent text-sm text-gray-700 outline-none dark:text-gray-300 [color-scheme:light] dark:[color-scheme:dark]"
      />
    </div>
  );
}
