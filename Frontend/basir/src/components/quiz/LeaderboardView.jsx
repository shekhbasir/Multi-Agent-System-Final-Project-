import React, { useEffect, useState } from "react";
import { motion } from "framer-motion";
import { FaTrophy, FaTimes, FaMedal } from "react-icons/fa";
import quizApi from "../../config/quizApi";

function medalColor(rank) {
  if (rank === 1) return "text-yellow-400";
  if (rank === 2) return "text-slate-300";
  if (rank === 3) return "text-amber-600";
  return "text-slate-500";
}

function LeaderboardView({ quizId, currentUserId, onClose }) {
  const [leaderboard, setLeaderboard] = useState([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    let mounted = true;
    quizApi
      .get(`/${quizId}/leaderboard`)
      .then((res) => {
        if (mounted) setLeaderboard(res.data.leaderboard || []);
      })
      .finally(() => mounted && setLoading(false));
    return () => {
      mounted = false;
    };
  }, [quizId]);

  return (
    <div className="fixed inset-0 z-[220] bg-black/80 backdrop-blur-sm flex items-center justify-center p-4">
      <motion.div
        initial={{ opacity: 0, scale: 0.95 }}
        animate={{ opacity: 1, scale: 1 }}
        className="w-full max-w-lg rounded-3xl bg-[#0b1120] border border-white/10 p-6 text-white max-h-[85vh] overflow-y-auto"
      >
        <div className="flex items-center justify-between mb-5">
          <div className="flex items-center gap-2">
            <FaTrophy className="text-yellow-400" />
            <h3 className="font-bold text-lg">Leaderboard</h3>
          </div>
          <button onClick={onClose} className="text-slate-400 hover:text-white">
            <FaTimes />
          </button>
        </div>

        {loading ? (
          <p className="text-sm text-slate-400 text-center py-8">
            Loading leaderboard...
          </p>
        ) : leaderboard.length === 0 ? (
          <p className="text-sm text-slate-400 text-center py-8">
            No submissions yet
          </p>
        ) : (
          <div className="space-y-2">
            {leaderboard.map((entry) => (
              <div
                key={entry.studentId}
                className={`flex items-center gap-3 rounded-xl px-4 py-3 border ${
                  entry.studentId === currentUserId
                    ? "border-cyan-400/60 bg-cyan-400/10"
                    : "border-white/10 bg-white/[0.03]"
                }`}
              >
                <span
                  className={`w-8 h-8 rounded-lg flex items-center justify-center font-bold text-sm bg-white/5 ${
                    entry.rank <= 3 ? medalColor(entry.rank) : "text-slate-400"
                  }`}
                >
                  {entry.rank <= 3 ? <FaMedal /> : entry.rank}
                </span>
                <div className="flex-1 min-w-0">
                  <p className="text-sm font-semibold truncate">
                    {entry.studentName}
                  </p>
                  <p className="text-xs text-slate-400">
                    {entry.correctAnswers} correct • {entry.timeTakenSeconds}s
                  </p>
                </div>
                <div className="text-right">
                  <p className="text-sm font-bold">
                    {entry.marksObtained}/{entry.totalMarks}
                  </p>
                  <p className="text-xs text-slate-400">{entry.percentage}%</p>
                </div>
              </div>
            ))}
          </div>
        )}
      </motion.div>
    </div>
  );
}

export default LeaderboardView;
