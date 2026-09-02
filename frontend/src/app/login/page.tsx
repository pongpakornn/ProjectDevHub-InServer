'use client';

import React, { useState } from 'react';
import { useRouter } from 'next/navigation';
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
    <div className="min-h-screen w-full flex flex-col items-center justify-center bg-[#1e1e1e] p-4 select-none">
      {/* Header / Branding */}
      <div className="flex items-center gap-2.5 mb-6">
        <div className="bg-[#2eab55] text-white p-2 rounded-xl flex items-center justify-center shadow-md">
          <span className="font-mono font-bold text-lg">&gt;_</span>
        </div>
        <h1 className="font-extrabold text-xl tracking-wider text-white uppercase">
          PROJECTDEV HUB
        </h1>
      </div>

      {/* Login Card Container */}
      <div className="w-full max-w-xs bg-[#2d2d2d] rounded-3xl p-6 sm:p-7 shadow-2xl border border-gray-800">
        <h2 className="text-2xl font-black text-white text-center mb-6 tracking-wider uppercase">
          LOGIN
        </h2>

        {/* Display Alert Message เมื่อเกิด Error */}
        {errorMessage && (
          <div className="mb-4 p-3 rounded-xl bg-red-500/10 border border-red-500/30 text-red-400 text-xs font-medium text-center">
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
          />

          <Input
            id="password"
            label="PASSWORD"
            type="password"
            value={password}
            onChange={(e: React.ChangeEvent<HTMLInputElement>) => setPassword(e.target.value)}
            disabled={isLoading}
            required
          />

          {/* โซนปุ่มกด */}
          <div className="grid grid-cols-2 gap-3 mt-4">
            <Button type="submit" variant="primary" disabled={isLoading}>
              {isLoading ? 'LOADING...' : 'LOGIN'}
            </Button>
            <Button type="button" variant="danger" onClick={handleCancel} disabled={isLoading}>
              CANCEL
            </Button>
          </div>
        </form>
      </div>
    </div>
  );
}