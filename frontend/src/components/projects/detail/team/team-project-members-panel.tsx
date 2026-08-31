"use client";

import React, { useState, useEffect } from "react";
import { Users, UserPlus, X, Crown } from "lucide-react";
import SearchableSelect from "@/components/ui/inputs/searchable-select";
import { ProjectMember } from "@/types/project";
import { getUsers, UserOption } from "@/lib/project-team-api";

interface TeamProjectMembersPanelProps {
  members: ProjectMember[];
  ownerId: number;
  onAddMember: (userId: number) => void;
  onRemoveMember: (userId: number) => void;
}

export default function TeamProjectMembersPanel({
  members,
  ownerId,
  onAddMember,
  onRemoveMember,
}: TeamProjectMembersPanelProps) {
  const [users, setUsers] = useState<UserOption[]>([]);
  const [selectedUserId, setSelectedUserId] = useState("");
  const [isAdding, setIsAdding] = useState(false);

  useEffect(() => {
    getUsers()
      .then(setUsers)
      .catch((err) => console.error("โหลดรายชื่อ User ไม่สำเร็จ", err));
  }, []);

  const memberIds = new Set(members.map((m) => m.userId));
  const candidateOptions = users
    .filter((u) => !memberIds.has(u.userId))
    .map((u) => ({ label: `${u.fullName} (${u.empId})`, value: String(u.userId) }));

  const handleAdd = async () => {
    if (!selectedUserId || isAdding) return;
    setIsAdding(true);
    try {
      await onAddMember(Number(selectedUserId));
      setSelectedUserId("");
    } finally {
      setIsAdding(false);
    }
  };

  return (
    <div className="bg-white rounded-2xl border border-slate-200 p-6 shadow-xs space-y-4">
      <h3 className="font-bold text-slate-800 text-sm flex items-center gap-1.5">
        <Users className="w-4 h-4 text-indigo-500" />
        สมาชิกทีม ({members.length})
      </h3>

      <div className="flex flex-col sm:flex-row gap-2 items-end">
        <div className="flex-1 w-full">
          <SearchableSelect
            label="เพิ่มสมาชิกจากรายชื่อ User ในระบบ"
            options={candidateOptions}
            value={selectedUserId}
            onChange={setSelectedUserId}
            placeholder="ค้นหาชื่อผู้ใช้..."
          />
        </div>
        <button
          type="button"
          onClick={handleAdd}
          disabled={!selectedUserId || isAdding}
          className="w-auto bg-indigo-600 hover:bg-indigo-700 disabled:opacity-50 text-white shadow-[0_4px_12px_rgba(79,70,229,0.25)] normal-case text-xs font-bold px-4 py-2 h-[38px] rounded-lg flex items-center gap-1.5 shrink-0"
        >
          <UserPlus className="w-3.5 h-3.5" />
          {isAdding ? "กำลังเพิ่ม..." : "เพิ่มสมาชิก"}
        </button>
      </div>

      <div className="flex flex-wrap gap-2 pt-1">
        {members.length === 0 ? (
          <p className="text-slate-400 text-xs">ยังไม่มีสมาชิกทีม</p>
        ) : (
          members.map((m) => {
            const isOwner = m.userId === ownerId;
            return (
              <div
                key={m.userId}
                className={`flex items-center gap-2 px-3 py-1.5 rounded-lg border text-xs font-bold ${
                  isOwner
                    ? "bg-amber-50 border-amber-200 text-amber-700"
                    : "bg-indigo-50 border-indigo-200 text-indigo-700"
                }`}
              >
                {isOwner && <Crown className="w-3.5 h-3.5 text-amber-500" />}
                {m.fullName}
                <span className="text-[10px] font-mono font-semibold opacity-70">{m.roleInProject}</span>
                {!isOwner && (
                  <button
                    type="button"
                    onClick={() => onRemoveMember(m.userId)}
                    className="text-current opacity-60 hover:opacity-100"
                    title="ลบออกจากทีม"
                  >
                    <X className="w-3 h-3" />
                  </button>
                )}
              </div>
            );
          })
        )}
      </div>
    </div>
  );
}
