// src/config/sessionApi.js
import axios from "axios";
import { attachAuthInterceptor } from "./authInterceptor";

const sessionApi = axios.create({
  baseURL: "https://multi-agent-system-final-project.onrender.com/api/session",
  withCredentials: true,
});

attachAuthInterceptor(sessionApi);

export default sessionApi;
