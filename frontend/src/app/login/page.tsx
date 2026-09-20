'use client';

import React, { useEffect, useRef, useState } from 'react';
import { useRouter } from 'next/navigation';
import { Terminal, UserCircle, KeyRound } from 'lucide-react';
import { Button } from '@/components/ui/buttons/button';
import { Input } from '@/components/ui/inputs/input';
import { Checkbox } from '@/components/ui/inputs/checkbox';
import { authService } from '@/services/auth.service';
import { saveSession, getRecentLogins, addRecentLogin, RecentLogin } from '@/lib/session';

export default function LoginPage() {
  const router = useRouter();
  const [username, setUsername] = useState<string>('');
  const [password, setPassword] = useState<string>('');
  const [rememberPassword, setRememberPassword] = useState<boolean>(false);
  const [isLoading, setIsLoading] = useState<boolean>(false);
  const [errorMessage, setErrorMessage] = useState<string>('');
  const [recentLogins, setRecentLogins] = useState<RecentLogin[]>([]);
  const passwordRef = useRef<HTMLInputElement>(null);

  // โหลดหลัง Mount กัน SSR/Hydration Mismatch (LocalStorage มีแค่ฝั่ง Browser)
  useEffect(() => {
    setRecentLogins(getRecentLogins());
  }, []);

  const handleSubmit = async (e: React.FormEvent<HTMLFormElement>) => {
    e.preventDefault();
    setIsLoading(true);
    setErrorMessage('');

    try {
      // ยิง API Login โดยส่ง username ไปเป็น empId ของ Backend
      const response = await authService.login({
        empId: username,
        password: password,
      });

      if (response.success && response.token && response.user) {
        // จัดเก็บ Session & User Info ลง LocalStorage (รวม sessionId เพื่อใช้จำกัด Login พร้อมกันได้ครั้งละ 1 Session)
        saveSession(response.user, response.token, response.sessionId);
        // จำ EmpId/ชื่อไว้เสมอให้คลิกเติม Username ได้เร็วขึ้นครั้งถัดไป ส่วนรหัสผ่านจะถูกจำไว้ด้วย
        // ก็ต่อเมื่อติ๊ก "จดจำรหัสผ่าน" เท่านั้น (ไม่ติ๊ก = ล้างรหัสผ่านเก่าที่เคยจำไว้ของบัญชีนี้ออกด้วย)
        addRecentLogin({
          empId: response.user.empId,
          fullName: response.user.fullName,
          password: rememberPassword ? password : undefined,
        });

        // นำทางไปยังหน้า Dashboard
        router.push('/dashboard');
      }
    } catch (err: unknown) {
      if (err instanceof Error) {
        setErrorMessage(err.message);
      } else {
        setErrorMessage('เกิดข้อผิดพลาด ไม่สามารถเข้าสู่ระบบได้');
      }
    } finally {
      setIsLoading(false);
    }
  };

  const handleCancel = () => {
    setUsername('');
    setPassword('');
    setRememberPassword(false);
    setErrorMessage('');
  };

  // คลิกการ์ด "เข้าสู่ระบบล่าสุด" — ถ้าบัญชีนี้เคยติ๊กจดจำรหัสผ่านไว้ จะเติมรหัสผ่านให้พร้อมกดเข้าสู่ระบบ
  // ได้ทันที (หรือแก้ไขต่อก่อนกดก็ได้) ถ้าไม่เคยจำรหัสผ่านไว้ ก็เติมแค่ Username แล้วโฟกัสช่องรหัสผ่านเหมือนเดิม
  const handlePickRecent = (recent: RecentLogin) => {
    setUsername(recent.empId);
    setErrorMessage('');
    if (recent.password) {
      setPassword(recent.password);
      setRememberPassword(true);
    } else {
      setPassword('');
      setRememberPassword(false);
      passwordRef.current?.focus();
    }
  };

  return (
    // พื้นหลัง + การ์ดกระจกฝ้า (Glassmorphism) โทน Indigo — ให้ตรงกับ Theme เดียวกับทั้งระบบ
    // (bg-slate-950 + Glow เบลอ ให้ความรู้สึกเดียวกับตอนกด Preview หน้า Present ที่เป็น Overlay มืดเบลอๆ)
    <div className="relative min-h-screen w-full flex flex-col items-center justify-center bg-slate-950 p-4 select-none overflow-hidden">
      <div className="absolute -top-32 -left-32 w-96 h-96 bg-indigo-500/20 rounded-full blur-3xl pointer-events-none" />
      <div className="absolute -bottom-32 -right-32 w-96 h-96 bg-violet-500/15 rounded-full blur-3xl pointer-events-none" />
      <div className="absolute inset-0 bg-linear-to-b from-transparent via-slate-950/40 to-slate-950 pointer-events-none" />

      {/* Header / Branding */}
      <div className="relative z-10 flex items-center gap-2.5 mb-6">
        <div className="w-10 h-10 rounded-xl bg-indigo-950/80 border border-indigo-500/40 flex items-center justify-center text-indigo-400 shadow-sm shadow-indigo-950/50">
          <Terminal className="w-5 h-5 stroke-[2.5]" />
        </div>
        <h1 className="font-mono font-black text-xl tracking-wider text-white uppercase">
          PROJECTDEV HUB
        </h1>
      </div>

      {/* Login Card — กระจกฝ้าโปร่งแสง ลอยบนพื้นหลังมืด (เพิ่ม Inner Highlight บางๆ ขอบบนให้ดูเป็นกระจกจริง) */}
      <div className="relative z-10 w-full max-w-xs bg-white/8 backdrop-blur-2xl rounded-3xl p-6 sm:p-7 shadow-2xl shadow-black/40 border border-white/15 ring-1 ring-white/5 ring-inset">
        <h2 className="text-2xl font-black text-white text-center mb-6 tracking-wider uppercase">
          LOGIN
        </h2>

        {/* Display Alert Message เมื่อเกิด Error */}
        {errorMessage && (
          <div className="mb-4 p-3 rounded-xl bg-red-500/10 border border-red-500/30 text-red-300 text-xs font-medium text-center">
            {errorMessage}
          </div>
        )}

        <form onSubmit={handleSubmit} className="flex flex-col gap-4">
          <Input
            id="username"
            label="USERNAME"
            type="text"
            value={username}
            onChange={(e: React.ChangeEvent<HTMLInputElement>) => setUsername(e.target.value)}
            disabled={isLoading}
            required
            className="border-white/20 focus:border-indigo-400"
          />

          <Input
            id="password"
            label="PASSWORD"
            type="password"
            value={password}
            onChange={(e: React.ChangeEvent<HTMLInputElement>) => setPassword(e.target.value)}
            disabled={isLoading}
            required
            ref={passwordRef}
            className="border-white/20 focus:border-indigo-400"
          />

          {/* จดจำรหัสผ่าน — ติ๊กแล้วครั้งหน้าคลิกการ์ด "เข้าสู่ระบบล่าสุด" จะเติมรหัสผ่านให้ทันที */}
          <Checkbox
            checked={rememberPassword}
            onChange={(e) => setRememberPassword(e.target.checked)}
            disabled={isLoading}
            label={<span className="text-slate-300! hover:text-white!">จดจำรหัสผ่าน</span>}
            className="-mt-1"
          />

          {/* โซนปุ่มกด */}
          <div className="grid grid-cols-2 gap-3 mt-4">
            <Button
              type="submit"
              variant="primary"
              disabled={isLoading}
              className="bg-indigo-600! hover:bg-indigo-500! shadow-[0_4px_12px_rgba(79,70,229,0.35)]! hover:shadow-[0_6px_16px_rgba(79,70,229,0.5)]!"
            >
              {isLoading ? 'LOADING...' : 'LOGIN'}
            </Button>
            <Button
              type="button"
              variant="danger"
              onClick={handleCancel}
              disabled={isLoading}
              className="bg-white/10! hover:bg-white/15! border! border-white/20! shadow-none! text-slate-200!"
            >
              CANCEL
            </Button>
          </div>
        </form>
      </div>

      {/* บัญชีที่เคยเข้าสู่ระบบล่าสุด — คลิกเพื่อเติม Username ให้ทันที (บัญชีที่มีไอคอนกุญแจ = เคยติ๊กจดจำ
          รหัสผ่านไว้ จะเติมรหัสผ่านให้พร้อมกดเข้าสู่ระบบเลย ส่วนที่เหลือต้องพิมพ์รหัสผ่านเองเหมือนเดิม) */}
      {recentLogins.length > 0 && (
        <div className="relative z-10 w-full max-w-xs mt-4">
          <p className="text-[10px] font-bold text-slate-400 uppercase tracking-widest px-1 mb-2">
            เข้าสู่ระบบล่าสุด
          </p>
          <div className="bg-white/8 backdrop-blur-2xl rounded-2xl border border-white/15 divide-y divide-white/10 overflow-hidden">
            {recentLogins.map((r) => (
              <button
                key={r.empId}
                type="button"
                onClick={() => handlePickRecent(r)}
                className="w-full flex items-center gap-2.5 px-3.5 py-2.5 text-left hover:bg-white/10 transition-colors"
              >
                <span className="w-7 h-7 rounded-full bg-indigo-500/20 border border-indigo-500/30 text-indigo-300 flex items-center justify-center shrink-0">
                  <UserCircle className="w-4 h-4" strokeWidth={1.75} />
                </span>
                <span className="min-w-0 flex-1">
                  <span className="block text-xs font-bold text-white truncate">{r.fullName}</span>
                  <span className="block text-[10px] font-mono text-slate-400 truncate">{r.empId}</span>
                </span>
                {r.password && (
                  <KeyRound className="w-3.5 h-3.5 text-amber-400 shrink-0" strokeWidth={2} />
                )}
              </button>
            ))}
          </div>
        </div>
      )}
    </div>
  );
}
