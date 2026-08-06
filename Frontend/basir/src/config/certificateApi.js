// src/config/certificateApi.js
import axios from "axios";
import { attachAuthInterceptor } from "./authInterceptor";

const certificateApi = axios.create({
  baseURL:
    "https://multi-agent-system-final-project.onrender.com/api/certificate",
  withCredentials: true,
});

attachAuthInterceptor(certificateApi);

export default certificateApi;
