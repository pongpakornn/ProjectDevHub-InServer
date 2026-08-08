'use client'

import React from 'react'
import Image from 'next/image'

interface BackgroundProps {
  children: React.ReactNode
  backgroundImageUrl?: string
}

const DEFAULT_BACKGROUND_IMAGE_URL = '/images/login-bg.jpg'

export function Background({ children, backgroundImageUrl }: BackgroundProps) {
  const bgImageUrl =
    backgroundImageUrl ?? process.env.NEXT_PUBLIC_LOGIN_BG_URL ?? DEFAULT_BACKGROUND_IMAGE_URL

  return (
    <div className="relative min-h-screen w-full overflow-hidden bg-slate-200 text-slate-800 flex items-center justify-center select-none">
      
      {/* 🖼️ 1. Background Image - เพิ่ม Opacity จาก 30% เป็น 65% ให้เห็นรายละเอียดชัดขึ้น */}
      <div className="absolute inset-0 z-0">
        <Image
          src={bgImageUrl}
          alt="NonDevHub Background"
          fill
          priority
          sizes="100vw"
          className="object-cover object-center opacity-65 filter contrast-105 brightness-100"
        />
        
        {/* Light Overlay Gradient - ลดความหนาแน่นของสีขาวลงเพื่อให้ภาพทะลุเข้ามาได้ง่ายขึ้น */}
        <div className="absolute inset-0 bg-linear-to-b from-slate-100/30 via-slate-100/20 to-slate-200/40" />
      </div>

      {/* 🔮 2. Glow Orbs - แสงนวลๆ ด้านหลัง */}
      <div className="pointer-events-none absolute -top-32 -left-32 h-125 w-125 rounded-full bg-slate-300/40 blur-[120px] z-10" />
      <div className="pointer-events-none absolute -bottom-32 -right-32 h-140 w-140 rounded-full bg-zinc-300/40 blur-[140px] z-10" />

      {/* 📐 3. Technical Grid Pattern */}
      <div 
        className="pointer-events-none absolute inset-0 z-10 opacity-[0.06]"
        style={{
          backgroundImage: `radial-gradient(rgba(15, 23, 42, 0.8) 1px, transparent 1px)`,
          backgroundSize: '24px 24px'
        }}
      />

      {/* 🔲 4. Content Area */}
      <div className="relative z-20 w-full max-w-md px-4">
        {children}
      </div>

    </div>
  )
}