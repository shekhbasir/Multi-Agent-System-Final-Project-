import jwt from "jsonwebtoken";
import User from "../model/user.js";

const parseCookies = (cookieHeader = "") => {
  const cookies = {};
  cookieHeader.split(";").forEach((pair) => {
    const idx = pair.indexOf("=");
    if (idx === -1) return;
    const key = pair.slice(0, idx).trim();
    const value = pair.slice(idx + 1).trim();
    if (key) cookies[key] = decodeURIComponent(value);
  });
  return cookies;
};

const attachSocketAuth = (io) => {
  io.use(async (socket, next) => {
    try {
      const cookies = parseCookies(socket.handshake.headers.cookie);
      const token = cookies.accessToken;

      if (!token) return next(new Error("Unauthorized"));

      let decoded;
      try {
        decoded = jwt.verify(token, process.env.SECRET_KEY);
      } catch (err) {
        return next(new Error("Unauthorized"));
      }

      const user = await User.findById(decoded.id).select("_id name");
      if (!user) return next(new Error("Unauthorized"));

      socket.user = { id: user._id.toString(), name: user.name };
      next();
    } catch (error) {
      next(new Error("Unauthorized"));
    }
  });
};

export default attachSocketAuth;
