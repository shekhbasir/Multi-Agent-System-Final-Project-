import React from "react";
import { motion, AnimatePresence } from "framer-motion";
import { FaBullhorn, FaTimes } from "react-icons/fa";

function QuizNotificationToast({ quizInfo, onAttend, onDismiss }) {
  if (!quizInfo) return null;

  return (
    <AnimatePresence>
      <motion.div
        initial={{ opacity: 0, y: -40, x: "-50%" }}
        animate={{ opacity: 1, y: 0, x: "-50%" }}
        exit={{ opacity: 0, y: -40, x: "-50%" }}
        className="fixed top-6 left-1/2 z-[210] w-[92%] max-w-md"
      >
        <div className="rounded-2xl bg-[#0b1120] border border-cyan-400/30 shadow-[0_20px_60px_-15px_rgba(34,211,238,0.5)] px-5 py-4 flex items-start gap-3">
          <div className="w-10 h-10 shrink-0 rounded-xl bg-gradient-to-br from-cyan-400 to-violet-500 flex items-center justify-center text-[#05070d]">
            <FaBullhorn />
          </div>
          <div className="flex-1 min-w-0">
            <p className="text-sm font-bold text-white">
              {quizInfo.hostName || "The Host"} has started a Live Quiz
            </p>
            <p className="text-xs text-slate-400 truncate mt-0.5">
              {quizInfo.title}
            </p>
            <div className="flex items-center gap-2 mt-3">
              <button
                onClick={onAttend}
                className="h-9 px-4 rounded-xl bg-gradient-to-r from-cyan-400 to-violet-500 text-[#05070d] text-xs font-bold hover:shadow-lg transition-shadow"
              >
                Attend Quiz
              </button>
              <button
                onClick={onDismiss}
                className="h-9 px-4 rounded-xl bg-white/5 border border-white/10 text-slate-300 text-xs font-semibold hover:bg-white/10 transition-colors"
              >
                Later
              </button>
            </div>
          </div>
          <button
            onClick={onDismiss}
            className="text-slate-500 hover:text-white transition-colors"
          >
            <FaTimes size={14} />
          </button>
        </div>
      </motion.div>
    </AnimatePresence>
  );
}

export default QuizNotificationToast;
