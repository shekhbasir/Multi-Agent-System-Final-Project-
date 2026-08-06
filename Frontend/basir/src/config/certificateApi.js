// src/config/certificateApi.js
import axios from "axios";
import { attachAuthInterceptor } from "./authInterceptor";

const certificateApi = axios.create({
  baseURL: "http://localhost:7000/api/certificate",
  withCredentials: true,
});

attachAuthInterceptor(certificateApi);

export default certificateApi;
