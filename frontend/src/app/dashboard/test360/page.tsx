// "use client";

// import Product360Viewer from "@/components/ui/product-360-viewer";

// // Demo frame set — swap this array for your own product's images.
// // Filenames just need to be in rotation order; count/naming is up to you.
// const DEMO_FRAMES = Array.from(
//   { length: 24 },
//   (_, i) => `/360-sample/box/frame-${String(i + 1).padStart(3, "0")}.png`
// );

// export default function Test360Page() {
//   return (
//     <div className="p-6 md:p-10">
//       <div className="mb-6">
//         <h1 className="font-mono text-lg font-black tracking-wider text-white">
//           360° VIEWER TEST
//         </h1>
//         <p className="mt-1 text-xs text-zinc-500">
//           ทดสอบ image-sequence 360° viewer — ลากเมาส์ซ้าย/ขวาบนรูปเพื่อหมุนดู
//         </p>
//       </div>

//       <div className="max-w-md">
//         <Product360Viewer images={DEMO_FRAMES} />
//       </div>

//       <div className="mt-6 max-w-md rounded-xl border border-zinc-800/80 bg-zinc-900/40 p-4 text-[11px] font-mono text-zinc-500">
//         <p className="mb-1 text-zinc-400">วิธีใช้กับรูปจริง:</p>
//         <p>1. เตรียมรูปสินค้า 24–72 มุม เรียงตามลำดับการหมุน</p>
//         <p>2. วางไว้ใน public/ เช่น public/360/your-product/frame-001.jpg</p>
//         <p>3. เปลี่ยน DEMO_FRAMES ให้ชี้ไป path ของรูปคุณ</p>
//       </div>
//     </div>
//   );
// }
"use client";

import Product360Viewer from "@/components/ui/product-360-viewer";

// Demo frame sets — swap these arrays for your own product's images.
// Filenames just need to be in rotation order; count/naming is up to you.
const BOX_FRAMES = Array.from(
  { length: 24 },
  (_, i) => `/360-sample/box/frame-${String(i + 1).padStart(3, "0")}.png`
);

const PHONE_FRAMES = Array.from(
  { length: 72 },
  (_, i) => `/360-sample/phone/frame-${String(i + 1).padStart(3, "0")}.png`
);

export default function Test360Page() {
  return (
    <div className="p-6 md:p-10">
      <div className="mb-6">
        <h1 className="font-mono text-lg font-black tracking-wider text-white">
          360° VIEWER TEST
        </h1>
        <p className="mt-1 text-xs text-zinc-500">
          ทดสอบ image-sequence 360° viewer — ลากซ้าย/ขวา แล้วปล่อยไวๆ เพื่อดู momentum
        </p>
      </div>

      <div className="grid gap-8 md:grid-cols-2">
        <div>
          <p className="mb-2 font-mono text-[11px] font-bold uppercase tracking-widest text-emerald-400">
            Phone mockup · 72 frames
          </p>
          <div className="max-w-sm">
            <Product360Viewer images={PHONE_FRAMES} friction={0.94} />
          </div>
          <p className="mt-2 text-[11px] text-zinc-500">
            เฟรมเยอะกว่า (5°/เฟรม) + crossfade = ลื่นกว่าเห็นชัด
          </p>
        </div>

        <div>
          <p className="mb-2 font-mono text-[11px] font-bold uppercase tracking-widest text-zinc-500">
            Box mockup · 24 frames
          </p>
          <div className="max-w-sm">
            <Product360Viewer images={BOX_FRAMES} friction={0.94} />
          </div>
          <p className="mt-2 text-[11px] text-zinc-500">
            เฟรมน้อยกว่า (15°/เฟรม) — สังเกตความต่างตอนหมุนช้าๆ
          </p>
        </div>
      </div>

      <div className="mt-8 max-w-2xl rounded-xl border border-zinc-800/80 bg-zinc-900/40 p-4 text-[11px] font-mono text-zinc-500">
        <p className="mb-1 text-zinc-400">วิธีใช้กับรูปสินค้าจริง:</p>
        <p>1. เตรียมรูปสินค้า 36–72 มุม เรียงตามลำดับการหมุน (ยิ่งเยอะยิ่งลื่น)</p>
        <p>2. วางไว้ใน public/ เช่น public/360/your-product/frame-001.jpg</p>
        <p>3. เปลี่ยน array ให้ชี้ไป path ของรูปคุณ แล้วปรับ friction ตามฟีลที่ต้องการ</p>
      </div>
    </div>
  );
}