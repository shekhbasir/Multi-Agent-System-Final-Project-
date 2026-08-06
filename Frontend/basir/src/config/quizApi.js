// src/config/quizApi.js
import axios from "axios";
import { attachAuthInterceptor } from "./authInterceptor";

const quizApi = axios.create({
  baseURL: "https://multi-agent-system-final-project.onrender.com/api/quiz",
  withCredentials: true,
});

attachAuthInterceptor(quizApi);

export default quizApi;
