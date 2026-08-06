import React from "react";
import { motion } from "framer-motion";
import {
  FaCheckCircle,
  FaTimesCircle,
  FaTrophy,
  FaTimes,
} from "react-icons/fa";

function StatCard({ label, value, accent }) {
  return (
    <div className="rounded-2xl bg-white/[0.03] border border-white/10 p-4">
      <p className="text-xs text-slate-400">{label}</p>
      <p className={`text-xl font-bold mt-1 ${accent || "text-white"}`}>
        {value}
      </p>
    </div>
  );
}

function QuizResultsView({
  attempt,
  showLeaderboard,
  onViewLeaderboard,
  onClose,
}) {
  return (
    <div className="fixed inset-0 z-[220] bg-black/80 backdrop-blur-sm flex items-center justify-center p-4">
      <motion.div
        initial={{ opacity: 0, scale: 0.95, y: 20 }}
        animate={{ opacity: 1, scale: 1, y: 0 }}
        className="w-full max-w-lg rounded-3xl bg-[#0b1120] border border-white/10 p-6 sm:p-8 text-white max-h-[90vh] overflow-y-auto"
      >
        <div className="flex items-center justify-between mb-6">
          <div className="flex items-center gap-3">
            <div
              className={`w-12 h-12 rounded-2xl flex items-center justify-center ${
                attempt.passed
                  ? "bg-emerald-400/20 text-emerald-300"
                  : "bg-red-500/20 text-red-300"
              }`}
            >
              {attempt.passed ? (
                <FaCheckCircle size={22} />
              ) : (
                <FaTimesCircle size={22} />
              )}
            </div>
            <div>
              <p className="font-bold text-lg">
                {attempt.passed ? "Passed" : "Not Passed"}
              </p>
              <p className="text-xs text-slate-400">
                Quiz submitted successfully
              </p>
            </div>
          </div>
          <button onClick={onClose} className="text-slate-400 hover:text-white">
            <FaTimes />
          </button>
        </div>

        <div className="text-center mb-6">
          <p className="text-5xl font-black bg-gradient-to-r from-cyan-400 to-violet-400 bg-clip-text text-transparent">
            {attempt.percentage}%
          </p>
          <p className="text-sm text-slate-400 mt-1">
            {attempt.marksObtained} / {attempt.totalMarks} marks
          </p>
        </div>

        <div className="grid grid-cols-2 gap-3">
          <StatCard
            label="Correct"
            value={attempt.correctAnswers}
            accent="text-emerald-300"
          />
          <StatCard
            label="Wrong"
            value={attempt.wrongAnswers}
            accent="text-red-300"
          />
          <StatCard
            label="Unanswered"
            value={attempt.unanswered}
            accent="text-slate-300"
          />
          <StatCard label="Accuracy" value={`${attempt.accuracy}%`} />
          <StatCard
            label="Time Taken"
            value={`${Math.floor(attempt.timeTakenSeconds / 60)}m ${attempt.timeTakenSeconds % 60}s`}
          />
          <StatCard
            label="Avg / Question"
            value={`${attempt.averageTimePerQuestion}s`}
          />
        </div>

        {showLeaderboard && (
          <button
            onClick={onViewLeaderboard}
            className="w-full mt-6 h-12 rounded-2xl bg-gradient-to-r from-cyan-400 to-violet-500 text-[#05070d] font-bold flex items-center justify-center gap-2"
          >
            <FaTrophy /> View Leaderboard
          </button>
        )}
      </motion.div>
    </div>
  );
}

export default QuizResultsView;
