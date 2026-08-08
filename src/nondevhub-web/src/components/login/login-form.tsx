'use client'

import React, { useState, useEffect } from 'react'
import { createPortal } from 'react-dom'
import { motion, AnimatePresence } from 'framer-motion'
import { Lock, User, Eye, EyeOff, ArrowRight, BadgeCheck, AlertCircle, CheckCircle2, X, ArrowLeft, KeyRound, Database } from 'lucide-react'
import { loginApi, registerApi, resetPasswordApi } from '@/services/auth.service'
import { useRouter } from 'next/navigation'

interface ToastState {
  show: boolean
  message: string
  type: 'error' | 'success'
}

interface WaveInputProps {
  label: string
  type: string
  name: string
  value: string
  onChange: (e: React.ChangeEvent<HTMLInputElement>) => void
  icon: React.ReactNode
  rightElement?: React.ReactNode
  autoComplete?: string
}

function WaveInput({
  label,
  type,
  name,
  value,
  onChange,
  icon,
  rightElement,
  autoComplete = 'on',
}: WaveInputProps) {
  const [isFocused, setIsFocused] = useState(false)
  const isFilled = value.length > 0
  const isFloating = isFocused || isFilled

  return (
    <div className="relative my-6 w-full">
      <div className="pointer-events-none absolute left-0 top-3 flex items-center text-slate-500">
        {icon}
      </div>

      <input
        type={type}
        name={name}
        value={value}
        onChange={onChange}
        onFocus={() => setIsFocused(true)}
        onBlur={() => setIsFocused(false)}
        autoComplete={autoComplete}
        className="peer w-full border-b-2 border-slate-300/80 bg-transparent py-2.5 pl-8 pr-10 text-sm font-bold text-slate-900 outline-none transition-colors duration-300 focus:border-zinc-900 autofill:bg-transparent"
      />

      <label className="pointer-events-none absolute left-8 top-2.5 flex">
        {label.split('').map((char, index) => (
          <span
            key={index}
            className="inline-block text-xs font-semibold transition-all duration-300 ease-[cubic-bezier(0.68,-0.55,0.265,1.55)]"
            style={{
              transitionDelay: `${index * 25}ms`,
              transform: isFloating ? 'translateY(-22px)' : 'translateY(0)',
              color: isFloating ? '#09090b' : '#475569',
            }}
          >
            {char === ' ' ? '\u00A0' : char}
          </span>
        ))}
      </label>

      {rightElement && (
        <div className="absolute right-0 top-2.5 z-10 flex items-center">
          {rightElement}
        </div>
      )}
    </div>
  )
}

interface LoginFormProps {
  isFlipped: boolean
  setIsFlipped: (flipped: boolean) => void
}

export function LoginForm({ isFlipped, setIsFlipped }: LoginFormProps) {
  const router = useRouter()
  const [state, setState] = useState<'login' | 'signup'>('login')
  const [showPassword, setShowPassword] = useState(false)
  const [showNewPassword, setShowNewPassword] = useState(false)
  const [mounted, setMounted] = useState(false)

  const [rememberMe, setRememberMe] = useState(false)
  const [dbStatus, setDbStatus] = useState<'checking' | 'online' | 'offline'>('checking')

  const [formData, setFormData] = useState({
    name: '',
    userId: '',
    password: '',
  })

  const [resetData, setResetData] = useState({
    userId: '',
    newPassword: '',
    confirmPassword: '',
  })

  const [toast, setToast] = useState<ToastState>({
    show: false,
    message: '',
    type: 'error',
  })

  useEffect(() => {
    setMounted(true)
    const savedUserId = localStorage.getItem('remembered_user_id')
    if (savedUserId) {
      setFormData((prev) => ({ ...prev, userId: savedUserId }))
      setRememberMe(true)
    }
    checkDbHealth()
  }, [])

  const checkDbHealth = async () => {
    try {
      const res = await fetch('/api/health/db-check', { method: 'GET', cache: 'no-store' })
      if (res.ok) {
        setDbStatus('online')
      } else {
        setDbStatus('offline')
      }
    } catch {
      setDbStatus('offline')
    }
  }

  const handleLoginSuccess = (userId: string) => {
    if (rememberMe) {
      localStorage.setItem('remembered_user_id', userId)
    } else {
      localStorage.removeItem('remembered_user_id')
    }
  }

  const triggerToast = (message: string, type: 'error' | 'success' = 'error') => {
    setToast({ show: true, message, type })
    setTimeout(() => {
      setToast((prev) => ({ ...prev, show: false }))
    }, 3500)
  }

  const handleChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const { name, value } = e.target
    setFormData((prev) => ({ ...prev, [name]: value }))
  }

  const handleResetChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const { name, value } = e.target
    setResetData((prev) => ({ ...prev, [name]: value }))
  }

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault()

    if (state === 'signup' && !formData.name.trim()) {
      triggerToast('กรุณากรอก ชื่อ - นามสกุล ให้ครบถ้วน')
      return
    }
    if (!formData.userId.trim()) {
      triggerToast('กรุณากรอก User ID (รหัสพนักงาน)')
      return
    }
    if (!formData.password) {
      triggerToast('กรุณากรอกรหัสผ่าน')
      return
    }

    try {
      if (state === 'login') {
        const data = await loginApi({
          userId: formData.userId.trim(),
          password: formData.password,
        })
        
        handleLoginSuccess(formData.userId.trim())
        window.sessionStorage.setItem('nondevhub-user', JSON.stringify(data.user))
        triggerToast(data.title || 'เข้าสู่ระบบสำเร็จ!', 'success')
        
        setTimeout(() => {
          router.push('/dashboard')
        }, 1000)
      } else {
        const data = await registerApi({
          userId: formData.userId.trim(),
          name: formData.name.trim(),
          password: formData.password,
        })
        triggerToast(data.title || 'ลงทะเบียนสำเร็จ!', 'success')
        setState('login')
      }
    } catch (error) {
      triggerToast(error instanceof Error ? error.message : 'เชื่อมต่อเซิร์ฟเวอร์ไม่ได้ กรุณาลองใหม่')
    }
  }

  const handleResetSubmit = async (e: React.FormEvent) => {
    e.preventDefault()

    if (!resetData.userId.trim()) {
      triggerToast('กรุณากรอก User ID (รหัสพนักงาน)')
      return
    }
    if (!resetData.newPassword) {
      triggerToast('กรุณากรอกรหัสผ่านใหม่')
      return
    }
    if (resetData.newPassword !== resetData.confirmPassword) {
      triggerToast('รหัสผ่านใหม่และยืนยันรหัสผ่านไม่ตรงกัน')
      return
    }

    try {
      const data = await resetPasswordApi({
        userId: resetData.userId.trim(),
        newPassword: resetData.newPassword,
      })

      triggerToast(data.title || 'เปลี่ยนรหัสผ่านสำเร็จเรียบร้อยแล้ว!', 'success')
      setTimeout(() => {
        setIsFlipped(false)
        setResetData({ userId: '', newPassword: '', confirmPassword: '' })
      }, 1200)
    } catch (error) {
      triggerToast(error instanceof Error ? error.message : 'เชื่อมต่อเซิร์ฟเวอร์ไม่ได้ กรุณาลองใหม่')
    }
  }

  return (
    <div className="relative w-full">
      {/* 🔴 ด้านหน้าการ์ด: Login / Register */}
      <div
        className={`transition-all duration-300 ${
          isFlipped ? 'pointer-events-none absolute inset-0 invisible opacity-0' : 'relative z-10 visible opacity-100'
        }`}
      >
        <form onSubmit={handleSubmit} noValidate className="space-y-2">
          {/* DB Status Badge */}
          {/* <div className="flex justify-end">
            <div className="inline-flex items-center gap-1.5 rounded-full border border-slate-200/80 bg-slate-50/50 px-2.5 py-0.5 text-[10px] font-medium text-slate-600">
              <Database className="h-3 w-3 text-slate-500" />
              <span>SQL Server:</span>
              {dbStatus === 'checking' && <span className="text-amber-500">Checking...</span>}
              {dbStatus === 'online' && <span className="font-semibold text-emerald-600">Online</span>}
              {dbStatus === 'offline' && <span className="font-semibold text-rose-600">Offline</span>}
            </div>
          </div> */}

          <div className="mb-6 space-y-1 text-center">
            <AnimatePresence mode="wait">
              <motion.h1
                key={state}
                initial={{ opacity: 0, y: -8 }}
                animate={{ opacity: 1, y: 0 }}
                exit={{ opacity: 0, y: 8 }}
                transition={{ duration: 0.15 }}
                className="text-2xl font-extrabold tracking-tight text-slate-900 sm:text-3xl drop-shadow-xs"
              >
                {state === 'login' ? 'เข้าสู่ระบบ' : 'ลงทะเบียนใช้งาน'}
              </motion.h1>
            </AnimatePresence>

            <AnimatePresence mode="wait">
              <motion.p
                key={state + '-subtitle'}
                initial={{ opacity: 0 }}
                animate={{ opacity: 1 }}
                exit={{ opacity: 0 }}
                transition={{ duration: 0.15, delay: 0.05 }}
                className="text-xs font-medium text-slate-600"
              >
                {state === 'login'
                  ? 'กรุณากรอกข้อมูลเพื่อเข้าสู่ระบบ NonDevHub System'
                  : 'สร้างบัญชีผู้ใช้ใหม่สำหรับเจ้าหน้าที่ในระบบ'}
              </motion.p>
            </AnimatePresence>
          </div>

          <AnimatePresence>
            {state === 'signup' && (
              <motion.div
                initial={{ opacity: 0, height: 0 }}
                animate={{ opacity: 1, height: 'auto' }}
                exit={{ opacity: 0, height: 0 }}
                transition={{ duration: 0.25 }}
              >
                <WaveInput
                  label="ชื่อ - นามสกุล"
                  type="text"
                  name="name"
                  value={formData.name}
                  onChange={handleChange}
                  icon={<User className="h-4 w-4" />}
                />
              </motion.div>
            )}
          </AnimatePresence>

          <WaveInput
            label="User ID (รหัสพนักงาน)"
            type="text"
            name="userId"
            value={formData.userId}
            onChange={handleChange}
            icon={<BadgeCheck className="h-4 w-4" />}
          />

          <div>
            <WaveInput
              label="รหัสผ่าน"
              type={showPassword ? 'text' : 'password'}
              name="password"
              value={formData.password}
              onChange={handleChange}
              icon={<Lock className="h-4 w-4" />}
              rightElement={
                <button
                  type="button"
                  onClick={() => setShowPassword(!showPassword)}
                  className="p-1 text-slate-500 transition-colors hover:text-slate-900"
                >
                  {showPassword ? <EyeOff className="h-4 w-4 text-zinc-900" /> : <Eye className="h-4 w-4" />}
                </button>
              }
            />
            {state === 'login' && (
              <div className="-mt-1 flex items-center justify-between">
                {/* 🎯 Custom Checkbox ตาม Style ที่นนท์ส่งมา + เปลี่ยนคำว่า Remember */}
                <label className="inline-flex cursor-pointer items-center gap-2 select-none group">
                  <div className="relative flex items-center">
                    <input
                      type="checkbox"
                      id="rememberMe"
                      checked={rememberMe}
                      onChange={(e) => setRememberMe(e.target.checked)}
                      className="peer hidden"
                    />
                    <div
                        className={`relative h-5.5 w-5.5 rounded border border-slate-300 bg-white transition-all duration-100 ease-in-out
                        after:absolute after:left-1.5 after:top-px after:h-3 after:w-1.5 after:rotate-45 after:border-b-2 after:border-r-2 after:border-white after:opacity-0 after:scale-0 after:transition-all after:duration-300 after:delay-150
                        peer-checked:border-transparent peer-checked:bg-[#6871f1] peer-checked:animate-jelly peer-checked:after:opacity-100 peer-checked:after:scale-100`}
                    />
                  </div>
                  <span className="text-xs font-semibold text-slate-600 transition-colors hover:text-slate-900">
                    Remember
                  </span>
                </label>

                <button
                  type="button"
                  onClick={() => setIsFlipped(true)}
                  className="text-xs font-semibold text-slate-600 transition-colors hover:text-zinc-900"
                >
                  ลืมรหัสผ่าน?
                </button>
              </div>
            )}
          </div>

          <motion.button
            whileHover={{ scale: 1.01 }}
            whileTap={{ scale: 0.98 }}
            type="submit"
            className="group relative mt-8! flex w-full cursor-pointer items-center justify-center gap-2 overflow-hidden rounded-xl bg-zinc-900 py-3 text-sm font-semibold text-white shadow-xl shadow-zinc-900/25 transition-all duration-300 hover:bg-zinc-800"
          >
            <span className="absolute inset-0 h-full w-1/2 -translate-x-full -skew-x-12 bg-white/15 transition-transform duration-1000 ease-in-out group-hover:translate-x-[300%]" />
            <span className="relative z-10 flex items-center gap-2">
              {state === 'login' ? 'เข้าสู่ระบบ' : 'ยืนยันลงทะเบียน'}
              <ArrowRight className="h-4 w-4 transition-transform duration-200 group-hover:translate-x-1" />
            </span>
          </motion.button>

          <div className="pt-3 text-center">
            <button
              type="button"
              onClick={() => setState((prev) => (prev === 'login' ? 'signup' : 'login'))}
              className="inline-flex cursor-pointer items-center gap-1.5 text-xs text-slate-600 transition-colors hover:text-slate-900"
            >
              <span>{state === 'login' ? 'ยังไม่มีบัญชีผู้ใช้งาน?' : 'มีบัญชีผู้ใช้งานอยู่แล้ว?'}</span>
              <span className="font-bold text-zinc-900 underline underline-offset-4 transition-colors hover:text-zinc-700">
                {state === 'login' ? 'ลงทะเบียนที่นี่' : 'เข้าสู่ระบบที่นี่'}
              </span>
            </button>
          </div>
        </form>
      </div>

      {/* 🔵 ด้านหลังการ์ด: Reset Password */}
      <div
        className={`transition-all duration-300 ${
          !isFlipped ? 'pointer-events-none absolute inset-0 invisible opacity-0' : 'relative z-20 visible opacity-100'
        }`}
        style={{ transform: 'rotateY(180deg)' }}
      >
        <form onSubmit={handleResetSubmit} noValidate className="space-y-1">
          <div className="mb-2">
            <button
              type="button"
              onClick={() => setIsFlipped(false)}
              className="inline-flex cursor-pointer items-center gap-1.5 rounded-lg border border-slate-300/80 bg-white/60 px-2.5 py-1 text-xs text-slate-700 transition-all hover:bg-white hover:text-slate-900"
            >
              <ArrowLeft className="h-3.5 w-3.5" />
              <span>ย้อนกลับ</span>
            </button>
          </div>

          <div className="mb-4 space-y-1 text-center">
            <h1 className="flex items-center justify-center gap-2 text-xl font-bold tracking-tight text-slate-900 sm:text-2xl">
              <KeyRound className="h-5 w-5 text-zinc-900" />
              ตั้งรหัสผ่านใหม่
            </h1>
            <p className="text-xs font-medium text-slate-600">
              กรอก User ID และกำหนดรหัสผ่านใหม่เพื่อเข้าใช้งาน
            </p>
          </div>

          <WaveInput
            label="User ID (รหัสพนักงาน)"
            type="text"
            name="userId"
            value={resetData.userId}
            onChange={handleResetChange}
            icon={<BadgeCheck className="h-4 w-4" />}
          />

          <WaveInput
            label="รหัสผ่านใหม่"
            type={showNewPassword ? 'text' : 'password'}
            name="newPassword"
            value={resetData.newPassword}
            onChange={handleResetChange}
            icon={<Lock className="h-4 w-4" />}
            rightElement={
              <button
                type="button"
                onClick={() => setShowNewPassword(!showNewPassword)}
                className="p-1 text-slate-500 transition-colors hover:text-slate-900"
              >
                {showNewPassword ? <EyeOff className="h-4 w-4 text-zinc-900" /> : <Eye className="h-4 w-4" />}
              </button>
            }
          />

          <WaveInput
            label="ยืนยันรหัสผ่านใหม่"
            type={showNewPassword ? 'text' : 'password'}
            name="confirmPassword"
            value={resetData.confirmPassword}
            onChange={handleResetChange}
            icon={<Lock className="h-4 w-4" />}
          />

          <motion.button
            whileHover={{ scale: 1.01 }}
            whileTap={{ scale: 0.98 }}
            type="submit"
            className="group relative mt-6! flex w-full cursor-pointer items-center justify-center gap-2 overflow-hidden rounded-xl bg-zinc-900 py-3 text-sm font-semibold text-white shadow-xl shadow-zinc-900/25 transition-all duration-300 hover:bg-zinc-800"
          >
            <span className="relative z-10 flex items-center gap-2">
              ยืนยันเปลี่ยนรหัสผ่าน
              <ArrowRight className="h-4 w-4 transition-transform duration-200 group-hover:translate-x-1" />
            </span>
          </motion.button>

          <div className="pt-3 text-center">
            <button
              type="button"
              onClick={() => setIsFlipped(false)}
              className="inline-flex cursor-pointer items-center gap-1.5 text-xs text-slate-600 transition-colors hover:text-slate-900"
            >
              <ArrowLeft className="h-3.5 w-3.5" />
              <span>ย้อนกลับไปหน้าเข้าสู่ระบบ</span>
            </button>
          </div>
        </form>
      </div>

      {/* 📍 Toast Notification Portal */}
      {mounted &&
        createPortal(
          <AnimatePresence>
            {toast.show && (
              <motion.div
                initial={{ opacity: 0, y: 50, scale: 0.9 }}
                animate={{ opacity: 1, y: 0, scale: 1 }}
                exit={{ opacity: 0, y: 20, scale: 0.95 }}
                transition={{ type: 'spring', stiffness: 400, damping: 25 }}
                className={`fixed bottom-8 right-8 z-50 flex items-center gap-3 rounded-2xl border px-4 py-3.5 shadow-xl backdrop-blur-xl ${
                  toast.type === 'error'
                    ? 'border-rose-200/90 bg-white/90 text-rose-700 shadow-rose-100/50'
                    : 'border-emerald-200/90 bg-white/90 text-emerald-800 shadow-emerald-100/50'
                }`}
              >
                {toast.type === 'error' ? (
                  <AlertCircle className="h-5 w-5 shrink-0 text-rose-600" />
                ) : (
                  <CheckCircle2 className="h-5 w-5 shrink-0 text-emerald-600" />
                )}
                <p className="pr-2 text-xs font-semibold text-slate-800">{toast.message}</p>
                <button
                  type="button"
                  onClick={() => setToast((prev) => ({ ...prev, show: false }))}
                  className="rounded-lg p-1 text-slate-400 transition-colors hover:bg-slate-100 hover:text-slate-700"
                >
                  <X className="h-3.5 w-3.5" />
                </button>
              </motion.div>
            )}
          </AnimatePresence>,
          document.body
        )}
    </div>
  )
}