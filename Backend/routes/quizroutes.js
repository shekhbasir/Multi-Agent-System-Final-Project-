import express from "express";
import { isAuth } from "../middleware/isAuthenticated.js";
import {
  generateQuiz,
  regenerateQuestion,
  updateQuiz,
  publishQuiz,
  endQuiz,
  getQuiz,
  startAttempt,
  saveAnswer,
  submitAttempt,
  getMyAttempt,
  getLeaderboard,
  getHostDashboard,
  getRoomQuizzes,
  getActiveQuizForRoom,
  getMyHistory,
} from "../controller/quizController.js";

const router = express.Router();

router.post("/generate", isAuth, generateQuiz);
router.post("/:quizId/regenerate-question/:index", isAuth, regenerateQuestion);
router.put("/:quizId", isAuth, updateQuiz);
router.post("/:quizId/publish", isAuth, publishQuiz);
router.post("/:quizId/end", isAuth, endQuiz);

router.get("/room/:roomId", isAuth, getRoomQuizzes);
router.get("/room/:roomId/active", isAuth, getActiveQuizForRoom);
router.get("/history/mine", isAuth, getMyHistory);

router.get("/:quizId", isAuth, getQuiz);
router.post("/:quizId/attempt/start", isAuth, startAttempt);
router.post("/:quizId/attempt/answer", isAuth, saveAnswer);
router.post("/:quizId/attempt/submit", isAuth, submitAttempt);
router.get("/:quizId/attempt/mine", isAuth, getMyAttempt);
router.get("/:quizId/leaderboard", isAuth, getLeaderboard);
router.get("/:quizId/dashboard", isAuth, getHostDashboard);

export default router;
