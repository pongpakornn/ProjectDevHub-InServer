'use client';

import React, { useState } from 'react';
import { useRouter } from 'next/navigation';
import { Terminal } from 'lucide-react';
import { Button } from '@/components/ui/buttons/button';
import { Input } from '@/components/ui/inputs/input';
import { authService } from '@/services/auth.service';
import { saveSession } from '@/lib/session';

export default function LoginPage() {
  const router = useRouter();
  const [username, setUsername] = useState<string>('');
  const [password, setPassword] = useState<string>('');
  const [isLoading, setIsLoading] = useState<boolean>(false);
  const [errorMessage, setErrorMessage] = useState<string>('');

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
    setErrorMessage('');
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

      {/* Login Card — กระจกฝ้าโปร่งแสง ลอยบนพื้นหลังมืด */}
      <div className="relative z-10 w-full max-w-xs bg-white/10 backdrop-blur-2xl rounded-3xl p-6 sm:p-7 shadow-2xl shadow-black/40 border border-white/15">
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
            className="border-white/20 focus:border-indigo-400 [&:-webkit-autofill]:shadow-[0_0_0_1000px_#1e1b4b_inset]!"
          />

          <Input
            id="password"
            label="PASSWORD"
            type="password"
            value={password}
            onChange={(e: React.ChangeEvent<HTMLInputElement>) => setPassword(e.target.value)}
            disabled={isLoading}
            required
            className="border-white/20 focus:border-indigo-400 [&:-webkit-autofill]:shadow-[0_0_0_1000px_#1e1b4b_inset]!"
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
    </div>
  );
}
