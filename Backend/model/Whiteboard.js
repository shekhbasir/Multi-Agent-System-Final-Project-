import mongoose from "mongoose";

const WhiteboardSchema = new mongoose.Schema(
  {
    roomId: {
      type: String,
      required: true,
      unique: true,
      trim: true,
      index: true,
    },
    canvasJSON: {
      type: mongoose.Schema.Types.Mixed,
      default: null,
    },
    lastEditedBy: {
      type: String,
      default: "",
    },
  },
  {
    timestamps: true,
  },
);

const Whiteboard = mongoose.model("Whiteboard", WhiteboardSchema);

export default Whiteboard;
