// src/config/quizApi.js
import axios from "axios";
import { attachAuthInterceptor } from "./authInterceptor";

const quizApi = axios.create({
  baseURL: "http://localhost:7000/api/quiz",
  withCredentials: true,
});

attachAuthInterceptor(quizApi);

export default quizApi;
