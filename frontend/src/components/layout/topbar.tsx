"use client";

import { ChevronLeft, ChevronRight, Menu } from "lucide-react";
import LogoutButton from "@/components/ui/buttons/logout-button";

interface TopbarProps {
  isCollapsed: boolean;
  onToggleSidebar: () => void;
  onOpenMobileMenu: () => void;
}

export default function Topbar({ isCollapsed, onToggleSidebar, onOpenMobileMenu }: TopbarProps) {
  return (
    <header className="h-16 bg-[#0d0e12] border-b border-zinc-800/80 px-4 sm:px-6 flex items-center justify-between select-none">
      {/* Left Side: Sidebar Toggle & App Title */}
      <div className="flex items-center gap-3 text-xs font-bold text-zinc-200 min-w-0">
        {/* Desktop: ยุบ/ขยาย Sidebar แบบ Static (แสดงเฉพาะจอ >= lg) */}
        <button
          onClick={onToggleSidebar}
          className="hidden lg:flex p-2 text-indigo-400 hover:text-white bg-indigo-950/40 hover:bg-indigo-900/60 border border-indigo-500/30 rounded-lg transition-all cursor-pointer items-center justify-center shadow-xs"
          title={isCollapsed ? "Expand Sidebar" : "Collapse Sidebar"}
        >
          {isCollapsed ? (
            <ChevronRight className="w-4 h-4 stroke-[2.5]" />
          ) : (
            <ChevronLeft className="w-4 h-4 stroke-[2.5]" />
          )}
        </button>

        {/* Mobile/Tablet: เปิด Off-canvas Drawer (แสดงเฉพาะจอ < lg) */}
        <button
          onClick={onOpenMobileMenu}
          className="lg:hidden p-2 text-indigo-400 hover:text-white bg-indigo-950/40 hover:bg-indigo-900/60 border border-indigo-500/30 rounded-lg transition-all cursor-pointer flex items-center justify-center shadow-xs shrink-0"
          title="เปิดเมนู"
          aria-label="เปิดเมนู"
        >
          <Menu className="w-4 h-4 stroke-[2.5]" />
        </button>

        <span className="font-mono font-black tracking-wider text-white text-sm truncate">
          PROJECTDEVHUB
        </span>
      </div>

      {/* Right Side: Logout Button */}
      <div className="flex items-center gap-3 shrink-0">
        <LogoutButton />
      </div>
    </header>
  );
}