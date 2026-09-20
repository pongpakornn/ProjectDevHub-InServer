// พอร์ตมาจาก AutoFlowStudio_ModulesD (src/lib/mermaid.ts) แบบเกือบทั้งหมด — Theme สี Indigo #4F46E5
// ตรงกับ Accent Color เดิมของ ProjectDevHub อยู่แล้ว ไม่ต้องปรับ
let mermaidPromise: Promise<typeof import("mermaid").default> | null = null;

export const loadMermaid = async () => {
  if (!mermaidPromise) {
    mermaidPromise = import("mermaid").then((m) => {
      m.default.initialize({
        startOnLoad: false,
        securityLevel: "loose",
        theme: "base",
        fontFamily: "inherit",
        themeVariables: {
          primaryColor: "#EEF2FF",
          primaryBorderColor: "#4F46E5",
          primaryTextColor: "#0F172A",
          lineColor: "#64748B",
          secondaryColor: "#F1F5F9",
          tertiaryColor: "#FFFFFF",
        },
      });
      return m.default;
    });
  }
  return mermaidPromise;
};

/** แปลง Mermaid code เป็น SVG string (ใช้ทั้งหน้า preview และตอนส่งออกเอกสาร) */
export async function renderMermaidSvg(code: string): Promise<string> {
  const mermaid = await loadMermaid();
  const id = `d${Math.random().toString(36).slice(2, 9)}`;
  try {
    const { svg } = await mermaid.render(id, code);
    return svg;
  } finally {
    document.getElementById(`d${id}`)?.remove();
    document.querySelectorAll('[id^="dd"]').forEach((n) => n.remove());
  }
}

export interface RasterImage {
  dataUrl: string;
  width: number;
  height: number;
}

/** แปลง SVG string เป็น PNG dataURL ความละเอียดสูง */
export async function svgToPng(svg: string, scale = 2, maxWidth = 1400): Promise<RasterImage> {
  const doc = new DOMParser().parseFromString(svg, "image/svg+xml");
  const el = doc.documentElement as unknown as SVGSVGElement;
  const viewBox = (el.getAttribute("viewBox") ?? "0 0 900 600").split(/[\s,]+/).map(Number);
  let width = Number(viewBox[2]) || 900;
  let height = Number(viewBox[3]) || 600;
  if (width > maxWidth) {
    height = (height * maxWidth) / width;
    width = maxWidth;
  }
  el.setAttribute("width", String(width));
  el.setAttribute("height", String(height));
  el.setAttribute("xmlns", "http://www.w3.org/2000/svg");
  el.setAttribute("style", "background:#ffffff");
  const source = new XMLSerializer().serializeToString(el);

  const img = new Image();
  img.crossOrigin = "anonymous";
  await new Promise<void>((resolve, reject) => {
    img.onload = () => resolve();
    img.onerror = () => reject(new Error("แปลงรูปไดอะแกรมไม่สำเร็จ"));
    img.src = `data:image/svg+xml;base64,${btoa(unescape(encodeURIComponent(source)))}`;
  });

  const canvas = document.createElement("canvas");
  canvas.width = Math.round(width * scale);
  canvas.height = Math.round(height * scale);
  const ctx = canvas.getContext("2d");
  if (!ctx) throw new Error("เบราว์เซอร์ไม่รองรับการแปลงรูปภาพ");
  ctx.fillStyle = "#ffffff";
  ctx.fillRect(0, 0, canvas.width, canvas.height);
  ctx.drawImage(img, 0, 0, canvas.width, canvas.height);
  return { dataUrl: canvas.toDataURL("image/png"), width, height };
}
