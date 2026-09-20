"use client";

// พรีวิวไดอะแกรม Mermaid — พอร์ต Logic Zoom/Pan/Fit มาจาก AutoFlowStudio_ModulesD
// (src/components/workflow/DiagramPreview.tsx) ตัด framer-motion/fullscreen ออกเพื่อความกระชับ
// ให้ตรงกับ Style การ์ดเดิมของ ProjectDevHub (bg-white rounded-2xl border shadow-xs)
import React, { useCallback, useEffect, useRef, useState } from "react";
import { AlertTriangle, Check, Code2, Copy, Loader2, Minus, Plus, Scan } from "lucide-react";
import { loadMermaid } from "@/lib/flow-diagram-mermaid";

interface FlowDiagramPreviewProps {
  code: string;
  title: string;
  onReady: (svg: SVGSVGElement | null) => void;
}

const MIN_ZOOM = 0.25;
const MAX_ZOOM = 4;
const clamp = (v: number) => Math.min(MAX_ZOOM, Math.max(MIN_ZOOM, v));

export default function FlowDiagramPreview({ code, title, onReady }: FlowDiagramPreviewProps) {
  const hostRef = useRef<HTMLDivElement>(null);
  const viewportRef = useRef<HTMLDivElement>(null);
  const [error, setError] = useState<string | null>(null);
  const [loading, setLoading] = useState(true);
  const [zoom, setZoom] = useState(1);
  const [offset, setOffset] = useState({ x: 0, y: 0 });
  const [showSource, setShowSource] = useState(false);
  const [copied, setCopied] = useState(false);
  const size = useRef({ w: 0, h: 0 });
  const drag = useRef<{ x: number; y: number } | null>(null);
  const view = useRef({ zoom: 1, offset: { x: 0, y: 0 } });
  view.current = { zoom, offset };
  const onReadyRef = useRef(onReady);
  onReadyRef.current = onReady;

  const fitToView = useCallback(() => {
    const vp = viewportRef.current;
    const { w, h } = size.current;
    if (!vp || !w || !h) return;
    const rect = vp.getBoundingClientRect();
    const pad = 32;
    const next = clamp(Math.min((rect.width - pad) / w, (rect.height - pad) / h, 1.5));
    setZoom(next);
    setOffset({ x: (rect.width - w * next) / 2, y: (rect.height - h * next) / 2 });
  }, []);

  useEffect(() => {
    let cancelled = false;
    setLoading(true);
    (async () => {
      try {
        const mermaid = await loadMermaid();
        const id = `d${Math.random().toString(36).slice(2, 9)}`;
        const { svg } = await mermaid.render(id, code);
        if (cancelled || !hostRef.current) return;
        hostRef.current.innerHTML = svg;
        const el = hostRef.current.querySelector("svg");
        if (el) {
          const vb = (el.getAttribute("viewBox") ?? "0 0 800 600").split(/[\s,]+/).map(Number);
          const vw = Number(vb[2]) || 800;
          const vh = Number(vb[3]) || 600;
          el.setAttribute("width", String(Math.round(vw)));
          el.setAttribute("height", String(Math.round(vh)));
          el.style.maxWidth = "none";
          el.style.display = "block";
          size.current = { w: vw, h: vh };
          fitToView();
        }
        onReadyRef.current((el as SVGSVGElement) ?? null);
        setError(null);
      } catch (e) {
        if (cancelled) return;
        document.querySelectorAll('[id^="dd"], .mermaid-error').forEach((n) => n.remove());
        setError(e instanceof Error ? e.message : "สร้างไดอะแกรมไม่สำเร็จ");
        onReadyRef.current(null);
      } finally {
        if (!cancelled) setLoading(false);
      }
    })();
    return () => {
      cancelled = true;
    };
  }, [code, fitToView]);

  const zoomAt = useCallback((factor: number, px: number, py: number) => {
    const { zoom: z, offset: o } = view.current;
    const next = clamp(z * factor);
    const k = next / z;
    setZoom(next);
    setOffset({ x: px - (px - o.x) * k, y: py - (py - o.y) * k });
  }, []);

  const zoomCenter = useCallback(
    (factor: number) => {
      const rect = viewportRef.current?.getBoundingClientRect();
      zoomAt(factor, (rect?.width ?? 0) / 2, (rect?.height ?? 0) / 2);
    },
    [zoomAt],
  );

  const wheelRef = useRef<(e: WheelEvent) => void>(() => {});
  wheelRef.current = (e: WheelEvent) => {
    const vp = viewportRef.current;
    if (!vp) return;
    const rect = vp.getBoundingClientRect();
    const dy = e.deltaY * (e.deltaMode === 1 ? 16 : e.deltaMode === 2 ? 100 : 1);
    zoomAt(Math.exp(-dy * 0.0018), e.clientX - rect.left, e.clientY - rect.top);
  };

  useEffect(() => {
    const el = viewportRef.current;
    if (!el) return;
    const handler = (e: WheelEvent) => {
      e.preventDefault();
      wheelRef.current(e);
    };
    el.addEventListener("wheel", handler, { passive: false });
    return () => el.removeEventListener("wheel", handler);
  }, []);

  useEffect(() => {
    const el = viewportRef.current;
    if (!el || typeof ResizeObserver === "undefined") return;
    const ro = new ResizeObserver(() => fitToView());
    ro.observe(el);
    return () => ro.disconnect();
  }, [fitToView]);

  const onPointerDown = useCallback((e: React.PointerEvent) => {
    drag.current = { x: e.clientX, y: e.clientY };
    (e.currentTarget as Element).setPointerCapture?.(e.pointerId);
  }, []);

  const onPointerMove = useCallback((e: React.PointerEvent) => {
    if (!drag.current) return;
    const dx = e.clientX - drag.current.x;
    const dy = e.clientY - drag.current.y;
    drag.current = { x: e.clientX, y: e.clientY };
    setOffset((o) => ({ x: o.x + dx, y: o.y + dy }));
  }, []);

  const stopDrag = useCallback(() => {
    drag.current = null;
  }, []);

  const copyCode = async () => {
    try {
      await navigator.clipboard.writeText(code);
      setCopied(true);
      window.setTimeout(() => setCopied(false), 1500);
    } catch {
      setCopied(false);
    }
  };

  return (
    <div className="bg-white rounded-2xl border border-slate-200 shadow-xs overflow-hidden">
      <div className="flex flex-wrap items-center justify-between gap-2 px-6 py-4 bg-gradient-to-r from-slate-900 via-slate-800 to-indigo-950 border-b border-slate-800">
        <p className="truncate text-sm font-bold text-slate-200">{title} — Diagram Preview</p>
        <div className="flex items-center gap-1">
          <button type="button" onClick={() => zoomCenter(1 / 1.2)} title="ซูมออก" className="p-1.5 rounded-md text-slate-300 hover:bg-white/10">
            <Minus className="w-4 h-4" />
          </button>
          <span className="w-12 text-center text-xs font-mono text-slate-300">{Math.round(zoom * 100)}%</span>
          <button type="button" onClick={() => zoomCenter(1.2)} title="ซูมเข้า" className="p-1.5 rounded-md text-slate-300 hover:bg-white/10">
            <Plus className="w-4 h-4" />
          </button>
          <button type="button" onClick={fitToView} title="จัดให้พอดีกรอบ" className="p-1.5 rounded-md text-slate-300 hover:bg-white/10">
            <Scan className="w-4 h-4" />
          </button>
          <button type="button" onClick={copyCode} title="คัดลอกโค้ด Mermaid" className="p-1.5 rounded-md text-slate-300 hover:bg-white/10">
            {copied ? <Check className="w-4 h-4 text-emerald-400" /> : <Copy className="w-4 h-4" />}
          </button>
          <button type="button" onClick={() => setShowSource((v) => !v)} title="ดูโค้ด Mermaid" className="p-1.5 rounded-md text-slate-300 hover:bg-white/10">
            <Code2 className="w-4 h-4" />
          </button>
        </div>
      </div>

      <div
        ref={viewportRef}
        className="relative h-[420px] cursor-grab touch-none overflow-hidden bg-slate-50 active:cursor-grabbing"
        onPointerDown={onPointerDown}
        onPointerMove={onPointerMove}
        onPointerUp={stopDrag}
        onPointerLeave={stopDrag}
        onDoubleClick={fitToView}
      >
        {loading ? (
          <div className="absolute inset-0 z-10 flex items-center justify-center bg-white/70">
            <Loader2 className="w-5 h-5 animate-spin text-indigo-600" />
          </div>
        ) : null}

        <div
          className="absolute left-0 top-0 origin-top-left"
          style={{
            transform: `translate3d(${offset.x}px, ${offset.y}px, 0) scale(${zoom})`,
            opacity: loading ? 0.4 : 1,
          }}
        >
          <div ref={hostRef} className="pointer-events-none" />
        </div>

        <p className="pointer-events-none absolute bottom-3 left-4 rounded-md bg-white/80 px-2 py-1 text-[11px] text-slate-500">
          ลากเพื่อเลื่อน · เลื่อนล้อเพื่อซูม · ดับเบิลคลิกเพื่อจัดให้พอดี
        </p>

        {error ? (
          <div className="absolute inset-x-4 bottom-4 flex items-start gap-2 rounded-lg border border-rose-200 bg-rose-50 p-3 text-xs text-rose-700">
            <AlertTriangle className="mt-0.5 h-4 w-4 shrink-0" />
            <span className="break-words">ข้อมูลบางแถวยังไม่ครบหรือมีอักขระที่ใช้ไม่ได้: {error}</span>
          </div>
        ) : null}
      </div>

      {showSource ? (
        <pre className="overflow-auto border-t border-slate-100 bg-slate-50 px-4 py-3 text-xs text-slate-600 max-h-64">{code}</pre>
      ) : null}
    </div>
  );
}
