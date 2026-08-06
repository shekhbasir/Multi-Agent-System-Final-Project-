import Whiteboard from "../model/Whiteboard.js";

const attachWhiteboardSocket = (io) => {
  io.on("connection", (socket) => {
    socket.on("whiteboard:join", (roomId) => {
      if (roomId) socket.join(roomId);
    });

    socket.on("whiteboard:leave", (roomId) => {
      if (roomId) socket.leave(roomId);
    });

    socket.on("whiteboard:sync", async ({ roomId, canvasJSON }, callback) => {
      if (!roomId) return;

      socket.to(roomId).emit("whiteboard:sync", { canvasJSON });

      try {
        await Whiteboard.findOneAndUpdate(
          { roomId },
          { canvasJSON, lastEditedBy: socket.user?.name || "" },
          { upsert: true },
        );
      } catch (error) {
        console.error("whiteboard autosave error:", error.message);
      }

      if (typeof callback === "function") callback({ ok: true });
    });

    socket.on("whiteboard:laser", ({ roomId, x, y }) => {
      if (!roomId) return;
      socket.to(roomId).emit("whiteboard:laser", {
        x,
        y,
        userName: socket.user?.name || "Guest",
      });
    });
  });
};

export default attachWhiteboardSocket;
