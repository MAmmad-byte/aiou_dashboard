"use client";

import React, { useEffect, useRef, useState } from "react";

interface FilterDropdownProps {
  label: string;
  options: string[];
  selected: string;
  onChange: (value: string) => void;
}

// Same component as components/oas/FilterDropdown.tsx and
// components/eoffice/FilterDropdown.tsx — duplicated here so this folder is
// self-contained. Safe to delete and import one of the others instead.
export default function FilterDropdown({
  label,
  options,
  selected,
  onChange,
}: FilterDropdownProps) {
  const [isOpen, setIsOpen] = useState(false);
  const ref = useRef<HTMLDivElement>(null);

  useEffect(() => {
    function handleClickOutside(e: MouseEvent) {
      if (ref.current && !ref.current.contains(e.target as Node)) {
        setIsOpen(false);
      }
    }
    document.addEventListener("mousedown", handleClickOutside);
    return () => document.removeEventListener("mousedown", handleClickOutside);
  }, []);

  return (
    <div className="relative" ref={ref}>
      <button
        type="button"
        onClick={() => setIsOpen((prev) => !prev)}
        className="flex min-w-[160px] items-center justify-between gap-2 rounded-lg border border-gray-200 bg-white px-4 py-2.5 text-sm font-medium text-gray-700 shadow-theme-xs hover:bg-gray-50 dark:border-gray-800 dark:bg-white/[0.03] dark:text-gray-300 dark:hover:bg-white/[0.05]"
      >
        <span className="truncate">
          {selected === "All" ? `All ${label}` : selected}
        </span>
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
        <div className="absolute z-20 mt-2 max-h-72 w-full min-w-[220px] overflow-y-auto rounded-lg border border-gray-200 bg-white py-1.5 shadow-theme-lg dark:border-gray-800 dark:bg-gray-900">
          <button
            type="button"
            onClick={() => {
              onChange("All");
              setIsOpen(false);
            }}
            className={`block w-full px-4 py-2 text-left text-sm ${
              selected === "All"
                ? "bg-brand-50 text-brand-600 dark:bg-brand-500/10 dark:text-brand-400"
                : "text-gray-600 hover:bg-gray-50 dark:text-gray-300 dark:hover:bg-white/[0.05]"
            }`}
          >
            All {label}
          </button>
          {options.map((option) => (
            <button
              key={option}
              type="button"
              onClick={() => {
                onChange(option);
                setIsOpen(false);
              }}
              className={`block w-full px-4 py-2 text-left text-sm ${
                selected === option
                  ? "bg-brand-50 text-brand-600 dark:bg-brand-500/10 dark:text-brand-400"
                  : "text-gray-600 hover:bg-gray-50 dark:text-gray-300 dark:hover:bg-white/[0.05]"
              }`}
            >
              {option}
            </button>
          ))}
        </div>
      )}
    </div>
  );
}
