'use client'

import { useState, useEffect } from 'react'
import { Background } from '@/components/login/background'
import { LoginCard, DbStatus } from '@/components/login/login-card'
import { LoginForm } from '@/components/login/login-form'

export default function LoginPage() {
  const [isFlipped, setIsFlipped] = useState(false)
  const [dbStatus, setDbStatus] = useState<DbStatus>('checking')

  useEffect(() => {
    // 🔍 ฟังก์ชันเช็คการเชื่อมต่อ SQL Server ผ่าน Backend API
    const checkDbHealth = async () => {
      try {
        const apiUrl = process.env.NEXT_PUBLIC_API_URL || 'http://localhost:5000'
        const res = await fetch(`${apiUrl}/api/v1/health/db-check`, {
          method: 'GET',
          cache: 'no-store', // ห้ามแคช เพื่อเช็คสถานะสดๆ ทุกครั้ง
        })

        if (res.ok) {
          const data = await res.json()
          if (data.isDbConnected) {
            setDbStatus('online')
          } else {
            setDbStatus('offline')
          }
        } else {
          setDbStatus('offline')
        }
      } catch (error) {
        // หากเซิร์ฟเวอร์ดับ หรือต่อเน็ตไม่ได้ ให้แสดงเป็น Offline
        setDbStatus('offline')
      }
    }

    // เรียกทำงานครั้งแรกทันทีเมื่อโหลดหน้าเว็บ
    checkDbHealth()

    // ⏱️ เช็คสถานะซ้ำทุกๆ 30 วินาที
    const interval = setInterval(checkDbHealth, 30000)
    return () => clearInterval(interval)
  }, [])

  return (
    <Background backgroundImageUrl={process.env.NEXT_PUBLIC_LOGIN_BG_URL}>
      {/* ส่ง dbStatus ลงไปให้ LoginCard ส่องไฟสัญญาณ LED */}
      <LoginCard isFlipped={isFlipped} dbStatus={dbStatus}>
        <LoginForm isFlipped={isFlipped} setIsFlipped={setIsFlipped} />
      </LoginCard>
    </Background>
  )
}