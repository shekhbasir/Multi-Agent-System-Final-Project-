import axios from "axios";
import { attachAuthInterceptor } from "./authInterceptor";

const api = axios.create({
  baseURL: "http://localhost:7000/api/auth",
  withCredentials: true,
});

attachAuthInterceptor(api);

export default api;
