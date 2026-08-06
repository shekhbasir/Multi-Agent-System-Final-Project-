import React, { useState } from "react";
import { AnimatePresence, motion } from "framer-motion";
import { FaTimes, FaMagic, FaSpinner, FaBrain } from "react-icons/fa";
import quizApi from "../../config/quizApi";
import QuizPreviewEditor from "./QuizPreviewEditor";

const TOPIC_SUGGESTIONS = [
  "Operating System",
  "Java",
  "React",
  "Node.js",
  "Mathematics",
  "Physics",
  "Chemistry",
  "Biology",
  "English",
  "History",
];

function AIQuizModal({ roomId, onClose, onQuizPublished }) {
  const [step, setStep] = useState("settings");
  const [topic, setTopic] = useState("");
  const [title, setTitle] = useState("");
  const [description, setDescription] = useState("");
  const [numQuestions, setNumQuestions] = useState(10);
  const [timePerQuestion, setTimePerQuestion] = useState(45);
  const [randomizeQuestions, setRandomizeQuestions] = useState(false);
  const [randomizeOptions, setRandomizeOptions] = useState(false);
  const [showCorrectAnswerAfterSubmit, setShowCorrectAnswerAfterSubmit] =
    useState(true);
  const [negativeMarking, setNegativeMarking] = useState(false);
  const [marksPerQuestion, setMarksPerQuestion] = useState(1);
  const [negativeMarksPerQuestion, setNegativeMarksPerQuestion] =
    useState(0.25);
  const [passingPercentage, setPassingPercentage] = useState(40);
  const [showLeaderboardToStudents, setShowLeaderboardToStudents] =
    useState(true);

  const [quiz, setQuiz] = useState(null);
  const [generating, setGenerating] = useState(false);
  const [publishing, setPublishing] = useState(false);
  const [error, setError] = useState("");

  const handleGenerate = async () => {
    if (!topic.trim()) {
      setError("Please enter a topic");
      return;
    }
    setError("");
    setGenerating(true);
    try {
      const res = await quizApi.post("/generate", {
        roomId,
        topic,
        title,
        description,
        numQuestions,
        timePerQuestion,
        randomizeQuestions,
        randomizeOptions,
        showCorrectAnswerAfterSubmit,
        negativeMarking,
        marksPerQuestion,
        negativeMarksPerQuestion,
        passingPercentage,
        showLeaderboardToStudents,
      });
      setQuiz(res.data.quiz);
      setStep("preview");
    } catch (err) {
      setError(err.response?.data?.message || "Failed to generate questions");
    } finally {
      setGenerating(false);
    }
  };

  const handlePublish = async (finalQuiz) => {
    setPublishing(true);
    setError("");
    try {
      const res = await quizApi.post(`/${finalQuiz._id}/publish`);
      onQuizPublished(res.data.quiz);
    } catch (err) {
      setError(err.response?.data?.message || "Failed to start the quiz");
    } finally {
      setPublishing(false);
    }
  };

  return (
    <AnimatePresence>
      <motion.div
        initial={{ opacity: 0 }}
        animate={{ opacity: 1 }}
        exit={{ opacity: 0 }}
        className="fixed inset-0 z-[200] flex items-center justify-center bg-black/70 backdrop-blur-sm p-4"
      >
        <motion.div
          initial={{ opacity: 0, y: 24, scale: 0.97 }}
          animate={{ opacity: 1, y: 0, scale: 1 }}
          exit={{ opacity: 0, y: 24, scale: 0.97 }}
          transition={{ duration: 0.25 }}
          className="w-full max-w-3xl max-h-[90vh] overflow-y-auto rounded-3xl bg-[#0b1120] border border-white/10 shadow-[0_20px_80px_-20px_rgba(34,211,238,0.35)]"
        >
          <div className="sticky top-0 z-10 flex items-center justify-between px-6 py-5 border-b border-white/10 bg-[#0b1120]/95 backdrop-blur">
            <div className="flex items-center gap-3">
              <div className="w-10 h-10 rounded-2xl bg-gradient-to-br from-cyan-400 to-violet-500 flex items-center justify-center text-[#05070d]">
                <FaBrain size={18} />
              </div>
              <div>
                <h2 className="text-white font-bold text-lg leading-tight">
                  AI Generated Live Quiz
                </h2>
                <p className="text-xs text-slate-400">
                  {step === "settings"
                    ? "Set up your quiz"
                    : "Preview & publish"}
                </p>
              </div>
            </div>
            <button
              onClick={onClose}
              className="w-9 h-9 flex items-center justify-center rounded-xl text-slate-400 hover:text-white hover:bg-white/10 transition-colors"
            >
              <FaTimes />
            </button>
          </div>

          <div className="p-6">
            {error && (
              <div className="mb-4 rounded-xl border border-red-500/30 bg-red-500/10 text-red-300 text-sm px-4 py-3">
                {error}
              </div>
            )}

            {step === "settings" && (
              <div className="space-y-6">
                <div>
                  <label className="block text-sm font-semibold text-slate-300 mb-2">
                    Subject / Topic
                  </label>
                  <input
                    value={topic}
                    onChange={(e) => setTopic(e.target.value)}
                    placeholder="e.g. Operating System, React, Physics..."
                    className="w-full h-12 rounded-xl bg-white/5 border border-white/10 px-4 text-white placeholder:text-slate-500 focus:outline-none focus:ring-2 focus:ring-cyan-400/60"
                  />
                  <div className="flex flex-wrap gap-2 mt-3">
                    {TOPIC_SUGGESTIONS.map((t) => (
                      <button
                        key={t}
                        onClick={() => setTopic(t)}
                        className="text-xs px-3 py-1.5 rounded-full bg-white/5 border border-white/10 text-slate-300 hover:border-cyan-400/60 hover:text-cyan-300 transition-colors"
                      >
                        {t}
                      </button>
                    ))}
                  </div>
                </div>

                <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                  <div>
                    <label className="block text-sm font-semibold text-slate-300 mb-2">
                      Quiz Title
                    </label>
                    <input
                      value={title}
                      onChange={(e) => setTitle(e.target.value)}
                      placeholder="Optional — auto-generated if left blank"
                      className="w-full h-11 rounded-xl bg-white/5 border border-white/10 px-4 text-white placeholder:text-slate-500 text-sm focus:outline-none focus:ring-2 focus:ring-cyan-400/60"
                    />
                  </div>
                  <div>
                    <label className="block text-sm font-semibold text-slate-300 mb-2">
                      Quiz Description
                    </label>
                    <input
                      value={description}
                      onChange={(e) => setDescription(e.target.value)}
                      placeholder="Optional"
                      className="w-full h-11 rounded-xl bg-white/5 border border-white/10 px-4 text-white placeholder:text-slate-500 text-sm focus:outline-none focus:ring-2 focus:ring-cyan-400/60"
                    />
                  </div>
                </div>

                <div className="grid grid-cols-2 sm:grid-cols-4 gap-3">
                  <SelectField
                    label="Questions"
                    value={numQuestions}
                    onChange={setNumQuestions}
                    options={[5, 10, 15, 20]}
                  />
                  <SelectField
                    label="Time / Question"
                    value={timePerQuestion}
                    onChange={setTimePerQuestion}
                    options={[30, 45, 60, 90, 120]}
                    suffix="s"
                  />
                  <NumberField
                    label="Marks / Question"
                    value={marksPerQuestion}
                    onChange={setMarksPerQuestion}
                    step={0.5}
                    min={0.5}
                  />
                  <NumberField
                    label="Passing %"
                    value={passingPercentage}
                    onChange={setPassingPercentage}
                    step={5}
                    min={0}
                    max={100}
                  />
                </div>

                <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
                  <ToggleField
                    label="Randomize Questions"
                    value={randomizeQuestions}
                    onChange={setRandomizeQuestions}
                  />
                  <ToggleField
                    label="Randomize Options"
                    value={randomizeOptions}
                    onChange={setRandomizeOptions}
                  />
                  <ToggleField
                    label="Show Correct Answer After Submission"
                    value={showCorrectAnswerAfterSubmit}
                    onChange={setShowCorrectAnswerAfterSubmit}
                  />
                  <ToggleField
                    label="Show Leaderboard To Students"
                    value={showLeaderboardToStudents}
                    onChange={setShowLeaderboardToStudents}
                  />
                  <ToggleField
                    label="Negative Marking"
                    value={negativeMarking}
                    onChange={setNegativeMarking}
                  />
                  {negativeMarking && (
                    <NumberField
                      label="Negative Marks / Wrong Answer"
                      value={negativeMarksPerQuestion}
                      onChange={setNegativeMarksPerQuestion}
                      step={0.25}
                      min={0}
                    />
                  )}
                </div>

                <button
                  onClick={handleGenerate}
                  disabled={generating}
                  className="w-full py-3.5 rounded-2xl bg-gradient-to-r from-cyan-400 to-violet-500 text-[#05070d] font-bold flex items-center justify-center gap-2 shadow-lg hover:shadow-2xl hover:-translate-y-0.5 transition-all disabled:opacity-60 disabled:hover:translate-y-0"
                >
                  {generating ? (
                    <>
                      <FaSpinner className="animate-spin" /> Generating
                      Questions...
                    </>
                  ) : (
                    <>
                      <FaMagic /> Generate Questions
                    </>
                  )}
                </button>
              </div>
            )}

            {step === "preview" && quiz && (
              <QuizPreviewEditor
                quiz={quiz}
                onQuizChange={setQuiz}
                onBack={() => setStep("settings")}
                onPublish={handlePublish}
                publishing={publishing}
              />
            )}
          </div>
        </motion.div>
      </motion.div>
    </AnimatePresence>
  );
}

function SelectField({ label, value, onChange, options, suffix = "" }) {
  return (
    <div>
      <label className="block text-xs font-semibold text-slate-400 mb-1.5">
        {label}
      </label>
      <select
        value={value}
        onChange={(e) => onChange(Number(e.target.value))}
        className="w-full h-10 rounded-xl bg-white/5 border border-white/10 px-3 text-white text-sm focus:outline-none focus:ring-2 focus:ring-cyan-400/60"
      >
        {options.map((o) => (
          <option key={o} value={o} className="bg-[#0b1120]">
            {o}
            {suffix}
          </option>
        ))}
      </select>
    </div>
  );
}

function NumberField({ label, value, onChange, step = 1, min, max }) {
  return (
    <div>
      <label className="block text-xs font-semibold text-slate-400 mb-1.5">
        {label}
      </label>
      <input
        type="number"
        value={value}
        step={step}
        min={min}
        max={max}
        onChange={(e) => onChange(Number(e.target.value))}
        className="w-full h-10 rounded-xl bg-white/5 border border-white/10 px-3 text-white text-sm focus:outline-none focus:ring-2 focus:ring-cyan-400/60"
      />
    </div>
  );
}

function ToggleField({ label, value, onChange }) {
  return (
    <button
      onClick={() => onChange(!value)}
      className="flex items-center justify-between h-11 px-4 rounded-xl bg-white/5 border border-white/10 hover:border-cyan-400/40 transition-colors"
    >
      <span className="text-sm text-slate-300 text-left">{label}</span>
      <span
        className={`w-10 h-5 rounded-full flex items-center px-0.5 transition-colors ${
          value
            ? "bg-gradient-to-r from-cyan-400 to-violet-500 justify-end"
            : "bg-white/10 justify-start"
        }`}
      >
        <span className="w-4 h-4 rounded-full bg-white shadow" />
      </span>
    </button>
  );
}

export default AIQuizModal;
