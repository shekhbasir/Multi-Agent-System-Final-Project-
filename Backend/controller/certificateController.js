import Certificate from "../model/Certificate.js";
import UserSession from "../model/UserSession.js";
import { generateCertificateId } from "../utils/generateCertificateId.js";

// ============================================================
// Generate Certificate
// Host can generate for any participant.
// Participant can generate ONLY their own certificate.
// Works for BOTH active and ended sessions.
// ============================================================
export const generateCertificate = async (req, res) => {
  try {
    const { roomId, participantId } = req.body;

    if (!roomId || !participantId) {
      return res.status(400).json({
        success: false,
        message: "roomId and participantId are required",
      });
    }

    const session = await UserSession.findOne({ roomId }).populate(
      "host",
      "name email",
    );

    if (!session) {
      return res.status(404).json({
        success: false,
        message: "Meeting Not Found",
      });
    }

    const currentUserId = req.user._id.toString();
    const hostId = session.host?._id?.toString();
    const requestedParticipantId = participantId.toString();

    const isHost = hostId === currentUserId;
    const isRequestingOwnCertificate = requestedParticipantId === currentUserId;

    // ------------------------------------------------------------
    // Permission:
    // Host -> can generate certificate for anyone who attended.
    // Participant -> can generate ONLY their own certificate.
    // ------------------------------------------------------------
    if (!isHost && !isRequestingOwnCertificate) {
      return res.status(403).json({
        success: false,
        message: "You can only generate your own certificate",
      });
    }

    // ------------------------------------------------------------
    // IMPORTANT:
    // No session.status === "ended" check here.
    //
    // Certificate is allowed for ACTIVE + ENDED.
    // ------------------------------------------------------------

    const participantEntry = session.participants.find(
      (p) => p.userId?.toString() === requestedParticipantId,
    );

    if (!participantEntry) {
      return res.status(404).json({
        success: false,
        message: "This participant did not attend this meeting",
      });
    }

    // ------------------------------------------------------------
    // Prevent duplicate certificate
    // ------------------------------------------------------------
    const existing = await Certificate.findOne({
      session: session._id,
      participant: requestedParticipantId,
    });

    if (existing) {
      return res.status(200).json({
        success: true,
        alreadyExists: true,
        message: "Certificate already generated",
        certificate: existing,
      });
    }

    // ------------------------------------------------------------
    // Duration
    //
    // Ended session:
    // startedAt -> endedAt
    //
    // Active session:
    // startedAt -> NOW
    // ------------------------------------------------------------
    const startedAt = session.startedAt || session.createdAt;

    const endedAt =
      session.status === "ended" && session.endedAt
        ? session.endedAt
        : new Date();

    const durationMinutes = Math.max(
      1,
      Math.round(
        (new Date(endedAt).getTime() - new Date(startedAt).getTime()) / 60000,
      ),
    );

    const certificateId = await generateCertificateId();

    const certificate = await Certificate.create({
      certificateId,
      session: session._id,
      roomId: session.roomId,
      meetingTitle: session.meetingTitle,
      description: session.description || "",
      host: session.host._id,
      hostName: session.hostName || session.host?.name || "Host",
      participant: participantEntry.userId,
      participantName: participantEntry.userName || "Participant",
      meetingDate: startedAt,
      durationMinutes,
    });

    return res.status(201).json({
      success: true,
      alreadyExists: false,
      message: "Certificate Generated Successfully",
      certificate,
    });
  } catch (error) {
    console.error("GENERATE CERTIFICATE ERROR:", error);

    // Duplicate-key safety
    if (error?.code === 11000) {
      try {
        const { roomId, participantId } = req.body;

        const session = await UserSession.findOne({ roomId });

        if (session) {
          const existing = await Certificate.findOne({
            session: session._id,
            participant: participantId,
          });

          if (existing) {
            return res.status(200).json({
              success: true,
              alreadyExists: true,
              message: "Certificate already generated",
              certificate: existing,
            });
          }
        }
      } catch (duplicateError) {
        console.error("DUPLICATE CERTIFICATE LOOKUP ERROR:", duplicateError);
      }
    }

    return res.status(500).json({
      success: false,
      message: error.message || "Failed to generate certificate",
    });
  }
};

// ============================================================
// Host: list certificates for their session
// ============================================================
export const getSessionCertificates = async (req, res) => {
  try {
    const { roomId } = req.params;

    const session = await UserSession.findOne({ roomId });

    if (!session) {
      return res.status(404).json({
        success: false,
        message: "Meeting Not Found",
      });
    }

    if (session.host.toString() !== req.user._id.toString()) {
      return res.status(403).json({
        success: false,
        message: "Only the Host can view certificates for this meeting",
      });
    }

    const certificates = await Certificate.find({
      session: session._id,
    }).sort({ createdAt: -1 });

    return res.status(200).json({
      success: true,
      total: certificates.length,
      certificates,
    });
  } catch (error) {
    console.error("GET SESSION CERTIFICATES ERROR:", error);

    return res.status(500).json({
      success: false,
      message: error.message,
    });
  }
};

// ============================================================
// Participant: list my certificates
// ============================================================
export const getMyCertificates = async (req, res) => {
  try {
    const certificates = await Certificate.find({
      participant: req.user._id,
    }).sort({ createdAt: -1 });

    return res.status(200).json({
      success: true,
      total: certificates.length,
      certificates,
    });
  } catch (error) {
    console.error("GET MY CERTIFICATES ERROR:", error);

    return res.status(500).json({
      success: false,
      message: error.message,
    });
  }
};

// ============================================================
// Public certificate verification
// ============================================================
export const verifyCertificate = async (req, res) => {
  try {
    const { certificateId } = req.params;

    const certificate = await Certificate.findOne({ certificateId });

    if (!certificate) {
      return res.status(404).json({
        success: false,
        valid: false,
        message: "No certificate found with this ID",
      });
    }

    return res.status(200).json({
      success: true,
      valid: true,
      certificate,
    });
  } catch (error) {
    console.error("VERIFY CERTIFICATE ERROR:", error);

    return res.status(500).json({
      success: false,
      message: error.message,
    });
  }
};
