"use client";

import React from "react";
import { useRouter } from "next/navigation";
import { authService } from "@/services/auth.service";
import { getStoredUser, getStoredSessionId, clearSession } from "@/lib/session";

interface LogoutButtonProps {
  onLogout?: () => void;
  className?: string;
}

export default function LogoutButton({ onLogout, className = "" }: LogoutButtonProps) {
  const router = useRouter();

  const handleLogout = async () => {
    if (onLogout) {
      onLogout();
      return;
    }

    // Default Behavior: แจ้ง Backend ให้ตั้งสถานะ Offline ก่อน แล้วค่อยล้าง Session ฝั่ง Client ทั้งหมด
    const user = getStoredUser();
    const sessionId = getStoredSessionId();
    try {
      if (user) {
        await authService.logout(user.userId, sessionId);
      }
    } catch (err) {
      console.error("Logout แจ้ง Backend ไม่สำเร็จ", err);
    } finally {
      clearSession();
      router.push("/login");
    }
  };

  return (
    <button
      onClick={handleLogout}
      type="button"
      className={`group relative flex h-11 w-11 items-center justify-start overflow-hidden rounded-full bg-rose-500 border border-rose-600/50 shadow-md transition-all duration-300 hover:w-32 hover:rounded-full active:translate-x-0.5 active:translate-y-0.5 ${className}`}
      title="Logout"
    >
      {/* Icon Section (Sign) */}
      <div className="flex w-full items-center justify-center transition-all duration-300 group-hover:w-[35%] group-hover:pl-2.5">
        <svg
          viewBox="0 0 512 512"
          className="w-4 h-4 fill-white transition-transform duration-300 group-hover:scale-110"
        >
          <path d="M377.9 105.9L500.7 228.7c7.2 7.2 11.3 17.1 11.3 27.3s-4.1 20.1-11.3 27.3L377.9 406.1c-6.4 6.4-15 9.9-24 9.9c-18.7 0-33.9-15.2-33.9-33.9l0-62.1-128 0c-17.7 0-32-14.3-32-32l0-64c0-17.7 14.3-32 32-32l128 0 0-62.1c0-18.7 15.2-33.9 33.9-33.9c9 0 17.6 3.6 24 9.9zM160 96L96 96c-17.7 0-32 14.3-32 32l0 256c0 17.7 14.3 32 32 32l64 0c17.7 0 32 14.3 32 32s-14.3 32-32 32l-64 0c-53 0-96-43-96-96L0 128C0 75 43 32 96 32l64 0c17.7 0 32 14.3 32 32s-14.3 32-32 32z" />
        </svg>
      </div>

      {/* Text Section */}
      <div className="absolute right-0 flex w-0 items-center justify-center opacity-0 font-bold text-white text-xs tracking-wide transition-all duration-300 group-hover:w-[65%] group-hover:opacity-100 group-hover:pr-2 select-none">
        Logout
      </div>
    </button>
  );
}