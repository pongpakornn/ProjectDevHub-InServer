// พอร์ตมาจาก AutoFlowStudio_ModulesD (src/hooks/useDiagramGenerator.ts) — Logic ล้วน ไม่ผูก Framework
// ปรับชื่อ field ให้ตรงกับ FlowDiagramRow ของโปรเจกต์นี้ (step→stepNo, data→dataField, next→nextStep, option→optionValue)
import type {
  FlowDiagramOptions,
  FlowDiagramRow,
  FlowDiagramType,
  FlowDiagramProjectMeta,
  FlowDiagramValidationIssue,
} from "@/types/flow-diagram";

const clean = (v: string | undefined) => (v ?? "").trim();

/** ทำความสะอาดข้อความก่อนแปะลง Mermaid label (กัน syntax error จาก " ( ) # ; และขึ้นบรรทัดใหม่) */
export const sanitize = (v: string | undefined) =>
  clean(v)
    .replace(/["`]/g, "'")
    .replace(/[\n\r]+/g, " ")
    .replace(/[()]/g, (m) => (m === "(" ? "[" : "]"))
    .replace(/[#;{}|<>]/g, " ")
    .replace(/\s{2,}/g, " ");

/** id ที่ปลอดภัยสำหรับ Mermaid (ตัดอักขระพิเศษ/ภาษาไทยที่มีวรรณยุกต์ออกเป็น _) */
const idOf = (v: string | undefined, fallback: string) => {
  const base = clean(v).replace(/[^A-Za-z0-9]/g, "_").replace(/_{2,}/g, "_").replace(/^_|_$/g, "");
  return base ? `n_${base}` : fallback;
};

const PLACEHOLDER = 'flowchart TD\n  empty["ยังไม่มีข้อมูล — กรอกตารางเพื่อสร้างไดอะแกรม"]';

const isFilled = (r: FlowDiagramRow) => clean(r.actor) || clean(r.action) || clean(r.nextStep);

/* ------------------------------ validation ------------------------------ */

export function validateFlowDiagram(type: FlowDiagramType, rows: FlowDiagramRow[]): FlowDiagramValidationIssue[] {
  const issues: FlowDiagramValidationIssue[] = [];
  const filled = rows.filter(isFilled);
  const push = (
    row: FlowDiagramRow,
    field: keyof FlowDiagramRow,
    message: string,
    severity: FlowDiagramValidationIssue["severity"] = "error",
  ) => issues.push({ rowIndex: rows.indexOf(row), field, message, severity });

  if (type === "FLOWCHART") {
    const steps = new Set(filled.map((r) => clean(r.stepNo)).filter(Boolean));
    filled.forEach((r) => {
      if (!clean(r.action)) push(r, "action", "ยังไม่ได้ระบุ Action", "warning");
      const next = clean(r.nextStep);
      if (next && steps.size > 0 && !steps.has(next)) push(r, "nextStep", `Next ชี้ไปยัง Step "${next}" ที่ไม่มีในตาราง`);
    });
  }

  if (type === "SEQUENCE") {
    filled.forEach((r) => {
      if (!clean(r.actor)) push(r, "actor", "ต้องระบุ From");
      if (!clean(r.nextStep)) push(r, "nextStep", "ต้องระบุ To");
      if (!clean(r.action)) push(r, "action", "ยังไม่ได้ระบุ Message", "warning");
    });
  }

  if (type === "STATE") {
    const states = new Set(filled.flatMap((r) => [clean(r.actor), clean(r.nextStep)]).filter(Boolean));
    filled.forEach((r) => {
      if (!clean(r.actor)) push(r, "actor", "ต้องระบุ From State");
      if (!clean(r.nextStep)) push(r, "nextStep", "ต้องระบุ To State");
      else if (!states.has(clean(r.nextStep))) push(r, "nextStep", `To State "${clean(r.nextStep)}" ไม่มีในตาราง`);
      if (!clean(r.action)) push(r, "action", "ยังไม่ได้ระบุ Trigger", "warning");
    });
  }

  if (type === "ERD") {
    const tables = new Set(filled.map((r) => clean(r.actor)).filter(Boolean));
    filled.forEach((r) => {
      if (!clean(r.actor)) push(r, "actor", "ต้องระบุชื่อ Table");
      if (!clean(r.dataField)) push(r, "dataField", "ยังไม่ได้ระบุ Primary Key", "warning");
      const rel = clean(r.nextStep);
      if (rel && !tables.has(rel)) push(r, "nextStep", `Relates To "${rel}" ไม่มีตารางนี้ในรายการ`);
    });
  }

  if (type === "DFD") {
    filled.forEach((r) => {
      if (!clean(r.action)) push(r, "action", "ต้องระบุชื่อ Process");
      if (!clean(r.actor)) push(r, "actor", "ต้องระบุ Source", "warning");
      if (!clean(r.nextStep)) push(r, "nextStep", "ต้องระบุ Destination", "warning");
    });
  }

  if (type === "USECASE") {
    filled.forEach((r) => {
      if (!clean(r.actor)) push(r, "actor", "ต้องระบุ Actor");
      if (!clean(r.action)) push(r, "action", "ต้องระบุ Use Case");
    });
  }

  return issues;
}

/* ------------------------------ generators ------------------------------ */

function flowchart(rows: FlowDiagramRow[]): string {
  const lines = ["flowchart TD", "  start([Start])"];
  const ids = rows.map((_, i) => `s${i}`);
  rows.forEach((r, i) => {
    const label = sanitize(r.action || r.actor || `Step ${i + 1}`);
    const actor = sanitize(r.actor);
    const text = actor ? `${actor}: ${label}` : label;
    if (clean(r.decision)) {
      lines.push(`  ${ids[i]}{"${sanitize(r.decision)}"}`);
      lines.push(`  ${ids[i]}_a["${text}"]`);
    } else {
      lines.push(`  ${ids[i]}["${text}"]`);
    }
  });
  let prev = "start";
  rows.forEach((r, i) => {
    if (clean(r.decision)) {
      lines.push(`  ${prev} --> ${ids[i]}_a`);
      lines.push(`  ${ids[i]}_a --> ${ids[i]}`);
      const nextId = ids[i + 1] ?? "done";
      lines.push(`  ${ids[i]} -- Yes --> ${clean(rows[i + 1]?.decision ?? "") ? `${nextId}_a` : nextId}`);
      lines.push(`  ${ids[i]} -- No --> reject([Rejected])`);
      prev = ids[i]!;
    } else {
      lines.push(`  ${prev} --> ${ids[i]}`);
      prev = ids[i]!;
    }
  });
  lines.push(`  ${prev} --> done([End])`);
  return lines.join("\n");
}

function usecase(rows: FlowDiagramRow[], meta: FlowDiagramProjectMeta): string {
  const lines = ["flowchart LR"];
  const actors = [...new Set(rows.map((r) => clean(r.actor)).filter(Boolean))];
  actors.forEach((a, i) => lines.push(`  a${i}(("${sanitize(a)}"))`));
  lines.push(`  subgraph SYS["${sanitize(meta.projectName) || "System"}"]`);
  rows.forEach((r, i) => lines.push(`    u${i}(["${sanitize(r.action) || `Use Case ${i + 1}`}"])`));
  lines.push("  end");
  rows.forEach((r, i) => {
    const ai = actors.indexOf(clean(r.actor));
    if (ai >= 0) lines.push(`  a${ai} --- u${i}`);
    const rel = sanitize(r.decision);
    if (rel) lines.push(`  u${i} -.->|${rel}| SYS`);
  });
  return lines.join("\n");
}

/**
 * DFD — Mermaid ไม่มีสัญลักษณ์ DFD จริง จึงใช้ flowchart LR ผสมรูปทรง
 * External Entity = สี่เหลี่ยม, Process = วงกลม/มน, Data Store = สี่เหลี่ยมเปิดสองด้าน
 */
function dfd(rows: FlowDiagramRow[], meta: FlowDiagramProjectMeta, level: FlowDiagramOptions["dfdLevel"]): string {
  const lines = ["flowchart LR"];
  const declared = new Set<string>();
  const entity = (name: string, fallback: string) => {
    const id = idOf(name, fallback);
    if (!declared.has(id)) {
      declared.add(id);
      lines.push(`  ${id}["${sanitize(name) || "External Entity"}"]`);
    }
    return id;
  };
  const store = (name: string, fallback: string) => {
    const id = `ds_${idOf(name, fallback)}`;
    if (!declared.has(id)) {
      declared.add(id);
      lines.push(`  ${id}[("${sanitize(name)}")]`);
    }
    return id;
  };

  if (level === "context") {
    const sys = "proc_0";
    lines.push(`  ${sys}(("0. ${sanitize(meta.projectName) || "System"}"))`);
    rows.forEach((r, i) => {
      const flow = sanitize(r.dataField) || "data";
      if (clean(r.actor)) lines.push(`  ${entity(r.actor, `src${i}`)} -->|${flow}| ${sys}`);
      if (clean(r.nextStep)) lines.push(`  ${sys} -->|${sanitize(r.decision) || flow}| ${entity(r.nextStep, `dst${i}`)}`);
    });
    return lines.join("\n");
  }

  const prefix = level === "level1" ? "1." : "";
  rows.forEach((r, i) => {
    const proc = `proc${i}`;
    lines.push(`  ${proc}(("${prefix}${i + 1} ${sanitize(r.action) || `Process ${i + 1}`}"))`);
    const flow = sanitize(r.dataField) || "data";
    if (clean(r.actor)) lines.push(`  ${entity(r.actor, `src${i}`)} -->|${flow}| ${proc}`);
    if (clean(r.nextStep)) lines.push(`  ${proc} -->|${flow}| ${entity(r.nextStep, `dst${i}`)}`);
    if (clean(r.decision)) lines.push(`  ${proc} <--> ${store(r.decision, `ds${i}`)}`);
  });
  return lines.join("\n");
}

function sequence(rows: FlowDiagramRow[]): string {
  const lines = ["sequenceDiagram", "  autonumber"];
  const parts = [...new Set(rows.flatMap((r) => [clean(r.actor), clean(r.nextStep)]).filter(Boolean))];
  const alias = new Map(parts.map((p, i) => [p, `P${i}`]));
  parts.forEach((p) => lines.push(`  participant ${alias.get(p)} as ${sanitize(p)}`));
  rows.forEach((r) => {
    const from = alias.get(clean(r.actor));
    const to = alias.get(clean(r.nextStep));
    if (!from || !to) return;
    lines.push(`  ${from}->>${to}: ${sanitize(r.action) || "request"}`);
    if (clean(r.dataField)) lines.push(`  Note over ${from},${to}: ${sanitize(r.dataField)}`);
    if (clean(r.decision)) lines.push(`  ${to}-->>${from}: ${sanitize(r.decision)}`);
  });
  return lines.join("\n");
}

const CARDINALITY: Record<string, string> = {
  "1-to-many": "||--o{",
  "1-to-1": "||--||",
  "many-to-many": "}o--o{",
  "0-to-many": "|o--o{",
};

function erd(rows: FlowDiagramRow[]): string {
  const lines = ["erDiagram"];
  const table = (v: string | undefined, f: string) => clean(v).replace(/[^A-Za-z0-9_]/g, "_") || f;
  rows.forEach((r, i) => {
    const t = table(r.actor, `TABLE_${i + 1}`);
    lines.push(`  ${t} {`);
    const pk = clean(r.dataField);
    const fk = clean(r.decision);
    if (pk) lines.push(`    int ${table(pk, "id")} PK`);
    if (fk) lines.push(`    int ${table(fk, "fk")} FK`);
    clean(r.action)
      .split(",")
      .map((c) => clean(c))
      .filter((c) => c && c !== pk && c !== fk)
      .forEach((c) => lines.push(`    string ${table(c, "column")}`));
    lines.push("  }");
  });
  rows.forEach((r, i) => {
    const parent = clean(r.nextStep);
    if (!parent) return;
    const rel = CARDINALITY[clean(r.optionValue) || "1-to-many"] ?? CARDINALITY["1-to-many"];
    lines.push(`  ${table(parent, "PARENT")} ${rel} ${table(r.actor, `TABLE_${i + 1}`)} : has`);
  });
  return lines.join("\n");
}

function state(rows: FlowDiagramRow[]): string {
  const lines = ["stateDiagram-v2"];
  const id = (v: string | undefined, f: string) => clean(v).replace(/[^A-Za-z0-9_]/g, "_") || f;
  const declared = new Map<string, string>();
  const declare = (v: string | undefined, f: string) => {
    const key = clean(v) || f;
    const sid = id(v, f);
    if (!declared.has(sid)) {
      declared.set(sid, key);
      lines.push(`  state "${sanitize(key)}" as ${sid}`);
    }
    return sid;
  };
  rows.forEach((r, i) => {
    declare(r.actor, `S${i}`);
    declare(r.nextStep, `S${i + 1}`);
  });
  if (rows[0]) lines.push(`  [*] --> ${id(rows[0].actor, "Draft")}`);
  rows.forEach((r, i) => {
    const from = id(r.actor, `S${i}`);
    const to = id(r.nextStep, `S${i + 1}`);
    const label = sanitize(r.action);
    const guard = sanitize(r.dataField);
    lines.push(`  ${from} --> ${to}${label || guard ? ` : ${[label, guard ? `[${guard}]` : ""].filter(Boolean).join(" ")}` : ""}`);
    if (clean(r.decision)) lines.push(`  note right of ${to}\n    ${sanitize(r.decision)}\n  end note`);
  });
  const last = rows[rows.length - 1];
  if (last) lines.push(`  ${id(last.nextStep, "Completed")} --> [*]`);
  return lines.join("\n");
}

export function generateFlowDiagram(
  type: FlowDiagramType,
  rows: FlowDiagramRow[],
  meta: FlowDiagramProjectMeta,
  options: FlowDiagramOptions = { dfdLevel: "level0" },
): string {
  const filled = rows.filter(isFilled);
  if (filled.length === 0) return PLACEHOLDER;
  switch (type) {
    case "FLOWCHART":
      return flowchart(filled);
    case "USECASE":
      return usecase(filled, meta);
    case "DFD":
      return dfd(filled, meta, options.dfdLevel);
    case "SEQUENCE":
      return sequence(filled);
    case "ERD":
      return erd(filled);
    case "STATE":
      return state(filled);
    default:
      return "flowchart TD\n  a[Unsupported]";
  }
}
