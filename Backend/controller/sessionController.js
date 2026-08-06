// backend/controller/sessionController.js
import UserSession from "../model/UserSession.js";
import { generateRoomId } from "../utils/generateRoomId.js";

export const createSession = async (req, res) => {
  try {
    const { meetingTitle, description, meetingType, maxParticipants } =
      req.body;

    let roomId;
    let exists = true;

    while (exists) {
      roomId = generateRoomId();

      const room = await UserSession.findOne({
        roomId,
      });

      if (!room) {
        exists = false;
      }
    }

    const session = await UserSession.create({
      roomId,

      meetingTitle: meetingTitle?.trim() || "Live Meeting",

      description: description?.trim() || "",

      meetingType: meetingType || "private",

      maxParticipants: maxParticipants || 100,

      host: req.user._id,

      hostName: req.user.name,
      status: "active",

      participants: [
        {
          userId: req.user._id,
          userName: req.user.name,
          role: "host",
        },
      ],
    });

    // realtime: let Explore pages know a new (possibly public/live) session exists
    const io = req.app.get("io");
    if (io) {
      io.emit("session:created", session);
    }

    return res.status(201).json({
      success: true,
      message: "Meeting Created",
      roomId: session.roomId,
      session,
    });
  } catch (error) {
    return res.status(500).json({
      success: false,
      message: error.message,
    });
  }
};

// Sessions the current user hosts OR has joined as a participant —
// each session is tagged with `myRole` so the frontend can distinguish them.
export const getMySessions = async (req, res) => {
  try {
    const sessions = await UserSession.find({
      $or: [{ host: req.user._id }, { "participants.userId": req.user._id }],
    })
      .sort({ createdAt: -1 })
      .populate("host", "name email");

    const withRole = sessions.map((s) => {
      const obj = s.toObject();
      const hostId = s.host?._id ? s.host._id.toString() : s.host?.toString();
      obj.myRole = hostId === req.user._id.toString() ? "host" : "participant";
      return obj;
    });

    return res.status(200).json({
      success: true,
      total: withRole.length,
      sessions: withRole,
    });
  } catch (error) {
    return res.status(500).json({
      success: false,
      message: error.message,
    });
  }
};

export const getActiveSessions = async (req, res) => {
  try {
    const sessions = await UserSession.find({
      status: "active",
    }).sort({ startedAt: -1 });

    return res.status(200).json({
      success: true,
      total: sessions.length,
      sessions,
    });
  } catch (error) {
    return res.status(500).json({
      success: false,
      message: error.message,
    });
  }
};

// GET /api/session/search?q=...
// Used by the Navbar search box — searches live sessions by title, host, or room ID.
export const searchSessions = async (req, res) => {
  try {
    const q = (req.query.q || "").trim();

    if (!q) {
      return res.status(200).json({ success: true, total: 0, sessions: [] });
    }

    const escaped = q.replace(/[.*+?^${}()|[\]\\]/g, "\\$&");
    const regex = new RegExp(escaped, "i");

    const sessions = await UserSession.find({
      status: "active",
      $or: [{ meetingTitle: regex }, { hostName: regex }, { roomId: regex }],
    })
      .sort({ startedAt: -1 })
      .limit(8)
      .select(
        "roomId meetingTitle description hostName status meetingType maxParticipants participants startedAt",
      );

    return res.status(200).json({
      success: true,
      total: sessions.length,
      sessions,
    });
  } catch (error) {
    return res.status(500).json({
      success: false,
      message: error.message,
    });
  }
};

export const joinSession = async (req, res) => {
  try {
    const { roomId } = req.params;

    const session = await UserSession.findOne({
      roomId,
    });

    if (!session) {
      return res.status(404).json({
        success: false,
        message: "Meeting Not Found",
      });
    }

    if (session.status === "ended") {
      return res.status(400).json({
        success: false,
        message: "Meeting Ended",
      });
    }

    const alreadyJoined = session.participants.some(
      (participant) =>
        participant.userId.toString() === req.user._id.toString(),
    );

    if (alreadyJoined) {
      return res.status(200).json({
        success: true,
        message: "Already Joined",
        session,
      });
    }

    if (session.participants.length >= session.maxParticipants) {
      return res.status(400).json({
        success: false,
        message: "Meeting Full",
      });
    }

    session.participants.push({
      userId: req.user._id,
      userName: req.user.name,
      role: "guest",
    });

    await session.save();

    const io = req.app.get("io");
    if (io) {
      io.emit("session:participant-update", {
        roomId: session.roomId,
        participantCount: session.participants.length,
      });
    }

    return res.status(200).json({
      success: true,
      message: "Joined Successfully",
      session,
    });
  } catch (error) {
    return res.status(500).json({
      success: false,
      message: error.message,
    });
  }
};

export const leaveSession = async (req, res) => {
  try {
    const { roomId } = req.params;

    const session = await UserSession.findOne({
      roomId,
    });

    if (!session) {
      return res.status(404).json({
        success: false,
        message: "Meeting Not Found",
      });
    }

    session.participants = session.participants.filter(
      (participant) =>
        participant.userId.toString() !== req.user._id.toString(),
    );

    await session.save();

    const io = req.app.get("io");
    if (io) {
      io.emit("session:participant-update", {
        roomId: session.roomId,
        participantCount: session.participants.length,
      });
    }

    return res.status(200).json({
      success: true,
      message: "Left Meeting",
    });
  } catch (error) {
    return res.status(500).json({
      success: false,
      message: error.message,
    });
  }
};

export const getSession = async (req, res) => {
  try {
    const { roomId } = req.params;

    const session = await UserSession.findOne({
      roomId,
    })
      .populate("participants.userId", "name email")
      .populate("host", "name email");

    if (!session) {
      return res.status(404).json({
        success: false,
        message: "Meeting Not Found",
      });
    }

    return res.status(200).json({
      success: true,
      session,
    });
  } catch (error) {
    return res.status(500).json({
      success: false,
      message: error.message,
    });
  }
};

export const getSessionParticipants = async (req, res) => {
  try {
    const { roomId } = req.params;

    const session = await UserSession.findOne({
      roomId,
    });

    if (!session) {
      return res.status(404).json({
        success: false,
        message: "Meeting Not Found",
      });
    }

    return res.status(200).json({
      success: true,
      total: session.participants.length,
      participants: session.participants,
    });
  } catch (error) {
    return res.status(500).json({
      success: false,
      message: error.message,
    });
  }
};

export const endSession = async (req, res) => {
  try {
    const { roomId } = req.params;

    const session = await UserSession.findOne({
      roomId,
    });

    if (!session) {
      return res.status(404).json({
        success: false,
        message: "Meeting Not Found",
      });
    }

    if (session.host.toString() !== req.user._id.toString()) {
      return res.status(403).json({
        success: false,
        message: "Only Host Can End Meeting",
      });
    }

    session.status = "ended";
    session.endedAt = new Date();

    await session.save();

    const io = req.app.get("io");
    if (io) {
      io.emit("session:ended", { roomId: session.roomId });
    }

    return res.status(200).json({
      success: true,
      message: "Meeting Ended",
    });
  } catch (error) {
    return res.status(500).json({
      success: false,
      message: error.message,
    });
  }
};
