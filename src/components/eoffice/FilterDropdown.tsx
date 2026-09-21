"use client";

import React, { useEffect, useMemo, useRef, useState } from "react";

interface FilterDropdownProps {
  label: string;
  options: string[];
  selected: string;
  onChange: (value: string) => void;
  searchable?: boolean;
}

export default function FilterDropdown({
  label,
  options,
  selected,
  onChange,
  searchable = false,
}: FilterDropdownProps) {
  const [isOpen, setIsOpen] = useState(false);
  const [query, setQuery] = useState("");
  const ref = useRef<HTMLDivElement>(null);
  const searchRef = useRef<HTMLInputElement>(null);

  useEffect(() => {
    function handleClickOutside(e: MouseEvent) {
      if (ref.current && !ref.current.contains(e.target as Node)) {
        setIsOpen(false);
        setQuery("");
      }
    }
    document.addEventListener("mousedown", handleClickOutside);
    return () => document.removeEventListener("mousedown", handleClickOutside);
  }, []);

  useEffect(() => {
    if (isOpen && searchable) searchRef.current?.focus();
  }, [isOpen, searchable]);

  const visibleOptions = useMemo(() => {
    if (!searchable || !query.trim()) return options;
    const q = query.trim().toLowerCase();
    return options.filter((o) => o.toLowerCase().includes(q));
  }, [options, query, searchable]);

  return (
    <div className="relative" ref={ref}>
      <button
        type="button"
        onClick={() => setIsOpen((prev) => !prev)}
        className="flex min-w-[180px] items-center justify-between gap-2 rounded-lg border border-gray-200 bg-white px-4 py-2.5 text-sm font-medium text-gray-700 shadow-theme-xs hover:bg-gray-50 dark:border-gray-800 dark:bg-white/[0.03] dark:text-gray-300 dark:hover:bg-white/[0.05]"
      >
        <span className="truncate">{selected === "All" ? `All ${label}` : selected}</span>
        <svg
          className={`h-4 w-4 shrink-0 text-gray-500 transition-transform dark:text-gray-400 ${
            isOpen ? "rotate-180" : ""
          }`}
          viewBox="0 0 20 20"
          fill="none"
        >
          <path
            d="M4.5 7.5L10 13L15.5 7.5"
            stroke="currentColor"
            strokeWidth="1.5"
            strokeLinecap="round"
            strokeLinejoin="round"
          />
        </svg>
      </button>

      {isOpen && (
        <div className="absolute z-20 mt-2 w-full min-w-[240px] rounded-lg border border-gray-200 bg-white shadow-theme-lg dark:border-gray-800 dark:bg-gray-900">
          {searchable && (
            <div className="border-b border-gray-100 p-2 dark:border-gray-800">
              <input
                ref={searchRef}
                type="text"
                value={query}
                onChange={(e) => setQuery(e.target.value)}
                placeholder={`Search ${label.toLowerCase()}...`}
                className="w-full rounded-md border border-gray-200 bg-gray-50 px-3 py-1.5 text-sm text-gray-700 outline-none focus:border-brand-300 dark:border-gray-700 dark:bg-white/[0.03] dark:text-gray-300"
              />
            </div>
          )}
          <div className="max-h-72 overflow-y-auto py-1.5">
            <button
              type="button"
              onClick={() => {
                onChange("All");
                setIsOpen(false);
                setQuery("");
              }}
              className={`block w-full px-4 py-2 text-left text-sm ${
                selected === "All"
                  ? "bg-brand-50 text-brand-600 dark:bg-brand-500/10 dark:text-brand-400"
                  : "text-gray-600 hover:bg-gray-50 dark:text-gray-300 dark:hover:bg-white/[0.05]"
              }`}
            >
              All {label}
            </button>
            {visibleOptions.length === 0 && (
              <div className="px-4 py-3 text-sm text-gray-400">No matches</div>
            )}
            {visibleOptions.map((option) => (
              <button
                key={option}
                type="button"
                onClick={() => {
                  onChange(option);
                  setIsOpen(false);
                  setQuery("");
                }}
                className={`block w-full truncate px-4 py-2 text-left text-sm ${
                  selected === option
                    ? "bg-brand-50 text-brand-600 dark:bg-brand-500/10 dark:text-brand-400"
                    : "text-gray-600 hover:bg-gray-50 dark:text-gray-300 dark:hover:bg-white/[0.05]"
                }`}
                title={option}
              >
                {option}
              </button>
            ))}
          </div>
        </div>
      )}
    </div>
  );
}
