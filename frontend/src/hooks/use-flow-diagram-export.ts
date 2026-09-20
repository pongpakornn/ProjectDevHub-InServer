"use client";

// พอร์ตมาจาก AutoFlowStudio_ModulesD (src/hooks/useExportDoc.ts) แบบเกือบทั้งหมด — Logic ล้วน ไม่ผูก Framework
// ตัด exportPdf ออก (เปิดหน้าต่างพิมพ์ของเบราว์เซอร์ ยังไม่เข้ากับ Flow ผูก Auth/Session ของโปรเจกต์นี้ในรอบแรก)
import { useCallback, useState } from "react";
import type { FlowDiagramOptions, FlowDiagramRow, FlowDiagramRowsByType, FlowDiagramProjectMeta } from "@/types/flow-diagram";
import { FLOW_DIAGRAM_TYPES } from "@/lib/flow-diagram-templates";
import { generateFlowDiagram } from "@/lib/flow-diagram-generator";
import { renderMermaidSvg, svgToPng, type RasterImage } from "@/lib/flow-diagram-mermaid";

const download = (blob: Blob, filename: string) => {
  const url = URL.createObjectURL(blob);
  const a = document.createElement("a");
  a.href = url;
  a.download = filename;
  document.body.appendChild(a);
  a.click();
  a.remove();
  setTimeout(() => URL.revokeObjectURL(url), 1000);
};

const slug = (v: string) => (v.trim() || "workflow").toLowerCase().replace(/[^a-z0-9ก-๙]+/g, "-");

const svgSource = (svgEl: SVGSVGElement) => {
  const clone = svgEl.cloneNode(true) as SVGSVGElement;
  clone.setAttribute("xmlns", "http://www.w3.org/2000/svg");
  clone.setAttribute("style", "background:#ffffff");
  return new XMLSerializer().serializeToString(clone);
};

const dataUrlToBytes = (dataUrl: string) => {
  const base64 = dataUrl.split(",")[1] ?? "";
  const bin = atob(base64);
  const bytes = new Uint8Array(bin.length);
  for (let i = 0; i < bin.length; i += 1) bytes[i] = bin.charCodeAt(i);
  return bytes;
};

export interface FlowDiagramExportProgress {
  running: boolean;
  step: string;
  percent: number;
}

const cell = (v: string | undefined) => (v && v.trim() ? v.trim() : "-");

export function useFlowDiagramExport() {
  const [progress, setProgress] = useState<FlowDiagramExportProgress>({ running: false, step: "", percent: 0 });

  const exportSvg = useCallback((svgEl: SVGSVGElement | null, name: string) => {
    if (!svgEl) throw new Error("ยังไม่มีไดอะแกรมให้ส่งออก");
    download(new Blob([svgSource(svgEl)], { type: "image/svg+xml;charset=utf-8" }), `${slug(name)}.svg`);
  }, []);

  const exportPng = useCallback(async (svgEl: SVGSVGElement | null, name: string, scale = 3) => {
    if (!svgEl) throw new Error("ยังไม่มีไดอะแกรมให้ส่งออก");
    const { dataUrl } = await svgToPng(svgSource(svgEl), scale, 2400);
    const res = await fetch(dataUrl);
    download(await res.blob(), `${slug(name)}.png`);
  }, []);

  /** เรนเดอร์ไดอะแกรมทั้ง 6 หมวดเป็นรูปภาพ พร้อมรายงานความคืบหน้า */
  const renderAll = useCallback(
    async (meta: FlowDiagramProjectMeta, rows: FlowDiagramRowsByType, options: FlowDiagramOptions) => {
      const results: {
        id: string;
        title: string;
        subtitle: string;
        description: string;
        code: string;
        image: RasterImage | null;
      }[] = [];
      for (let i = 0; i < FLOW_DIAGRAM_TYPES.length; i += 1) {
        const flow = FLOW_DIAGRAM_TYPES[i]!;
        setProgress({ running: true, step: `กำลังสร้างไดอะแกรม ${flow.title}`, percent: Math.round(((i + 1) / (FLOW_DIAGRAM_TYPES.length + 1)) * 100) });
        const code = generateFlowDiagram(flow.id, rows[flow.id], meta, options);
        let image: RasterImage | null = null;
        try {
          image = await svgToPng(await renderMermaidSvg(code), 2, 1400);
        } catch {
          image = null;
        }
        results.push({ id: flow.id, title: flow.title, subtitle: flow.subtitle, description: flow.description, code, image });
        await new Promise((r) => setTimeout(r, 0));
      }
      return results;
    },
    [],
  );

  const buildMarkdown = useCallback((meta: FlowDiagramProjectMeta, rows: FlowDiagramRowsByType, options: FlowDiagramOptions) => {
    const out: string[] = [
      `# ${meta.projectName || "System Documentation"}`,
      "",
      `- **System Type:** ${meta.systemType || "-"}`,
      `- **Modules:** ${meta.moduleList || "-"}`,
      `- **Owner:** ${meta.owner || "-"}`,
      `- **Generated:** ${new Date().toLocaleString("th-TH")}`,
      "",
      "## สารบัญ",
      ...FLOW_DIAGRAM_TYPES.map((f, i) => `${i + 1}. ${f.title}`),
      "",
    ];
    FLOW_DIAGRAM_TYPES.forEach((flow, index) => {
      const data: FlowDiagramRow[] = rows[flow.id];
      out.push(`## ${index + 1}. ${flow.title}`, `_${flow.subtitle} — ${flow.description}_`, "");
      out.push(`| ${flow.columns.map((c) => c.label).join(" | ")} |`);
      out.push(`| ${flow.columns.map(() => "---").join(" | ")} |`);
      data.forEach((r) => out.push(`| ${flow.columns.map((c) => cell(r[c.key] as string)).join(" | ")} |`));
      out.push("", "```mermaid", generateFlowDiagram(flow.id, data, meta, options), "```", "");
    });
    return out.join("\n");
  }, []);

  const exportMarkdown = useCallback(
    (meta: FlowDiagramProjectMeta, rows: FlowDiagramRowsByType, options: FlowDiagramOptions) => {
      download(
        new Blob([buildMarkdown(meta, rows, options)], { type: "text/markdown;charset=utf-8" }),
        `${slug(meta.projectName)}-docs.md`,
      );
    },
    [buildMarkdown],
  );

  /** รูปเล่ม Word (.docx) จริง: หน้าปก + สารบัญ + ทุกหมวดพร้อมรูปและตาราง */
  const exportWord = useCallback(
    async (meta: FlowDiagramProjectMeta, rows: FlowDiagramRowsByType, options: FlowDiagramOptions) => {
      try {
        const sections = await renderAll(meta, rows, options);
        setProgress({ running: true, step: "กำลังประกอบไฟล์ Word", percent: 95 });
        const docx = await import("docx");
        const { Document, Packer, Paragraph, TextRun, HeadingLevel, ImageRun, Table, TableRow, TableCell, WidthType, PageBreak, AlignmentType } = docx;

        const textCell = (v: string | undefined, bold = false) =>
          new TableCell({
            children: [new Paragraph({ children: [new TextRun({ text: cell(v), bold, size: 18, font: "Tahoma" })] })],
          });

        const children: unknown[] = [];
        const push = (node: unknown) => children.push(node);

        push(new Paragraph({ text: "", spacing: { after: 1200 } }));
        push(
          new Paragraph({
            alignment: AlignmentType.CENTER,
            children: [new TextRun({ text: meta.projectName || "System Documentation", bold: true, size: 56, font: "Tahoma" })],
          }),
        );
        push(
          new Paragraph({
            alignment: AlignmentType.CENTER,
            spacing: { before: 300 },
            children: [new TextRun({ text: "System Workflow & Documentation", size: 28, font: "Tahoma", color: "4F46E5" })],
          }),
        );
        [
          `System Type: ${meta.systemType || "-"}`,
          `Modules: ${meta.moduleList || "-"}`,
          `Owner: ${meta.owner || "-"}`,
          `Generated: ${new Date().toLocaleString("th-TH")}`,
        ].forEach((line) =>
          push(
            new Paragraph({
              alignment: AlignmentType.CENTER,
              spacing: { before: 120 },
              children: [new TextRun({ text: line, size: 22, font: "Tahoma" })],
            }),
          ),
        );
        push(new Paragraph({ children: [new PageBreak()] }));

        push(new Paragraph({ heading: HeadingLevel.HEADING_1, children: [new TextRun({ text: "สารบัญ", bold: true, size: 32, font: "Tahoma" })] }));
        sections.forEach((s, i) =>
          push(new Paragraph({ children: [new TextRun({ text: `${i + 1}. ${s.title} — ${s.subtitle}`, size: 22, font: "Tahoma" })] })),
        );
        push(new Paragraph({ children: [new PageBreak()] }));

        sections.forEach((s, index) => {
          const flow = FLOW_DIAGRAM_TYPES.find((f) => f.id === s.id)!;
          push(
            new Paragraph({
              heading: HeadingLevel.HEADING_1,
              spacing: { before: 200, after: 120 },
              children: [new TextRun({ text: `${index + 1}. ${s.title}`, bold: true, size: 32, font: "Tahoma" })],
            }),
          );
          push(new Paragraph({ children: [new TextRun({ text: s.description, italics: true, size: 20, font: "Tahoma", color: "475569" })] }));

          if (s.image) {
            const width = Math.min(600, s.image.width);
            const height = Math.round((s.image.height * width) / s.image.width);
            push(
              new Paragraph({
                alignment: AlignmentType.CENTER,
                spacing: { before: 200, after: 200 },
                children: [new ImageRun({ type: "png", data: dataUrlToBytes(s.image.dataUrl), transformation: { width, height } })],
              }),
            );
          } else {
            push(new Paragraph({ children: [new TextRun({ text: "(ไม่สามารถเรนเดอร์ไดอะแกรมได้ — ตรวจสอบข้อมูลในตาราง)", size: 20, font: "Tahoma", color: "B91C1C" })] }));
          }

          push(
            new Table({
              width: { size: 100, type: WidthType.PERCENTAGE },
              rows: [
                new TableRow({ children: flow.columns.map((c) => textCell(c.label, true)) }),
                ...rows[s.id as keyof FlowDiagramRowsByType].map(
                  (r) => new TableRow({ children: flow.columns.map((c) => textCell(r[c.key] as string)) }),
                ),
              ],
            }),
          );
          if (index < sections.length - 1) push(new Paragraph({ children: [new PageBreak()] }));
        });

        const doc = new Document({ sections: [{ children: children as never[] }] });
        const blob = await Packer.toBlob(doc);
        download(blob, `${slug(meta.projectName)}-documentation.docx`);
      } finally {
        setProgress({ running: false, step: "", percent: 0 });
      }
    },
    [renderAll],
  );

  return { progress, exportSvg, exportPng, exportMarkdown, exportWord, buildMarkdown };
}
