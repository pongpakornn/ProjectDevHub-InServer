"use client";

import { ChevronLeft, ChevronRight } from "lucide-react";
import LogoutButton from "@/components/ui/buttons/logout-button";

interface TopbarProps {
  isCollapsed: boolean;
  onToggleSidebar: () => void;
}

export default function Topbar({ isCollapsed, onToggleSidebar }: TopbarProps) {
  return (
    <header className="h-16 bg-[#0d0e12] border-b border-zinc-800/80 px-6 flex items-center justify-between select-none">
      {/* Left Side: Sidebar Toggle & App Title */}
      <div className="flex items-center gap-3 text-xs font-bold text-zinc-200">
        <button
          onClick={onToggleSidebar}
          className="p-2 text-emerald-400 hover:text-white bg-emerald-950/40 hover:bg-emerald-900/60 border border-emerald-500/30 rounded-lg transition-all cursor-pointer flex items-center justify-center shadow-xs"
          title={isCollapsed ? "Expand Sidebar" : "Collapse Sidebar"}
        >
          {isCollapsed ? (
            <ChevronRight className="w-4 h-4 stroke-[2.5]" />
          ) : (
            <ChevronLeft className="w-4 h-4 stroke-[2.5]" />
          )}
        </button>
        <span className="font-mono font-black tracking-wider text-white text-sm">
          PROJECTDEVHUB
        </span>
      </div>

      {/* Right Side: Logout Button */}
      <div className="flex items-center gap-3">
        <LogoutButton />
      </div>
    </header>
  );
}