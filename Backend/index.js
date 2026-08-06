import express from "express";
import http from "http";
import { Server } from "socket.io";
import cors from "cors";
import dotenv from "dotenv";
dotenv.config();

import Database from "./config/database.js";
import cookieparser from "cookie-parser";
import routes from "./routes/authroutes.js";
import router from "./routes/sessionroutes.js";
import certificateRoutes from "./routes/certificateroutes.js";
import whiteboardRoutes from "./routes/whiteboardroutes.js";
import quizRoutes from "./routes/quizroutes.js";
import attachWhiteboardSocket from "./socket/whiteboardSocket.js";
import attachQuizSocket from "./socket/quizSocket.js";
import settingsRoutes from "./routes/settingsRoutes.js";
import attachSocketAuth from "./socket/socketAuth.js";
import opportunityRoutes from "./routes/opportunityRoutes.js";
import { startOpportunitySyncScheduler } from "./services/opportunitySync.js";

const app = express();
const server = http.createServer(app);
const PORT = process.env.PORT;

const corsOption = {
  origin: process.env.CLIENT_URL,
  credentials: true,
};

const io = new Server(server, {
  cors: corsOption,
});

app.use(express.json());
app.use(cors(corsOption));
app.use(express.urlencoded({ extended: true }));
app.use(cookieparser());
app.use("/uploads", express.static("uploads"));

//here i call al the thing

app.use("/api/auth", routes);
app.use("/api/session", router);
app.use("/api/certificate", certificateRoutes);
app.use("/api/whiteboard", whiteboardRoutes);
app.use("/api/quiz", quizRoutes);
app.use("/api/settings", settingsRoutes);
app.use("/api/opportunities", opportunityRoutes);

attachSocketAuth(io);
attachWhiteboardSocket(io);
attachQuizSocket(io);
app.set("io", io);

Database();

startOpportunitySyncScheduler();
server.listen(PORT, () => {
  console.log(`this  is the link http://localhost:${PORT}`);
});
