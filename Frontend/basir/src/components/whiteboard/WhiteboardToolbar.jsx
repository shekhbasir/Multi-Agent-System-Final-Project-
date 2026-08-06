import {
  FaMousePointer,
  FaHandPaper,
  FaPen,
  FaPencilAlt,
  FaPaintBrush,
  FaHighlighter,
  FaEraser,
  FaCrosshairs,
  FaVectorSquare,
  FaCircle,
  FaMinus,
  FaLongArrowAltRight,
  FaFont,
  FaStickyNote,
  FaClipboardList,
  FaUndo,
  FaRedo,
  FaTrashAlt,
  FaSearchPlus,
  FaSearchMinus,
  FaImage,
  FaPaperclip,
  FaFileImage,
  FaFilePdf,
  FaFillDrip,
  FaTimes,
  FaCheck,
  FaSpinner,
} from "react-icons/fa";
import { BsTriangle } from "react-icons/bs";

const TOOLS = [
  { id: "select", icon: FaMousePointer, label: "Select" },
  { id: "hand", icon: FaHandPaper, label: "Pan" },
  { divider: true },
  { id: "pen", icon: FaPen, label: "Pen" },
  { id: "pencil", icon: FaPencilAlt, label: "Pencil" },
  { id: "brush", icon: FaPaintBrush, label: "Brush" },
  { id: "marker", icon: FaHighlighter, label: "Marker" },
  { id: "eraser", icon: FaEraser, label: "Eraser" },
  { id: "laser", icon: FaCrosshairs, label: "Laser Pointer" },
  { divider: true },
  { id: "rectangle", icon: FaVectorSquare, label: "Rectangle" },
  { id: "circle", icon: FaCircle, label: "Circle" },
  { id: "triangle", icon: BsTriangle, label: "Triangle" },
  { id: "line", icon: FaMinus, label: "Line" },
  { id: "arrow", icon: FaLongArrowAltRight, label: "Arrow" },
  { divider: true },
  { id: "text", icon: FaFont, label: "Text" },
  { id: "sticky", icon: FaStickyNote, label: "Sticky Note" },
  { id: "rich", icon: FaClipboardList, label: "Rich Note" },
];

function WhiteboardToolbar({
  activeTool,
  setActiveTool,
  color,
  setColor,
  fillColor,
  setFillColor,
  fillEnabled,
  setFillEnabled,
  strokeWidth,
  setStrokeWidth,
  onUndo,
  onRedo,
  canUndo,
  canRedo,
  onClear,
  zoomPct,
  onZoomIn,
  onZoomOut,
  onZoomReset,
  onImageUpload,
  onDocUpload,
  uploading,
  onExportPNG,
  onExportPDF,
  saveStatus,
  onClose,
}) {
  const showStylePanel = !["select", "hand"].includes(activeTool);

  return (
    <>
      {/* TOP BAR */}
      <div className="absolute top-4 left-1/2 -translate-x-1/2 z-20 flex items-center gap-2 px-3 py-2 rounded-2xl bg-[#0b0f1a]/95 border border-white/10 backdrop-blur-xl shadow-[0_20px_60px_-15px_rgba(0,0,0,0.6)]">
        <span className="px-2 text-sm font-bold text-slate-100 hidden sm:inline">
          Whiteboard
        </span>

        <div className="flex items-center gap-1 text-[11px] text-slate-400 px-2">
          {saveStatus === "saving" ? (
            <>
              <FaSpinner className="animate-spin" size={10} /> Saving
            </>
          ) : (
            <>
              <FaCheck className="text-emerald-400" size={10} /> Saved
            </>
          )}
        </div>

        <Divider />

        <IconBtn onClick={onUndo} disabled={!canUndo} title="Undo">
          <FaUndo size={13} />
        </IconBtn>
        <IconBtn onClick={onRedo} disabled={!canRedo} title="Redo">
          <FaRedo size={13} />
        </IconBtn>
        <IconBtn onClick={onClear} title="Clear Canvas" danger>
          <FaTrashAlt size={13} />
        </IconBtn>

        <Divider />

        <IconBtn onClick={onZoomOut} title="Zoom Out">
          <FaSearchMinus size={13} />
        </IconBtn>
        <button
          onClick={onZoomReset}
          className="w-12 text-[11px] font-semibold text-slate-300 hover:text-white"
        >
          {zoomPct}%
        </button>
        <IconBtn onClick={onZoomIn} title="Zoom In">
          <FaSearchPlus size={13} />
        </IconBtn>

        <Divider />

        <IconBtn
          onClick={onImageUpload}
          disabled={uploading}
          title="Upload Image"
        >
          <FaImage size={13} />
        </IconBtn>
        <IconBtn
          onClick={onDocUpload}
          disabled={uploading}
          title="Upload PDF / Document"
        >
          <FaPaperclip size={13} />
        </IconBtn>

        <Divider />

        <IconBtn onClick={onExportPNG} title="Export as PNG">
          <FaFileImage size={13} />
        </IconBtn>
        <IconBtn onClick={onExportPDF} title="Export as PDF">
          <FaFilePdf size={13} />
        </IconBtn>

        <Divider />

        <IconBtn onClick={onClose} title="Close Whiteboard">
          <FaTimes size={13} />
        </IconBtn>
      </div>

      {/* LEFT TOOL RAIL */}
      <div className="absolute top-1/2 left-4 -translate-y-1/2 z-20 flex flex-col gap-1 p-2 rounded-2xl bg-[#0b0f1a]/95 border border-white/10 backdrop-blur-xl shadow-[0_20px_60px_-15px_rgba(0,0,0,0.6)] max-h-[80vh] overflow-y-auto">
        {TOOLS.map((t, i) =>
          t.divider ? (
            <div key={`d-${i}`} className="h-px bg-white/10 my-1" />
          ) : (
            <button
              key={t.id}
              title={t.label}
              onClick={() => setActiveTool(t.id)}
              className={`w-10 h-10 flex items-center justify-center rounded-xl transition-colors ${
                activeTool === t.id
                  ? "bg-gradient-to-br from-cyan-400 to-violet-400 text-[#05070d]"
                  : "text-slate-300 hover:bg-white/10"
              }`}
            >
              <t.icon size={15} />
            </button>
          ),
        )}
      </div>

      {/* STYLE PANEL */}
      {showStylePanel && (
        <div className="absolute bottom-6 left-1/2 -translate-x-1/2 z-20 flex items-center gap-4 px-5 py-3 rounded-2xl bg-[#0b0f1a]/95 border border-white/10 backdrop-blur-xl shadow-[0_20px_60px_-15px_rgba(0,0,0,0.6)]">
          <label className="flex items-center gap-2">
            <span className="text-[11px] text-slate-400">Color</span>
            <input
              type="color"
              value={color}
              onChange={(e) => setColor(e.target.value)}
              className="w-8 h-8 rounded-lg cursor-pointer border border-white/10 bg-transparent"
            />
          </label>

          <label className="flex items-center gap-2 w-32">
            <span className="text-[11px] text-slate-400 shrink-0">Width</span>
            <input
              type="range"
              min="1"
              max="40"
              value={strokeWidth}
              onChange={(e) => setStrokeWidth(Number(e.target.value))}
              className="w-full accent-cyan-400"
            />
          </label>

          {["rectangle", "circle", "triangle"].includes(activeTool) && (
            <>
              <button
                onClick={() => setFillEnabled(!fillEnabled)}
                title="Toggle Fill"
                className={`w-8 h-8 flex items-center justify-center rounded-lg border transition-colors ${
                  fillEnabled
                    ? "border-cyan-400/60 bg-cyan-500/20 text-cyan-300"
                    : "border-white/10 text-slate-400 hover:bg-white/10"
                }`}
              >
                <FaFillDrip size={12} />
              </button>
              {fillEnabled && (
                <input
                  type="color"
                  value={fillColor}
                  onChange={(e) => setFillColor(e.target.value)}
                  className="w-8 h-8 rounded-lg cursor-pointer border border-white/10 bg-transparent"
                />
              )}
            </>
          )}
        </div>
      )}
    </>
  );
}

function IconBtn({ children, onClick, disabled, title, danger }) {
  return (
    <button
      onClick={onClick}
      disabled={disabled}
      title={title}
      className={`w-8 h-8 flex items-center justify-center rounded-lg transition-colors disabled:opacity-30 disabled:cursor-not-allowed ${
        danger
          ? "text-rose-400 hover:bg-rose-500/15"
          : "text-slate-300 hover:bg-white/10"
      }`}
    >
      {children}
    </button>
  );
}

function Divider() {
  return <div className="w-px h-6 bg-white/10 mx-0.5" />;
}

export default WhiteboardToolbar;
