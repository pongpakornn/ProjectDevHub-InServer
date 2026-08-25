"use client";

import { useCallback, useEffect, useRef, useState } from "react";
import { Loader2, RotateCw } from "lucide-react";

interface Product360ViewerProps {
  /** Ordered array of image URLs, one per angle, e.g. 24-72 frames around the object */
  images: string[];
  /** Optional className for the outer wrapper */
  className?: string;
  /** How many px of drag = 1 full frame step. Lower = more sensitive. Default 6 */
  sensitivity?: number;
  /** Auto-spin once on mount to hint interactivity. Default true */
  autoSpinOnLoad?: boolean;
  /**
   * How quickly momentum slows down after release, per ~16ms frame.
   * Closer to 1 = spins longer (less friction). Closer to 0 = stops fast. Default 0.94
   */
  friction?: number;
}

export default function Product360Viewer({
  images,
  className = "",
  sensitivity = 6,
  autoSpinOnLoad = true,
  friction = 0.94,
}: Product360ViewerProps) {
  // `position` is a CONTINUOUS float in "frame units" (e.g. 4.35 = 35% between frame 4 and 5).
  // This is what makes the stop smooth: we crossfade the two nearest frames by the
  // fractional part instead of hard-swapping images on integer boundaries.
  const [position, setPosition] = useState(0);
  const [loadedCount, setLoadedCount] = useState(0);
  const [isDragging, setIsDragging] = useState(false);
  const [isSpinning, setIsSpinning] = useState(false);

  const dragStartX = useRef(0);
  const dragStartPos = useRef(0);
  const containerRef = useRef<HTMLDivElement>(null);

  // momentum tracking
  const moveHistory = useRef<{ t: number; x: number }[]>([]);
  const velocity = useRef(0); // px per ms
  const rafId = useRef<number | null>(null);

  const len = images.length;
  const isReady = loadedCount >= len && len > 0;

  // Preload every frame before allowing interaction
  useEffect(() => {
    setLoadedCount(0);
    let cancelled = false;
    let count = 0;

    images.forEach((src) => {
      const img = new Image();
      img.src = src;
      img.onload = img.onerror = () => {
        if (cancelled) return;
        count += 1;
        setLoadedCount(count);
      };
    });

    return () => {
      cancelled = true;
    };
  }, [images]);

  // Small auto-spin once loaded, just so users notice it's draggable
  useEffect(() => {
    if (!isReady || !autoSpinOnLoad || len === 0) return;
    let i = 0;
    const id = setInterval(() => {
      i += 1;
      setPosition((p) => p + 1);
      if (i > len / 6) clearInterval(id);
    }, 35);
    return () => clearInterval(id);
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [isReady]);

  const stopMomentum = useCallback(() => {
    if (rafId.current !== null) {
      cancelAnimationFrame(rafId.current);
      rafId.current = null;
    }
    setIsSpinning(false);
  }, []);

  useEffect(() => stopMomentum, [stopMomentum]);

  const stepFromDelta = useCallback((deltaX: number) => {
    setPosition(dragStartPos.current - deltaX / sensitivity);
  }, [sensitivity]);

  // Momentum loop: keeps spinning after release, slowing down smoothly each frame.
  // Because `position` is continuous, this glides to a stop instead of snapping
  // between discrete frames.
  const startMomentum = useCallback(() => {
    if (Math.abs(velocity.current) < 0.03 || len === 0) return;

    setIsSpinning(true);
    let lastTime = performance.now();

    const tick = (time: number) => {
      const dt = Math.min(time - lastTime, 48); // clamp for tab-switch jumps
      lastTime = time;

      // frame-rate independent exponential decay ("friction")
      velocity.current *= Math.pow(friction, dt / 16.67);

      // move continuously — this is the key to a smooth stop, no integer snapping
      setPosition((p) => p - (velocity.current * dt) / sensitivity);

      if (Math.abs(velocity.current) > 0.015) {
        rafId.current = requestAnimationFrame(tick);
      } else {
        setIsSpinning(false);
        rafId.current = null;
      }
    };

    rafId.current = requestAnimationFrame(tick);
  }, [friction, len, sensitivity]);

  const onPointerDown = (e: React.PointerEvent) => {
    if (!isReady) return;
    stopMomentum(); // grabbing the object cancels any spin in progress
    setIsDragging(true);
    dragStartX.current = e.clientX;
    dragStartPos.current = position;
    moveHistory.current = [{ t: performance.now(), x: e.clientX }];
    (e.target as HTMLElement).setPointerCapture(e.pointerId);
  };

  const onPointerMove = (e: React.PointerEvent) => {
    if (!isDragging) return;
    const now = performance.now();
    moveHistory.current.push({ t: now, x: e.clientX });
    moveHistory.current = moveHistory.current.filter((p) => now - p.t < 100);
    stepFromDelta(e.clientX - dragStartX.current);
  };

  const onPointerUp = () => {
    setIsDragging(false);
    const pts = moveHistory.current;
    if (pts.length >= 2) {
      const first = pts[0];
      const last = pts[pts.length - 1];
      const dt = last.t - first.t;
      const dx = last.x - first.x;
      if (dt > 0) {
        velocity.current = dx / dt;
        startMomentum();
      }
    }
    moveHistory.current = [];
  };

  // Resolve the continuous position into two neighboring frame indices + blend weight
  let normalized = position % len;
  if (normalized < 0) normalized += len;
  const baseIndex = Math.floor(normalized);
  const nextIndex = (baseIndex + 1) % len;
  const blend = normalized - baseIndex; // 0..1, how far toward nextIndex

  return (
    <div
      ref={containerRef}
      className={`relative select-none overflow-hidden rounded-2xl border border-zinc-800/80 bg-[#0d0e12] ${className}`}
      style={{ touchAction: "none" }}
      onPointerDown={onPointerDown}
      onPointerMove={onPointerMove}
      onPointerUp={onPointerUp}
      onPointerLeave={onPointerUp}
    >
      {!isReady && (
        <div className="absolute inset-0 z-10 flex flex-col items-center justify-center gap-2 bg-[#0d0e12]/90 text-zinc-400">
          <Loader2 className="h-5 w-5 animate-spin text-emerald-400" />
          <span className="font-mono text-[11px]">
            Loading frames {loadedCount}/{len}
          </span>
        </div>
      )}

      {images.map((src, i) => {
        // only the two active frames need to be visibly opaque; skip work for the rest
        let opacity = 0;
        if (i === baseIndex) opacity = 1 - blend;
        else if (i === nextIndex) opacity = blend;

        return (
          // eslint-disable-next-line @next/next/no-img-element
          <img
            key={src}
            src={src}
            alt={`frame ${i + 1}`}
            draggable={false}
            className="pointer-events-none absolute inset-0 h-full w-full object-contain p-6"
            style={{ opacity, willChange: "opacity" }}
          />
        );
      })}

      {/* spacer to size the container by aspect ratio */}
      <div className="pt-[100%]" />

      <div
        className={`pointer-events-none absolute bottom-3 left-1/2 flex -translate-x-1/2 items-center gap-1.5 rounded-full border border-zinc-800/80 bg-[#121318]/90 px-3 py-1.5 text-[10px] font-mono text-zinc-400 transition-opacity ${
          isReady ? "opacity-100" : "opacity-0"
        } ${isDragging || isSpinning ? "border-emerald-500/40 text-emerald-400" : ""}`}
      >
        <RotateCw className={`h-3 w-3 ${isSpinning ? "animate-spin" : ""}`} />
        {isSpinning ? "spinning…" : "drag to rotate"} · {baseIndex + 1}/{len}
      </div>
    </div>
  );
}