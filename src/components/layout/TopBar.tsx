"use client";

import { RefreshCw } from "lucide-react";
import { cn } from "@/lib/utils/cn";

interface TopBarProps {
  title: string;
  subtitle?: string;
  bodyName?: string;
  onRefresh?: () => void;
}

export function TopBar({ title, subtitle, bodyName, onRefresh }: TopBarProps) {
  return (
    <header className="sticky top-0 z-20 glass-1 border-b border-line">
      <div className="flex items-center justify-between px-4 lg:px-6 h-14">
        <div className="flex flex-col">
          <div className="flex items-center gap-2">
            <span className="text-sm text-text-ghost">🙏</span>
            {bodyName && (
              <span className="text-xs text-text-soft font-sarabun thai-text">
                {bodyName}
              </span>
            )}
          </div>
          <h1 className="font-kanit font-extrabold text-xl text-text-main thai-text leading-tight">
            {title}
          </h1>
          {subtitle && (
            <span className="text-xs text-text-ghost font-jetbrains">
              {subtitle}
            </span>
          )}
        </div>
        <div className="flex items-center gap-2">
          {onRefresh && (
            <button
              onClick={onRefresh}
              className="h-9 w-9 rounded-lg flex items-center justify-center text-text-ghost hover:text-text-soft hover:bg-ink-lift transition-colors"
              aria-label="รีเฟรช"
            >
              <RefreshCw className="h-4 w-4" />
            </button>
          )}
        </div>
      </div>
    </header>
  );
}
