'use client'

import React from 'react'
import { motion } from 'framer-motion'

export type DbStatus = 'checking' | 'online' | 'offline'

interface LoginCardProps {
  children: React.ReactNode
  isFlipped: boolean
  dbStatus?: DbStatus
}

export function LoginCard({ children, isFlipped, dbStatus = 'checking' }: LoginCardProps) {
  // Config ไฟสัญญาณ (Dot Color, Glow Shadow & Smooth Breathing Animation)
  const statusConfig = {
    checking: {
      dotColor: 'bg-amber-400 shadow-[0_0_8px_rgba(251,191,36,0.8)]',
      pulseAnimation: 'animate-pulse duration-1000',
      tooltip: 'System Status: Checking Connection...',
    },
    online: {
      dotColor: 'bg-emerald-400 shadow-[0_0_10px_rgba(52,211,153,0.9)]',
      pulseAnimation: 'animate-pulse duration-1500',
      tooltip: 'System Status: Connected (Online)',
    },
    offline: {
      dotColor: 'bg-rose-500 shadow-[0_0_10px_rgba(244,63,94,0.9)]',
      pulseAnimation: 'animate-pulse duration-700',
      tooltip: 'System Status: Disconnected (Offline)',
    },
  }[dbStatus]

  return (
    <div className="relative z-20 w-full max-w-lg" style={{ perspective: '1200px' }}>
      
      {/* 🟢/🟡/🔴 Minimal Brand Badge + Smooth Breathing Light */}
      <div className="absolute top-6 left-1/2 -translate-x-1/2 z-30 pointer-events-none">
        <div 
          className="inline-flex items-center gap-2.5 rounded-full border border-zinc-800/80 bg-zinc-900/90 px-4 py-1.5 text-xs font-semibold tracking-wider text-zinc-100 shadow-lg backdrop-blur-md transition-all duration-300"
          title={statusConfig.tooltip}
        >
          {/* Smooth Breathing LED Light */}
          <span className="relative flex h-2.5 w-2.5 items-center justify-center">
            <span 
              className={`h-2.5 w-2.5 rounded-full transition-all duration-500 ${statusConfig.dotColor} ${statusConfig.pulseAnimation}`} 
            />
          </span>

          {/* Brand Name เท่านั้น (ไม่มี SQL Server Text แล้ว) */}
          <span>NONDEVHUB SYSTEM</span>
        </div>
      </div>

      {/* Flip Card Motion */}
      <motion.div
        animate={{ rotateY: isFlipped ? 180 : 0 }}
        transition={{ duration: 0.7, ease: [0.4, 0.2, 0.2, 1] }}
        style={{ transformStyle: 'preserve-3d' }}
        className="relative w-full"
      >
        {/* Frosted Glass Container */}
        <div className="relative rounded-3xl border border-white/60 bg-white/20 p-8 pt-16 shadow-2xl shadow-slate-900/10 backdrop-blur-xl ring-1 ring-white/40 min-h-120">
          <div className="pointer-events-none absolute inset-0 rounded-3xl bg-linear-to-br from-white/40 via-transparent to-transparent opacity-70" />
          <div className="relative z-10">{children}</div>
        </div>
      </motion.div>
    </div>
  )
}