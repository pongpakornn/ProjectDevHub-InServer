"use client";

import { useState } from "react";
import Link from "next/link";
import { usePathname } from "next/navigation";
import { 
  LayoutDashboard, 
  User, 
  Users, 
  TestTube, 
  GitFork, 
  Tv,
  Terminal,
  RotateCw,
  Box,
  X
} from "lucide-react";

interface SidebarProps {
  isCollapsed: boolean;
  setIsCollapsed: (value: boolean | ((prev: boolean) => boolean)) => void;
}

const menuItems = [
  { name: "DASHBOARD", href: "/dashboard", icon: LayoutDashboard },
  { name: "Solo Work", href: "/dashboard/solo", icon: User },
  { name: "Team Work", href: "/dashboard/team", icon: Users },
  { name: "Tester Automation", href: "/dashboard/testing", icon: TestTube }, // 👈 อัปเดต Path ให้ตรงกับ app/dashboard/testing/page.tsx
  { name: "Flow Diagram", href: "/dashboard/flow", icon: GitFork },
  { name: "Present Station", href: "/dashboard/present", icon: Tv },
  { name: "3D Model Test", href: "/dashboard/test3d", icon: Box }, // 👈 เมนูทดสอบ 3D model viewer (หมุนได้ทุกแกน)
];

export default function Sidebar({ isCollapsed, setIsCollapsed }: SidebarProps) {
  const pathname = usePathname();
  const [showDevCard, setShowDevCard] = useState(false);

  return (
    <>
      <aside
        className={`bg-[#0d0e12] text-zinc-300 min-h-screen flex flex-col border-r border-zinc-800/80 transition-all duration-300 relative select-none ${
          isCollapsed ? "w-20" : "w-64"
        }`}
      >
        {/* ========================================================= */}
        {/* 🟢 BRAND HEADER */}
        {/* ========================================================= */}
        <div className="h-16 px-4 flex items-center justify-between border-b border-zinc-800/60 relative">
          <div className={`flex items-center gap-3 min-w-0 ${isCollapsed ? "w-full justify-center" : ""}`}>
            {/* Terminal Prompt Icon (>_) */}
            <div className="w-9 h-9 rounded-xl bg-emerald-950/80 border border-emerald-500/40 flex items-center justify-center text-emerald-400 font-mono font-bold shrink-0 shadow-sm shadow-emerald-950/50">
              <Terminal className="w-5 h-5 stroke-[2.5]" />
            </div>

            {!isCollapsed && (
              <span className="font-mono font-black tracking-wider text-white text-sm leading-none truncate">
                PROJECTDEVHUB
              </span>
            )}
          </div>
        </div>

        {/* Menu Section */}
        <div className="p-3 flex-1 overflow-x-hidden space-y-4">
          {!isCollapsed && (
            <p className="text-[10px] font-bold text-zinc-500 uppercase tracking-widest px-3 pt-2">
              MAIN MENU
            </p>
          )}

          <nav className="space-y-1.5">
            {menuItems.map((item) => {
              const Icon = item.icon;
              const isActive = pathname === item.href;

              return (
                <Link
                  key={item.href}
                  href={item.href}
                  title={isCollapsed ? item.name : undefined}
                  aria-current={isActive ? "page" : undefined}
                  className={`flex items-center gap-3 px-3 py-2.5 rounded-xl text-xs font-semibold transition-all ${
                    isActive
                      ? "bg-emerald-500/15 text-emerald-400 border border-emerald-500/30 shadow-md shadow-emerald-500/5 font-bold"
                      : "text-zinc-400 hover:bg-zinc-800/50 hover:text-zinc-200"
                  } ${isCollapsed ? "justify-center px-0 py-3" : ""}`}
                >
                  <Icon className={`w-4 h-4 min-w-4 shrink-0 ${isActive ? "text-emerald-400" : "text-zinc-400"}`} />
                  {!isCollapsed && (
                    <span className="whitespace-nowrap truncate">
                      {item.name}
                    </span>
                  )}
                </Link>
              );
            })}
          </nav>
        </div>
      </aside>

      {/* ========================================================= */}
      {/* 🚀 FLOATING DEVELOPER BADGE (P.U) */}
      {/* ========================================================= */}
      <div className="fixed bottom-5 right-5 z-50 flex flex-col items-end gap-3 pointer-events-auto">
        {showDevCard && (
          <div className="w-72 bg-[#0d0e12]/95 backdrop-blur-md border border-zinc-800 rounded-2xl p-4 shadow-2xl shadow-black/80 text-zinc-200 animate-in fade-in slide-in-from-bottom-3 duration-200">
            <div className="flex items-center justify-between border-b border-zinc-800/80 pb-3 mb-3">
              <div className="flex items-center gap-2">
                <span className="flex h-2 w-2 relative">
                  <span className="animate-ping absolute inline-flex h-full w-full rounded-full bg-emerald-400 opacity-75"></span>
                  <span className="relative inline-flex rounded-full h-2 w-2 bg-emerald-500"></span>
                </span>
                <span className="text-[11px] font-mono font-bold tracking-wider text-emerald-400 uppercase">
                  DEVELOPER PROFILE
                </span>
              </div>
              <button
                onClick={() => setShowDevCard(false)}
                className="text-zinc-500 hover:text-zinc-300 p-1 rounded-lg hover:bg-zinc-800/60 transition-colors"
              >
                <X className="w-4 h-4" />
              </button>
            </div>

            <div className="space-y-3">
              <div className="flex items-center gap-3">
                <div className="w-12 h-12 rounded-xl bg-linear-to-br from-zinc-800 to-zinc-900 border border-zinc-700/60 flex items-center justify-center text-cyan-400 font-mono font-black text-sm shadow-inner shrink-0">
                  P.U
                </div>
                <div className="flex flex-col min-w-0">
                  <h4 className="text-sm font-bold text-white truncate">
                    Pongpakorn Urang
                  </h4>
                  <p className="text-[11px] text-zinc-400 truncate">
                    Full-Stack Engineer
                  </p>
                </div>
              </div>

              <div className="bg-zinc-900/80 rounded-xl p-2.5 border border-zinc-800/80 space-y-1.5 text-[11px] font-mono">
                <div className="flex justify-between text-zinc-400">
                  <span>Project:</span>
                  <span className="text-white font-bold">PROJECTDEVHUB</span>
                </div>
                <div className="flex justify-between text-zinc-400">
                  <span>Year:</span>
                  <span className="text-emerald-400 font-bold">© 2026</span>
                </div>
              </div>
            </div>
          </div>
        )}

        <button
          onClick={() => setShowDevCard((prev) => !prev)}
          className={`group relative w-11 h-11 rounded-full bg-[#121318]/90 backdrop-blur-md border border-zinc-700/80 flex items-center justify-center shadow-lg shadow-black/50 hover:border-cyan-400/80 hover:scale-105 active:scale-95 transition-all duration-200 ${
            showDevCard ? "ring-2 ring-cyan-500/50 border-cyan-400" : ""
          }`}
          title="Developer Information"
          aria-label="Developer Information"
        >
          <div className="absolute inset-0 rounded-full bg-cyan-500/10 opacity-0 group-hover:opacity-100 transition-opacity" />
          
          <span className="font-mono font-black text-xs tracking-wider text-cyan-400 group-hover:text-white transition-colors">
            P.U
          </span>

          <span className="absolute top-0 right-0 w-3 h-3 bg-emerald-500 border-2 border-[#0d0e12] rounded-full" />
        </button>
      </div>
    </>
  );
}