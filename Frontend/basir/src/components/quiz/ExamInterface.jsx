import React, { useEffect, useRef, useState, useCallback } from "react";
import {
  FaClock,
  FaChevronLeft,
  FaChevronRight,
  FaFlag,
  FaRegFlag,
  FaExpand,
  FaCompress,
  FaCheckCircle,
} from "react-icons/fa";
import quizApi from "../../config/quizApi";

function formatTime(totalSeconds) {
  const m = Math.floor(totalSeconds / 60)
    .toString()
    .padStart(2, "0");
  const s = Math.floor(totalSeconds % 60)
    .toString()
    .padStart(2, "0");
  return `${m}:${s}`;
}

function ExamInterface({ quizId, onExit, onSubmitted }) {
  const containerRef = useRef(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState("");
  const [quiz, setQuiz] = useState(null);
  const [questionOrder, setQuestionOrder] = useState([]);
  const [optionOrder, setOptionOrder] = useState([]);
  const [responses, setResponses] = useState({});
  const [pos, setPos] = useState(0);
  const [remaining, setRemaining] = useState(0);
  const [submitting, setSubmitting] = useState(false);
  const [isFullscreen, setIsFullscreen] = useState(false);

  useEffect(() => {
    let mounted = true;
    const load = async () => {
      try {
        const quizRes = await quizApi.get(`/${quizId}`);
        const startRes = await quizApi.post(`/${quizId}/attempt/start`);

        if (!mounted) return;

        if (startRes.data.alreadySubmitted) {
          onSubmitted(startRes.data.attempt);
          return;
        }

        setQuiz(quizRes.data.quiz);
        setQuestionOrder(
          startRes.data.questionOrder?.length
            ? startRes.data.questionOrder
            : quizRes.data.quiz.questions.map((_, i) => i),
        );
        setOptionOrder(startRes.data.optionOrder || []);
        setRemaining(startRes.data.remainingSeconds || 0);

        const respMap = {};
        (startRes.data.attempt.responses || []).forEach((r) => {
          respMap[r.questionIndex] = {
            selectedAnswer: r.selectedAnswer,
            markedForReview: r.markedForReview,
          };
        });
        setResponses(respMap);
      } catch (err) {
        setError(err.response?.data?.message || "Failed to load the quiz");
      } finally {
        if (mounted) setLoading(false);
      }
    };
    load();
    return () => {
      mounted = false;
    };
  }, [quizId]);

  const handleSubmit = useCallback(
    async (auto = false) => {
      if (submitting) return;
      setSubmitting(true);
      try {
        const res = await quizApi.post(`/${quizId}/attempt/submit`);
        onSubmitted(res.data.attempt, auto);
      } catch (err) {
        setError(err.response?.data?.message || "Failed to submit");
        setSubmitting(false);
      }
    },
    [quizId, submitting, onSubmitted],
  );

  useEffect(() => {
    if (loading || !quiz) return;
    if (remaining <= 0) {
      handleSubmit(true);
      return;
    }
    const timer = setInterval(() => {
      setRemaining((r) => {
        if (r <= 1) {
          clearInterval(timer);
          handleSubmit(true);
          return 0;
        }
        return r - 1;
      });
    }, 1000);
    return () => clearInterval(timer);
  }, [loading, quiz]);

  const toggleFullscreen = () => {
    if (!document.fullscreenElement) {
      containerRef.current?.requestFullscreen?.();
      setIsFullscreen(true);
    } else {
      document.exitFullscreen?.();
      setIsFullscreen(false);
    }
  };

  const selectAnswer = async (questionIndex, key) => {
    setResponses((prev) => ({
      ...prev,
      [questionIndex]: { ...prev[questionIndex], selectedAnswer: key },
    }));
    try {
      await quizApi.post(`/${quizId}/attempt/answer`, {
        questionIndex,
        selectedAnswer: key,
      });
    } catch (err) {
      console.log(err);
    }
  };

  const toggleMark = async (questionIndex) => {
    const nextVal = !responses[questionIndex]?.markedForReview;
    setResponses((prev) => ({
      ...prev,
      [questionIndex]: { ...prev[questionIndex], markedForReview: nextVal },
    }));
    try {
      await quizApi.post(`/${quizId}/attempt/answer`, {
        questionIndex,
        markedForReview: nextVal,
      });
    } catch (err) {
      console.log(err);
    }
  };

  const clearAnswer = async (questionIndex) => {
    setResponses((prev) => ({
      ...prev,
      [questionIndex]: { ...prev[questionIndex], selectedAnswer: null },
    }));
    try {
      await quizApi.post(`/${quizId}/attempt/answer`, {
        questionIndex,
        selectedAnswer: null,
      });
    } catch (err) {
      console.log(err);
    }
  };

  if (loading) {
    return (
      <div className="fixed inset-0 z-[220] bg-[#05070d] flex items-center justify-center text-white">
        Loading exam...
      </div>
    );
  }

  if (error || !quiz) {
    return (
      <div className="fixed inset-0 z-[220] bg-[#05070d] flex flex-col items-center justify-center text-white gap-4 px-6 text-center">
        <p className="text-red-400">{error || "Quiz unavailable"}</p>
        <button onClick={onExit} className="h-10 px-5 rounded-xl bg-white/10">
          Close
        </button>
      </div>
    );
  }

  const qIndex = questionOrder[pos];
  const question = quiz.questions[qIndex];
  const displayOptions = optionOrder[qIndex]?.length
    ? optionOrder[qIndex].map((key) =>
        question.options.find((o) => o.key === key),
      )
    : question.options;
  const current = responses[qIndex] || {};
  const answeredCount = Object.values(responses).filter(
    (r) => r.selectedAnswer,
  ).length;
  const totalQuestions = quiz.questions.length;

  const statusFor = (idx) => {
    if (idx === qIndex) return "current";
    if (responses[idx]?.markedForReview) return "marked";
    if (responses[idx]?.selectedAnswer) return "answered";
    return "unanswered";
  };

  return (
    <div
      ref={containerRef}
      className="fixed inset-0 z-[220] bg-[#05070d] flex flex-col text-white"
    >
      <div className="flex items-center justify-between px-4 sm:px-6 py-4 border-b border-white/10 bg-[#0b1120]">
        <div className="min-w-0">
          <p className="font-bold text-sm sm:text-base truncate">
            {quiz.title}
          </p>
          <p className="text-xs text-slate-400">
            Question {pos + 1} of {totalQuestions} • {answeredCount} answered
          </p>
        </div>
        <div className="flex items-center gap-3">
          <div
            className={`flex items-center gap-2 px-3 py-1.5 rounded-xl text-sm font-bold ${
              remaining <= 30
                ? "bg-red-500/20 text-red-300"
                : "bg-white/10 text-cyan-300"
            }`}
          >
            <FaClock size={12} /> {formatTime(remaining)}
          </div>
          <button
            onClick={toggleFullscreen}
            className="w-9 h-9 rounded-xl bg-white/5 border border-white/10 flex items-center justify-center hover:bg-white/10"
          >
            {isFullscreen ? <FaCompress size={13} /> : <FaExpand size={13} />}
          </button>
        </div>
      </div>

      <div className="w-full h-1 bg-white/5">
        <div
          className="h-1 bg-gradient-to-r from-cyan-400 to-violet-500 transition-all"
          style={{ width: `${((pos + 1) / totalQuestions) * 100}%` }}
        />
      </div>

      <div className="flex-1 overflow-y-auto flex flex-col lg:flex-row">
        <div className="flex-1 p-5 sm:p-8 max-w-3xl mx-auto w-full">
          <div className="flex items-center gap-2 mb-4">
            <span className="text-xs font-semibold px-2.5 py-1 rounded-full bg-white/10 text-slate-300">
              {question.difficulty}
            </span>
          </div>
          <h2 className="text-lg sm:text-xl font-semibold leading-relaxed mb-6">
            {question.questionText}
          </h2>

          <div className="space-y-3">
            {displayOptions.map((opt) => (
              <button
                key={opt.key}
                onClick={() => selectAnswer(qIndex, opt.key)}
                className={`w-full text-left flex items-center gap-3 rounded-2xl border px-4 py-3.5 transition-colors ${
                  current.selectedAnswer === opt.key
                    ? "border-cyan-400 bg-cyan-400/10"
                    : "border-white/10 bg-white/[0.03] hover:border-white/20"
                }`}
              >
                <span
                  className={`w-7 h-7 rounded-lg flex items-center justify-center text-xs font-bold shrink-0 ${
                    current.selectedAnswer === opt.key
                      ? "bg-cyan-400 text-[#05070d]"
                      : "bg-white/10 text-slate-300"
                  }`}
                >
                  {opt.key}
                </span>
                <span className="text-sm sm:text-base">{opt.text}</span>
              </button>
            ))}
          </div>

          <div className="flex flex-wrap items-center gap-3 mt-6">
            <button
              onClick={() => toggleMark(qIndex)}
              className="flex items-center gap-2 text-xs font-semibold px-3.5 py-2.5 rounded-xl bg-white/5 border border-white/10 hover:bg-white/10"
            >
              {current.markedForReview ? (
                <FaFlag className="text-amber-400" size={12} />
              ) : (
                <FaRegFlag size={12} />
              )}
              {current.markedForReview
                ? "Marked for Review"
                : "Mark for Review"}
            </button>
            <button
              onClick={() => clearAnswer(qIndex)}
              className="flex items-center gap-2 text-xs font-semibold px-3.5 py-2.5 rounded-xl bg-white/5 border border-white/10 hover:bg-white/10"
            >
              Clear Answer
            </button>
          </div>
        </div>

        <div className="w-full lg:w-72 shrink-0 border-t lg:border-t-0 lg:border-l border-white/10 p-5">
          <p className="text-xs font-semibold text-slate-400 mb-3">
            Question Navigator
          </p>
          <div className="grid grid-cols-6 sm:grid-cols-8 lg:grid-cols-5 gap-2">
            {questionOrder.map((idx, i) => {
              const status = statusFor(idx);
              const styles = {
                current: "bg-cyan-400 text-[#05070d]",
                marked: "bg-amber-400/80 text-[#05070d]",
                answered: "bg-emerald-400/80 text-[#05070d]",
                unanswered: "bg-white/10 text-slate-300",
              };
              return (
                <button
                  key={idx}
                  onClick={() => setPos(i)}
                  className={`w-9 h-9 rounded-lg text-xs font-bold ${styles[status]}`}
                >
                  {i + 1}
                </button>
              );
            })}
          </div>
          <div className="mt-4 space-y-1.5 text-xs text-slate-400">
            <p>
              <span className="inline-block w-2.5 h-2.5 rounded-sm bg-emerald-400/80 mr-2" />
              Answered
            </p>
            <p>
              <span className="inline-block w-2.5 h-2.5 rounded-sm bg-amber-400/80 mr-2" />
              Marked for Review
            </p>
            <p>
              <span className="inline-block w-2.5 h-2.5 rounded-sm bg-white/10 mr-2" />
              Unanswered
            </p>
          </div>
        </div>
      </div>

      <div className="flex items-center justify-between gap-3 px-4 sm:px-6 py-4 border-t border-white/10 bg-[#0b1120]">
        <button
          onClick={() => setPos((p) => Math.max(0, p - 1))}
          disabled={pos === 0}
          className="flex items-center gap-2 h-11 px-4 rounded-xl bg-white/5 border border-white/10 text-sm font-semibold disabled:opacity-40"
        >
          <FaChevronLeft size={12} /> Previous
        </button>

        {pos === totalQuestions - 1 ? (
          <button
            onClick={() => handleSubmit(false)}
            disabled={submitting}
            className="flex items-center gap-2 h-11 px-6 rounded-xl bg-gradient-to-r from-emerald-400 to-cyan-500 text-[#05070d] text-sm font-bold disabled:opacity-60"
          >
            <FaCheckCircle size={13} />{" "}
            {submitting ? "Submitting..." : "Submit Quiz"}
          </button>
        ) : (
          <button
            onClick={() => setPos((p) => Math.min(totalQuestions - 1, p + 1))}
            className="flex items-center gap-2 h-11 px-4 rounded-xl bg-white/5 border border-white/10 text-sm font-semibold"
          >
            Next <FaChevronRight size={12} />
          </button>
        )}
      </div>
    </div>
  );
}

export default ExamInterface;
