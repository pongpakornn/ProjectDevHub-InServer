"use client";

import { useEffect, useState } from "react";
import { createPortal } from "react-dom";

// Render children ตรงเข้า document.body แทนที่จะฝังอยู่ใน Component Tree ปกติ — กัน Modal ไปเจอ
// Ancestor ที่มี transform/filter/perspective/overflow:hidden คั่นกลาง (เช่น Page Transition Wrapper)
// ซึ่งจะทำให้ position:fixed ของ Modal ถูกตีความใหม่เป็น Relative กับ Ancestor นั้นแทนที่จะเป็น Viewport จริง
export default function Portal({ children }: { children: React.ReactNode }) {
  const [mounted, setMounted] = useState(false);

  useEffect(() => {
    setMounted(true);
    return () => setMounted(false);
  }, []);

  if (!mounted) return null;
  return createPortal(children, document.body);
}
