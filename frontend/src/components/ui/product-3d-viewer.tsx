// "use client";

// import { Suspense } from "react";
// import { Canvas } from "@react-three/fiber";
// import { OrbitControls, Stage, useGLTF } from "@react-three/drei";
// import { Loader2 } from "lucide-react";

// interface Product3DViewerProps {
//   /** Path to your scanned .glb file, e.g. "/models/my-part.glb" */
//   modelUrl: string;
//   className?: string;
//   /** Allow zoom with scroll/pinch. Default true */
//   enableZoom?: boolean;
//   /** Auto-rotate slowly when idle, like a showroom turntable. Default false */
//   autoRotate?: boolean;
// }

// function Model({ url }: { url: string }) {
//   // useGLTF caches by url and suspends until loaded
//   const { scene } = useGLTF(url);
//   return <primitive object={scene} />;
// }

// function LoadingFallback() {
//   return (
//     <div className="absolute inset-0 z-10 flex flex-col items-center justify-center gap-2 bg-[#0d0e12]/90 text-zinc-400">
//       <Loader2 className="h-5 w-5 animate-spin text-emerald-400" />
//       <span className="font-mono text-[11px]">Loading model…</span>
//     </div>
//   );
// }

// export default function Product3DViewer({
//   modelUrl,
//   className = "",
//   enableZoom = true,
//   autoRotate = false,
// }: Product3DViewerProps) {
//   return (
//     <div
//       className={`relative aspect-square overflow-hidden rounded-2xl border border-zinc-800/80 bg-[#0d0e12] ${className}`}
//     >
//       <Canvas camera={{ position: [0, 0, 4], fov: 40 }} dpr={[1, 2]}>
//         <Suspense fallback={null}>
//           {/* Stage auto-frames + lights the model so you don't hand-tune lighting per object */}
//           <Stage environment="city" intensity={0.6} adjustCamera={1.2}>
//             <Model url={modelUrl} />
//           </Stage>
//         </Suspense>
//         <OrbitControls
//           makeDefault
//           enablePan={false}
//           enableZoom={enableZoom}
//           autoRotate={autoRotate}
//           autoRotateSpeed={1.2}
//           // this is what gives free rotation on every axis, unlike the image-sequence viewer
//           minDistance={2}
//           maxDistance={8}
//         />
//       </Canvas>

//       <Suspense fallback={<LoadingFallback />}>
//         <span />
//       </Suspense>

//       <div className="pointer-events-none absolute bottom-3 left-1/2 -translate-x-1/2 rounded-full border border-zinc-800/80 bg-[#121318]/90 px-3 py-1.5 text-[10px] font-mono text-zinc-400">
//         drag to orbit · scroll to zoom
//       </div>
//     </div>
//   );
// }

// // Preload hint (optional) — call Product3DViewer.preload("/models/my-part.glb")
// // in a parent component if you want to start loading before the viewer mounts.
// Product3DViewer.preload = (url: string) => useGLTF.preload(url);




"use client";

import { Suspense } from "react";
import { Canvas, useLoader } from "@react-three/fiber";
import { OrbitControls, Stage, useGLTF } from "@react-three/drei";
import { Loader2 } from "lucide-react";
import { STLLoader } from "three/examples/jsm/loaders/STLLoader.js";

interface Product3DViewerProps {
  /** Path to your model file, e.g. "/models/your-part.glb" or "/models/48962_5F0A1test.STL" */
  modelUrl: string;
  className?: string;
  /** Allow zoom with scroll/pinch. Default true */
  enableZoom?: boolean;
  /** Auto-rotate slowly when idle, like a showroom turntable. Default false */
  autoRotate?: boolean;
}

// โหลดโมเดลสำหรับไฟล์ .GLB / .GLTF
function GLTFModel({ url }: { url: string }) {
  const { scene } = useGLTF(url);
  return <primitive object={scene} />;
}

// โหลดโมเดลสำหรับไฟล์ .STL (กำหนดวัสดุเป็นโลหะสีเทา-เงินให้ดูสวยงาม)
function STLModel({ url }: { url: string }) {
  const geometry = useLoader(STLLoader, url);
  return (
    <mesh geometry={geometry}>
      <meshStandardMaterial color="#94a3b8" metalness={0.6} roughness={0.3} />
    </mesh>
  );
}

// คอมโพเนนต์เลือกรันตามนามสกุลไฟล์
function Model({ url }: { url: string }) {
  const isStl = url.toLowerCase().endsWith(".stl");
  return isStl ? <STLModel url={url} /> : <GLTFModel url={url} />;
}

function LoadingFallback() {
  return (
    <div className="absolute inset-0 z-10 flex flex-col items-center justify-center gap-2 bg-[#0d0e12]/90 text-zinc-400">
      <Loader2 className="h-5 w-5 animate-spin text-emerald-400" />
      <span className="font-mono text-[11px]">Loading model…</span>
    </div>
  );
}

export default function Product3DViewer({
  modelUrl,
  className = "",
  enableZoom = true,
  autoRotate = false,
}: Product3DViewerProps) {
  return (
    <div
      className={`relative aspect-square overflow-hidden rounded-2xl border border-zinc-800/80 bg-[#0d0e12] ${className}`}
    >
      <Canvas camera={{ position: [0, 0, 4], fov: 40 }} dpr={[1, 2]}>
        <Suspense fallback={null}>
          {/* Stage auto-frames + lights the model so you don't hand-tune lighting per object */}
          <Stage environment="city" intensity={0.6} adjustCamera={1.2}>
            {/* ใส่ key={modelUrl} เพื่อให้เวลาเปลี่ยนไฟล์ โมเดลจะ Rerender ใหม่ได้อย่างถูกต้อง */}
            <Model key={modelUrl} url={modelUrl} />
          </Stage>
        </Suspense>
        <OrbitControls
          makeDefault
          enablePan={false}
          enableZoom={enableZoom}
          autoRotate={autoRotate}
          autoRotateSpeed={1.2}
          // this is what gives free rotation on every axis, unlike the image-sequence viewer
          minDistance={2}
          maxDistance={8}
        />
      </Canvas>

      <Suspense fallback={<LoadingFallback />}>
        <span />
      </Suspense>

      <div className="pointer-events-none absolute bottom-3 left-1/2 -translate-x-1/2 rounded-full border border-zinc-800/80 bg-[#121318]/90 px-3 py-1.5 text-[10px] font-mono text-zinc-400">
        drag to orbit · scroll to zoom
      </div>
    </div>
  );
}

// Preload hint (optional)
Product3DViewer.preload = (url: string) => {
  if (!url.toLowerCase().endsWith(".stl")) {
    useGLTF.preload(url);
  }
};