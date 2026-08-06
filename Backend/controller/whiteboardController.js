import Whiteboard from "../model/Whiteboard.js";

export const getWhiteboard = async (req, res) => {
  try {
    const { roomId } = req.params;
    const board = await Whiteboard.findOne({ roomId });

    return res.status(200).json({
      success: true,
      canvasJSON: board?.canvasJSON || null,
    });
  } catch (error) {
    return res.status(500).json({ success: false, message: error.message });
  }
};

export const saveWhiteboard = async (req, res) => {
  try {
    const { roomId, canvasJSON } = req.body;

    if (!roomId) {
      return res
        .status(400)
        .json({ success: false, message: "roomId is required" });
    }

    await Whiteboard.findOneAndUpdate(
      { roomId },
      { canvasJSON, lastEditedBy: req.user.name },
      { upsert: true, new: true },
    );

    return res.status(200).json({ success: true, message: "Whiteboard Saved" });
  } catch (error) {
    return res.status(500).json({ success: false, message: error.message });
  }
};

export const uploadWhiteboardFile = async (req, res) => {
  try {
    if (!req.file) {
      return res
        .status(400)
        .json({ success: false, message: "No file uploaded" });
    }

    const fileUrl = `${
      process.env.SERVER_URL || "http://localhost:7000"
    }/uploads/${req.file.filename}`;

    return res.status(201).json({
      success: true,
      file: {
        url: fileUrl,
        name: req.file.originalname,
        type: req.file.mimetype,
        size: req.file.size,
      },
    });
  } catch (error) {
    return res.status(500).json({ success: false, message: error.message });
  }
};
