"use client";

import React from "react";
import { useParams } from "next/navigation";
import { flowProjects } from "../page";
import FlowDetailHeader from "@/components/flow/flow-detail-header";
import FlowDiagramSection from "@/components/flow/flow-diagram-section";
import ArchitectureDiagramSection from "@/components/flow/architecture-diagram-section";
import FlowGanttQaSections from "@/components/flow/flow-gantt-qa-sections";

export default function FlowProjectDetailPage() {
  const params = useParams();
  const projectId = String(params.id);
  const project = flowProjects.find((p) => p.id === projectId) || flowProjects[0];

  return (
    <div className="w-full select-none space-y-6">
      <FlowDetailHeader
        name={project.name}
        status={project.status}
        startDate={project.startDate}
        endDate={project.endDate}
        workType={project.workType}
      />

      <FlowDiagramSection phases={project.phases} />

      <ArchitectureDiagramSection
        frontend={project.frontend}
        backend={project.backend}
        database={project.database}
      />

      <FlowGanttQaSections />
    </div>
  );
}