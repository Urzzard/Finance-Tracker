'use client';

import { useState, useSyncExternalStore } from 'react';
import { ChevronDown, ChevronRight } from 'lucide-react';
import { cn } from '@/lib/utils';

interface CollapsibleSectionProps {
  title: string;
  sectionKey: string;
  defaultExpanded?: boolean;
  children: React.ReactNode;
  className?: string;
  actions?: React.ReactNode;
  count?: number;
}

function useHydrated() {
  return useSyncExternalStore(
    () => () => {},
    () => true,
    () => false
  );
}

export function CollapsibleSection({
  title,
  sectionKey,
  defaultExpanded = false,
  children,
  className,
  actions,
  count,
}: CollapsibleSectionProps) {
  const isHydrated = useHydrated();
  
  const [isExpanded, setIsExpanded] = useState(() => {
    if (!isHydrated) return defaultExpanded;
    const stored = localStorage.getItem(`section_${sectionKey}`);
    return stored !== null ? stored === 'true' : defaultExpanded;
  });

  const toggle = () => {
    const newValue = !isExpanded;
    setIsExpanded(newValue);
    localStorage.setItem(`section_${sectionKey}`, String(newValue));
  };

  const expanded = isHydrated ? isExpanded : defaultExpanded;

  return (
    <div className={cn("bg-white dark:bg-slate-900 rounded-2xl p-6 shadow-md border border-slate-200 dark:border-slate-800 mb-8", className)}>
      <div className="flex items-center gap-3 w-full text-left mb-4">
        <button
          onClick={toggle}
          className="flex items-center gap-3 hover:opacity-80 transition-opacity flex-1 cursor-pointer"
        >
          {expanded ? (
            <ChevronDown className="w-5 h-5 text-slate-600 dark:text-slate-400" />
          ) : (
            <ChevronRight className="w-5 h-5 text-slate-600 dark:text-slate-400" />
          )}
          <h2 className="text-xl font-semibold text-slate-900 dark:text-slate-50">
            {title}
            {count !== undefined && count > 0 && (
              <span className="ml-2 text-xs text-slate-500 dark:text-slate-400 bg-slate-100 dark:bg-slate-800 px-2 py-0.5 rounded-full">
                {count}
              </span>
            )}
          </h2>
        </button>
        {actions && (
          <div className="flex-shrink-0">
            {actions}
          </div>
        )}
      </div>
      
      <div className={cn(
        "overflow-hidden transition-all duration-300",
        expanded ? "max-h-[2000px] opacity-100" : "max-h-0 opacity-0"
      )}>
        {children}
      </div>
    </div>
  );
}
