// frontend/src/pages/Explore.jsx
import { useEffect, useMemo, useState } from "react";
import { useNavigate } from "react-router-dom";
import { motion, AnimatePresence } from "framer-motion";
import toast from "react-hot-toast";
import {
  FaSearch,
  FaSyncAlt,
  FaCrown,
  FaUsers,
  FaHashtag,
  FaVideoSlash,
  FaArrowRight,
  FaLock,
  FaGlobe,
} from "react-icons/fa";
import sessionApi from "../config/sessionApi";
import socket from "../config/socket";

const TYPE_FILTERS = ["All Types", "Public", "Private"];

function Explore() {
  const navigate = useNavigate();
  const [sessions, setSessions] = useState([]);
  const [loading, setLoading] = useState(true);
  const [refreshing, setRefreshing] = useState(false);
  const [searchTerm, setSearchTerm] = useState("");
  const [typeFilter, setTypeFilter] = useState("All Types");
  const [joiningRoomId, setJoiningRoomId] = useState(null);

  useEffect(() => {
    loadActiveSessions();
  }, []);

  // realtime — a new live session appears, a session ends, or a
  // participant count changes, without the user refreshing manually.
  useEffect(() => {
    const onCreated = (session) => {
      if (session?.status !== "active") return;
      setSessions((prev) => {
        if (prev.some((s) => s.roomId === session.roomId)) return prev;
        return [session, ...prev];
      });
    };

    const onEnded = ({ roomId }) => {
      setSessions((prev) => prev.filter((s) => s.roomId !== roomId));
    };

    const onParticipantUpdate = ({ roomId, participantCount }) => {
      setSessions((prev) =>
        prev.map((s) =>
          s.roomId === roomId
            ? { ...s, participants: new Array(participantCount).fill(null) }
            : s,
        ),
      );
    };

    socket.on("session:created", onCreated);
    socket.on("session:ended", onEnded);
    socket.on("session:participant-update", onParticipantUpdate);

    return () => {
      socket.off("session:created", onCreated);
      socket.off("session:ended", onEnded);
      socket.off("session:participant-update", onParticipantUpdate);
    };
  }, []);

  const loadActiveSessions = async (isRefresh = false) => {
    try {
      isRefresh ? setRefreshing(true) : setLoading(true);
      const res = await sessionApi.get("/active");
      setSessions(res.data.sessions || []);
    } catch (error) {
      console.log(error);
      toast.error("Couldn't load active sessions");
    } finally {
      setLoading(false);
      setRefreshing(false);
    }
  };

  const filtered = useMemo(() => {
    let data = [...sessions];

    if (typeFilter === "Public")
      data = data.filter((s) => s.meetingType === "public");
    if (typeFilter === "Private")
      data = data.filter((s) => s.meetingType === "private");

    if (searchTerm.trim()) {
      const q = searchTerm.trim().toLowerCase();
      data = data.filter(
        (s) =>
          s.meetingTitle?.toLowerCase().includes(q) ||
          s.hostName?.toLowerCase().includes(q) ||
          s.roomId?.toLowerCase().includes(q),
      );
    }

    return data;
  }, [sessions, searchTerm, typeFilter]);

  const handleJoin = async (session) => {
    try {
      setJoiningRoomId(session.roomId);
      await sessionApi.post(`/join/${session.roomId}`);
      navigate(`/meeting/${session.roomId}`);
    } catch (error) {
      toast.error(error?.response?.data?.message || "Couldn't join session");
    } finally {
      setJoiningRoomId(null);
    }
  };

  const cardVariants = {
    hidden: { opacity: 0, y: 18 },
    show: (i) => ({
      opacity: 1,
      y: 0,
      transition: { delay: Math.min(i * 0.04, 0.4), duration: 0.35 },
    }),
    exit: { opacity: 0, y: -8, transition: { duration: 0.2 } },
  };

  return (
    <div className="relative min-h-screen px-6 md:px-10 py-10 bg-[#05070d] text-slate-100 overflow-hidden">
      <div className="pointer-events-none absolute -top-40 -left-40 w-[420px] h-[420px] bg-violet-500/20 rounded-full blur-[120px]" />
      <div className="pointer-events-none absolute top-1/3 -right-32 w-[420px] h-[420px] bg-cyan-500/20 rounded-full blur-[130px]" />

      <div className="relative max-w-7xl mx-auto">
        <div className="flex flex-col md:flex-row md:items-end md:justify-between gap-6">
          <div>
            <p className="text-xs font-semibold tracking-[0.2em] text-cyan-400/80 uppercase mb-2">
              Discover
            </p>
            <h1 className="text-3xl md:text-4xl font-bold tracking-tight">
              <span className="bg-gradient-to-r from-cyan-300 via-sky-200 to-violet-300 bg-clip-text text-transparent">
                Explore Live Sessions
              </span>
            </h1>
            <p className="text-slate-400 mt-2 text-sm flex items-center gap-2">
              <span className="relative flex w-2 h-2">
                <span className="absolute inline-flex w-full h-full rounded-full bg-emerald-400 opacity-75 animate-ping" />
                <span className="relative inline-flex w-2 h-2 rounded-full bg-emerald-400" />
              </span>
              {loading ? "Loading…" : `${filtered.length} live right now`}
            </p>
          </div>

          <div className="flex flex-wrap items-center gap-3">
            <div className="relative">
              <FaSearch className="absolute left-4 top-1/2 -translate-y-1/2 text-slate-500 text-sm" />
              <input
                value={searchTerm}
                onChange={(e) => setSearchTerm(e.target.value)}
                placeholder="Search title, host or room ID"
                className="w-56 md:w-64 bg-white/5 border border-white/10 rounded-xl pl-10 pr-4 py-3 text-sm
                  placeholder:text-slate-500 outline-none focus:border-cyan-400/60 focus:bg-white/[0.07] transition-colors"
              />
            </div>

            <div className="flex bg-white/5 border border-white/10 rounded-xl p-1">
              {TYPE_FILTERS.map((t) => (
                <button
                  key={t}
                  onClick={() => setTypeFilter(t)}
                  className={`px-3 py-2 rounded-lg text-xs font-semibold transition-colors ${
                    typeFilter === t
                      ? "bg-cyan-500/15 text-cyan-300"
                      : "text-slate-400 hover:text-slate-200"
                  }`}
                >
                  {t}
                </button>
              ))}
            </div>

            <button
              onClick={() => loadActiveSessions(true)}
              disabled={refreshing}
              className="w-11 h-11 flex items-center justify-center rounded-xl bg-white/5 border border-white/10
                hover:border-cyan-400/50 hover:bg-white/[0.07] transition-colors disabled:opacity-60"
              title="Refresh"
            >
              <FaSyncAlt
                className={`text-slate-300 text-sm ${refreshing ? "animate-spin" : ""}`}
              />
            </button>
          </div>
        </div>

        <div className="mt-10">
          {loading ? (
            <div className="grid md:grid-cols-2 lg:grid-cols-3 gap-5">
              {[0, 1, 2].map((i) => (
                <div
                  key={i}
                  className="h-[200px] rounded-2xl bg-white/5 border border-white/10 animate-pulse"
                />
              ))}
            </div>
          ) : filtered.length === 0 ? (
            <div className="flex flex-col items-center justify-center text-center py-24 rounded-2xl border border-dashed border-white/10 bg-white/[0.02]">
              <div className="w-14 h-14 rounded-2xl bg-white/5 border border-white/10 flex items-center justify-center mb-4">
                <FaVideoSlash className="text-slate-500 text-xl" />
              </div>
              <h3 className="text-lg font-semibold text-slate-200">
                {sessions.length === 0
                  ? "No sessions are live right now"
                  : "Nothing matches your search"}
              </h3>
              <p className="text-slate-500 text-sm mt-1 max-w-xs">
                {sessions.length === 0
                  ? "Host a session and it'll show up here for others in realtime."
                  : "Try a different search term or filter."}
              </p>
            </div>
          ) : (
            <div className="grid md:grid-cols-2 lg:grid-cols-3 gap-5">
              <AnimatePresence mode="popLayout">
                {filtered.map((session, i) => {
                  const isJoining = joiningRoomId === session.roomId;
                  return (
                    <motion.div
                      key={session.roomId}
                      custom={i}
                      variants={cardVariants}
                      initial="hidden"
                      animate="show"
                      exit="exit"
                      layout
                      whileHover={{ y: -4 }}
                      className="rounded-2xl p-6 bg-white/[0.04] border border-white/10 backdrop-blur-sm
                        hover:border-cyan-400/40 hover:bg-white/[0.06] transition-colors duration-300
                        hover:shadow-[0_0_40px_-12px_rgba(34,211,238,0.35)]"
                    >
                      <div className="flex justify-between items-start gap-3">
                        <h2 className="text-base font-bold text-slate-100 leading-snug line-clamp-2">
                          {session.meetingTitle}
                        </h2>
                        <span
                          className={`shrink-0 flex items-center gap-1 px-2.5 py-1 rounded-full text-[10px] font-semibold ${
                            session.meetingType === "public"
                              ? "bg-cyan-500/10 text-cyan-300 border border-cyan-400/20"
                              : "bg-slate-500/10 text-slate-300 border border-slate-400/20"
                          }`}
                        >
                          {session.meetingType === "public" ? (
                            <FaGlobe size={9} />
                          ) : (
                            <FaLock size={9} />
                          )}
                          {session.meetingType}
                        </span>
                      </div>

                      {session.description && (
                        <p className="mt-2 text-slate-400 text-xs leading-relaxed line-clamp-2">
                          {session.description}
                        </p>
                      )}

                      <div className="mt-4 flex items-center justify-between text-xs text-slate-300">
                        <div className="flex items-center gap-1.5">
                          <FaCrown className="text-amber-400/80" />
                          <span className="truncate max-w-[110px]">
                            {session.hostName}
                          </span>
                        </div>
                        <div className="flex items-center gap-1.5">
                          <FaUsers className="text-cyan-400/80" />
                          {session.participants?.length || 0}/
                          {session.maxParticipants}
                        </div>
                        <div className="flex items-center gap-1.5">
                          <FaHashtag className="text-violet-400/80" />
                          <span className="font-mono">{session.roomId}</span>
                        </div>
                      </div>

                      <button
                        onClick={() => handleJoin(session)}
                        disabled={
                          isJoining ||
                          (session.participants?.length || 0) >=
                            session.maxParticipants
                        }
                        className="mt-5 w-full flex items-center justify-center gap-2 px-4 py-2.5 rounded-xl font-semibold text-sm
                          text-[#05070d] bg-gradient-to-r from-cyan-300 to-violet-300
                          hover:shadow-[0_0_25px_-5px_rgba(34,211,238,0.6)] transition-shadow duration-300
                          disabled:opacity-50 disabled:cursor-not-allowed"
                      >
                        {isJoining
                          ? "Joining…"
                          : (session.participants?.length || 0) >=
                              session.maxParticipants
                            ? "Meeting Full"
                            : "Join Meeting"}
                        {!isJoining && <FaArrowRight className="text-xs" />}
                      </button>
                    </motion.div>
                  );
                })}
              </AnimatePresence>
            </div>
          )}
        </div>
      </div>
    </div>
  );
}

export default Explore;
