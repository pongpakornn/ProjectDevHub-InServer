"use client";

import React, { useState } from "react";
import { Plus, ChevronDown, GripVertical, CheckCircle2, Clock, CircleDashed, UserPlus, X } from "lucide-react";
import { Button } from "@/components/ui/buttons/button";
import Checkbox from "@/components/ui/inputs/checkbox";
import DeleteButtonV2 from "@/components/ui/buttons/buttonv2/delete-buttonv2";
import { ResetRolePresetButton } from "@/components/users/preset-action-button";
import { TableDatePickerCell } from "@/components/projects/detail/table-date-picker-cell";
import { Phase, TaskItem } from "@/types/project-detail";
import { ProjectMember } from "@/types/project";
import {
  createPhase,
  deletePhase,
  updatePhase,
  createTaskItem,
  deleteTaskItem,
  assignTaskAssignees,
} from "@/lib/project-team-api";

interface TeamProjectPhaseTableProps {
  projectId: number;
  currentUserId: number;
  members: ProjectMember[];
  phases: Phase[];
  setPhases: React.Dispatch<React.SetStateAction<Phase[]>>;
  onAutoGeneratePhases: () => void;
  onToggleTask?: (task: TaskItem) => void;
  canAdd?: boolean;
  canDelete?: boolean;
}

export default function TeamProjectPhaseTable({
  projectId,
  currentUserId,
  members,
  phases,
  setPhases,
  onAutoGeneratePhases,
  onToggleTask,
  canAdd = true,
  canDelete = true,
}: TeamProjectPhaseTableProps) {
  const [newPhaseName, setNewPhaseName] = useState("");
  const [newTaskTitle, setNewTaskTitle] = useState<{ [phaseId: string]: string }>({});
  const [newTaskDetail, setNewTaskDetail] = useState<{ [phaseId: string]: string }>({});
  const [isSavingPhase, setIsSavingPhase] = useState(false);
  const [assignPopoverTaskId, setAssignPopoverTaskId] = useState<string | null>(null);

  const calculatePhaseProgress = (phase: Phase) => {
    if (phase.items.length === 0) return phase.status === "Done" ? 100 : 0;
    const done = phase.items.filter((i) => i.completed).length;
    return Math.round((done / phase.items.length) * 100);
  };

  // ===========================================================================
  // Phase — สร้าง/ลบ/แก้ไข ยิง API จริง
  // ===========================================================================
  const handleAddPhase = async () => {
    if (!newPhaseName.trim() || isSavingPhase) return;
    setIsSavingPhase(true);
    try {
      const created = await createPhase(projectId, {
        name: newPhaseName,
        status: "Not Started",
        sortOrder: phases.length + 1,
      }, currentUserId);
      setPhases([...phases, { ...created, isExpanded: true }]);
      setNewPhaseName("");
    } catch (err) {
      console.error("เพิ่ม Phase ไม่สำเร็จ", err);
      alert("เพิ่ม Phase ไม่สำเร็จ กรุณาลองใหม่อีกครั้ง");
    } finally {
      setIsSavingPhase(false);
    }
  };

  const togglePhaseExpand = (id: string) => {
    setPhases(phases.map((p) => (p.id === id ? { ...p, isExpanded: !p.isExpanded } : p)));
  };

  const syncPhaseUpdate = async (phase: Phase) => {
    try {
      await updatePhase(Number(phase.id), {
        name: phase.name,
        status: phase.status,
        startDate: phase.startDate || undefined,
        dueDate: phase.endDate || undefined,
      }, currentUserId);
    } catch (err) {
      console.error("อัปเดต Phase ไม่สำเร็จ", err);
      alert("บันทึก Phase ไม่สำเร็จ กรุณาลองใหม่อีกครั้ง");
    }
  };

  const handleAddTask = async (phaseId: string) => {
    const title = newTaskTitle[phaseId];
    if (!title || !title.trim()) return;
    try {
      const created = await createTaskItem(
        projectId,
        Number(phaseId),
        { title, detail: newTaskDetail[phaseId] || "" },
        currentUserId
      );
      setPhases(phases.map((p) => (p.id === phaseId ? { ...p, items: [...p.items, created] } : p)));
      setNewTaskTitle({ ...newTaskTitle, [phaseId]: "" });
      setNewTaskDetail({ ...newTaskDetail, [phaseId]: "" });
    } catch (err) {
      console.error("เพิ่ม Task ไม่สำเร็จ", err);
      alert("เพิ่ม Task ไม่สำเร็จ กรุณาลองใหม่อีกครั้ง");
    }
  };

  const toggleTaskComplete = (phaseId: string, taskId: string) => {
    let toggledTask: TaskItem | null = null;
    setPhases(
      phases.map((p) => {
        if (p.id === phaseId) {
          const updatedItems = p.items.map((t) => {
            if (t.id === taskId) {
              toggledTask = { ...t, completed: !t.completed };
              return toggledTask;
            }
            return t;
          });
          return { ...p, items: updatedItems };
        }
        return p;
      })
    );
    if (toggledTask && onToggleTask) onToggleTask(toggledTask);
  };

  const handleDeleteTask = async (phaseId: string, taskId: string) => {
    const prevPhases = phases;
    setPhases(phases.map((p) => (p.id === phaseId ? { ...p, items: p.items.filter((t) => t.id !== taskId) } : p)));
    try {
      await deleteTaskItem(Number(taskId), currentUserId);
    } catch (err) {
      console.error("ลบ Task ไม่สำเร็จ", err);
      alert("ลบ Task ไม่สำเร็จ กรุณาลองใหม่อีกครั้ง");
      setPhases(prevPhases);
    }
  };

  const handleDeletePhase = async (id: string) => {
    const prevPhases = phases;
    setPhases(phases.filter((p) => p.id !== id));
    try {
      await deletePhase(Number(id), currentUserId);
    } catch (err) {
      console.error("ลบ Phase ไม่สำเร็จ", err);
      alert("ลบ Phase ไม่สำเร็จ กรุณาลองใหม่อีกครั้ง");
      setPhases(prevPhases);
    }
  };

  // ===========================================================================
  // Assignees — มอบหมายผู้รับผิดชอบงาน (Project.TaskAssignees)
  // ===========================================================================
  const toggleAssignee = async (phaseId: string, task: TaskItem, userId: number) => {
    const current = task.assignees || [];
    const isAssigned = current.some((a) => a.userId === userId);
    const nextUserIds = isAssigned
      ? current.filter((a) => a.userId !== userId).map((a) => a.userId)
      : [...current.map((a) => a.userId), userId];

    try {
      const updated = await assignTaskAssignees(projectId, Number(task.id), nextUserIds, currentUserId);
      setPhases(
        phases.map((p) =>
          p.id === phaseId
            ? { ...p, items: p.items.map((t) => (t.id === task.id ? { ...t, assignees: updated } : t)) }
            : p
        )
      );
    } catch (err) {
      console.error("มอบหมายผู้รับผิดชอบไม่สำเร็จ", err);
      alert("มอบหมายผู้รับผิดชอบไม่สำเร็จ กรุณาลองใหม่อีกครั้ง");
    }
  };

  const handleDragStart = (e: React.DragEvent, index: number) => {
    e.dataTransfer.setData("text/plain", index.toString());
  };

  const handleDrop = (e: React.DragEvent, dropIndex: number) => {
    const dragIndex = Number(e.dataTransfer.getData("text/plain"));
    if (isNaN(dragIndex) || dragIndex === dropIndex) return;
    const newPhases = [...phases];
    const [draggedItem] = newPhases.splice(dragIndex, 1);
    newPhases.splice(dropIndex, 0, draggedItem);
    setPhases(newPhases);
  };

  return (
    <div className="bg-white rounded-2xl border border-slate-200/80 p-6 shadow-sm space-y-5">
      <div className="flex flex-col sm:flex-row items-start sm:items-center justify-between gap-3 pb-2 border-b border-slate-100">
        <div className="flex items-center gap-2.5">
          <div className="flex items-center gap-1.5 bg-indigo-50 border border-indigo-100 px-3 py-1.5 rounded-lg">
            <span className="w-2 h-2 rounded-full bg-indigo-600 animate-pulse" />
            <span className="text-indigo-900 font-bold text-xs tracking-wide">Phase / ลำดับงาน</span>
          </div>

          {canAdd && (
            <ResetRolePresetButton
              onClick={onAutoGeneratePhases}
              title="สร้าง Standard Phase"
            />
          )}
        </div>

        {canAdd && (
          <div className="flex items-center gap-2 w-full sm:w-auto">
            <input
              type="text"
              placeholder="ชื่อขั้นตอนใหม่..."
              value={newPhaseName}
              onChange={(e) => setNewPhaseName(e.target.value)}
              onKeyDown={(e) => e.key === "Enter" && handleAddPhase()}
              className="px-3.5 py-1.5 border border-slate-200 rounded-lg text-xs w-full sm:w-52 focus:outline-none focus:ring-2 focus:ring-indigo-500/20 focus:border-indigo-500 transition-all bg-slate-50/50 focus:bg-white"
            />
            <Button
              onClick={handleAddPhase}
              disabled={isSavingPhase}
              className="w-auto! bg-indigo-600 hover:bg-indigo-700 text-white shadow-[0_4px_12px_rgba(79,70,229,0.25)] hover:shadow-[0_6px_16px_rgba(79,70,229,0.35)] normal-case text-xs font-bold py-1.5 px-3.5 flex items-center gap-1 shrink-0 disabled:opacity-60"
            >
              <Plus className="w-3.5 h-3.5" />
              {isSavingPhase ? "กำลังบันทึก..." : "เพิ่ม Phase"}
            </Button>
          </div>
        )}
      </div>

      <div className="overflow-hidden border border-slate-200/90 rounded-xl shadow-2xs bg-white">
        <div className="overflow-x-auto">
          <table className="w-full text-left text-xs border-collapse">
            <thead className="bg-gradient-to-r from-slate-900 via-slate-800 to-indigo-950 text-slate-200 font-semibold border-b border-slate-800 select-none">
              <tr>
                <th className="py-3.5 px-3 w-10 text-center"></th>
                <th className="py-3.5 px-2 w-12 text-center font-mono text-[11px] font-bold uppercase tracking-wider text-slate-200">#</th>
                <th className="py-3.5 px-3 min-w-[220px] tracking-wide">Phase Name</th>
                <th className="py-3.5 px-3 w-36 tracking-wide">Owner</th>
                <th className="py-3.5 px-3 w-40 tracking-wide">Start Date</th>
                <th className="py-3.5 px-3 w-40 tracking-wide">End Date</th>
                <th className="py-3.5 px-3 w-36 tracking-wide">Status</th>
                <th className="py-3.5 px-3 w-36 tracking-wide">Progress</th>
                <th className="py-3.5 px-3 w-12 text-center">Action</th>
              </tr>
            </thead>

            <tbody className="divide-y divide-slate-100">
              {phases.map((phase, idx) => {
                const phaseProgress = calculatePhaseProgress(phase);
                const totalTasks = phase.items.length;
                const completedTasksCount = phase.items.filter((i) => i.completed).length;

                let autoStatus: "Not Started" | "In Progress" | "Done" = "Not Started";
                if (totalTasks > 0 && completedTasksCount === totalTasks) autoStatus = "Done";
                else if (completedTasksCount > 0) autoStatus = "In Progress";

                const isDone = autoStatus === "Done";
                const isInProgress = autoStatus === "In Progress";

                return (
                  <React.Fragment key={phase.id}>
                    <tr
                      draggable
                      onDragStart={(e) => handleDragStart(e, idx)}
                      onDragOver={(e) => e.preventDefault()}
                      onDrop={(e) => handleDrop(e, idx)}
                      className="hover:bg-indigo-50/30 transition-colors group"
                    >
                      <td className="py-2.5 px-3 text-center cursor-grab active:cursor-grabbing text-slate-300 group-hover:text-slate-500 transition-colors">
                        <GripVertical className="w-4 h-4 mx-auto" />
                      </td>

                      <td className="py-2.5 px-2 text-center">
                        <div className="flex items-center justify-center gap-1">
                          <button
                            onClick={() => togglePhaseExpand(phase.id)}
                            className={`p-1 rounded-md transition-transform duration-200 hover:bg-slate-200/70 text-slate-500 ${
                              phase.isExpanded ? "rotate-0" : "-rotate-90"
                            }`}
                          >
                            <ChevronDown className="w-3.5 h-3.5" />
                          </button>
                          <span className="font-mono text-slate-700 text-xs font-extrabold tracking-tight min-w-[20px]">
                            {String(idx + 1).padStart(2, "0")}
                          </span>
                        </div>
                      </td>

                      <td className="py-2.5 px-3">
                        <input
                          type="text"
                          value={phase.name}
                          onChange={(e) => {
                            const val = e.target.value;
                            setPhases(phases.map((p) => (p.id === phase.id ? { ...p, name: val } : p)));
                          }}
                          onBlur={() => {
                            const current = phases.find((p) => p.id === phase.id);
                            if (current) syncPhaseUpdate(current);
                          }}
                          className="w-full px-2.5 py-1.5 bg-transparent border border-transparent hover:border-slate-200 focus:border-indigo-500 focus:bg-white rounded-md font-bold text-slate-900 text-sm tracking-tight transition-all focus:outline-none"
                        />
                      </td>

                      <td className="py-2.5 px-3">
                        <input
                          type="text"
                          value={phase.owner}
                          placeholder="เช่น Pongpakorn, Somchai"
                          onChange={(e) => {
                            const val = e.target.value;
                            setPhases(phases.map((p) => (p.id === phase.id ? { ...p, owner: val } : p)));
                          }}
                          className="w-full px-2.5 py-1.5 bg-transparent border border-transparent hover:border-slate-200 focus:border-indigo-500 focus:bg-white rounded-md font-bold text-slate-700 transition-all focus:outline-none"
                        />
                      </td>

                      <td className="py-2.5 px-3">
                        <TableDatePickerCell
                          value={phase.startDate}
                          placeholder="DD-MM-YYYY"
                          onChange={(val) => {
                            const updated = { ...phase, startDate: val };
                            setPhases(phases.map((p) => (p.id === phase.id ? updated : p)));
                            syncPhaseUpdate(updated);
                          }}
                        />
                      </td>

                      <td className="py-2.5 px-3">
                        <TableDatePickerCell
                          value={phase.endDate}
                          placeholder="DD-MM-YYYY"
                          onChange={(val) => {
                            const updated = { ...phase, endDate: val };
                            setPhases(phases.map((p) => (p.id === phase.id ? updated : p)));
                            syncPhaseUpdate(updated);
                          }}
                        />
                      </td>

                      <td className="py-2.5 px-3">
                        <div
                          className={`flex items-center gap-1.5 px-2.5 py-1 rounded-lg text-[12px] font-bold border transition-all duration-300 w-fit select-none ${
                            isDone
                              ? "bg-emerald-50 text-emerald-700 border-emerald-200/80 shadow-2xs"
                              : isInProgress
                              ? "bg-indigo-50 text-indigo-700 border-indigo-200/80 shadow-2xs"
                              : "bg-slate-100/80 text-slate-500 border-slate-200/80"
                          }`}
                        >
                          {isDone && <CheckCircle2 className="w-3.5 h-3.5 text-emerald-600" />}
                          {isInProgress && <Clock className="w-3.5 h-3.5 text-indigo-600 animate-spin-slow" />}
                          {!isDone && !isInProgress && <CircleDashed className="w-3.5 h-3.5 text-slate-400" />}
                          <span>{autoStatus}</span>
                        </div>
                      </td>

                      <td className="py-2.5 px-3">
                        <div className="flex items-center gap-2">
                          <div className="flex-1 bg-slate-100 rounded-full h-2 border border-slate-200/80 overflow-hidden">
                            <div
                              className={`h-full transition-all duration-500 rounded-full ${
                                isDone
                                  ? "bg-indigo-500 shadow-[0_0_8px_rgba(16,185,129,0.4)]"
                                  : isInProgress
                                  ? "bg-indigo-600 shadow-[0_0_8px_rgba(79,70,229,0.3)]"
                                  : "bg-slate-300"
                              }`}
                              style={{ width: `${phaseProgress}%` }}
                            />
                          </div>
                          <span className="font-mono text-[12px] font-bold text-slate-600 min-w-[34px] text-right">
                            {phaseProgress}%
                          </span>
                        </div>
                      </td>

                      <td className="py-2.5 px-3 text-center">
                        {canDelete && <DeleteButtonV2 onClick={() => handleDeletePhase(phase.id)} title="ลบ Phase นี้" />}
                      </td>
                    </tr>

                    <tr>
                      <td colSpan={9} className="p-0 border-none">
                        <div
                          className={`grid transition-all duration-300 ease-in-out ${
                            phase.isExpanded ? "grid-rows-[1fr] opacity-100" : "grid-rows-[0fr] opacity-0"
                          }`}
                        >
                          <div className="overflow-hidden">
                            <div className="bg-slate-50/80 p-4 pl-12 border-t border-b border-slate-200/60 space-y-3">
                              <div className="flex items-center justify-between">
                                <h4 className="font-semibold text-slate-700 text-xs flex items-center gap-1.5">
                                  <span className="w-1.5 h-1.5 rounded-full bg-indigo-500" />
                                  รายการ Sub-tasks ในเฟสนี้ ({completedTasksCount}/{totalTasks})
                                </h4>
                              </div>

                              <div className="space-y-2">
                                {phase.items.map((task) => {
                                  const assignees = task.assignees || [];
                                  const isPopoverOpen = assignPopoverTaskId === task.id;

                                  return (
                                    <div
                                      key={task.id}
                                      className={`flex items-start gap-3 p-3 rounded-xl border transition-all duration-200 ${
                                        task.completed
                                          ? "bg-slate-50/80 border-slate-200/60 shadow-2xs"
                                          : "bg-white border-slate-200 shadow-xs hover:border-indigo-200"
                                      }`}
                                    >
                                      <div className="pt-0.5">
                                        <Checkbox checked={task.completed} onChange={() => toggleTaskComplete(phase.id, task.id)} />
                                      </div>

                                      <div className="flex-1 min-w-0">
                                        <h5 className="relative inline-block text-xs font-bold text-slate-800 transition-colors duration-200">
                                          <span className={`transition-all duration-300 ${task.completed ? "text-slate-400" : "text-slate-800"}`}>
                                            {task.title}
                                          </span>
                                          <span
                                            className={`absolute left-0 top-1/2 h-[1.5px] bg-slate-400 transition-all duration-300 ease-out pointer-events-none ${
                                              task.completed ? "w-full" : "w-0"
                                            }`}
                                          />
                                        </h5>
                                        {task.detail && (
                                          <p className={`text-[11px] mt-0.5 transition-colors duration-200 ${task.completed ? "text-slate-400/80" : "text-slate-500"}`}>
                                            {task.detail}
                                          </p>
                                        )}

                                        <div className="flex items-center flex-wrap gap-1 mt-1.5 relative">
                                          {assignees.map((a) => (
                                            <span
                                              key={a.userId}
                                              className="inline-flex items-center gap-1 px-1.5 py-0.5 rounded bg-violet-50 text-violet-700 border border-violet-200 font-bold text-[10px]"
                                            >
                                              {a.fullName}
                                            </span>
                                          ))}
                                          <button
                                            type="button"
                                            onClick={() => setAssignPopoverTaskId(isPopoverOpen ? null : task.id)}
                                            className="inline-flex items-center gap-1 px-1.5 py-0.5 rounded border border-dashed border-slate-300 text-slate-400 hover:text-indigo-600 hover:border-indigo-300 text-[10px] font-bold transition-colors"
                                          >
                                            <UserPlus className="w-3 h-3" />
                                            มอบหมาย
                                          </button>

                                          {isPopoverOpen && (
                                            <div className="absolute z-20 top-full left-0 mt-1 w-56 bg-white border border-slate-200 rounded-lg shadow-lg p-2 space-y-1">
                                              <div className="flex items-center justify-between px-1 pb-1 border-b border-slate-100">
                                                <span className="text-[10px] font-bold text-slate-500">เลือกผู้รับผิดชอบ</span>
                                                <button onClick={() => setAssignPopoverTaskId(null)} className="text-slate-400 hover:text-slate-600">
                                                  <X className="w-3 h-3" />
                                                </button>
                                              </div>
                                              {members.length === 0 ? (
                                                <p className="text-[10px] text-slate-400 px-1 py-1">ยังไม่มีสมาชิกทีม</p>
                                              ) : (
                                                members.map((m) => {
                                                  const checked = assignees.some((a) => a.userId === m.userId);
                                                  return (
                                                    <label
                                                      key={m.userId}
                                                      className="flex items-center gap-2 px-1 py-1 rounded hover:bg-slate-50 cursor-pointer text-[11px] font-medium text-slate-700"
                                                    >
                                                      <input
                                                        type="checkbox"
                                                        checked={checked}
                                                        onChange={() => toggleAssignee(phase.id, task, m.userId)}
                                                        className="rounded border-slate-300"
                                                      />
                                                      {m.fullName}
                                                    </label>
                                                  );
                                                })
                                              )}
                                            </div>
                                          )}
                                        </div>
                                      </div>

                                      {canDelete && (
                                        <DeleteButtonV2 onClick={() => handleDeleteTask(phase.id, task.id)} className="scale-75" title="ลบ Task" />
                                      )}
                                    </div>
                                  );
                                })}
                              </div>

                              {canAdd && (
                                <div className="flex flex-col sm:flex-row items-center gap-2 pt-2 border-t border-slate-200/50">
                                  <input
                                    type="text"
                                    placeholder="ชื่อรายการงาน เช่น ออกแบบ Schema..."
                                    value={newTaskTitle[phase.id] || ""}
                                    onChange={(e) => setNewTaskTitle({ ...newTaskTitle, [phase.id]: e.target.value })}
                                    className="flex-1 px-3 py-1.5 bg-white border border-slate-200 rounded-lg text-xs w-full focus:outline-none focus:border-indigo-500 shadow-2xs"
                                  />
                                  <input
                                    type="text"
                                    placeholder="รายละเอียดเพิ่มเติม (Optional)"
                                    value={newTaskDetail[phase.id] || ""}
                                    onChange={(e) => setNewTaskDetail({ ...newTaskDetail, [phase.id]: e.target.value })}
                                    className="flex-1 px-3 py-1.5 bg-white border border-slate-200 rounded-lg text-xs w-full focus:outline-none focus:border-indigo-500 shadow-2xs"
                                  />
                                  <Button
                                    onClick={() => handleAddTask(phase.id)}
                                    className="w-auto! bg-indigo-600 hover:bg-indigo-700 text-white normal-case text-xs font-bold py-1.5 px-3.5 flex items-center gap-1 shrink-0 shadow-2xs"
                                  >
                                    <Plus className="w-3.5 h-3.5" />
                                    เพิ่ม Task
                                  </Button>
                                </div>
                              )}
                            </div>
                          </div>
                        </div>
                      </td>
                    </tr>
                  </React.Fragment>
                );
              })}
            </tbody>
          </table>
        </div>
      </div>
    </div>
  );
}
