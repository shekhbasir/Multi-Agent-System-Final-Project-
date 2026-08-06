import React, { useEffect, useState, useMemo } from "react";
import { motion } from "framer-motion";
import {
  FaTimes,
  FaDownload,
  FaSearch,
  FaStopCircle,
  FaTrophy,
} from "react-icons/fa";
import quizApi from "../../config/quizApi";
import socket from "../../config/socket";

function Stat({ label, value }) {
  return (
    <div className="rounded-2xl bg-white/[0.03] border border-white/10 p-4">
      <p className="text-xs text-slate-400">{label}</p>
      <p className="text-xl font-bold text-white mt-1">{value}</p>
    </div>
  );
}

function HostQuizDashboard({ quizId, onClose, onEndQuiz }) {
  const [data, setData] = useState(null);
  const [loading, setLoading] = useState(true);
  const [search, setSearch] = useState("");
  const [sortKey, setSortKey] = useState("rank");

  const fetchData = () => {
    quizApi
      .get(`/${quizId}/dashboard`)
      .then((res) => setData(res.data))
      .finally(() => setLoading(false));
  };

  useEffect(() => {
    fetchData();
    const onUpdate = (payload) => {
      if (payload.quizId === quizId) fetchData();
    };
    socket.on("quiz:leaderboard-update", onUpdate);
    return () => socket.off("quiz:leaderboard-update", onUpdate);
  }, [quizId]);

  const filteredLeaderboard = useMemo(() => {
    if (!data) return [];
    let rows = data.leaderboard.filter((r) =>
      r.studentName.toLowerCase().includes(search.toLowerCase()),
    );
    if (sortKey === "marks")
      rows = [...rows].sort((a, b) => b.marksObtained - a.marksObtained);
    if (sortKey === "time")
      rows = [...rows].sort((a, b) => a.timeTakenSeconds - b.timeTakenSeconds);
    return rows;
  }, [data, search, sortKey]);

  const exportCsv = () => {
    if (!data) return;
    const header =
      "Rank,Name,Marks,Percentage,Correct,Wrong,Unanswered,Time(s)\n";
    const rows = data.leaderboard
      .map((r) =>
        [
          r.rank,
          r.studentName,
          r.marksObtained,
          r.percentage,
          r.correctAnswers,
          r.wrongAnswers,
          r.unanswered,
          r.timeTakenSeconds,
        ].join(","),
      )
      .join("\n");
    const blob = new Blob([header + rows], { type: "text/csv" });
    const url = URL.createObjectURL(blob);
    const a = document.createElement("a");
    a.href = url;
    a.download = `${data.quiz.title.replace(/\s+/g, "_")}_results.csv`;
    a.click();
    URL.revokeObjectURL(url);
  };

  if (loading || !data) {
    return (
      <div className="fixed inset-0 z-[220] bg-black/80 backdrop-blur-sm flex items-center justify-center text-white">
        Loading dashboard...
      </div>
    );
  }

  const { quiz, stats, leaderboard } = data;

  return (
    <div className="fixed inset-0 z-[220] bg-black/80 backdrop-blur-sm flex items-center justify-center p-4">
      <motion.div
        initial={{ opacity: 0, scale: 0.96 }}
        animate={{ opacity: 1, scale: 1 }}
        className="w-full max-w-4xl max-h-[90vh] overflow-y-auto rounded-3xl bg-[#0b1120] border border-white/10 p-6 text-white"
      >
        <div className="flex items-center justify-between mb-5 flex-wrap gap-3">
          <div>
            <h3 className="font-bold text-lg">{quiz.title}</h3>
            <p className="text-xs text-slate-400">
              {quiz.status === "live" ? "Live now" : "Ended"} •{" "}
              {quiz.questions.length} questions
            </p>
          </div>
          <div className="flex items-center gap-2">
            {quiz.status === "live" && (
              <button
                onClick={() => onEndQuiz(quizId)}
                className="flex items-center gap-2 h-10 px-4 rounded-xl bg-red-500/10 border border-red-500/30 text-red-300 text-xs font-semibold hover:bg-red-500/20"
              >
                <FaStopCircle /> End Quiz
              </button>
            )}
            <button
              onClick={exportCsv}
              className="flex items-center gap-2 h-10 px-4 rounded-xl bg-white/5 border border-white/10 text-xs font-semibold hover:bg-white/10"
            >
              <FaDownload /> Export
            </button>
            <button
              onClick={onClose}
              className="text-slate-400 hover:text-white"
            >
              <FaTimes />
            </button>
          </div>
        </div>

        <div className="grid grid-cols-2 sm:grid-cols-4 gap-3 mb-6">
          <Stat label="Participants" value={stats.totalParticipants} />
          <Stat label="Attempted" value={stats.attempted} />
          <Stat label="Not Attempted" value={stats.notAttempted} />
          <Stat label="Highest Score" value={stats.highestScore} />
          <Stat label="Lowest Score" value={stats.lowestScore} />
          <Stat label="Average Score" value={stats.averageScore} />
          <Stat label="Pass %" value={`${stats.passPercentage}%`} />
          <Stat label="Fail %" value={`${stats.failPercentage}%`} />
        </div>

        {(stats.mostCorrectQuestion || stats.mostIncorrectQuestion) && (
          <div className="grid grid-cols-1 sm:grid-cols-2 gap-3 mb-6">
            {stats.mostCorrectQuestion && (
              <div className="rounded-2xl bg-emerald-400/5 border border-emerald-400/20 p-4">
                <p className="text-xs text-emerald-300 font-semibold mb-1">
                  Most Correctly Answered
                </p>
                <p className="text-sm text-slate-200 truncate">
                  {stats.mostCorrectQuestion.questionText}
                </p>
                <p className="text-xs text-slate-400 mt-1">
                  {stats.mostCorrectQuestion.accuracy}% accuracy
                </p>
              </div>
            )}
            {stats.mostIncorrectQuestion && (
              <div className="rounded-2xl bg-red-400/5 border border-red-400/20 p-4">
                <p className="text-xs text-red-300 font-semibold mb-1">
                  Most Incorrectly Answered
                </p>
                <p className="text-sm text-slate-200 truncate">
                  {stats.mostIncorrectQuestion.questionText}
                </p>
                <p className="text-xs text-slate-400 mt-1">
                  {stats.mostIncorrectQuestion.accuracy}% accuracy
                </p>
              </div>
            )}
          </div>
        )}

        <div className="flex items-center justify-between mb-3 flex-wrap gap-2">
          <div className="flex items-center gap-2">
            <FaTrophy className="text-yellow-400" />
            <p className="font-semibold text-sm">Leaderboard</p>
          </div>
          <div className="flex items-center gap-2">
            <div className="relative">
              <FaSearch
                className="absolute left-3 top-1/2 -translate-y-1/2 text-slate-500"
                size={12}
              />
              <input
                value={search}
                onChange={(e) => setSearch(e.target.value)}
                placeholder="Search student"
                className="h-9 pl-8 pr-3 rounded-lg bg-white/5 border border-white/10 text-xs text-white focus:outline-none"
              />
            </div>
            <select
              value={sortKey}
              onChange={(e) => setSortKey(e.target.value)}
              className="h-9 rounded-lg bg-white/5 border border-white/10 text-xs text-white px-2"
            >
              <option value="rank" className="bg-[#0b1120]">
                By Rank
              </option>
              <option value="marks" className="bg-[#0b1120]">
                By Marks
              </option>
              <option value="time" className="bg-[#0b1120]">
                By Time
              </option>
            </select>
          </div>
        </div>

        <div className="space-y-2">
          {filteredLeaderboard.length === 0 ? (
            <p className="text-sm text-slate-400 text-center py-6">
              No submissions yet
            </p>
          ) : (
            filteredLeaderboard.map((entry) => (
              <div
                key={entry.studentId}
                className="flex items-center gap-3 rounded-xl px-4 py-3 border border-white/10 bg-white/[0.03]"
              >
                <span className="w-8 h-8 rounded-lg bg-white/5 flex items-center justify-center text-xs font-bold text-slate-300">
                  {entry.rank}
                </span>
                <div className="flex-1 min-w-0">
                  <p className="text-sm font-semibold truncate">
                    {entry.studentName}
                  </p>
                  <p className="text-xs text-slate-400">
                    {entry.correctAnswers}✓ {entry.wrongAnswers}✗{" "}
                    {entry.unanswered}– • {entry.timeTakenSeconds}s
                  </p>
                </div>
                <div className="text-right">
                  <p className="text-sm font-bold">
                    {entry.marksObtained}/{entry.totalMarks}
                  </p>
                  <p
                    className={`text-xs ${entry.passed ? "text-emerald-400" : "text-red-400"}`}
                  >
                    {entry.percentage}%
                  </p>
                </div>
              </div>
            ))
          )}
        </div>
      </motion.div>
    </div>
  );
}

export default HostQuizDashboard;
