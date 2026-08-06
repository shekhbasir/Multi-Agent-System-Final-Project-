import { useEffect, useRef, useState } from "react";
import * as fabric from "fabric";
import jsPDF from "jspdf";
import socket from "../../config/socket";
import whiteboardApi from "../../config/whiteboardApi";
import WhiteboardToolbar from "./WhiteboardToolbar";
import {
  FREE_DRAW_TOOLS,
  SHAPE_TOOLS,
  CUSTOM_PROPS,
  applyFreeDrawBrush,
  createArrow,
  createStickyNote,
  createFileCard,
  rehydrateFileCards,
} from "./whiteboardHelpers";

function Whiteboard({ roomId, onClose }) {
  const wrapperRef = useRef(null);
  const canvasElRef = useRef(null);
  const fabricRef = useRef(null);
  const overlayRef = useRef(null);

  const [activeTool, setActiveTool] = useState("select");
  const [color, setColor] = useState("#22d3ee");
  const [fillColor, setFillColor] = useState("#22d3ee");
  const [fillEnabled, setFillEnabled] = useState(false);
  const [strokeWidth, setStrokeWidth] = useState(3);
  const [zoom, setZoom] = useState(1);
  const [canUndo, setCanUndo] = useState(false);
  const [canRedo, setCanRedo] = useState(false);
  const [uploading, setUploading] = useState(false);
  const [saveStatus, setSaveStatus] = useState("saved");
  const [localLaser, setLocalLaser] = useState(null);
  const [remoteLasers, setRemoteLasers] = useState({});

  const activeToolRef = useRef(activeTool);
  const colorRef = useRef(color);
  const fillColorRef = useRef(fillColor);
  const fillEnabledRef = useRef(fillEnabled);
  const strokeWidthRef = useRef(strokeWidth);

  const historyRef = useRef([]);
  const redoRef = useRef([]);
  const suppressHistoryRef = useRef(false);
  const broadcastTimerRef = useRef(null);

  const drawingShapeRef = useRef(null);
  const shapeStartRef = useRef(null);
  const isPanningRef = useRef(false);
  const lastPosRef = useRef({ x: 0, y: 0 });
  const laserTimeoutsRef = useRef({});
  const imageInputRef = useRef(null);
  const docInputRef = useRef(null);

  /* ---------------- keep refs in sync with state ---------------- */
  useEffect(() => {
    activeToolRef.current = activeTool;
    colorRef.current = color;
    fillColorRef.current = fillColor;
    fillEnabledRef.current = fillEnabled;
    strokeWidthRef.current = strokeWidth;

    const canvas = fabricRef.current;
    if (!canvas) return;

    canvas.isDrawingMode = FREE_DRAW_TOOLS.includes(activeTool);
    canvas.selection = activeTool === "select";
    canvas.skipTargetFind = activeTool !== "select";

    if (canvas.isDrawingMode) {
      applyFreeDrawBrush(canvas, activeTool, color, strokeWidth);
    }

    canvas.defaultCursor =
      activeTool === "hand"
        ? "grab"
        : SHAPE_TOOLS.includes(activeTool) ||
            ["text", "sticky", "rich", "laser"].includes(activeTool)
          ? "crosshair"
          : "default";

    canvas.renderAll();
  }, [activeTool, color, fillColor, fillEnabled, strokeWidth]);

  /* ---------------- core setup (runs once) ---------------- */
  useEffect(() => {
    const wrapper = wrapperRef.current;
    const canvas = new fabric.Canvas(canvasElRef.current, {
      width: wrapper.clientWidth,
      height: wrapper.clientHeight,
      backgroundColor: "#ffffff",
      preserveObjectStacking: true,
    });
    fabricRef.current = canvas;

    const loadCanvasJSON = (json, cb) => {
      suppressHistoryRef.current = true;
      canvas.loadFromJSON(json, () => {
        rehydrateFileCards(canvas);
        canvas.renderAll();
        suppressHistoryRef.current = false;
        if (cb) cb();
      });
    };

    const scheduleBroadcast = (json) => {
      setSaveStatus("saving");
      if (broadcastTimerRef.current) clearTimeout(broadcastTimerRef.current);
      broadcastTimerRef.current = setTimeout(() => {
        socket.emit("whiteboard:sync", { roomId, canvasJSON: json }, () => {
          setSaveStatus("saved");
        });
      }, 300);
    };

    const pushHistory = () => {
      if (suppressHistoryRef.current) return;
      const json = canvas.toJSON(CUSTOM_PROPS);
      historyRef.current.push(JSON.stringify(json));
      if (historyRef.current.length > 60) historyRef.current.shift();
      redoRef.current = [];
      setCanUndo(historyRef.current.length > 1);
      setCanRedo(false);
      scheduleBroadcast(json);
    };

    canvas.loadCanvasJSON = loadCanvasJSON;
    canvas.pushHistory = pushHistory;
    canvas.scheduleBroadcast = scheduleBroadcast;

    /* ----- object change listeners ----- */
    canvas.on("object:added", pushHistory);
    canvas.on("object:modified", pushHistory);
    canvas.on("object:removed", pushHistory);
    canvas.on("path:created", pushHistory);
    canvas.on("text:changed", pushHistory);

    /* ----- mouse handlers for shapes / pan / text / notes / laser ----- */
    const handleMouseDown = (opt) => {
      const tool = activeToolRef.current;
      const pointer = canvas.getPointer(opt.e);

      if (tool === "hand") {
        isPanningRef.current = true;
        lastPosRef.current = { x: opt.e.clientX, y: opt.e.clientY };
        return;
      }

      if (tool === "laser") return;

      if (SHAPE_TOOLS.includes(tool)) {
        shapeStartRef.current = pointer;
        suppressHistoryRef.current = true;

        const common = {
          stroke: colorRef.current,
          strokeWidth: strokeWidthRef.current,
          fill: fillEnabledRef.current ? fillColorRef.current : "transparent",
          selectable: false,
          evented: false,
        };

        let shape = null;
        if (tool === "rectangle") {
          shape = new fabric.Rect({
            ...common,
            left: pointer.x,
            top: pointer.y,
            width: 1,
            height: 1,
          });
        } else if (tool === "circle") {
          shape = new fabric.Ellipse({
            ...common,
            left: pointer.x,
            top: pointer.y,
            rx: 1,
            ry: 1,
          });
        } else if (tool === "triangle") {
          shape = new fabric.Triangle({
            ...common,
            left: pointer.x,
            top: pointer.y,
            width: 1,
            height: 1,
          });
        } else if (tool === "line") {
          shape = new fabric.Line(
            [pointer.x, pointer.y, pointer.x, pointer.y],
            {
              stroke: colorRef.current,
              strokeWidth: strokeWidthRef.current,
              selectable: false,
              evented: false,
            },
          );
        } else if (tool === "arrow") {
          shape = createArrow(
            pointer.x,
            pointer.y,
            pointer.x,
            pointer.y,
            colorRef.current,
            strokeWidthRef.current,
          );
        }

        if (shape) {
          drawingShapeRef.current = shape;
          canvas.add(shape);
        }
        return;
      }

      if (tool === "text") {
        const textbox = new fabric.Textbox("Type here...", {
          left: pointer.x,
          top: pointer.y,
          fontSize: 20,
          fill: colorRef.current,
          width: 240,
        });
        canvas.add(textbox);
        canvas.setActiveObject(textbox);
        textbox.enterEditing();
        textbox.selectAll();
        setActiveTool("select");
        return;
      }

      if (tool === "sticky" || tool === "rich") {
        const note = createStickyNote(pointer.x, pointer.y, tool);
        canvas.add(note);
        canvas.setActiveObject(note);
        setActiveTool("select");
        return;
      }
    };

    const handleMouseMove = (opt) => {
      const tool = activeToolRef.current;

      if (tool === "hand" && isPanningRef.current) {
        const e = opt.e;
        const vpt = canvas.viewportTransform;
        vpt[4] += e.clientX - lastPosRef.current.x;
        vpt[5] += e.clientY - lastPosRef.current.y;
        canvas.requestRenderAll();
        lastPosRef.current = { x: e.clientX, y: e.clientY };
        return;
      }

      if (tool === "laser") {
        const pointer = canvas.getPointer(opt.e);
        const screenPt = fabric.util.transformPoint(
          pointer,
          canvas.viewportTransform,
        );
        setLocalLaser(screenPt);
        socket.emit("whiteboard:laser", { roomId, x: pointer.x, y: pointer.y });
        return;
      }

      const shape = drawingShapeRef.current;
      if (!shape) return;
      const pointer = canvas.getPointer(opt.e);
      const start = shapeStartRef.current;

      if (tool === "rectangle" || tool === "triangle") {
        shape.set({
          width: Math.abs(pointer.x - start.x),
          height: Math.abs(pointer.y - start.y),
          left: Math.min(pointer.x, start.x),
          top: Math.min(pointer.y, start.y),
        });
      } else if (tool === "circle") {
        shape.set({
          rx: Math.abs(pointer.x - start.x) / 2,
          ry: Math.abs(pointer.y - start.y) / 2,
          left: Math.min(pointer.x, start.x),
          top: Math.min(pointer.y, start.y),
        });
      } else if (tool === "line") {
        shape.set({ x2: pointer.x, y2: pointer.y });
      } else if (tool === "arrow") {
        canvas.remove(shape);
        const updated = createArrow(
          start.x,
          start.y,
          pointer.x,
          pointer.y,
          colorRef.current,
          strokeWidthRef.current,
        );
        drawingShapeRef.current = updated;
        canvas.add(updated);
      }
      canvas.requestRenderAll();
    };

    const handleMouseUp = () => {
      isPanningRef.current = false;

      const shape = drawingShapeRef.current;
      if (shape) {
        shape.set({ selectable: true, evented: true });
        drawingShapeRef.current = null;
        canvas.setActiveObject(shape);
        suppressHistoryRef.current = false;
        pushHistory();
      }

      if (activeToolRef.current === "laser") {
        setLocalLaser(null);
      }
    };

    const handleWheel = (opt) => {
      const delta = opt.e.deltaY;
      let newZoom = canvas.getZoom() * 0.999 ** delta;
      newZoom = Math.min(4, Math.max(0.2, newZoom));
      canvas.zoomToPoint({ x: opt.e.offsetX, y: opt.e.offsetY }, newZoom);
      setZoom(newZoom);
      opt.e.preventDefault();
      opt.e.stopPropagation();
    };

    canvas.on("mouse:down", handleMouseDown);
    canvas.on("mouse:move", handleMouseMove);
    canvas.on("mouse:up", handleMouseUp);
    canvas.on("mouse:wheel", handleWheel);

    /* ----- initial load ----- */
    whiteboardApi
      .get(`/${roomId}`)
      .then((res) => {
        const saved = res.data.canvasJSON;
        if (saved) {
          loadCanvasJSON(saved, () => {
            historyRef.current = [JSON.stringify(saved)];
            setCanUndo(false);
          });
        } else {
          historyRef.current = [JSON.stringify(canvas.toJSON(CUSTOM_PROPS))];
        }
      })
      .catch(() => {
        historyRef.current = [JSON.stringify(canvas.toJSON(CUSTOM_PROPS))];
      });

    /* ----- socket ----- */
    socket.emit("whiteboard:join", roomId);

    const onRemoteSync = ({ canvasJSON }) => {
      loadCanvasJSON(canvasJSON);
    };

    const onLaser = ({ x, y, userName }) => {
      const screenPt = fabric.util.transformPoint(
        { x, y },
        canvas.viewportTransform,
      );
      setRemoteLasers((prev) => ({
        ...prev,
        [userName]: { ...screenPt, userName },
      }));
      clearTimeout(laserTimeoutsRef.current[userName]);
      laserTimeoutsRef.current[userName] = setTimeout(() => {
        setRemoteLasers((prev) => {
          const next = { ...prev };
          delete next[userName];
          return next;
        });
      }, 1200);
    };

    socket.on("whiteboard:sync", onRemoteSync);
    socket.on("whiteboard:laser", onLaser);

    /* ----- resize ----- */
    const handleResize = () => {
      canvas.setWidth(wrapper.clientWidth);
      canvas.setHeight(wrapper.clientHeight);
      canvas.renderAll();
    };
    window.addEventListener("resize", handleResize);

    return () => {
      window.removeEventListener("resize", handleResize);
      socket.emit("whiteboard:leave", roomId);
      socket.off("whiteboard:sync", onRemoteSync);
      socket.off("whiteboard:laser", onLaser);
      if (broadcastTimerRef.current) clearTimeout(broadcastTimerRef.current);
      canvas.dispose();
      fabricRef.current = null;
    };
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [roomId]);

  /* ---------------- actions ---------------- */
  const undo = () => {
    const canvas = fabricRef.current;
    if (!canvas || historyRef.current.length < 2) return;
    const current = historyRef.current.pop();
    redoRef.current.push(current);
    const previous = historyRef.current[historyRef.current.length - 1];
    canvas.loadCanvasJSON(previous, () => {
      setCanUndo(historyRef.current.length > 1);
      setCanRedo(true);
      canvas.scheduleBroadcast(JSON.parse(previous));
    });
  };

  const redo = () => {
    const canvas = fabricRef.current;
    if (!canvas || redoRef.current.length === 0) return;
    const next = redoRef.current.pop();
    historyRef.current.push(next);
    canvas.loadCanvasJSON(next, () => {
      setCanUndo(true);
      setCanRedo(redoRef.current.length > 0);
      canvas.scheduleBroadcast(JSON.parse(next));
    });
  };

  const clearCanvas = () => {
    const canvas = fabricRef.current;
    if (!canvas) return;
    if (!window.confirm("Clear the entire whiteboard for everyone?")) return;
    canvas.clear();
    canvas.backgroundColor = "#ffffff";
    canvas.renderAll();
    canvas.pushHistory();
  };

  const applyZoom = (newZoom) => {
    const canvas = fabricRef.current;
    if (!canvas) return;
    const clamped = Math.min(4, Math.max(0.2, newZoom));
    const center = canvas.getVpCenter
      ? canvas.getVpCenter()
      : { x: canvas.width / 2, y: canvas.height / 2 };
    canvas.zoomToPoint(center, clamped);
    setZoom(clamped);
  };

  const zoomReset = () => {
    const canvas = fabricRef.current;
    if (!canvas) return;
    canvas.setViewportTransform([1, 0, 0, 1, 0, 0]);
    setZoom(1);
  };

  const uploadAndAddFile = async (file) => {
    const canvas = fabricRef.current;
    if (!canvas) return;
    try {
      setUploading(true);
      const formData = new FormData();
      formData.append("file", file);
      const res = await whiteboardApi.post("/upload", formData, {
        headers: { "Content-Type": "multipart/form-data" },
      });
      const meta = res.data.file;
      const center = canvas.getVpCenter
        ? canvas.getVpCenter()
        : { x: 200, y: 200 };

      if (meta.type.startsWith("image/")) {
        const img = await fabric.Image.fromURL(meta.url, {
          crossOrigin: "anonymous",
        });
        img.scaleToWidth(320);
        img.set({ left: center.x - 160, top: center.y - 100 });
        canvas.add(img);
        canvas.setActiveObject(img);
      } else {
        const card = createFileCard(meta, center.x - 100, center.y - 45);
        canvas.add(card);
        canvas.setActiveObject(card);
      }
      canvas.renderAll();
    } catch (err) {
      alert(err?.response?.data?.message || "Upload failed");
    } finally {
      setUploading(false);
    }
  };

  const exportPNG = () => {
    const canvas = fabricRef.current;
    if (!canvas) return;
    const dataUrl = canvas.toDataURL({ format: "png", multiplier: 2 });
    const link = document.createElement("a");
    link.download = `whiteboard-${roomId}.png`;
    link.href = dataUrl;
    link.click();
  };

  const exportPDF = () => {
    const canvas = fabricRef.current;
    if (!canvas) return;
    const dataUrl = canvas.toDataURL({ format: "png", multiplier: 2 });
    const pdf = new jsPDF({
      orientation: canvas.width >= canvas.height ? "landscape" : "portrait",
      unit: "px",
      format: [canvas.width * 2, canvas.height * 2],
    });
    pdf.addImage(dataUrl, "PNG", 0, 0, canvas.width * 2, canvas.height * 2);
    pdf.save(`whiteboard-${roomId}.pdf`);
  };

  /* ----- drag & drop ----- */
  const handleDrop = (e) => {
    e.preventDefault();
    const file = e.dataTransfer.files?.[0];
    if (file) uploadAndAddFile(file);
  };

  return (
    <div
      className="fixed inset-0 z-[150] bg-[#05070d]"
      onDragOver={(e) => e.preventDefault()}
      onDrop={handleDrop}
    >
      <div
        ref={wrapperRef}
        className="absolute inset-0 flex items-center justify-center p-6"
      >
        <canvas ref={canvasElRef} className="rounded-xl shadow-2xl" />
      </div>

      {/* laser overlay */}
      <div
        ref={overlayRef}
        className="pointer-events-none absolute inset-0 z-30"
      >
        {localLaser && (
          <span
            className="absolute w-3 h-3 -ml-1.5 -mt-1.5 rounded-full bg-red-500 shadow-[0_0_16px_6px_rgba(239,68,68,0.6)]"
            style={{ left: localLaser.x, top: localLaser.y }}
          />
        )}
        {Object.entries(remoteLasers).map(([userName, pt]) => (
          <span
            key={userName}
            className="absolute flex items-center gap-1 -ml-1.5 -mt-1.5"
            style={{ left: pt.x, top: pt.y }}
          >
            <span className="w-3 h-3 rounded-full bg-orange-500 shadow-[0_0_16px_6px_rgba(249,115,22,0.6)]" />
            <span className="text-[10px] text-white bg-black/70 px-1.5 py-0.5 rounded">
              {userName}
            </span>
          </span>
        ))}
      </div>

      <WhiteboardToolbar
        activeTool={activeTool}
        setActiveTool={setActiveTool}
        color={color}
        setColor={setColor}
        fillColor={fillColor}
        setFillColor={setFillColor}
        fillEnabled={fillEnabled}
        setFillEnabled={setFillEnabled}
        strokeWidth={strokeWidth}
        setStrokeWidth={setStrokeWidth}
        onUndo={undo}
        onRedo={redo}
        canUndo={canUndo}
        canRedo={canRedo}
        onClear={clearCanvas}
        zoomPct={Math.round(zoom * 100)}
        onZoomIn={() => applyZoom(zoom * 1.2)}
        onZoomOut={() => applyZoom(zoom / 1.2)}
        onZoomReset={zoomReset}
        onImageUpload={() => imageInputRef.current?.click()}
        onDocUpload={() => docInputRef.current?.click()}
        uploading={uploading}
        onExportPNG={exportPNG}
        onExportPDF={exportPDF}
        saveStatus={saveStatus}
        onClose={onClose}
      />

      <input
        ref={imageInputRef}
        type="file"
        accept="image/*"
        className="hidden"
        onChange={(e) => {
          const file = e.target.files?.[0];
          e.target.value = "";
          if (file) uploadAndAddFile(file);
        }}
      />
      <input
        ref={docInputRef}
        type="file"
        accept=".pdf,.doc,.docx,.ppt,.pptx,.xls,.xlsx,.txt"
        className="hidden"
        onChange={(e) => {
          const file = e.target.files?.[0];
          e.target.value = "";
          if (file) uploadAndAddFile(file);
        }}
      />
    </div>
  );
}

export default Whiteboard;
