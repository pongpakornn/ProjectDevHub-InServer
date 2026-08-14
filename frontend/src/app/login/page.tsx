'use client';

import React, { useState } from 'react';
import { Button } from '@/components/ui/buttons/button';
import { Input } from '@/components/ui/inputs/input';

export default function LoginPage() {
  const [username, setUsername] = useState<string>('');
  const [password, setPassword] = useState<string>('');

  const handleSubmit = (e: React.FormEvent<HTMLFormElement>) => {
    e.preventDefault();
    console.log('Login Submitted:', { username, password });
  };

  const handleCancel = () => {
    setUsername('');
    setPassword('');
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

      {/* Login Card Container - ปรับขนาดการ์ดเป็น max-w-xs (320px) ให้กระชับสมส่วน */}
      <div className="w-full max-w-xs bg-[#2d2d2d] rounded-3xl p-6 sm:p-7 shadow-2xl border border-gray-800">
        <h2 className="text-2xl font-black text-white text-center mb-6 tracking-wider uppercase">
          LOGIN
        </h2>

        <form onSubmit={handleSubmit} className="flex flex-col gap-4">
          <Input
            id="username"
            label="USERNAME"
            type="text"
            value={username}
            onChange={(e: React.ChangeEvent<HTMLInputElement>) => setUsername(e.target.value)}
            required
          />

          <Input
            id="password"
            label="PASSWORD"
            type="password"
            value={password}
            onChange={(e: React.ChangeEvent<HTMLInputElement>) => setPassword(e.target.value)}
            required
          />

          {/* โซนปุ่มกดขนาดพอดีคำ ไม่แผ่กว้างเต็มเกินไป */}
          <div className="grid grid-cols-2 gap-3 mt-4">
            <Button type="submit" variant="primary">
              LOGIN
            </Button>
            <Button type="button" variant="danger" onClick={handleCancel}>
              CANCEL
            </Button>
          </div>
        </form>
      </div>
    </div>
  );
}