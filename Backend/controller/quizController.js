import Quiz from "../model/Quiz.js";
import QuizAttempt from "../model/QuizAttempt.js";
import UserSession from "../model/UserSession.js";
import { generateQuizQuestions } from "../services/aiService.js";

const isSessionHost = async (roomId, userId) => {
  const session = await UserSession.findOne({ roomId });
  if (!session) return { session: null, isHost: false };
  return { session, isHost: session.host.toString() === userId.toString() };
};

const shuffleArray = (arr) => {
  const copy = [...arr];
  for (let i = copy.length - 1; i > 0; i--) {
    const j = Math.floor(Math.random() * (i + 1));
    [copy[i], copy[j]] = [copy[j], copy[i]];
  }
  return copy;
};

const buildLeaderboard = async (quizId) => {
  const attempts = await QuizAttempt.find({
    quiz: quizId,
    status: { $in: ["submitted", "auto-submitted"] },
  }).sort({ marksObtained: -1, percentage: -1, timeTakenSeconds: 1 });

  return attempts.map((a, i) => ({
    rank: i + 1,
    studentId: a.student,
    studentName: a.studentName,
    marksObtained: a.marksObtained,
    totalMarks: a.totalMarks,
    percentage: a.percentage,
    correctAnswers: a.correctAnswers,
    wrongAnswers: a.wrongAnswers,
    unanswered: a.unanswered,
    timeTakenSeconds: a.timeTakenSeconds,
    passed: a.passed,
  }));
};

const finalizeAttempt = async (quiz, attempt, status, res) => {
  let correct = 0,
    wrong = 0,
    unanswered = 0;

  attempt.responses.forEach((r) => {
    const question = quiz.questions[r.questionIndex];
    if (!r.selectedAnswer) {
      unanswered++;
      r.isCorrect = false;
    } else if (r.selectedAnswer === question.correctAnswer) {
      correct++;
      r.isCorrect = true;
    } else {
      wrong++;
      r.isCorrect = false;
    }
  });

  const marksPerQuestion = quiz.settings.marksPerQuestion;
  const negPerQuestion = quiz.settings.negativeMarking
    ? quiz.settings.negativeMarksPerQuestion
    : 0;
  const marksObtained = Math.max(
    0,
    correct * marksPerQuestion - wrong * negPerQuestion,
  );
  const totalMarks = quiz.questions.length * marksPerQuestion;
  const percentage =
    totalMarks > 0
      ? Number(((marksObtained / totalMarks) * 100).toFixed(2))
      : 0;
  const accuracy =
    correct + wrong > 0
      ? Number(((correct / (correct + wrong)) * 100).toFixed(2))
      : 0;
  const timeTakenSeconds = Math.round(
    (Date.now() - new Date(attempt.startedAt).getTime()) / 1000,
  );

  attempt.correctAnswers = correct;
  attempt.wrongAnswers = wrong;
  attempt.unanswered = unanswered;
  attempt.marksObtained = marksObtained;
  attempt.totalMarks = totalMarks;
  attempt.percentage = percentage;
  attempt.accuracy = accuracy;
  attempt.passed = percentage >= quiz.settings.passingPercentage;
  attempt.timeTakenSeconds = timeTakenSeconds;
  attempt.averageTimePerQuestion = Number(
    (timeTakenSeconds / quiz.questions.length).toFixed(1),
  );
  attempt.submittedAt = new Date();
  attempt.status = status;

  await attempt.save();

  return res
    .status(200)
    .json({ success: true, message: "Quiz submitted", attempt });
};

// ---------------- GENERATE ----------------
export const generateQuiz = async (req, res) => {
  try {
    const {
      roomId,
      topic,
      title,
      description,
      numQuestions = 10,
      timePerQuestion = 45,
      randomizeQuestions = false,
      randomizeOptions = false,
      showCorrectAnswerAfterSubmit = true,
      negativeMarking = false,
      marksPerQuestion = 1,
      negativeMarksPerQuestion = 0.25,
      passingPercentage = 40,
      showLeaderboardToStudents = true,
    } = req.body;

    if (!roomId || !topic || !topic.trim()) {
      return res
        .status(400)
        .json({ success: false, message: "roomId and topic are required" });
    }

    const { session, isHost } = await isSessionHost(roomId, req.user._id);
    if (!session) {
      return res
        .status(404)
        .json({ success: false, message: "Meeting not found" });
    }
    if (!isHost) {
      return res
        .status(403)
        .json({ success: false, message: "Only the host can create a quiz" });
    }

    const generated = await generateQuizQuestions({ topic, numQuestions });

    const quiz = await Quiz.create({
      roomId,
      host: req.user._id,
      title: title?.trim() || `${topic} Quiz`,
      description: description?.trim() || "",
      topic: topic.trim(),
      questions: generated,
      settings: {
        numQuestions: generated.length,
        timePerQuestion,
        randomizeQuestions,
        randomizeOptions,
        showCorrectAnswerAfterSubmit,
        negativeMarking,
        marksPerQuestion,
        negativeMarksPerQuestion,
        passingPercentage,
        showLeaderboardToStudents,
      },
      status: "draft",
    });

    return res
      .status(201)
      .json({ success: true, message: "Questions generated", quiz });
  } catch (error) {
    return res.status(500).json({ success: false, message: error.message });
  }
};

// ---------------- REGENERATE ONE QUESTION ----------------
export const regenerateQuestion = async (req, res) => {
  try {
    const { quizId, index } = req.params;
    const idx = Number(index);

    const quiz = await Quiz.findById(quizId);
    if (!quiz)
      return res
        .status(404)
        .json({ success: false, message: "Quiz not found" });

    if (quiz.host.toString() !== req.user._id.toString()) {
      return res
        .status(403)
        .json({ success: false, message: "Only the host can edit this quiz" });
    }
    if (quiz.status !== "draft") {
      return res.status(400).json({
        success: false,
        message: "Cannot edit a quiz that is already live or ended",
      });
    }
    if (idx < 0 || idx >= quiz.questions.length) {
      return res
        .status(400)
        .json({ success: false, message: "Invalid question index" });
    }

    const [fresh] = await generateQuizQuestions({
      topic: quiz.topic,
      numQuestions: 1,
    });
    quiz.questions[idx] = fresh;
    await quiz.save();

    return res
      .status(200)
      .json({ success: true, message: "Question regenerated", quiz });
  } catch (error) {
    return res.status(500).json({ success: false, message: error.message });
  }
};

// ---------------- UPDATE (edit / add / delete / reorder / settings) ----------------
export const updateQuiz = async (req, res) => {
  try {
    const { quizId } = req.params;
    const { title, description, questions, settings } = req.body;

    const quiz = await Quiz.findById(quizId);
    if (!quiz)
      return res
        .status(404)
        .json({ success: false, message: "Quiz not found" });

    if (quiz.host.toString() !== req.user._id.toString()) {
      return res
        .status(403)
        .json({ success: false, message: "Only the host can edit this quiz" });
    }
    if (quiz.status !== "draft") {
      return res.status(400).json({
        success: false,
        message: "Cannot edit a quiz that is already live or ended",
      });
    }

    if (title !== undefined) quiz.title = title;
    if (description !== undefined) quiz.description = description;
    if (Array.isArray(questions)) quiz.questions = questions;

    if (settings && typeof settings === "object") {
      quiz.settings = {
        ...quiz.settings.toObject(),
        ...settings,
        numQuestions: quiz.questions.length,
      };
    } else {
      quiz.settings.numQuestions = quiz.questions.length;
    }

    await quiz.save();

    return res
      .status(200)
      .json({ success: true, message: "Quiz updated", quiz });
  } catch (error) {
    return res.status(500).json({ success: false, message: error.message });
  }
};

// ---------------- PUBLISH ----------------
export const publishQuiz = async (req, res) => {
  try {
    const { quizId } = req.params;

    const quiz = await Quiz.findById(quizId);
    if (!quiz)
      return res
        .status(404)
        .json({ success: false, message: "Quiz not found" });

    if (quiz.host.toString() !== req.user._id.toString()) {
      return res
        .status(403)
        .json({ success: false, message: "Only the host can start this quiz" });
    }
    if (!quiz.questions.length) {
      return res
        .status(400)
        .json({ success: false, message: "Quiz has no questions" });
    }

    quiz.status = "live";
    quiz.startedAt = new Date();
    await quiz.save();

    const io = req.app.get("io");
    if (io) {
      io.to(`quiz:${quiz.roomId}`).emit("quiz:started", {
        quizId: quiz._id,
        roomId: quiz.roomId,
        title: quiz.title,
        description: quiz.description,
        hostName: req.user.name,
        numQuestions: quiz.questions.length,
        timePerQuestion: quiz.settings.timePerQuestion,
      });
    }

    return res
      .status(200)
      .json({ success: true, message: "Quiz is now live", quiz });
  } catch (error) {
    return res.status(500).json({ success: false, message: error.message });
  }
};

// ---------------- END ----------------
export const endQuiz = async (req, res) => {
  try {
    const { quizId } = req.params;
    const quiz = await Quiz.findById(quizId);
    if (!quiz)
      return res
        .status(404)
        .json({ success: false, message: "Quiz not found" });

    if (quiz.host.toString() !== req.user._id.toString()) {
      return res
        .status(403)
        .json({ success: false, message: "Only the host can end this quiz" });
    }

    quiz.status = "ended";
    quiz.endedAt = new Date();
    await quiz.save();

    const io = req.app.get("io");
    if (io) {
      io.to(`quiz:${quiz.roomId}`).emit("quiz:ended", { quizId: quiz._id });
    }

    return res.status(200).json({ success: true, message: "Quiz ended", quiz });
  } catch (error) {
    return res.status(500).json({ success: false, message: error.message });
  }
};

// ---------------- GET QUIZ (sanitized for students) ----------------
export const getQuiz = async (req, res) => {
  try {
    const { quizId } = req.params;
    const quiz = await Quiz.findById(quizId);
    if (!quiz)
      return res
        .status(404)
        .json({ success: false, message: "Quiz not found" });

    const isHost = quiz.host.toString() === req.user._id.toString();
    if (isHost) {
      return res.status(200).json({ success: true, quiz, isHost: true });
    }

    const attempt = await QuizAttempt.findOne({
      quiz: quiz._id,
      student: req.user._id,
    });
    const revealAnswers =
      quiz.status === "ended" ||
      (attempt &&
        attempt.status !== "in-progress" &&
        quiz.settings.showCorrectAnswerAfterSubmit);

    const sanitizedQuestions = quiz.questions.map((q) => ({
      questionText: q.questionText,
      options: q.options,
      difficulty: q.difficulty,
      ...(revealAnswers
        ? { correctAnswer: q.correctAnswer, explanation: q.explanation }
        : {}),
    }));

    return res.status(200).json({
      success: true,
      isHost: false,
      quiz: {
        _id: quiz._id,
        title: quiz.title,
        description: quiz.description,
        status: quiz.status,
        settings: quiz.settings,
        questions: sanitizedQuestions,
      },
    });
  } catch (error) {
    return res.status(500).json({ success: false, message: error.message });
  }
};

// ---------------- START / RESUME ATTEMPT ----------------
export const startAttempt = async (req, res) => {
  try {
    const { quizId } = req.params;
    const quiz = await Quiz.findById(quizId);
    if (!quiz)
      return res
        .status(404)
        .json({ success: false, message: "Quiz not found" });
    if (quiz.status !== "live") {
      return res
        .status(400)
        .json({ success: false, message: "This quiz is not currently live" });
    }

    let attempt = await QuizAttempt.findOne({
      quiz: quiz._id,
      student: req.user._id,
    });

    if (!attempt) {
      const questionOrder = quiz.settings.randomizeQuestions
        ? shuffleArray(quiz.questions.map((_, i) => i))
        : quiz.questions.map((_, i) => i);

      const optionOrder = quiz.questions.map((q) =>
        quiz.settings.randomizeOptions
          ? shuffleArray(q.options.map((o) => o.key))
          : q.options.map((o) => o.key),
      );

      attempt = await QuizAttempt.create({
        quiz: quiz._id,
        roomId: quiz.roomId,
        student: req.user._id,
        studentName: req.user.name,
        totalQuestions: quiz.questions.length,
        totalMarks: quiz.questions.length * quiz.settings.marksPerQuestion,
        questionOrder,
        optionOrder,
        responses: quiz.questions.map((_, i) => ({
          questionIndex: i,
          selectedAnswer: null,
        })),
      });
    }

    if (attempt.status === "in-progress") {
      const totalSeconds =
        quiz.settings.timePerQuestion * quiz.questions.length;
      const elapsed =
        (Date.now() - new Date(attempt.startedAt).getTime()) / 1000;
      const remainingSeconds = Math.max(0, Math.round(totalSeconds - elapsed));

      if (remainingSeconds <= 0) {
        return await finalizeAttempt(quiz, attempt, "auto-submitted", res);
      }

      return res.status(200).json({
        success: true,
        attempt,
        remainingSeconds,
        questionOrder: attempt.questionOrder,
        optionOrder: attempt.optionOrder,
      });
    }

    return res.status(200).json({
      success: true,
      attempt,
      remainingSeconds: 0,
      alreadySubmitted: true,
    });
  } catch (error) {
    return res.status(500).json({ success: false, message: error.message });
  }
};

// ---------------- AUTOSAVE ANSWER ----------------
export const saveAnswer = async (req, res) => {
  try {
    const { quizId } = req.params;
    const { questionIndex, selectedAnswer, markedForReview } = req.body;

    const attempt = await QuizAttempt.findOne({
      quiz: quizId,
      student: req.user._id,
    });
    if (!attempt)
      return res
        .status(404)
        .json({ success: false, message: "Attempt not found" });
    if (attempt.status !== "in-progress") {
      return res
        .status(400)
        .json({ success: false, message: "This attempt is already submitted" });
    }

    const response = attempt.responses.find(
      (r) => r.questionIndex === questionIndex,
    );
    if (!response)
      return res
        .status(400)
        .json({ success: false, message: "Invalid question index" });

    if (selectedAnswer !== undefined) response.selectedAnswer = selectedAnswer;
    if (markedForReview !== undefined)
      response.markedForReview = markedForReview;

    await attempt.save();

    return res.status(200).json({ success: true, message: "Saved" });
  } catch (error) {
    return res.status(500).json({ success: false, message: error.message });
  }
};

// ---------------- SUBMIT ----------------
export const submitAttempt = async (req, res) => {
  try {
    const { quizId } = req.params;

    const quiz = await Quiz.findById(quizId);
    if (!quiz)
      return res
        .status(404)
        .json({ success: false, message: "Quiz not found" });

    const attempt = await QuizAttempt.findOne({
      quiz: quizId,
      student: req.user._id,
    });
    if (!attempt)
      return res
        .status(404)
        .json({ success: false, message: "Attempt not found" });
    if (attempt.status !== "in-progress") {
      return res
        .status(200)
        .json({ success: true, message: "Already submitted", attempt });
    }

    await finalizeAttempt(quiz, attempt, "submitted", res);

    const io = req.app.get("io");
    if (io) {
      const leaderboard = await buildLeaderboard(quizId);
      io.to(`quiz:${quiz.roomId}`).emit("quiz:leaderboard-update", {
        quizId,
        leaderboard,
      });
    }
  } catch (error) {
    return res.status(500).json({ success: false, message: error.message });
  }
};

// ---------------- MY ATTEMPT / RANK ----------------
export const getMyAttempt = async (req, res) => {
  try {
    const { quizId } = req.params;
    const attempt = await QuizAttempt.findOne({
      quiz: quizId,
      student: req.user._id,
    });
    if (!attempt)
      return res
        .status(404)
        .json({ success: false, message: "No attempt found" });

    let rank = null;
    if (attempt.status !== "in-progress") {
      const leaderboard = await buildLeaderboard(quizId);
      const pos = leaderboard.findIndex(
        (l) => l.studentId.toString() === req.user._id.toString(),
      );
      rank = pos >= 0 ? pos + 1 : null;
    }

    return res.status(200).json({ success: true, attempt, rank });
  } catch (error) {
    return res.status(500).json({ success: false, message: error.message });
  }
};

// ---------------- LEADERBOARD ----------------
export const getLeaderboard = async (req, res) => {
  try {
    const { quizId } = req.params;
    const leaderboard = await buildLeaderboard(quizId);
    return res.status(200).json({ success: true, leaderboard });
  } catch (error) {
    return res.status(500).json({ success: false, message: error.message });
  }
};

// ---------------- HOST DASHBOARD ----------------
export const getHostDashboard = async (req, res) => {
  try {
    const { quizId } = req.params;
    const quiz = await Quiz.findById(quizId);
    if (!quiz)
      return res
        .status(404)
        .json({ success: false, message: "Quiz not found" });

    if (quiz.host.toString() !== req.user._id.toString()) {
      return res.status(403).json({
        success: false,
        message: "Only the host can view this dashboard",
      });
    }

    const session = await UserSession.findOne({ roomId: quiz.roomId });
    const totalParticipants = session ? session.participants.length : 0;

    const attempts = await QuizAttempt.find({ quiz: quizId });
    const submitted = attempts.filter((a) => a.status !== "in-progress");
    const attempted = attempts.length;
    const notAttempted = Math.max(0, totalParticipants - attempted);

    const scores = submitted.map((a) => a.marksObtained);
    const percentages = submitted.map((a) => a.percentage);

    const highestScore = scores.length ? Math.max(...scores) : 0;
    const lowestScore = scores.length ? Math.min(...scores) : 0;
    const averageScore = scores.length
      ? Number((scores.reduce((a, b) => a + b, 0) / scores.length).toFixed(2))
      : 0;
    const averagePercentage = percentages.length
      ? Number(
          (percentages.reduce((a, b) => a + b, 0) / percentages.length).toFixed(
            2,
          ),
        )
      : 0;
    const passedCount = submitted.filter((a) => a.passed).length;
    const passPercentage = submitted.length
      ? Number(((passedCount / submitted.length) * 100).toFixed(2))
      : 0;
    const failPercentage = submitted.length
      ? Number((100 - passPercentage).toFixed(2))
      : 0;

    const questionStats = quiz.questions.map((q, idx) => {
      let correctCount = 0,
        attemptCount = 0;
      submitted.forEach((a) => {
        const r = a.responses.find((res) => res.questionIndex === idx);
        if (r && r.selectedAnswer) {
          attemptCount++;
          if (r.isCorrect) correctCount++;
        }
      });
      return {
        questionIndex: idx,
        questionText: q.questionText,
        correctCount,
        attemptCount,
        accuracy: attemptCount
          ? Number(((correctCount / attemptCount) * 100).toFixed(1))
          : 0,
      };
    });

    const mostCorrectQuestion = questionStats.length
      ? [...questionStats].sort((a, b) => b.accuracy - a.accuracy)[0]
      : null;
    const mostIncorrectQuestion = questionStats.length
      ? [...questionStats].sort((a, b) => a.accuracy - b.accuracy)[0]
      : null;

    const leaderboard = await buildLeaderboard(quizId);

    return res.status(200).json({
      success: true,
      quiz,
      stats: {
        totalParticipants,
        attempted,
        notAttempted,
        highestScore,
        lowestScore,
        averageScore,
        averagePercentage,
        passPercentage,
        failPercentage,
        questionStats,
        mostCorrectQuestion,
        mostIncorrectQuestion,
      },
      leaderboard,
    });
  } catch (error) {
    return res.status(500).json({ success: false, message: error.message });
  }
};

// ---------------- ROOM QUIZ HISTORY (host) ----------------
export const getRoomQuizzes = async (req, res) => {
  try {
    const { roomId } = req.params;
    const quizzes = await Quiz.find({ roomId }).sort({ createdAt: -1 });

    const withStats = await Promise.all(
      quizzes.map(async (q) => {
        const attempts = await QuizAttempt.find({
          quiz: q._id,
          status: { $ne: "in-progress" },
        });
        const avgMarks = attempts.length
          ? Number(
              (
                attempts.reduce((s, a) => s + a.marksObtained, 0) /
                attempts.length
              ).toFixed(2),
            )
          : 0;
        return {
          _id: q._id,
          title: q.title,
          topic: q.topic,
          status: q.status,
          numQuestions: q.questions.length,
          createdAt: q.createdAt,
          attemptCount: attempts.length,
          averageMarks: avgMarks,
        };
      }),
    );

    return res.status(200).json({ success: true, quizzes: withStats });
  } catch (error) {
    return res.status(500).json({ success: false, message: error.message });
  }
};

export const getActiveQuizForRoom = async (req, res) => {
  try {
    const { roomId } = req.params;
    const quiz = await Quiz.findOne({ roomId, status: "live" }).populate(
      "host",
      "name",
    );

    if (!quiz) {
      return res.status(200).json({ success: true, quiz: null });
    }

    return res.status(200).json({
      success: true,
      quiz: {
        quizId: quiz._id,
        roomId: quiz.roomId,
        title: quiz.title,
        description: quiz.description,
        hostName: quiz.host?.name || "Host",
        numQuestions: quiz.questions.length,
        timePerQuestion: quiz.settings.timePerQuestion,
      },
    });
  } catch (error) {
    return res.status(500).json({ success: false, message: error.message });
  }
};

// ---------------- MY QUIZ HISTORY (student) ----------------
export const getMyHistory = async (req, res) => {
  try {
    const attempts = await QuizAttempt.find({
      student: req.user._id,
      status: { $ne: "in-progress" },
    })
      .populate("quiz", "title topic roomId")
      .sort({ submittedAt: -1 });

    const history = attempts.map((a) => ({
      attemptId: a._id,
      quizId: a.quiz?._id,
      title: a.quiz?.title,
      topic: a.quiz?.topic,
      marksObtained: a.marksObtained,
      totalMarks: a.totalMarks,
      percentage: a.percentage,
      passed: a.passed,
      submittedAt: a.submittedAt,
    }));

    return res.status(200).json({ success: true, history });
  } catch (error) {
    return res.status(500).json({ success: false, message: error.message });
  }
};
