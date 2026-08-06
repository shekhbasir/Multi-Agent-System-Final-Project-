import * as fabric from "fabric";

export const FREE_DRAW_TOOLS = ["pen", "pencil", "brush", "marker", "eraser"];
export const SHAPE_TOOLS = ["rectangle", "circle", "triangle", "line", "arrow"];
export const CUSTOM_PROPS = ["fileUrl"];

const BRUSH_PRESETS = {
  pen: { width: 2, opacity: 1 },
  pencil: { width: 1.5, opacity: 0.85 },
  brush: { width: 10, opacity: 1 },
  marker: { width: 18, opacity: 0.45 },
};

export const hexToRgba = (hex, opacity = 1) => {
  const clean = hex.replace("#", "");
  const bigint = parseInt(clean, 16);
  const r = (bigint >> 16) & 255;
  const g = (bigint >> 8) & 255;
  const b = bigint & 255;
  return `rgba(${r}, ${g}, ${b}, ${opacity})`;
};

export const applyFreeDrawBrush = (canvas, tool, color, strokeWidth) => {
  if (tool === "eraser") {
    const eraser = new fabric.EraserBrush(canvas);
    eraser.width = strokeWidth || 20;
    canvas.freeDrawingBrush = eraser;
    return;
  }

  const preset = BRUSH_PRESETS[tool] || BRUSH_PRESETS.pen;
  const brush = new fabric.PencilBrush(canvas);
  brush.width = strokeWidth || preset.width;
  brush.color = hexToRgba(color, preset.opacity);
  brush.strokeLineCap = "round";
  brush.strokeLineJoin = "round";
  canvas.freeDrawingBrush = brush;
};

export const createArrow = (x1, y1, x2, y2, color, strokeWidth) => {
  const angle = Math.atan2(y2 - y1, x2 - x1);
  const headLength = Math.max(12, strokeWidth * 3);

  const line = new fabric.Line([x1, y1, x2, y2], {
    stroke: color,
    strokeWidth,
    selectable: false,
    evented: false,
  });

  const head = new fabric.Triangle({
    left: x2,
    top: y2,
    originX: "center",
    originY: "center",
    width: headLength,
    height: headLength,
    fill: color,
    angle: (angle * 180) / Math.PI + 90,
    selectable: false,
    evented: false,
  });

  return new fabric.Group([line, head], { selectable: true });
};

export const createStickyNote = (left, top, variant = "sticky") => {
  const isRich = variant === "rich";

  return new fabric.Textbox(
    isRich ? "Rich note — click to edit" : "Sticky note",
    {
      left,
      top,
      width: isRich ? 260 : 180,
      fontSize: isRich ? 15 : 16,
      fontFamily: "sans-serif",
      fill: "#1b2436",
      backgroundColor: isRich ? "#ffffff" : "#fef08a",
      padding: 14,
      editable: true,
      shadow: "rgba(0,0,0,0.25) 0px 4px 10px",
      stroke: isRich ? "#e2e8f0" : undefined,
      strokeWidth: isRich ? 1 : 0,
    },
  );
};

export const createFileCard = ({ url, name, type }, left = 150, top = 150) => {
  const isPdf = type === "application/pdf";

  const bg = new fabric.Rect({
    width: 200,
    height: 90,
    rx: 12,
    ry: 12,
    fill: "#ffffff",
    stroke: "#e2e8f0",
    strokeWidth: 1,
  });

  const badge = new fabric.Text(isPdf ? "PDF" : "DOC", {
    fontSize: 16,
    fontWeight: "bold",
    fill: isPdf ? "#dc2626" : "#2563eb",
    left: 14,
    top: 14,
  });

  const label = new fabric.Textbox(name, {
    fontSize: 12,
    width: 172,
    left: 14,
    top: 48,
    fill: "#1b2436",
    editable: false,
  });

  const group = new fabric.Group([bg, badge, label], { left, top });
  group.fileUrl = url;
  group.on("mousedblclick", () => window.open(url, "_blank"));
  group.__fileCardBound = true;
  return group;
};

export const rehydrateFileCards = (canvas) => {
  canvas.getObjects().forEach((obj) => {
    if (obj.fileUrl && !obj.__fileCardBound) {
      obj.on("mousedblclick", () => window.open(obj.fileUrl, "_blank"));
      obj.__fileCardBound = true;
    }
  });
};
