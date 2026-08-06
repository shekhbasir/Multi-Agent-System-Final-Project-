import mongoose from "mongoose";

const OptionSchema = new mongoose.Schema(
  {
    key: { type: String, enum: ["A", "B", "C", "D"], required: true },
    text: { type: String, required: true },
  },
  { _id: false },
);

const QuestionSchema = new mongoose.Schema(
  {
    questionText: { type: String, required: true },
    options: { type: [OptionSchema], required: true },
    correctAnswer: { type: String, enum: ["A", "B", "C", "D"], required: true },
    explanation: { type: String, default: "" },
    difficulty: {
      type: String,
      enum: ["Easy", "Medium", "Hard"],
      default: "Medium",
    },
  },
  { _id: false },
);

const QuizSettingsSchema = new mongoose.Schema(
  {
    numQuestions: { type: Number, default: 10 },
    timePerQuestion: { type: Number, default: 45 }, // seconds
    randomizeQuestions: { type: Boolean, default: false },
    randomizeOptions: { type: Boolean, default: false },
    showCorrectAnswerAfterSubmit: { type: Boolean, default: true },
    negativeMarking: { type: Boolean, default: false },
    marksPerQuestion: { type: Number, default: 1 },
    negativeMarksPerQuestion: { type: Number, default: 0.25 },
    passingPercentage: { type: Number, default: 40 },
    showLeaderboardToStudents: { type: Boolean, default: true },
  },
  { _id: false },
);

const QuizSchema = new mongoose.Schema(
  {
    roomId: { type: String, required: true, index: true },

    host: {
      type: mongoose.Schema.Types.ObjectId,
      ref: "User",
      required: true,
    },

    title: { type: String, required: true, default: "AI Quiz" },
    description: { type: String, default: "" },
    topic: { type: String, required: true },

    questions: { type: [QuestionSchema], default: [] },
    settings: { type: QuizSettingsSchema, default: () => ({}) },

    status: {
      type: String,
      enum: ["draft", "live", "ended"],
      default: "draft",
    },

    startedAt: { type: Date, default: null },
    endedAt: { type: Date, default: null },
  },
  { timestamps: true },
);

const Quiz = mongoose.model("Quiz", QuizSchema);

export default Quiz;
