import React, { useState } from "react";
import { motion, AnimatePresence } from "framer-motion";
import {
  FaChevronDown,
  FaChevronUp,
  FaTrash,
  FaSyncAlt,
  FaPlus,
  FaArrowUp,
  FaArrowDown,
  FaRocket,
  FaSpinner,
} from "react-icons/fa";
import quizApi from "../../config/quizApi";

const DIFFICULTIES = ["Easy", "Medium", "Hard"];
const OPTION_KEYS = ["A", "B", "C", "D"];

function blankQuestion() {
  return {
    questionText: "",
    options: OPTION_KEYS.map((k) => ({ key: k, text: "" })),
    correctAnswer: "A",
    explanation: "",
    difficulty: "Medium",
  };
}

function QuizPreviewEditor({
  quiz,
  onQuizChange,
  onBack,
  onPublish,
  publishing,
}) {
  const [openIndex, setOpenIndex] = useState(0);
  const [regeneratingIndex, setRegeneratingIndex] = useState(null);
  const [saving, setSaving] = useState(false);

  const updateQuestion = (idx, patch) => {
    onQuizChange({
      ...quiz,
      questions: quiz.questions.map((q, i) =>
        i === idx ? { ...q, ...patch } : q,
      ),
    });
  };

  const updateOption = (qIdx, optKey, text) => {
    onQuizChange({
      ...quiz,
      questions: quiz.questions.map((q, i) =>
        i === qIdx
          ? {
              ...q,
              options: q.options.map((o) =>
                o.key === optKey ? { ...o, text } : o,
              ),
            }
          : q,
      ),
    });
  };

  const deleteQuestion = (idx) => {
    onQuizChange({
      ...quiz,
      questions: quiz.questions.filter((_, i) => i !== idx),
    });
  };

  const addQuestion = () => {
    const next = { ...quiz, questions: [...quiz.questions, blankQuestion()] };
    onQuizChange(next);
    setOpenIndex(next.questions.length - 1);
  };

  const moveQuestion = (idx, dir) => {
    const target = idx + dir;
    if (target < 0 || target >= quiz.questions.length) return;
    const arr = [...quiz.questions];
    [arr[idx], arr[target]] = [arr[target], arr[idx]];
    onQuizChange({ ...quiz, questions: arr });
    setOpenIndex(target);
  };

  const regenerate = async (idx) => {
    setRegeneratingIndex(idx);
    try {
      const res = await quizApi.post(`/${quiz._id}/regenerate-question/${idx}`);
      onQuizChange(res.data.quiz);
    } catch (err) {
      console.log(err);
    } finally {
      setRegeneratingIndex(null);
    }
  };

  const handleStartQuiz = async () => {
    setSaving(true);
    try {
      const res = await quizApi.put(`/${quiz._id}`, {
        title: quiz.title,
        description: quiz.description,
        questions: quiz.questions,
        settings: quiz.settings,
      });
      await onPublish(res.data.quiz);
    } catch (err) {
      console.log(err);
    } finally {
      setSaving(false);
    }
  };

  return (
    <div className="space-y-5">
      <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
        <div>
          <label className="block text-xs font-semibold text-slate-400 mb-1.5">
            Quiz Title
          </label>
          <input
            value={quiz.title}
            onChange={(e) => onQuizChange({ ...quiz, title: e.target.value })}
            className="w-full h-11 rounded-xl bg-white/5 border border-white/10 px-4 text-white text-sm focus:outline-none focus:ring-2 focus:ring-cyan-400/60"
          />
        </div>
        <div>
          <label className="block text-xs font-semibold text-slate-400 mb-1.5">
            Description
          </label>
          <input
            value={quiz.description}
            onChange={(e) =>
              onQuizChange({ ...quiz, description: e.target.value })
            }
            className="w-full h-11 rounded-xl bg-white/5 border border-white/10 px-4 text-white text-sm focus:outline-none focus:ring-2 focus:ring-cyan-400/60"
          />
        </div>
      </div>

      <div className="flex items-center justify-between">
        <p className="text-sm text-slate-400">
          {quiz.questions.length} questions
        </p>
        <button
          onClick={addQuestion}
          className="flex items-center gap-2 text-xs font-semibold px-3 py-2 rounded-xl bg-white/5 border border-white/10 text-cyan-300 hover:border-cyan-400/60 transition-colors"
        >
          <FaPlus size={11} /> Add Question
        </button>
      </div>

      <div className="space-y-3 max-h-[45vh] overflow-y-auto pr-1">
        {quiz.questions.map((q, idx) => (
          <div
            key={idx}
            className="rounded-2xl border border-white/10 bg-white/[0.03] overflow-hidden"
          >
            <button
              onClick={() => setOpenIndex(openIndex === idx ? -1 : idx)}
              className="w-full flex items-center justify-between px-4 py-3 text-left"
            >
              <div className="flex items-center gap-3 min-w-0">
                <span className="shrink-0 w-7 h-7 rounded-lg bg-gradient-to-br from-cyan-400/20 to-violet-500/20 border border-white/10 text-xs font-bold text-cyan-300 flex items-center justify-center">
                  {idx + 1}
                </span>
                <span className="text-sm text-slate-200 truncate">
                  {q.questionText || "Untitled question"}
                </span>
              </div>
              {openIndex === idx ? (
                <FaChevronUp className="text-slate-400 shrink-0" />
              ) : (
                <FaChevronDown className="text-slate-400 shrink-0" />
              )}
            </button>

            <AnimatePresence>
              {openIndex === idx && (
                <motion.div
                  initial={{ height: 0, opacity: 0 }}
                  animate={{ height: "auto", opacity: 1 }}
                  exit={{ height: 0, opacity: 0 }}
                  className="px-4 pb-4 space-y-3 border-t border-white/10"
                >
                  <textarea
                    value={q.questionText}
                    onChange={(e) =>
                      updateQuestion(idx, { questionText: e.target.value })
                    }
                    placeholder="Question text"
                    rows={2}
                    className="w-full rounded-xl bg-white/5 border border-white/10 px-4 py-3 text-sm text-white mt-3 focus:outline-none focus:ring-2 focus:ring-cyan-400/60"
                  />

                  <div className="grid grid-cols-1 sm:grid-cols-2 gap-2">
                    {q.options.map((opt) => (
                      <div key={opt.key} className="flex items-center gap-2">
                        <button
                          onClick={() =>
                            updateQuestion(idx, { correctAnswer: opt.key })
                          }
                          title="Mark as correct"
                          className={`shrink-0 w-8 h-8 rounded-lg flex items-center justify-center text-xs font-bold border transition-colors ${
                            q.correctAnswer === opt.key
                              ? "bg-emerald-400/20 border-emerald-400 text-emerald-300"
                              : "bg-white/5 border-white/10 text-slate-400"
                          }`}
                        >
                          {opt.key}
                        </button>
                        <input
                          value={opt.text}
                          onChange={(e) =>
                            updateOption(idx, opt.key, e.target.value)
                          }
                          placeholder={`Option ${opt.key}`}
                          className="flex-1 h-9 rounded-lg bg-white/5 border border-white/10 px-3 text-sm text-white focus:outline-none focus:ring-2 focus:ring-cyan-400/60"
                        />
                      </div>
                    ))}
                  </div>

                  <input
                    value={q.explanation}
                    onChange={(e) =>
                      updateQuestion(idx, { explanation: e.target.value })
                    }
                    placeholder="Short explanation of the correct answer"
                    className="w-full h-9 rounded-lg bg-white/5 border border-white/10 px-3 text-sm text-white focus:outline-none focus:ring-2 focus:ring-cyan-400/60"
                  />

                  <div className="flex items-center justify-between flex-wrap gap-2">
                    <select
                      value={q.difficulty}
                      onChange={(e) =>
                        updateQuestion(idx, { difficulty: e.target.value })
                      }
                      className="h-9 rounded-lg bg-white/5 border border-white/10 px-3 text-xs text-white focus:outline-none"
                    >
                      {DIFFICULTIES.map((d) => (
                        <option key={d} value={d} className="bg-[#0b1120]">
                          {d}
                        </option>
                      ))}
                    </select>

                    <div className="flex items-center gap-1.5">
                      <IconBtn
                        onClick={() => moveQuestion(idx, -1)}
                        title="Move up"
                      >
                        <FaArrowUp size={11} />
                      </IconBtn>
                      <IconBtn
                        onClick={() => moveQuestion(idx, 1)}
                        title="Move down"
                      >
                        <FaArrowDown size={11} />
                      </IconBtn>
                      <IconBtn
                        onClick={() => regenerate(idx)}
                        title="Regenerate with AI"
                        disabled={regeneratingIndex === idx}
                      >
                        {regeneratingIndex === idx ? (
                          <FaSpinner className="animate-spin" size={11} />
                        ) : (
                          <FaSyncAlt size={11} />
                        )}
                      </IconBtn>
                      <IconBtn
                        onClick={() => deleteQuestion(idx)}
                        title="Delete"
                        danger
                      >
                        <FaTrash size={11} />
                      </IconBtn>
                    </div>
                  </div>
                </motion.div>
              )}
            </AnimatePresence>
          </div>
        ))}
      </div>

      <div className="flex items-center gap-3 pt-2">
        <button
          onClick={onBack}
          className="h-12 px-5 rounded-2xl bg-white/5 border border-white/10 text-slate-300 text-sm font-semibold hover:bg-white/10 transition-colors"
        >
          Back to Settings
        </button>
        <button
          onClick={handleStartQuiz}
          disabled={saving || publishing || quiz.questions.length === 0}
          className="flex-1 h-12 rounded-2xl bg-gradient-to-r from-emerald-400 to-cyan-500 text-[#05070d] font-bold flex items-center justify-center gap-2 shadow-lg hover:shadow-2xl hover:-translate-y-0.5 transition-all disabled:opacity-60 disabled:hover:translate-y-0"
        >
          {saving || publishing ? (
            <>
              <FaSpinner className="animate-spin" /> Starting Quiz...
            </>
          ) : (
            <>
              <FaRocket /> Start Quiz
            </>
          )}
        </button>
      </div>
    </div>
  );
}

function IconBtn({ children, onClick, title, disabled, danger }) {
  return (
    <button
      onClick={onClick}
      title={title}
      disabled={disabled}
      className={`w-8 h-8 rounded-lg flex items-center justify-center border transition-colors disabled:opacity-50 ${
        danger
          ? "bg-red-500/10 border-red-500/30 text-red-400 hover:bg-red-500/20"
          : "bg-white/5 border-white/10 text-slate-300 hover:border-cyan-400/40 hover:text-cyan-300"
      }`}
    >
      {children}
    </button>
  );
}

export default QuizPreviewEditor;
