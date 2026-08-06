import axios from "axios";
import { attachAuthInterceptor } from "./authInterceptor";

const api = axios.create({
  baseURL: "https://multi-agent-system-final-project.onrender.com/api/auth",
  withCredentials: true,
});

attachAuthInterceptor(api);

export default api;
