import { io } from "socket.io-client";

const socket = io("https://multi-agent-system-final-project.onrender.com", {
  withCredentials: true,
  autoConnect: true,
});

export const joinRoomOnConnect = (event, roomId) => {
  if (!roomId) return () => {};

  const join = () => socket.emit(event, roomId);

  if (socket.connected) join();
  socket.on("connect", join);

  return () => socket.off("connect", join);
};

export default socket;
