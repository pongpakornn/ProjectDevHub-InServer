"use client";

import { useState } from "react";
import { Space_Grotesk, Inter, IBM_Plex_Mono } from "next/font/google";
import Product3DViewer from "@/components/ui/product-3d-viewer";
import { Check, Minus, Plus, ScanLine, ShieldCheck, Truck, ChevronDown, Box } from "lucide-react";

const display = Space_Grotesk({ subsets: ["latin"], weight: ["500", "700"], variable: "--font-display" });
const body = Inter({ subsets: ["latin"], weight: ["400", "500"], variable: "--font-body" });
const mono = IBM_Plex_Mono({ subsets: ["latin"], weight: ["400", "500"], variable: "--font-mono-plex" });

// --- รายการโมเดล 3D ทั้งหมด (รวม 15 รายการ) ------------------------
const PRODUCTS = [
  {
    id: "test-1",
    name: "อะลูมิเนียมแบร็คเก็ตยึด CNC (Test 1)",
    sku: "SCAN-0417-AL",
    modelUrl: "/models/your-part.glb",
    price: 1290,
    compareAtPrice: 1590,
    currency: "฿",
    specs: [
      { label: "วัสดุ", value: "Aluminum 6061-T6" },
      { label: "ค่าความคลาดเคลื่อน", value: "±0.05 mm" },
      { label: "น้ำหนัก", value: "142 g" },
      { label: "ชนิดไฟล์", value: "GLB / GLTF" },
      { label: "ระยะเวลาผลิต", value: "3–5 วันทำการ" },
    ],
  },
  {
    id: "test-2",
    name: "ชิ้นส่วนเครื่องจักรปั๊มงาน (Test 2)",
    sku: "STL-48962-5F",
    modelUrl: "/models/48962_5F0A1test.STL",
    price: 2450,
    compareAtPrice: 2890,
    currency: "฿",
    specs: [
      { label: "วัสดุ", value: "High-Carbon Steel" },
      { label: "ค่าความคลาดเคลื่อน", value: "±0.02 mm" },
      { label: "น้ำหนัก", value: "310 g" },
      { label: "ชนิดไฟล์", value: "STL (3D Mesh)" },
      { label: "ระยะเวลาผลิต", value: "2–4 วันทำการ" },
    ],
  },
  {
    id: "gopro-mount",
    name: "ขายึดบอร์ด GoPro Mount",
    sku: "GOPRO-MNT-02",
    modelUrl: "/models/goproboard_mount.STL",
    price: 890,
    compareAtPrice: 1150,
    currency: "฿",
    specs: [
      { label: "วัสดุ", value: "PETG / Nylon Blend" },
      { label: "ค่าความคลาดเคลื่อน", value: "±0.05 mm" },
      { label: "ชนิดไฟล์", value: "STL (3D Mesh)" },
      { label: "ระยะเวลาผลิต", value: "2–3 วันทำการ" },
    ],
  },
  {
    id: "l-bracket-test-2",
    name: "ขายึดฉาก L-Bracket (Test 2)",
    sku: "LBRK-TEST-02",
    modelUrl: "/models/L-BRACKET-Test2.glb",
    price: 1350,
    compareAtPrice: 1650,
    currency: "฿",
    specs: [
      { label: "วัสดุ", value: "Aluminum Alloy" },
      { label: "ค่าความคลาดเคลื่อน", value: "±0.05 mm" },
      { label: "ชนิดไฟล์", value: "STL (3D Mesh)" },
      { label: "ระยะเวลาผลิต", value: "3–5 วันทำการ" },
    ],
  },
  {
    id: "test-file-1",
    name: "ชิ้นงานทดสอบ Test 1",
    sku: "TEST-FILE-01",
    modelUrl: "/models/Test1.glb",
    price: 990,
    compareAtPrice: 1200,
    currency: "฿",
    specs: [
      { label: "วัสดุ", value: "Standard Resin / PLA" },
      { label: "ค่าความคลาดเคลื่อน", value: "±0.05 mm" },
      { label: "ชนิดไฟล์", value: "GLB / GLTF" },
      { label: "ระยะเวลาผลิต", value: "1–3 วันทำการ" },
    ],
  },
  {
    id: "test-file-2",
    name: "ชิ้นงานทดสอบ Test 2",
    sku: "TEST-FILE-02",
    modelUrl: "/models/Test2.stl",
    price: 990,
    compareAtPrice: 1200,
    currency: "฿",
    specs: [
      { label: "วัสดุ", value: "Standard Resin / PLA" },
      { label: "ค่าความคลาดเคลื่อน", value: "±0.05 mm" },
      { label: "ชนิดไฟล์", value: "STL (3D Mesh)" },
      { label: "ระยะเวลาผลิต", value: "1–3 วันทำการ" },
    ],
  },
  {
    id: "test-file-3",
    name: "ชิ้นงานทดสอบ Test 3",
    sku: "TEST-FILE-03",
    modelUrl: "/models/Test3.stl",
    price: 990,
    compareAtPrice: 1200,
    currency: "฿",
    specs: [
      { label: "วัสดุ", value: "Standard Resin / PLA" },
      { label: "ค่าความคลาดเคลื่อน", value: "±0.05 mm" },
      { label: "ชนิดไฟล์", value: "STL (3D Mesh)" },
      { label: "ระยะเวลาผลิต", value: "1–3 วันทำการ" },
    ],
  },
  {
    id: "test-file-4",
    name: "ชิ้นงานทดสอบ Test 4",
    sku: "TEST-FILE-04",
    modelUrl: "/models/Test4.stl",
    price: 990,
    compareAtPrice: 1200,
    currency: "฿",
    specs: [
      { label: "วัสดุ", value: "Standard Resin / PLA" },
      { label: "ค่าความคลาดเคลื่อน", value: "±0.05 mm" },
      { label: "ชนิดไฟล์", value: "STL (3D Mesh)" },
      { label: "ระยะเวลาผลิต", value: "1–3 วันทำการ" },
    ],
  },
  {
    id: "test-file-5",
    name: "ชิ้นงานทดสอบ Test 5",
    sku: "TEST-FILE-05",
    modelUrl: "/models/Test5.stl",
    price: 990,
    compareAtPrice: 1200,
    currency: "฿",
    specs: [
      { label: "วัสดุ", value: "Standard Resin / PLA" },
      { label: "ค่าความคลาดเคลื่อน", value: "±0.05 mm" },
      { label: "ชนิดไฟล์", value: "STL (3D Mesh)" },
      { label: "ระยะเวลาผลิต", value: "1–3 วันทำการ" },
    ],
  },
  {
    id: "test-file-6",
    name: "ชิ้นงานทดสอบ Test 6",
    sku: "TEST-FILE-06",
    modelUrl: "/models/Test6.stl",
    price: 990,
    compareAtPrice: 1200,
    currency: "฿",
    specs: [
      { label: "วัสดุ", value: "Standard Resin / PLA" },
      { label: "ค่าความคลาดเคลื่อน", value: "±0.05 mm" },
      { label: "ชนิดไฟล์", value: "STL (3D Mesh)" },
      { label: "ระยะเวลาผลิต", value: "1–3 วันทำการ" },
    ],
  },
  {
    id: "test-file-7",
    name: "ชิ้นงานทดสอบ Test 7",
    sku: "TEST-FILE-07",
    modelUrl: "/models/Test7.stl",
    price: 990,
    compareAtPrice: 1200,
    currency: "฿",
    specs: [
      { label: "วัสดุ", value: "Standard Resin / PLA" },
      { label: "ค่าความคลาดเคลื่อน", value: "±0.05 mm" },
      { label: "ชนิดไฟล์", value: "STL (3D Mesh)" },
      { label: "ระยะเวลาผลิต", value: "1–3 วันทำการ" },
    ],
  },
  {
    id: "test-file-8",
    name: "ชิ้นงานทดสอบ Test 8",
    sku: "TEST-FILE-08",
    modelUrl: "/models/Test8.stl",
    price: 990,
    compareAtPrice: 1200,
    currency: "฿",
    specs: [
      { label: "วัสดุ", value: "Standard Resin / PLA" },
      { label: "ค่าความคลาดเคลื่อน", value: "±0.05 mm" },
      { label: "ชนิดไฟล์", value: "STL (3D Mesh)" },
      { label: "ระยะเวลาผลิต", value: "1–3 วันทำการ" },
    ],
  },
  {
    id: "test-file-9",
    name: "ชิ้นงานทดสอบ Test 9",
    sku: "TEST-FILE-09",
    modelUrl: "/models/Test9.stl",
    price: 990,
    compareAtPrice: 1200,
    currency: "฿",
    specs: [
      { label: "วัสดุ", value: "Standard Resin / PLA" },
      { label: "ค่าความคลาดเคลื่อน", value: "±0.05 mm" },
      { label: "ชนิดไฟล์", value: "STL (3D Mesh)" },
      { label: "ระยะเวลาผลิต", value: "1–3 วันทำการ" },
    ],
  },
  {
    id: "test-file-10",
    name: "ชิ้นงานทดสอบ Test 10",
    sku: "TEST-FILE-10",
    modelUrl: "/models/Test10.stl",
    price: 990,
    compareAtPrice: 1200,
    currency: "฿",
    specs: [
      { label: "วัสดุ", value: "Standard Resin / PLA" },
      { label: "ค่าความคลาดเคลื่อน", value: "±0.05 mm" },
      { label: "ชนิดไฟล์", value: "STL (3D Mesh)" },
      { label: "ระยะเวลาผลิต", value: "1–3 วันทำการ" },
    ],
  },
  {
    id: "test-file-11",
    name: "ชิ้นงานทดสอบ Test 11",
    sku: "TEST-FILE-11",
    modelUrl: "/models/Test11.stl",
    price: 990,
    compareAtPrice: 1200,
    currency: "฿",
    specs: [
      { label: "วัสดุ", value: "Standard Resin / PLA" },
      { label: "ค่าความคลาดเคลื่อน", value: "±0.05 mm" },
      { label: "ชนิดไฟล์", value: "STL (3D Mesh)" },
      { label: "ระยะเวลาผลิต", value: "1–3 วันทำการ" },
    ],
  },
  // {
  //   id: "test-file-12",
  //   name: "ชิ้นงานทดสอบ Test 12",
  //   sku: "TEST-FILE-12",
  //   modelUrl: "/models/Test12.glb",
  //   price: 990,
  //   compareAtPrice: 1200,
  //   currency: "฿",
  //   specs: [
  //     { label: "วัสดุ", value: "Standard Resin / PLA" },
  //     { label: "ค่าความคลาดเคลื่อน", value: "±0.05 mm" },
  //     { label: "ชนิดไฟล์", value: "STL (3D Mesh)" },
  //     { label: "ระยะเวลาผลิต", value: "1–3 วันทำการ" },
  //   ],
  // },
  // {
  //   id: "test-file-13",
  //   name: "ชิ้นงานทดสอบ Test 13",
  //   sku: "TEST-FILE-13",
  //   modelUrl: "/models/Test13.stl",
  //   price: 990,
  //   compareAtPrice: 1200,
  //   currency: "฿",
  //   specs: [
  //     { label: "วัสดุ", value: "Standard Resin / PLA" },
  //     { label: "ค่าความคลาดเคลื่อน", value: "±0.05 mm" },
  //     { label: "ชนิดไฟล์", value: "STL (3D Mesh)" },
  //     { label: "ระยะเวลาผลิต", value: "1–3 วันทำการ" },
  //   ],
  // },
  // {
  //   id: "test-file-14",
  //   name: "ชิ้นงานทดสอบ Test 14",
  //   sku: "TEST-FILE-14",
  //   modelUrl: "/models/Test14.glb",
  //   price: 990,
  //   compareAtPrice: 1200,
  //   currency: "฿",
  //   specs: [
  //     { label: "วัสดุ", value: "Standard Resin / PLA" },
  //     { label: "ค่าความคลาดเคลื่อน", value: "±0.05 mm" },
  //     { label: "ชนิดไฟล์", value: "STL (3D Mesh)" },
  //     { label: "ระยะเวลาผลิต", value: "1–3 วันทำการ" },
  //   ],
  // },
  // {
  //   id: "test-file-15",
  //   name: "ชิ้นงานทดสอบ Test 15",
  //   sku: "TEST-FILE-15",
  //   modelUrl: "/models/Test15.glb",
  //   price: 990,
  //   compareAtPrice: 1200,
  //   currency: "฿",
  //   specs: [
  //     { label: "วัสดุ", value: "Standard Resin / PLA" },
  //     { label: "ค่าความคลาดเคลื่อน", value: "±0.05 mm" },
  //     { label: "ชนิดไฟล์", value: "STL (3D Mesh)" },
  //     { label: "ระยะเวลาผลิต", value: "1–3 วันทำการ" },
  //   ],
  // },
  // {
  //   id: "test-file-16",
  //   name: "ชิ้นงานทดสอบ Test 16",
  //   sku: "TEST-FILE-16",
  //   modelUrl: "/models/Test16.glb",
  //   price: 990,
  //   compareAtPrice: 1200,
  //   currency: "฿",
  //   specs: [
  //     { label: "วัสดุ", value: "Standard Resin / PLA" },
  //     { label: "ค่าความคลาดเคลื่อน", value: "±0.05 mm" },
  //     { label: "ชนิดไฟล์", value: "STL (3D Mesh)" },
  //     { label: "ระยะเวลาผลิต", value: "1–3 วันทำการ" },
  //   ],
  // },
  // {
  //   id: "test-file-17",
  //   name: "ชิ้นงานทดสอบ Test 17",
  //   sku: "TEST-FILE-17",
  //   modelUrl: "/models/Test17.glb",
  //   price: 990,
  //   compareAtPrice: 1200,
  //   currency: "฿",
  //   specs: [
  //     { label: "วัสดุ", value: "Standard Resin / PLA" },
  //     { label: "ค่าความคลาดเคลื่อน", value: "±0.05 mm" },
  //     { label: "ชนิดไฟล์", value: "STL (3D Mesh)" },
  //     { label: "ระยะเวลาผลิต", value: "1–3 วันทำการ" },
  //   ],
  // },
  // {
  //   id: "test-file-18",
  //   name: "ชิ้นงานทดสอบ Test 18",
  //   sku: "TEST-FILE-18",
  //   modelUrl: "/models/Test18.glb",
  //   price: 990,
  //   compareAtPrice: 1200,
  //   currency: "฿",
  //   specs: [
  //     { label: "วัสดุ", value: "Standard Resin / PLA" },
  //     { label: "ค่าความคลาดเคลื่อน", value: "±0.05 mm" },
  //     { label: "ชนิดไฟล์", value: "STL (3D Mesh)" },
  //     { label: "ระยะเวลาผลิต", value: "1–3 วันทำการ" },
  //   ],
  // },
  {
    id: "test-file-19",
    name: "ชิ้นงานทดสอบ New Product",
    sku: "TEST-FILE-19",
    modelUrl: "/models/v2/main.stl",
    price: 990,
    compareAtPrice: 1200,
    currency: "฿",
    specs: [
      { label: "วัสดุ", value: "Standard Resin / PLA" },
      { label: "ค่าความคลาดเคลื่อน", value: "±0.05 mm" },
      { label: "ชนิดไฟล์", value: "STL (3D Mesh)" },
      { label: "ระยะเวลาผลิต", value: "1–3 วันทำการ" },
    ],
  },
  {
    id: "test-file-20",
    name: "ชิ้นงานทดสอบ New Product6",
    sku: "TEST-FILE-20",
    modelUrl: "/models/v2/6.stl",
    price: 990,
    compareAtPrice: 1200,
    currency: "฿",
    specs: [
      { label: "วัสดุ", value: "Standard Resin / PLA" },
      { label: "ค่าความคลาดเคลื่อน", value: "±0.05 mm" },
      { label: "ชนิดไฟล์", value: "STL (3D Mesh)" },
      { label: "ระยะเวลาผลิต", value: "1–3 วันทำการ" },
    ],
  },
  {
    id: "test-file-21",
    name: "ชิ้นงานทดสอบ New Product5",
    sku: "TEST-FILE-21",
    modelUrl: "/models/v2/5.stl",
    price: 990,
    compareAtPrice: 1200,
    currency: "฿",
    specs: [
      { label: "วัสดุ", value: "Standard Resin / PLA" },
      { label: "ค่าความคลาดเคลื่อน", value: "±0.05 mm" },
      { label: "ชนิดไฟล์", value: "STL (3D Mesh)" },
      { label: "ระยะเวลาผลิต", value: "1–3 วันทำการ" },
    ],
  },
  {
    id: "test-file-22",
    name: "ชิ้นงานทดสอบ New Product4",
    sku: "TEST-FILE-22",
    modelUrl: "/models/v2/4.stl",
    price: 990,
    compareAtPrice: 1200,
    currency: "฿",
    specs: [
      { label: "วัสดุ", value: "Standard Resin / PLA" },
      { label: "ค่าความคลาดเคลื่อน", value: "±0.05 mm" },
      { label: "ชนิดไฟล์", value: "STL (3D Mesh)" },
      { label: "ระยะเวลาผลิต", value: "1–3 วันทำการ" },
    ],
  },
  {
    id: "test-file-23",
    name: "ชิ้นงานทดสอบ New Product3",
    sku: "TEST-FILE-23",
    modelUrl: "/models/v2/3.stl",
    price: 990,
    compareAtPrice: 1200,
    currency: "฿",
    specs: [
      { label: "วัสดุ", value: "Standard Resin / PLA" },
      { label: "ค่าความคลาดเคลื่อน", value: "±0.05 mm" },
      { label: "ชนิดไฟล์", value: "STL (3D Mesh)" },
      { label: "ระยะเวลาผลิต", value: "1–3 วันทำการ" },
    ],
  },
  {
    id: "test-file-24",
    name: "ชิ้นงานทดสอบ New Product2",
    sku: "TEST-FILE-24",
    modelUrl: "/models/v2/2.stl",
    price: 990,
    compareAtPrice: 1200,
    currency: "฿",
    specs: [
      { label: "วัสดุ", value: "Standard Resin / PLA" },
      { label: "ค่าความคลาดเคลื่อน", value: "±0.05 mm" },
      { label: "ชนิดไฟล์", value: "STL (3D Mesh)" },
      { label: "ระยะเวลาผลิต", value: "1–3 วันทำการ" },
    ],
  },
  {
    id: "test-file-25",
    name: "ชิ้นงานทดสอบ New Product1",
    sku: "TEST-FILE-25",
    modelUrl: "/models/v2/1.stl",
    price: 990,
    compareAtPrice: 1200,
    currency: "฿",
    specs: [
      { label: "วัสดุ", value: "Standard Resin / PLA" },
      { label: "ค่าความคลาดเคลื่อน", value: "±0.05 mm" },
      { label: "ชนิดไฟล์", value: "STL (3D Mesh)" },
      { label: "ระยะเวลาผลิต", value: "1–3 วันทำการ" },
    ],
  },
];
// -----------------------------------------------------------------------

const PROCESS = [
  { step: "01", title: "สแกน/สร้าง CAD", detail: "สแกนชิ้นงานจริง หรือส่งไฟล์ 3D CAD (.GLB / .STL) เข้าสู่ระบบ" },
  { step: "02", title: "ตรวจสอบ", detail: "เทียบขนาดกับแบบ CAD ต้นฉบับ ยืนยันค่าความคลาดเคลื่อนก่อนขึ้นสาย" },
  { step: "03", title: "จัดส่ง", detail: "ผลิตตามคำสั่งซื้อ พร้อมใบรับรองขนาด ส่งถึงหน้างาน" },
];

const FEATURES = [
  { icon: ScanLine, label: "โมเดล 3D จากของจริง", detail: "ไม่ใช่ภาพ mockup — หมุนดูได้ทุกมุมก่อนตัดสินใจ" },
  { icon: ShieldCheck, label: "รับประกันขนาด", detail: "ตรวจสอบด้วยเครื่องวัด 3 มิติทุกล็อตการผลิต" },
  { icon: Truck, label: "จัดส่งหน้างาน", detail: "ส่งตรงถึงไซต์งานหรือคลังสินค้าของคุณ" },
];

function formatPrice(n: number) {
  return n.toLocaleString("th-TH");
}

export default function Test3DPage() {
  const [selectedProductIndex, setSelectedProductIndex] = useState(0);
  const [qty, setQty] = useState(1);

  const product = PRODUCTS[selectedProductIndex];

  return (
    <div
      className={`${display.variable} ${body.variable} ${mono.variable} min-h-screen bg-[#0A0E14] text-[#E9E6DD]`}
      style={{ fontFamily: "var(--font-body)" }}
    >
      <style>{`
        @keyframes rise-in {
          from { opacity: 0; transform: translateY(14px); }
          to { opacity: 1; transform: translateY(0); }
        }
        .rise { animation: rise-in 0.5s ease-out both; }
        .brass-btn { position: relative; overflow: hidden; }
        .brass-btn::after {
          content: "";
          position: absolute;
          inset: 0;
          background: linear-gradient(115deg, transparent 20%, rgba(255,255,255,0.28) 40%, transparent 60%);
          transform: translateX(-120%);
          transition: transform 0.6s ease;
        }
        .brass-btn:hover::after { transform: translateX(120%); }
        .spec-row { transition: background-color 0.15s ease; }
        .spec-row:hover { background-color: rgba(199, 130, 61, 0.06); }
        @media (prefers-reduced-motion: reduce) {
          .rise { animation: none; }
          .brass-btn::after { transition: none; }
        }
      `}</style>

      {/* blueprint grid backdrop */}
      <div
        aria-hidden="true"
        className="pointer-events-none fixed inset-0 opacity-[0.35]"
        style={{
          backgroundImage:
            "linear-gradient(#151C26 1px, transparent 1px), linear-gradient(90deg, #151C26 1px, transparent 1px)",
          backgroundSize: "48px 48px",
        }}
      />

      <div className="relative mx-auto max-w-6xl px-6 py-14 md:px-10">
        
        {/* === Dropdown เมนูเลือกเปลี่ยนโมเดล 3D === */}
        <div className="rise mb-8 max-w-md rounded-2xl border border-[#1B2733] bg-[#10161F] p-4">
          <label
            htmlFor="model-select"
            className="mb-2 block flex items-center gap-2 text-[11px] tracking-[0.15em] text-[#7C8592]"
            style={{ fontFamily: "var(--font-mono-plex)" }}
          >
            <Box className="h-3.5 w-3.5 text-[#C7823D]" />
            SELECT 3D MODEL / เลือกโมเดลทดสอบ ({PRODUCTS.length} รายการ):
          </label>
          <div className="relative">
            <select
              id="model-select"
              value={selectedProductIndex}
              onChange={(e) => setSelectedProductIndex(Number(e.target.value))}
              className="w-full appearance-none rounded-xl border border-[#2A3644] bg-[#0A0E14] px-4 py-2.5 pr-10 text-sm font-medium text-[#E9E6DD] outline-none transition-colors focus:border-[#C7823D]"
            >
              {PRODUCTS.map((item, index) => (
                <option key={item.id} value={index} className="bg-[#10161F] text-[#E9E6DD]">
                  {item.name} ({item.modelUrl.split(".").pop()?.toUpperCase()})
                </option>
              ))}
            </select>
            <ChevronDown className="pointer-events-none absolute right-3 top-1/2 h-4 w-4 -translate-y-1/2 text-[#7C8592]" />
          </div>
        </div>

        <div
          className="rise mb-8 flex items-center gap-3 text-[11px] tracking-[0.2em] text-[#7C8592]"
          style={{ fontFamily: "var(--font-mono-plex)" }}
        >
          <span className="h-1.5 w-1.5 rounded-full bg-[#6FB8C4]" />
          รหัสสินค้า {product.sku} — ตรวจสอบแล้วจากไฟล์สแกน 3 มิติ
        </div>

        <div className="grid gap-10 md:grid-cols-[1.15fr_0.85fr] md:gap-14">
          <div className="rise" style={{ animationDelay: "80ms" }}>
            <Product3DViewer modelUrl={product.modelUrl} autoRotate className="max-w-none" />
            <p className="mt-3 text-[11px] text-[#4A5364]" style={{ fontFamily: "var(--font-mono-plex)" }}>
              หมุนได้ทุกแกน (ซ้าย/ขวา/บน/ล่าง) กำลังโหลดไฟล์: {product.modelUrl.split("/").pop()}
            </p>
          </div>

          <div className="rise flex flex-col" style={{ animationDelay: "160ms" }}>
            <h1
              className="text-3xl leading-tight text-[#F2EFE7] md:text-4xl"
              style={{ fontFamily: "var(--font-display)", fontWeight: 700 }}
            >
              {product.name}
            </h1>

            <div className="mt-4 flex items-baseline gap-3" style={{ fontFamily: "var(--font-mono-plex)" }}>
              <span className="text-3xl font-medium text-[#C7823D]">
                {product.currency}
                {formatPrice(product.price)}
              </span>
              {product.compareAtPrice && (
                <span className="text-base text-[#4A5364] line-through">
                  {product.currency}
                  {formatPrice(product.compareAtPrice)}
                </span>
              )}
            </div>

            <div className="mt-6 rounded-2xl border border-[#1B2733] bg-[#EDE6D6] p-5 text-[#17140F]">
              <p className="mb-3 text-[10px] tracking-[0.2em] text-[#6B6350]" style={{ fontFamily: "var(--font-mono-plex)" }}>
                SPEC SHEET
              </p>
              <dl className="divide-y divide-[#D8CFB8]">
                {product.specs.map((s) => (
                  <div key={s.label} className="spec-row -mx-2 flex items-center justify-between px-2 py-2.5">
                    <dt className="text-sm text-[#6B6350]">{s.label}</dt>
                    <dd className="text-sm font-medium" style={{ fontFamily: "var(--font-mono-plex)" }}>
                      {s.value}
                    </dd>
                  </div>
                ))}
              </dl>
            </div>

            <div className="mt-6 flex items-center gap-3">
              <div className="flex items-center rounded-full border border-[#2A3644]">
                <button
                  type="button"
                  aria-label="ลดจำนวน"
                  onClick={() => setQty((q) => Math.max(1, q - 1))}
                  className="flex h-11 w-11 items-center justify-center text-[#7C8592] transition-colors hover:text-[#E9E6DD]"
                >
                  <Minus className="h-4 w-4" />
                </button>
                <span className="w-8 text-center text-sm" style={{ fontFamily: "var(--font-mono-plex)" }}>
                  {qty}
                </span>
                <button
                  type="button"
                  aria-label="เพิ่มจำนวน"
                  onClick={() => setQty((q) => q + 1)}
                  className="flex h-11 w-11 items-center justify-center text-[#7C8592] transition-colors hover:text-[#E9E6DD]"
                >
                  <Plus className="h-4 w-4" />
                </button>
              </div>

              <button
                type="button"
                className="brass-btn flex h-11 flex-1 items-center justify-center rounded-full bg-[#C7823D] text-sm font-medium text-[#2A1808] transition-transform active:scale-[0.98]"
              >
                หยิบใส่ตะกร้า — {product.currency}
                {formatPrice(product.price * qty)}
              </button>
            </div>

            <div className="mt-4 flex items-center gap-2 text-xs text-[#7C8592]">
              <Check className="h-3.5 w-3.5 text-[#6FB8C4]" />
              ยืนยันขนาดจากไฟล์สแกน 3 มิติ ไม่ใช่ภาพจากแคตตาล็อก
            </div>
          </div>
        </div>

        <div className="mt-20 grid gap-6 md:grid-cols-3">
          {PROCESS.map((p, i) => (
            <div
              key={p.step}
              className="rise rounded-2xl border border-[#1B2733] bg-[#10161F] p-6"
              style={{ animationDelay: `${240 + i * 90}ms` }}
            >
              <span className="text-xs text-[#C7823D]" style={{ fontFamily: "var(--font-mono-plex)" }}>
                {p.step}
              </span>
              <h3 className="mt-2 text-lg text-[#F2EFE7]" style={{ fontFamily: "var(--font-display)", fontWeight: 500 }}>
                {p.title}
              </h3>
              <p className="mt-2 text-sm leading-relaxed text-[#8A93A0]">{p.detail}</p>
            </div>
          ))}
        </div>

        <div className="mt-6 grid gap-px overflow-hidden rounded-2xl border border-[#1B2733] bg-[#1B2733] md:grid-cols-3">
          {FEATURES.map((f) => (
            <div key={f.label} className="bg-[#0A0E14] p-6">
              <f.icon className="h-5 w-5 text-[#6FB8C4]" />
              <p className="mt-3 text-sm font-medium text-[#E9E6DD]">{f.label}</p>
              <p className="mt-1 text-xs leading-relaxed text-[#7C8592]">{f.detail}</p>
            </div>
          ))}
        </div>

        <div className="mt-10 max-w-md rounded-xl border border-[#1B2733] bg-[#10161F] p-4 text-[11px] text-[#7C8592]" style={{ fontFamily: "var(--font-mono-plex)" }}>
          <p className="mb-1 text-[#8A93A0]">ต้องติดตั้งก่อนใช้งาน:</p>
          <p>npm install three @react-three/fiber @react-three/drei</p>
          <p className="mt-2 mb-1 text-[#8A93A0]">ตำแหน่งวางไฟล์ 3D (ใน public/models/):</p>
          <p>วางไฟล์ Test1.glb ถึง Test11.glb และ L-BRACKET-Test2.glb ไว้ในโฟลเดอร์ public/models/</p>
        </div>
      </div>
    </div>
  );
}