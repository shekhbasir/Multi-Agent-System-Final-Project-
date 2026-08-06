import UserSession from "../model/UserSession.js";

const attachQuizSocket = (io) => {
  io.on("connection", (socket) => {
    socket.on("quiz:join", async (roomId, callback) => {
      const ack = typeof callback === "function" ? callback : () => {};

      if (!roomId || !socket.user) {
        return ack({ ok: false, reason: "INVALID_REQUEST" });
      }

      try {
        const session = await UserSession.findOne({
          roomId,
          status: "active",
        }).select("_id");

        if (!session) {
          return ack({ ok: false, reason: "NO_ACTIVE_SESSION" });
        }

        socket.join(`quiz:${roomId}`);
        return ack({ ok: true });
      } catch (error) {
        return ack({ ok: false, reason: "SERVER_ERROR" });
      }
    });

    socket.on("quiz:leave", (roomId) => {
      if (roomId) socket.leave(`quiz:${roomId}`);
    });
  });
};

export default attachQuizSocket;
