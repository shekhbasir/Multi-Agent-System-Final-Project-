// src/config/whiteboardApi.js
import axios from "axios";
import { attachAuthInterceptor } from "./authInterceptor";

const whiteboardApi = axios.create({
  baseURL:
    "https://multi-agent-system-final-project.onrender.com/api/whiteboard",
  withCredentials: true,
});

attachAuthInterceptor(whiteboardApi);

export default whiteboardApi;
