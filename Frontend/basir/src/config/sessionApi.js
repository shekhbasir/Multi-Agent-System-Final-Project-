// src/config/sessionApi.js
import axios from "axios";
import { attachAuthInterceptor } from "./authInterceptor";

const sessionApi = axios.create({
  baseURL: "http://localhost:7000/api/session",
  withCredentials: true,
});

attachAuthInterceptor(sessionApi);

export default sessionApi;
