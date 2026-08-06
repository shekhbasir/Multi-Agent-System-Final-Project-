// src/config/whiteboardApi.js
import axios from "axios";
import { attachAuthInterceptor } from "./authInterceptor";

const whiteboardApi = axios.create({
  baseURL: "http://localhost:7000/api/whiteboard",
  withCredentials: true,
});

attachAuthInterceptor(whiteboardApi);

export default whiteboardApi;
