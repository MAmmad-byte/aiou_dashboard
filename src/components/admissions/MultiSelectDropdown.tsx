"use client";

import React, { useEffect, useRef, useState } from "react";

interface MultiSelectDropdownProps {
  label: string;
  options: string[];
  /** Selected values. An empty array or ["All"] both mean "no filter". */
  selected: string[];
  onChange: (values: string[]) => void;
}

/** Multi-select variant of FilterDropdown — checkboxes instead of radio-style
 * single choice, with an "All <label>" option that clears every specific
 * selection. Built for the Semester filter now that there's more than one
 * semester of real data, but generic enough to reuse elsewhere. */
export default function MultiSelectDropdown({
  label,
  options,
  selected,
  onChange,
}: MultiSelectDropdownProps) {
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

  const isAll = selected.length === 0 || selected.includes("All");

  function toggleOption(option: string) {
    if (isAll) {
      // Coming from "All" state, picking one option means "just this one".
      onChange([option]);
      return;
    }
    if (selected.includes(option)) {
      const next = selected.filter((s) => s !== option);
      // Nothing left selected falls back to "All" rather than an
      // impossible-to-read empty filter.
      onChange(next.length > 0 ? next : ["All"]);
    } else {
      onChange([...selected, option]);
    }
  }

  const buttonLabel = isAll
    ? `All ${label}`
    : selected.length === 1
    ? selected[0]
    : `${selected.length} ${label} selected`;

  return (
    <div className="relative" ref={ref}>
      <button
        type="button"
        onClick={() => setIsOpen((prev) => !prev)}
        className="flex min-w-[200px] items-center justify-between gap-2 rounded-lg border border-gray-200 bg-white px-4 py-2.5 text-sm font-medium text-gray-700 shadow-theme-xs hover:bg-gray-50 dark:border-gray-800 dark:bg-white/[0.03] dark:text-gray-300 dark:hover:bg-white/[0.05]"
      >
        <span className="truncate">{buttonLabel}</span>
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
        <div className="absolute z-20 mt-2 w-full min-w-[220px] rounded-lg border border-gray-200 bg-white py-1.5 shadow-theme-lg dark:border-gray-800 dark:bg-gray-900">
          <button
            type="button"
            onClick={() => {
              onChange(["All"]);
              setIsOpen(false);
            }}
            className={`block w-full px-4 py-2 text-left text-sm ${
              isAll
                ? "bg-brand-50 text-brand-600 dark:bg-brand-500/10 dark:text-brand-400"
                : "text-gray-600 hover:bg-gray-50 dark:text-gray-300 dark:hover:bg-white/[0.05]"
            }`}
          >
            All {label}
          </button>
          <div className="my-1 border-t border-gray-100 dark:border-gray-800" />
          {options.map((option) => {
            const checked = !isAll && selected.includes(option);
            return (
              <button
                key={option}
                type="button"
                onClick={() => toggleOption(option)}
                className="flex w-full items-center gap-2.5 px-4 py-2 text-left text-sm text-gray-600 hover:bg-gray-50 dark:text-gray-300 dark:hover:bg-white/[0.05]"
              >
                <span
                  className={`flex h-4 w-4 shrink-0 items-center justify-center rounded border ${
                    checked
                      ? "border-brand-500 bg-brand-500"
                      : "border-gray-300 dark:border-gray-600"
                  }`}
                >
                  {checked && (
                    <svg className="h-3 w-3 text-white" viewBox="0 0 12 12" fill="none">
                      <path
                        d="M2.5 6.5L4.75 8.75L9.5 3.5"
                        stroke="currentColor"
                        strokeWidth="1.5"
                        strokeLinecap="round"
                        strokeLinejoin="round"
                      />
                    </svg>
                  )}
                </span>
                <span className={checked ? "font-medium text-gray-800 dark:text-white/90" : ""}>
                  {option}
                </span>
              </button>
            );
          })}
          {/* <div className="mt-1 border-t border-gray-100 px-4 pt-2 dark:border-gray-800">
            <button
              type="button"
              onClick={() => setIsOpen(false)}
              className="w-full rounded-md bg-brand-500 py-1.5 text-sm font-medium text-white hover:bg-brand-600"
            >
              Done
            </button>
          </div> */}
        </div>
      )}
    </div>
  );
}
