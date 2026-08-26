"use client";

import React, { useState } from "react";
import { Wand2, Plus, Trash2, ChevronDown, ChevronRight, GripVertical } from "lucide-react";

export interface TaskItem {
  id: string;
  title: string;
  detail: string;
  completed: boolean;
}

export interface Phase {
  id: string;
  name: string;
  owner: string;
  startDate: string;
  endDate: string;
  status: "Done" | "In Progress" | "Not Started";
  items: TaskItem[];
  isExpanded?: boolean;
}

interface TeamProjectPhaseTableProps {
  phases: Phase[];
  setPhases: React.Dispatch<React.SetStateAction<Phase[]>>;
  standardPhases: Phase[];
}

export default function TeamProjectPhaseTable({
  phases,
  setPhases,
  standardPhases,
}: TeamProjectPhaseTableProps) {
  const [newPhaseName, setNewPhaseName] = useState("");
  const [newTaskTitle, setNewTaskTitle] = useState<{ [phaseId: string]: string }>({});
  const [newTaskDetail, setNewTaskDetail] = useState<{ [phaseId: string]: string }>({});

  const calculatePhaseProgress = (phase: Phase) => {
    if (phase.items.length === 0) return phase.status === "Done" ? 100 : 0;
    const done = phase.items.filter((i) => i.completed).length;
    return Math.round((done / phase.items.length) * 100);
  };

  const handleAutoGeneratePhases = () => {
    setPhases(standardPhases);
  };

  const handleAddPhase = () => {
    if (!newPhaseName.trim()) return;
    const newP: Phase = {
      id: Date.now().toString(),
      name: newPhaseName,
      owner: "",
      startDate: "",
      endDate: "",
      status: "Not Started",
      items: [],
      isExpanded: true,
    };
    setPhases([...phases, newP]);
    setNewPhaseName("");
  };

  const togglePhaseExpand = (id: string) => {
    setPhases(phases.map((p) => (p.id === id ? { ...p, isExpanded: !p.isExpanded } : p)));
  };

  const handleAddTask = (phaseId: string) => {
    const title = newTaskTitle[phaseId];
    if (!title || !title.trim()) return;

    setPhases(
      phases.map((p) => {
        if (p.id === phaseId) {
          const newTask: TaskItem = {
            id: Date.now().toString(),
            title: title,
            detail: newTaskDetail[phaseId] || "",
            completed: false,
          };
          return { ...p, items: [...p.items, newTask] };
        }
        return p;
      })
    );

    setNewTaskTitle({ ...newTaskTitle, [phaseId]: "" });
    setNewTaskDetail({ ...newTaskDetail, [phaseId]: "" });
  };

  const toggleTaskComplete = (phaseId: string, taskId: string) => {
    setPhases(
      phases.map((p) => {
        if (p.id === phaseId) {
          const updatedItems = p.items.map((t) =>
            t.id === taskId ? { ...t, completed: !t.completed } : t
          );
          return { ...p, items: updatedItems };
        }
        return p;
      })
    );
  };

  const handleDeleteTask = (phaseId: string, taskId: string) => {
    setPhases(
      phases.map((p) => {
        if (p.id === phaseId) {
          return { ...p, items: p.items.filter((t) => t.id !== taskId) };
        }
        return p;
      })
    );
  };

  const handleDeletePhase = (id: string) => {
    setPhases(phases.filter((p) => p.id !== id));
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
    <div className="bg-white rounded-2xl border border-slate-200 p-6 shadow-xs space-y-4">
      <div className="flex flex-col sm:flex-row items-start sm:items-center justify-between gap-3">
        <div className="flex items-center gap-2">
          <span className="bg-indigo-100 text-indigo-800 font-bold px-2 py-1 rounded text-xs">
            Phase / ลำดับงาน
          </span>

          <button
            onClick={handleAutoGeneratePhases}
            title="สร้าง Phase อัตโนมัติตามมาตรฐาน"
            className="p-1.5 bg-indigo-50 hover:bg-indigo-100 text-indigo-700 rounded-lg border border-indigo-200 transition-all flex items-center gap-1 text-xs font-medium cursor-pointer"
          >
            <Wand2 className="w-4 h-4 text-indigo-600" />
            <span>สร้าง Standard Phase</span>
          </button>
        </div>

        <div className="flex items-center gap-2 w-full sm:w-auto">
          <input
            type="text"
            placeholder="ชื่อขั้นตอนใหม่"
            value={newPhaseName}
            onChange={(e) => setNewPhaseName(e.target.value)}
            className="px-3 py-1.5 border border-slate-200 rounded-lg text-xs w-full sm:w-48 focus:outline-none focus:border-indigo-500"
          />
          <button
            onClick={handleAddPhase}
            className="px-3 py-1.5 bg-indigo-600 hover:bg-indigo-700 text-white rounded-lg text-xs font-bold flex items-center gap-1 shrink-0 cursor-pointer"
          >
            <Plus className="w-3.5 h-3.5" />
            เพิ่ม
          </button>
        </div>
      </div>

      <div className="overflow-x-auto border border-slate-200 rounded-xl">
        <table className="w-full text-left text-xs">
          <thead className="bg-slate-50 border-b border-slate-200 text-slate-500 font-semibold">
            <tr>
              <th className="py-3 px-2 w-10 text-center"></th>
              <th className="py-3 px-2 w-10 text-center">No</th>
              <th className="py-3 px-3 min-w-[200px]">Phase</th>
              <th className="py-3 px-3 w-32">Owner</th>
              <th className="py-3 px-3 w-28">Start</th>
              <th className="py-3 px-3 w-28">End</th>
              <th className="py-3 px-3 w-28">Status</th>
              <th className="py-3 px-3 w-28">Progress</th>
              <th className="py-3 px-2 w-12 text-center"></th>
            </tr>
          </thead>
          <tbody className="divide-y divide-slate-100">
            {phases.map((phase, idx) => {
              const phaseProgress = calculatePhaseProgress(phase);
              return (
                <React.Fragment key={phase.id}>
                  <tr
                    draggable
                    onDragStart={(e) => handleDragStart(e, idx)}
                    onDragOver={(e) => e.preventDefault()}
                    onDrop={(e) => handleDrop(e, idx)}
                    className="hover:bg-slate-50/80 transition-colors"
                  >
                    <td className="py-3 px-2 text-center cursor-grab text-slate-300 hover:text-slate-600">
                      <GripVertical className="w-4 h-4 mx-auto" />
                    </td>
                    <td className="py-3 px-2 text-center">
                      <button
                        onClick={() => togglePhaseExpand(phase.id)}
                        className="p-1 hover:bg-slate-200 rounded text-slate-500 cursor-pointer"
                      >
                        {phase.isExpanded ? (
                          <ChevronDown className="w-3.5 h-3.5" />
                        ) : (
                          <ChevronRight className="w-3.5 h-3.5" />
                        )}
                      </button>
                      <span className="font-bold ml-1">{idx + 1}</span>
                    </td>
                    <td className="py-3 px-3">
                      <input
                        type="text"
                        value={phase.name}
                        onChange={(e) => {
                          const val = e.target.value;
                          setPhases(phases.map((p) => (p.id === phase.id ? { ...p, name: val } : p)));
                        }}
                        className="w-full px-2 py-1 border border-slate-200 rounded font-medium focus:outline-none focus:border-indigo-500"
                      />
                    </td>
                    <td className="py-3 px-3">
                      <input
                        type="text"
                        value={phase.owner}
                        onChange={(e) => {
                          const val = e.target.value;
                          setPhases(phases.map((p) => (p.id === phase.id ? { ...p, owner: val } : p)));
                        }}
                        placeholder="เช่น Pongpakorn, Somchai"
                        className="w-full px-2 py-1 border border-slate-200 rounded focus:outline-none focus:border-indigo-500"
                      />
                    </td>
                    <td className="py-3 px-3">
                      <input
                        type="date"
                        value={phase.startDate}
                        onChange={(e) => {
                          const val = e.target.value;
                          setPhases(phases.map((p) => (p.id === phase.id ? { ...p, startDate: val } : p)));
                        }}
                        className="w-full px-1.5 py-1 border border-slate-200 rounded focus:outline-none"
                      />
                    </td>
                    <td className="py-3 px-3">
                      <input
                        type="date"
                        value={phase.endDate}
                        onChange={(e) => {
                          const val = e.target.value;
                          setPhases(phases.map((p) => (p.id === phase.id ? { ...p, endDate: val } : p)));
                        }}
                        className="w-full px-1.5 py-1 border border-slate-200 rounded focus:outline-none"
                      />
                    </td>
                    <td className="py-3 px-3">
                      <select
                        value={phase.status}
                        onChange={(e) => {
                          const val = e.target.value as Phase["status"];
                          setPhases(phases.map((p) => (p.id === phase.id ? { ...p, status: val } : p)));
                        }}
                        className="w-full px-1.5 py-1 border border-slate-200 rounded focus:outline-none bg-white font-medium cursor-pointer"
                      >
                        <option value="Not Started">Not Started</option>
                        <option value="In Progress">In Progress</option>
                        <option value="Done">Done</option>
                      </select>
                    </td>
                    <td className="py-3 px-3 font-mono font-bold">
                      <div className="flex items-center gap-2">
                        <div className="flex-1 bg-slate-100 rounded-full h-2 border border-slate-200 overflow-hidden">
                          <div
                            className={`h-full ${
                              phaseProgress === 100 ? "bg-indigo-500" : "bg-amber-500"
                            }`}
                            style={{ width: `${phaseProgress}%` }}
                          />
                        </div>
                        <span>{phaseProgress}%</span>
                      </div>
                    </td>
                    <td className="py-3 px-2 text-center">
                      <button
                        onClick={() => handleDeletePhase(phase.id)}
                        className="text-rose-500 hover:text-rose-700 p-1 cursor-pointer"
                      >
                        <Trash2 className="w-3.5 h-3.5" />
                      </button>
                    </td>
                  </tr>

                  {phase.isExpanded && (
                    <tr>
                      <td colSpan={9} className="bg-slate-50/50 p-4 border-t border-b border-slate-100">
                        <div className="pl-8 space-y-3">
                          <h4 className="font-semibold text-slate-700 text-xs">
                            รายละเอียดงานภายในเฟสนี้
                          </h4>

                          {phase.items.map((task) => (
                            <div
                              key={task.id}
                              className="flex items-start gap-3 bg-white p-2.5 rounded-lg border border-slate-200"
                            >
                              <input
                                type="checkbox"
                                checked={task.completed}
                                onChange={() => toggleTaskComplete(phase.id, task.id)}
                                className="mt-0.5 accent-indigo-600 rounded cursor-pointer"
                              />
                              <div className="flex-1">
                                <h5
                                  className={`font-bold text-xs ${
                                    task.completed ? "line-through text-slate-400" : "text-slate-800"
                                  }`}
                                >
                                  {task.title}
                                </h5>
                                {task.detail && (
                                  <p className="text-[11px] text-slate-500 mt-0.5">{task.detail}</p>
                                )}
                              </div>
                              <button
                                onClick={() => handleDeleteTask(phase.id, task.id)}
                                className="text-rose-400 hover:text-rose-600 p-1 cursor-pointer"
                              >
                                <Trash2 className="w-3 h-3" />
                              </button>
                            </div>
                          ))}

                          <div className="flex flex-col sm:flex-row items-center gap-2 pt-2">
                            <input
                              type="text"
                              placeholder="หัวข้องาน เช่น ออกแบบหน้า Login"
                              value={newTaskTitle[phase.id] || ""}
                              onChange={(e) =>
                                setNewTaskTitle({ ...newTaskTitle, [phase.id]: e.target.value })
                              }
                              className="flex-1 px-3 py-1.5 border border-slate-200 rounded-lg text-xs w-full focus:outline-none focus:border-indigo-500"
                            />
                            <input
                              type="text"
                              placeholder="รายละเอียดเพิ่มเติม (ถ้ามี)"
                              value={newTaskDetail[phase.id] || ""}
                              onChange={(e) =>
                                setNewTaskDetail({ ...newTaskDetail, [phase.id]: e.target.value })
                              }
                              className="flex-1 px-3 py-1.5 border border-slate-200 rounded-lg text-xs w-full focus:outline-none focus:border-indigo-500"
                            />
                            <button
                              onClick={() => handleAddTask(phase.id)}
                              className="px-3 py-1.5 bg-indigo-600 hover:bg-indigo-700 text-white rounded-lg text-xs font-bold flex items-center gap-1 shrink-0 cursor-pointer"
                            >
                              <Plus className="w-3.5 h-3.5" />
                              เพิ่มรายการ
                            </button>
                          </div>
                        </div>
                      </td>
                    </tr>
                  )}
                </React.Fragment>
              );
            })}
          </tbody>
        </table>
      </div>
    </div>
  );
}