import mongoose from "mongoose";

const ResponseSchema = new mongoose.Schema(
  {
    questionIndex: { type: Number, required: true },
    selectedAnswer: {
      type: String,
      enum: ["A", "B", "C", "D", null],
      default: null,
    },
    isCorrect: { type: Boolean, default: false },
    markedForReview: { type: Boolean, default: false },
  },
  { _id: false },
);

const QuizAttemptSchema = new mongoose.Schema(
  {
    quiz: {
      type: mongoose.Schema.Types.ObjectId,
      ref: "Quiz",
      required: true,
      index: true,
    },

    roomId: { type: String, required: true, index: true },

    student: {
      type: mongoose.Schema.Types.ObjectId,
      ref: "User",
      required: true,
    },
    studentName: { type: String, required: true },

    responses: { type: [ResponseSchema], default: [] },

    // assigned once at attempt start, kept stable across refreshes
    questionOrder: { type: [Number], default: [] },
    optionOrder: { type: [[String]], default: [] },

    totalQuestions: Number,
    correctAnswers: { type: Number, default: 0 },
    wrongAnswers: { type: Number, default: 0 },
    unanswered: { type: Number, default: 0 },

    marksObtained: { type: Number, default: 0 },
    totalMarks: { type: Number, default: 0 },
    percentage: { type: Number, default: 0 },
    accuracy: { type: Number, default: 0 },
    passed: { type: Boolean, default: false },

    timeTakenSeconds: { type: Number, default: 0 },
    averageTimePerQuestion: { type: Number, default: 0 },

    startedAt: { type: Date, default: Date.now },
    submittedAt: { type: Date, default: null },

    status: {
      type: String,
      enum: ["in-progress", "submitted", "auto-submitted"],
      default: "in-progress",
    },
  },
  { timestamps: true },
);

QuizAttemptSchema.index({ quiz: 1, student: 1 }, { unique: true });

const QuizAttempt = mongoose.model("QuizAttempt", QuizAttemptSchema);

export default QuizAttempt;
