import React, { useEffect, useState } from "react";
import { motion } from "framer-motion";
import { FaTimes, FaHistory, FaChartLine, FaTrophy } from "react-icons/fa";
import quizApi from "../../config/quizApi";

function QuizHistory({ roomId, isHost, onClose, onOpenDashboard }) {
  const [items, setItems] = useState([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    const url = isHost ? `/room/${roomId}` : `/history/mine`;
    quizApi
      .get(url)
      .then((res) => {
        setItems(isHost ? res.data.quizzes : res.data.history);
      })
      .finally(() => setLoading(false));
  }, [roomId, isHost]);

  const trend =
    !isHost && items.length >= 2
      ? items[0].percentage - items[items.length - 1].percentage
      : null;

  return (
    <div className="fixed inset-0 z-[220] bg-black/80 backdrop-blur-sm flex items-center justify-center p-4">
      <motion.div
        initial={{ opacity: 0, scale: 0.96 }}
        animate={{ opacity: 1, scale: 1 }}
        className="w-full max-w-2xl max-h-[85vh] overflow-y-auto rounded-3xl bg-[#0b1120] border border-white/10 p-6 text-white"
      >
        <div className="flex items-center justify-between mb-5">
          <div className="flex items-center gap-2">
            <FaHistory className="text-cyan-400" />
            <h3 className="font-bold text-lg">Quiz History</h3>
          </div>
          <button onClick={onClose} className="text-slate-400 hover:text-white">
            <FaTimes />
          </button>
        </div>

        {!isHost && trend !== null && (
          <div className="flex items-center gap-2 rounded-xl bg-white/[0.03] border border-white/10 px-4 py-3 mb-4 text-sm">
            <FaChartLine
              className={trend >= 0 ? "text-emerald-400" : "text-red-400"}
            />
            <span>
              Improvement trend:{" "}
              <span
                className={trend >= 0 ? "text-emerald-400" : "text-red-400"}
              >
                {trend >= 0 ? "+" : ""}
                {trend.toFixed(1)}%
              </span>{" "}
              since your first attempt
            </span>
          </div>
        )}

        {loading ? (
          <p className="text-sm text-slate-400 text-center py-8">Loading...</p>
        ) : items.length === 0 ? (
          <p className="text-sm text-slate-400 text-center py-8">
            No quiz history yet
          </p>
        ) : (
          <div className="space-y-2">
            {items.map((item) => (
              <div
                key={item._id || item.attemptId}
                className="flex items-center justify-between rounded-xl border border-white/10 bg-white/[0.03] px-4 py-3"
              >
                <div className="min-w-0">
                  <p className="text-sm font-semibold truncate">{item.title}</p>
                  <p className="text-xs text-slate-400">
                    {isHost
                      ? `${item.attemptCount} attempts • Avg ${item.averageMarks} marks • ${item.status}`
                      : new Date(item.submittedAt).toLocaleString()}
                  </p>
                </div>
                {isHost ? (
                  <button
                    onClick={() => onOpenDashboard(item._id)}
                    className="flex items-center gap-1.5 text-xs font-semibold px-3 py-2 rounded-lg bg-white/5 border border-white/10 hover:bg-white/10 shrink-0"
                  >
                    <FaTrophy size={11} /> View
                  </button>
                ) : (
                  <div className="text-right shrink-0">
                    <p className="text-sm font-bold">
                      {item.marksObtained}/{item.totalMarks}
                    </p>
                    <p
                      className={`text-xs ${item.passed ? "text-emerald-400" : "text-red-400"}`}
                    >
                      {item.percentage}%
                    </p>
                  </div>
                )}
              </div>
            ))}
          </div>
        )}
      </motion.div>
    </div>
  );
}

export default QuizHistory;
