"use client";

import React, { useRef, useState } from "react";
import { Paperclip, Upload, Trash2, Download } from "lucide-react";
import { ProjectAttachment } from "@/types/project-detail";
import { addAttachment, deleteAttachment } from "@/lib/project-team-api";

interface TeamProjectAttachmentsPanelProps {
  projectId: number;
  currentUserId: number;
  attachments: ProjectAttachment[];
  setAttachments: React.Dispatch<React.SetStateAction<ProjectAttachment[]>>;
  canAdd?: boolean;
  canDelete?: boolean;
}

function formatFileSize(bytes: number | null): string {
  if (!bytes) return "-";
  if (bytes < 1024) return `${bytes} B`;
  if (bytes < 1024 * 1024) return `${(bytes / 1024).toFixed(1)} KB`;
  return `${(bytes / (1024 * 1024)).toFixed(1)} MB`;
}

export default function TeamProjectAttachmentsPanel({
  projectId,
  currentUserId,
  attachments,
  setAttachments,
  canAdd = true,
  canDelete = true,
}: TeamProjectAttachmentsPanelProps) {
  const fileInputRef = useRef<HTMLInputElement>(null);
  const [isUploading, setIsUploading] = useState(false);

  const handleFileChange = async (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (!file) return;
    setIsUploading(true);
    try {
      const created = await addAttachment(projectId, file, currentUserId);
      setAttachments([created, ...attachments]);
    } catch (err) {
      console.error("แนบไฟล์ไม่สำเร็จ", err);
      alert("แนบไฟล์ไม่สำเร็จ กรุณาลองใหม่อีกครั้ง");
    } finally {
      setIsUploading(false);
      if (fileInputRef.current) fileInputRef.current.value = "";
    }
  };

  const handleDelete = async (attachmentId: string) => {
    const prevAttachments = attachments;
    setAttachments(attachments.filter((a) => a.id !== attachmentId));
    try {
      await deleteAttachment(Number(attachmentId), currentUserId);
    } catch (err) {
      console.error("ลบไฟล์แนบไม่สำเร็จ", err);
      alert("ลบไฟล์แนบไม่สำเร็จ กรุณาลองใหม่อีกครั้ง");
      setAttachments(prevAttachments);
    }
  };

  return (
    <div className="bg-white rounded-2xl border border-slate-200 p-6 shadow-xs space-y-4">
      <div className="flex items-center justify-between">
        <h3 className="font-bold text-slate-800 text-sm flex items-center gap-1.5">
          <Paperclip className="w-4 h-4 text-indigo-500" />
          ไฟล์แนบ ({attachments.length})
        </h3>
        {canAdd && (
          <>
            <button
              type="button"
              onClick={() => fileInputRef.current?.click()}
              disabled={isUploading}
              className="bg-indigo-600 hover:bg-indigo-700 disabled:opacity-50 disabled:pointer-events-none text-white shadow-[0_4px_12px_rgba(79,70,229,0.25)] hover:shadow-[0_6px_16px_rgba(79,70,229,0.4)] text-xs font-bold px-4 py-2 h-[34px] rounded-lg flex items-center gap-1.5 cursor-pointer transition-all duration-200 ease-in-out hover:scale-[1.02] hover:-translate-y-0.5 active:scale-[0.98] active:translate-y-0"
            >
              <Upload className="w-3.5 h-3.5" />
              {isUploading ? "กำลังอัปโหลด..." : "แนบไฟล์"}
            </button>
            <input ref={fileInputRef} type="file" className="hidden" onChange={handleFileChange} />
          </>
        )}
      </div>

      <div className="space-y-2">
        {attachments.length === 0 ? (
          <p className="text-slate-400 text-xs">ยังไม่มีไฟล์แนบ</p>
        ) : (
          attachments.map((a) => (
            <div
              key={a.id}
              className="flex items-center justify-between gap-3 px-3 py-2 rounded-lg border border-slate-100 bg-slate-50"
            >
              <a
                href={a.fileUrl}
                target="_blank"
                rel="noopener noreferrer"
                className="flex items-center gap-2 text-xs font-semibold text-indigo-700 hover:underline truncate"
              >
                <Download className="w-3.5 h-3.5 shrink-0" />
                <span className="truncate">{a.fileName}</span>
              </a>
              <div className="flex items-center gap-3 shrink-0">
                <span className="text-[10px] text-slate-400">{formatFileSize(a.fileSizeByte)}</span>
                <span className="text-[10px] text-slate-400">{a.uploadedByName}</span>
                {canDelete && (
                  <button
                    type="button"
                    onClick={() => handleDelete(a.id)}
                    className="text-slate-400 hover:text-rose-600"
                    title="ลบไฟล์แนบ"
                  >
                    <Trash2 className="w-3.5 h-3.5" />
                  </button>
                )}
              </div>
            </div>
          ))
        )}
      </div>
    </div>
  );
}
