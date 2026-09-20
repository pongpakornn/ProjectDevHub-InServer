"use client";

// Modal ส่งออกเอกสาร — พอร์ตความสามารถมาจาก AutoFlowStudio_ModulesD (src/components/workflow/ExportModal.tsx
// + src/hooks/useExportDoc.ts) ตัด PDF (เปิดหน้าต่างพิมพ์เบราว์เซอร์) ออกในรอบแรก เหลือ SVG/PNG/Markdown/Word
import React from "react";
import { X, FileImage, FileCode2, FileText, File, Loader2 } from "lucide-react";
import Portal from "@/components/ui/portal";
import { useBodyScrollLock } from "@/hooks/use-body-scroll-lock";
import { useFlowDiagramExport } from "@/hooks/use-flow-diagram-export";
import { useToast } from "@/lib/toast-context";
import { FlowDiagramOptions, FlowDiagramProjectMeta, FlowDiagramRowsByType } from "@/types/flow-diagram";

interface FlowDiagramExportModalProps {
  isOpen: boolean;
  onClose: () => void;
  title: string;
  subtitle: string;
  meta: FlowDiagramProjectMeta;
  rows: FlowDiagramRowsByType;
  options: FlowDiagramOptions;
  diagramName?: string;
  getSvg?: () => SVGSVGElement | null;
}

export default function FlowDiagramExportModal({
  isOpen,
  onClose,
  title,
  subtitle,
  meta,
  rows,
  options,
  diagramName,
  getSvg,
}: FlowDiagramExportModalProps) {
  useBodyScrollLock(isOpen);
  const toast = useToast();
  const { progress, exportSvg, exportPng, exportMarkdown, exportWord } = useFlowDiagramExport();

  if (!isOpen) return null;

  const run = async (fn: () => void | Promise<void>, successMsg: string) => {
    try {
      await fn();
      toast.success("ส่งออกสำเร็จ", successMsg);
    } catch (err) {
      toast.error("ส่งออกไม่สำเร็จ", err instanceof Error ? err.message : "กรุณาลองใหม่อีกครั้ง");
    }
  };

  const options_: {
    key: string;
    icon: React.ReactNode;
    label: string;
    desc: string;
    disabled?: boolean;
    onClick: () => void;
  }[] = [
    {
      key: "svg",
      icon: <FileCode2 className="w-4 h-4" />,
      label: "SVG (เวกเตอร์)",
      desc: "ไดอะแกรมที่เปิดอยู่ตอนนี้ — คมทุกขนาด",
      disabled: !getSvg,
      onClick: () => run(() => exportSvg(getSvg?.() ?? null, diagramName ?? meta.projectName), "ส่งออก SVG สำเร็จ"),
    },
    {
      key: "png",
      icon: <FileImage className="w-4 h-4" />,
      label: "PNG (ความละเอียดสูง)",
      desc: "ไดอะแกรมที่เปิดอยู่ตอนนี้ — แปะลงเอกสารอื่นได้ทันที",
      disabled: !getSvg,
      onClick: () => run(() => exportPng(getSvg?.() ?? null, diagramName ?? meta.projectName), "ส่งออก PNG สำเร็จ"),
    },
    {
      key: "md",
      icon: <FileText className="w-4 h-4" />,
      label: "Markdown (.md)",
      desc: "รูปเล่มทุกไดอะแกรม + ตารางข้อมูล + โค้ด Mermaid",
      onClick: () => run(() => exportMarkdown(meta, rows, options), "ส่งออก Markdown สำเร็จ"),
    },
    {
      key: "docx",
      icon: <File className="w-4 h-4" />,
      label: "Word (.docx)",
      desc: "รูปเล่มเอกสารฉบับเต็ม พร้อมหน้าปกและรูปไดอะแกรมทุกประเภท",
      onClick: () => run(() => exportWord(meta, rows, options), "ส่งออก Word สำเร็จ"),
    },
  ];

  return (
    <Portal>
      <div
        className="fixed inset-0 z-50 flex items-center justify-center bg-slate-950/70 backdrop-blur-xs p-4 animate-in fade-in duration-200"
        onClick={onClose}
      >
        <div
          className="w-full max-w-lg bg-white rounded-2xl shadow-2xl overflow-hidden animate-in zoom-in-95 duration-200"
          onClick={(e) => e.stopPropagation()}
        >
          <div className="flex items-start justify-between gap-3 px-6 py-4 border-b border-slate-100">
            <div className="min-w-0">
              <h3 className="text-sm font-bold text-slate-800 truncate">{title}</h3>
              <p className="text-xs text-slate-500 truncate">{subtitle}</p>
            </div>
            <button type="button" onClick={onClose} className="p-1.5 rounded-lg text-slate-400 hover:bg-slate-100 hover:text-slate-600 shrink-0">
              <X className="w-4 h-4" />
            </button>
          </div>

          <div className="p-6 space-y-2.5">
            {options_.map((o) => (
              <button
                key={o.key}
                type="button"
                disabled={o.disabled || progress.running}
                onClick={o.onClick}
                className="w-full flex items-center gap-3 px-4 py-3 rounded-xl border border-slate-200 hover:border-indigo-300 hover:bg-indigo-50/50 transition-colors text-left disabled:opacity-40 disabled:cursor-not-allowed disabled:hover:border-slate-200 disabled:hover:bg-transparent"
              >
                <span className="w-9 h-9 rounded-lg bg-indigo-50 border border-indigo-100 text-indigo-600 flex items-center justify-center shrink-0">
                  {o.icon}
                </span>
                <span className="min-w-0">
                  <span className="block text-xs font-bold text-slate-800">{o.label}</span>
                  <span className="block text-[11px] text-slate-500 truncate">{o.desc}</span>
                </span>
              </button>
            ))}

            {progress.running ? (
              <div className="pt-2 space-y-1.5">
                <div className="flex items-center gap-2 text-xs text-indigo-700 font-semibold">
                  <Loader2 className="w-3.5 h-3.5 animate-spin" />
                  {progress.step}
                </div>
                <div className="w-full bg-slate-100 rounded-full h-1.5 overflow-hidden">
                  <div
                    className="h-full bg-indigo-600 rounded-full transition-all duration-300"
                    style={{ width: `${progress.percent}%` }}
                  />
                </div>
              </div>
            ) : null}
          </div>
        </div>
      </div>
    </Portal>
  );
}
