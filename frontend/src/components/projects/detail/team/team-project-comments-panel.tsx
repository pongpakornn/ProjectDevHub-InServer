"use client";

import React, { useMemo, useRef, useState } from "react";
import { MessageSquare, Send, Trash2, AtSign } from "lucide-react";
import { ProjectComment } from "@/types/project-detail";
import { ProjectMember } from "@/types/project";
import { addComment, deleteComment } from "@/lib/project-team-api";

interface TeamProjectCommentsPanelProps {
  projectId: number;
  currentUserId: number;
  members: ProjectMember[];
  comments: ProjectComment[];
  setComments: React.Dispatch<React.SetStateAction<ProjectComment[]>>;
}

// แปลงข้อความให้ Highlight ส่วนที่เป็น @ชื่อสมาชิกในโปรเจกต์ (แค่ Visual, ไม่ได้ผูก Notification จริง)
function renderCommentText(text: string, memberNames: Set<string>) {
  const parts = text.split(/(@[^\s@]+(?:\s[^\s@]+)?)/g);
  return parts.map((part, idx) => {
    const name = part.startsWith("@") ? part.slice(1) : "";
    if (name && memberNames.has(name)) {
      return (
        <span key={idx} className="text-indigo-600 font-bold bg-indigo-50 rounded px-1">
          {part}
        </span>
      );
    }
    return <React.Fragment key={idx}>{part}</React.Fragment>;
  });
}

export default function TeamProjectCommentsPanel({
  projectId,
  currentUserId,
  members,
  comments,
  setComments,
}: TeamProjectCommentsPanelProps) {
  const [text, setText] = useState("");
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [mentionQuery, setMentionQuery] = useState<string | null>(null);
  const textareaRef = useRef<HTMLTextAreaElement>(null);

  const memberNameSet = useMemo(() => new Set(members.map((m) => m.fullName)), [members]);

  const mentionSuggestions = useMemo(() => {
    if (mentionQuery === null) return [];
    const q = mentionQuery.toLowerCase();
    return members.filter((m) => m.fullName.toLowerCase().includes(q)).slice(0, 6);
  }, [mentionQuery, members]);

  // ตรวจว่า Cursor ปัจจุบันอยู่หลัง "@คำค้นหา" ที่ยังพิมพ์ไม่จบหรือไม่ (ไม่มี Space คั่น) เพื่อเปิด/ปิด Dropdown แท็ก
  const detectMentionQuery = (value: string, cursorPos: number) => {
    const uptoCursor = value.slice(0, cursorPos);
    const match = uptoCursor.match(/@([^\s@]*)$/);
    setMentionQuery(match ? match[1] : null);
  };

  const handleChange = (e: React.ChangeEvent<HTMLTextAreaElement>) => {
    setText(e.target.value);
    detectMentionQuery(e.target.value, e.target.selectionStart ?? e.target.value.length);
  };

  const handleSelectMention = (member: ProjectMember) => {
    const el = textareaRef.current;
    if (!el) return;
    const cursorPos = el.selectionStart ?? text.length;
    const uptoCursor = text.slice(0, cursorPos);
    const afterCursor = text.slice(cursorPos);
    const replaced = uptoCursor.replace(/@([^\s@]*)$/, `@${member.fullName} `);
    const nextText = replaced + afterCursor;
    setText(nextText);
    setMentionQuery(null);

    requestAnimationFrame(() => {
      el.focus();
      const nextCursor = replaced.length;
      el.setSelectionRange(nextCursor, nextCursor);
    });
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    const trimmed = text.trim();
    if (!trimmed || isSubmitting) return;
    setIsSubmitting(true);
    try {
      const created = await addComment(projectId, trimmed, currentUserId);
      setComments([...comments, created]);
      setText("");
      setMentionQuery(null);
    } catch (err) {
      console.error("ส่งความคิดเห็นไม่สำเร็จ", err);
      alert("ส่งความคิดเห็นไม่สำเร็จ กรุณาลองใหม่อีกครั้ง");
    } finally {
      setIsSubmitting(false);
    }
  };

  const handleDelete = async (commentId: string) => {
    const prevComments = comments;
    setComments(comments.filter((c) => c.id !== commentId));
    try {
      await deleteComment(Number(commentId));
    } catch (err) {
      console.error("ลบความคิดเห็นไม่สำเร็จ", err);
      alert("ลบความคิดเห็นไม่สำเร็จ กรุณาลองใหม่อีกครั้ง");
      setComments(prevComments);
    }
  };

  return (
    <div className="bg-white rounded-2xl border border-slate-200 p-6 shadow-xs space-y-4">
      <h3 className="font-bold text-slate-800 text-sm flex items-center gap-1.5">
        <MessageSquare className="w-4 h-4 text-indigo-500" />
        ความคิดเห็น ({comments.length})
      </h3>

      <form onSubmit={handleSubmit} className="flex items-start gap-2">
        <div className="relative flex-1">
          <textarea
            ref={textareaRef}
            rows={2}
            value={text}
            onChange={handleChange}
            onKeyUp={(e) => detectMentionQuery(e.currentTarget.value, e.currentTarget.selectionStart ?? 0)}
            onBlur={() => window.setTimeout(() => setMentionQuery(null), 150)}
            placeholder="แสดงความคิดเห็นเกี่ยวกับโปรเจกต์นี้... (พิมพ์ @ เพื่อแท็กสมาชิกในโปรเจกต์)"
            className="w-full px-3 py-2 bg-slate-50 border border-slate-200 rounded-lg text-xs font-medium focus:outline-none focus:border-emerald-500 focus:bg-white transition-all resize-none"
          />

          {/* Mention Dropdown — แสดงรายชื่อสมาชิกในโปรเจกต์ที่ตรงกับคำค้นหลัง @ */}
          {mentionQuery !== null && mentionSuggestions.length > 0 && (
            <div className="absolute z-10 bottom-full mb-1.5 left-0 w-64 max-w-full bg-white border border-slate-200 rounded-xl shadow-xl p-1.5 space-y-0.5 animate-in fade-in slide-in-from-bottom-2 duration-150">
              <p className="px-2 py-1 text-[10px] font-mono font-bold text-slate-400 uppercase tracking-wider flex items-center gap-1">
                <AtSign className="w-3 h-3" />
                แท็กสมาชิกในโปรเจกต์
              </p>
              {mentionSuggestions.map((m) => (
                <button
                  key={m.projectMemberId}
                  type="button"
                  onMouseDown={(e) => e.preventDefault()}
                  onClick={() => handleSelectMention(m)}
                  className="w-full flex items-center gap-2 px-2 py-1.5 rounded-lg text-left hover:bg-indigo-50 transition-colors cursor-pointer"
                >
                  <span className="w-6 h-6 rounded-full bg-indigo-100 text-indigo-700 font-bold text-[10px] flex items-center justify-center shrink-0">
                    {m.fullName.slice(0, 2).toUpperCase()}
                  </span>
                  <span className="text-xs font-semibold text-slate-700 truncate">{m.fullName}</span>
                  <span className="text-[10px] text-slate-400 font-mono ml-auto shrink-0">{m.empId}</span>
                </button>
              ))}
            </div>
          )}
        </div>

        <button
          type="submit"
          disabled={!text.trim() || isSubmitting}
          className="bg-indigo-600 hover:bg-indigo-700 disabled:opacity-50 disabled:pointer-events-none text-white shadow-[0_4px_12px_rgba(79,70,229,0.25)] hover:shadow-[0_6px_16px_rgba(79,70,229,0.4)] text-xs font-bold px-4 py-2 h-[38px] rounded-lg flex items-center gap-1.5 shrink-0 cursor-pointer transition-all duration-200 ease-in-out hover:scale-[1.02] hover:-translate-y-0.5 active:scale-[0.98] active:translate-y-0"
        >
          <Send className="w-3.5 h-3.5" />
          ส่ง
        </button>
      </form>

      <div className="space-y-3 pt-1">
        {comments.length === 0 ? (
          <p className="text-slate-400 text-xs">ยังไม่มีความคิดเห็น</p>
        ) : (
          comments.map((c) => (
            <div
              key={c.id}
              className="flex items-start justify-between gap-3 border-b border-slate-100 pb-3 last:border-0 last:pb-0"
            >
              <div>
                <div className="flex items-center gap-2">
                  <span className="text-xs font-bold text-slate-800">{c.fullName}</span>
                  <span className="text-[10px] text-slate-400">
                    {new Date(c.createdDate).toLocaleString("th-TH")}
                  </span>
                </div>
                <p className="text-xs text-slate-600 mt-0.5 whitespace-pre-wrap">
                  {renderCommentText(c.text, memberNameSet)}
                </p>
              </div>
              {c.userId === currentUserId && (
                <button
                  type="button"
                  onClick={() => handleDelete(c.id)}
                  className="text-slate-400 hover:text-rose-600 shrink-0"
                  title="ลบความคิดเห็น"
                >
                  <Trash2 className="w-3.5 h-3.5" />
                </button>
              )}
            </div>
          ))
        )}
      </div>
    </div>
  );
}
