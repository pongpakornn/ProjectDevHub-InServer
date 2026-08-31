"use client";

import React, { useState } from "react";
import { MessageSquare, Send, Trash2 } from "lucide-react";
import { ProjectComment } from "@/types/project-detail";
import { addComment, deleteComment } from "@/lib/project-team-api";

interface TeamProjectCommentsPanelProps {
  projectId: number;
  currentUserId: number;
  comments: ProjectComment[];
  setComments: React.Dispatch<React.SetStateAction<ProjectComment[]>>;
}

export default function TeamProjectCommentsPanel({
  projectId,
  currentUserId,
  comments,
  setComments,
}: TeamProjectCommentsPanelProps) {
  const [text, setText] = useState("");
  const [isSubmitting, setIsSubmitting] = useState(false);

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    const trimmed = text.trim();
    if (!trimmed || isSubmitting) return;
    setIsSubmitting(true);
    try {
      const created = await addComment(projectId, trimmed, currentUserId);
      setComments([...comments, created]);
      setText("");
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
        <textarea
          rows={2}
          value={text}
          onChange={(e) => setText(e.target.value)}
          placeholder="แสดงความคิดเห็นเกี่ยวกับโปรเจกต์นี้..."
          className="flex-1 px-3 py-2 bg-slate-50 border border-slate-200 rounded-lg text-xs font-medium focus:outline-none focus:border-emerald-500 focus:bg-white transition-all resize-none"
        />
        <button
          type="submit"
          disabled={!text.trim() || isSubmitting}
          className="bg-emerald-700 hover:bg-emerald-800 disabled:opacity-50 text-white shadow-md shadow-emerald-900/10 text-xs font-bold px-4 py-2 h-[38px] rounded-lg flex items-center gap-1.5 shrink-0"
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
                <p className="text-xs text-slate-600 mt-0.5 whitespace-pre-wrap">{c.text}</p>
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
