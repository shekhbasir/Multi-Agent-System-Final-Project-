// frontend/src/components/dashboard/Filtersession.jsx
import React, { useEffect, useMemo, useRef, useState } from "react";
import { AnimatePresence, motion } from "framer-motion";
import { useNavigate } from "react-router-dom";
import toast from "react-hot-toast";
import sessionApi from "../../config/sessionApi";
import socket from "../../config/socket";
import {
  FaFilter,
  FaChevronDown,
  FaSearch,
  FaSyncAlt,
  FaTimes,
  FaCrown,
  FaHashtag,
  FaUsers,
  FaCalendarAlt,
  FaVideoSlash,
  FaArrowRight,
  FaCertificate,
  FaSignOutAlt,
  FaStopCircle,
  FaUserGraduate,
} from "react-icons/fa";
import CertificateModal from "../certificate/CertificateModal";

const STATUS_FILTERS = [
  "All Sessions",
  "Active Sessions",
  "Ended Sessions",
  "Hosted By Me",
  "Joined By Me",
];
const SORT_FILTERS = ["Newest First", "Oldest First", "Most Participants"];

function Filtersession() {
  const navigate = useNavigate();
  const [open, setOpen] = useState(false);
  const [sessions, setSessions] = useState([]);
  const [loading, setLoading] = useState(true);
  const [refreshing, setRefreshing] = useState(false);
  const [selectedFilter, setSelectedFilter] = useState("All Sessions");
  const [searchTerm, setSearchTerm] = useState("");
  const [certModalSession, setCertModalSession] = useState(null);
  const [busyRoomId, setBusyRoomId] = useState(null);

  const dropdownRef = useRef(null);

  useEffect(() => {
    getSessions();
  }, []);

  // Realtime — when any session changes status or gets a new participant,
  // silently refresh so this list never shows stale "active" state.
  useEffect(() => {
    const onCreated = () => getSessions(true);
    const onEnded = () => getSessions(true);
    const onParticipantUpdate = () => getSessions(true);

    socket.on("session:created", onCreated);
    socket.on("session:ended", onEnded);
    socket.on("session:participant-update", onParticipantUpdate);

    return () => {
      socket.off("session:created", onCreated);
      socket.off("session:ended", onEnded);
      socket.off("session:participant-update", onParticipantUpdate);
    };
  }, []);

  useEffect(() => {
    const closeDropdown = (e) => {
      if (dropdownRef.current && !dropdownRef.current.contains(e.target)) {
        setOpen(false);
      }
    };
    document.addEventListener("mousedown", closeDropdown);
    return () => document.removeEventListener("mousedown", closeDropdown);
  }, []);

  const getSessions = async (isRefresh = false) => {
    try {
      isRefresh ? setRefreshing(true) : setLoading(true);
      const res = await sessionApi.get("/my-sessions");
      setSessions(res.data.sessions || []);
    } catch (error) {
      console.log(error);
    } finally {
      setLoading(false);
      setRefreshing(false);
    }
  };

  const applyFilter = (filter) => {
    setSelectedFilter(filter);
    setOpen(false);
  };

  const clearFilter = (e) => {
    e.stopPropagation();
    setSelectedFilter("All Sessions");
  };

  const filteredSessions = useMemo(() => {
    let data = [...sessions];

    switch (selectedFilter) {
      case "Active Sessions":
        data = data.filter((s) => s.status === "active");
        break;
      case "Ended Sessions":
        data = data.filter((s) => s.status === "ended");
        break;
      case "Hosted By Me":
        data = data.filter((s) => s.myRole === "host");
        break;
      case "Joined By Me":
        data = data.filter((s) => s.myRole === "participant");
        break;
      case "Newest First":
        data.sort((a, b) => new Date(b.createdAt) - new Date(a.createdAt));
        break;
      case "Oldest First":
        data.sort((a, b) => new Date(a.createdAt) - new Date(b.createdAt));
        break;
      case "Most Participants":
        data.sort(
          (a, b) =>
            (b.participants?.length || 0) - (a.participants?.length || 0),
        );
        break;
      default:
        break;
    }

    if (searchTerm.trim()) {
      const q = searchTerm.trim().toLowerCase();
      data = data.filter(
        (s) =>
          s.meetingTitle?.toLowerCase().includes(q) ||
          s.description?.toLowerCase().includes(q) ||
          s.roomId?.toLowerCase().includes(q) ||
          s.hostName?.toLowerCase().includes(q),
      );
    }

    return data;
  }, [sessions, selectedFilter, searchTerm]);

  const openSession = async (session) => {
    try {
      setBusyRoomId(session.roomId);
      // idempotent — registers the user as a participant if not already,
      // so MongoDB participants list (and later, certificates) stay accurate.
      await sessionApi.post(`/join/${session.roomId}`);
      navigate(`/meeting/${session.roomId}`);
    } catch (error) {
      toast.error(
        error?.response?.data?.message || "Couldn't open this session",
      );
    } finally {
      setBusyRoomId(null);
    }
  };

  const handleEndMeeting = async (session, e) => {
    e.stopPropagation();
    try {
      setBusyRoomId(session.roomId);
      await sessionApi.post(`/end/${session.roomId}`);
      toast.success("Meeting ended");
      getSessions(true);
    } catch (error) {
      toast.error(error?.response?.data?.message || "Couldn't end meeting");
    } finally {
      setBusyRoomId(null);
    }
  };

  const handleLeave = async (session, e) => {
    e.stopPropagation();
    try {
      setBusyRoomId(session.roomId);
      await sessionApi.post(`/leave/${session.roomId}`);
      toast.success("You left the session");
      getSessions(true);
    } catch (error) {
      toast.error(error?.response?.data?.message || "Couldn't leave session");
    } finally {
      setBusyRoomId(null);
    }
  };

  const cardVariants = {
    hidden: { opacity: 0, y: 18 },
    show: (i) => ({
      opacity: 1,
      y: 0,
      transition: {
        delay: Math.min(i * 0.05, 0.4),
        duration: 0.4,
        ease: "easeOut",
      },
    }),
    exit: { opacity: 0, y: -8, transition: { duration: 0.2 } },
  };

  return (
    <div className="relative min-h-screen px-6 md:px-10 py-10 bg-[#05070d] text-slate-100 overflow-hidden">
      {/* AMBIENT BACKGROUND GLOW */}
      <div className="pointer-events-none absolute -top-40 -left-40 w-[420px] h-[420px] bg-cyan-500/20 rounded-full blur-[120px]" />
      <div className="pointer-events-none absolute top-1/3 -right-32 w-[420px] h-[420px] bg-violet-500/20 rounded-full blur-[130px]" />
      <div className="pointer-events-none absolute inset-0 bg-[radial-gradient(circle_at_1px_1px,rgba(255,255,255,0.04)_1px,transparent_0)] bg-[size:32px_32px]" />

      <div className="relative max-w-7xl mx-auto">
        {/* HEADER */}
        <div className="flex flex-col md:flex-row md:items-end md:justify-between gap-6">
          <div>
            <p className="text-xs font-semibold tracking-[0.2em] text-cyan-400/80 uppercase mb-2">
              Your Workspace
            </p>
            <h1 className="text-3xl md:text-4xl font-bold tracking-tight">
              <span className="bg-gradient-to-r from-cyan-300 via-sky-200 to-violet-300 bg-clip-text text-transparent">
                Sessions
              </span>
            </h1>
            <p className="text-slate-400 mt-2 text-sm">
              {loading
                ? "Loading your sessions…"
                : `${filteredSessions.length} of ${sessions.length} sessions`}
            </p>
          </div>

          <div className="flex flex-wrap items-center gap-3">
            {/* SEARCH */}
            <div className="relative">
              <FaSearch className="absolute left-4 top-1/2 -translate-y-1/2 text-slate-500 text-sm" />
              <input
                type="text"
                value={searchTerm}
                onChange={(e) => setSearchTerm(e.target.value)}
                placeholder="Search title, host or room ID"
                className="w-56 md:w-64 bg-white/5 border border-white/10 rounded-xl pl-10 pr-4 py-3 text-sm
                  placeholder:text-slate-500 outline-none focus:border-cyan-400/60 focus:bg-white/[0.07]
                  transition-colors duration-200"
              />
            </div>

            {/* REFRESH */}
            <button
              onClick={() => getSessions(true)}
              disabled={refreshing}
              className="w-11 h-11 flex items-center justify-center rounded-xl bg-white/5 border border-white/10
                hover:border-cyan-400/50 hover:bg-white/[0.07] transition-colors duration-200 disabled:opacity-60"
              title="Refresh sessions"
            >
              <FaSyncAlt
                className={`text-slate-300 text-sm ${refreshing ? "animate-spin" : ""}`}
              />
            </button>

            {/* FILTER */}
            <div className="relative" ref={dropdownRef}>
              <button
                onClick={() => setOpen(!open)}
                className={`flex items-center gap-3 pl-5 pr-4 py-3 rounded-xl border font-medium text-sm
                  transition-all duration-200 ${
                    open
                      ? "border-cyan-400/60 bg-cyan-500/10 shadow-[0_0_0_1px_rgba(34,211,238,0.3)]"
                      : "border-white/10 bg-white/5 hover:border-cyan-400/40 hover:bg-white/[0.07]"
                  }`}
              >
                <FaFilter className="text-cyan-300" />
                <span>{selectedFilter}</span>
                {selectedFilter !== "All Sessions" && (
                  <span
                    onClick={clearFilter}
                    className="ml-1 w-5 h-5 flex items-center justify-center rounded-full bg-white/10 hover:bg-white/20 transition-colors"
                  >
                    <FaTimes className="text-[10px] text-slate-300" />
                  </span>
                )}
                <motion.span
                  animate={{ rotate: open ? 180 : 0 }}
                  transition={{ duration: 0.2 }}
                >
                  <FaChevronDown className="text-xs text-slate-400" />
                </motion.span>
              </button>

              <AnimatePresence>
                {open && (
                  <motion.div
                    initial={{ opacity: 0, y: -8, scale: 0.97 }}
                    animate={{ opacity: 1, y: 0, scale: 1 }}
                    exit={{ opacity: 0, y: -8, scale: 0.97 }}
                    transition={{ duration: 0.16, ease: "easeOut" }}
                    className="absolute right-0 mt-3 w-72 bg-[#0b0f1a]/95 backdrop-blur-xl border border-white/10
                      rounded-2xl overflow-hidden shadow-[0_20px_60px_-15px_rgba(0,0,0,0.6)] z-50"
                  >
                    <FilterGroup
                      label="Status"
                      items={STATUS_FILTERS}
                      selected={selectedFilter}
                      onSelect={applyFilter}
                    />
                    <div className="h-px bg-white/10" />
                    <FilterGroup
                      label="Sort by"
                      items={SORT_FILTERS}
                      selected={selectedFilter}
                      onSelect={applyFilter}
                    />
                  </motion.div>
                )}
              </AnimatePresence>
            </div>
          </div>
        </div>

        {/* SESSION GRID */}
        <div className="mt-10">
          {loading ? (
            <div className="grid md:grid-cols-2 gap-5">
              {[0, 1, 2, 3].map((i) => (
                <div
                  key={i}
                  className="h-[220px] rounded-2xl bg-white/5 border border-white/10 animate-pulse"
                />
              ))}
            </div>
          ) : filteredSessions.length === 0 ? (
            <div className="flex flex-col items-center justify-center text-center py-24 rounded-2xl border border-dashed border-white/10 bg-white/[0.02]">
              <div className="w-14 h-14 rounded-2xl bg-white/5 border border-white/10 flex items-center justify-center mb-4">
                <FaVideoSlash className="text-slate-500 text-xl" />
              </div>
              <h3 className="text-lg font-semibold text-slate-200">
                No sessions found
              </h3>
              <p className="text-slate-500 text-sm mt-1 max-w-xs">
                {searchTerm
                  ? `Nothing matches "${searchTerm}" in title, host or room ID. Try a different search or filter.`
                  : "Try switching filters, or host a new session to get started."}
              </p>
            </div>
          ) : (
            <div className="grid md:grid-cols-2 gap-5">
              <AnimatePresence mode="popLayout">
                {filteredSessions.map((session, i) => {
                  const isBusy = busyRoomId === session.roomId;
                  const isHost = session.myRole === "host";
                  const isActive = session.status === "active";

                  return (
                    <motion.div
                      key={session._id}
                      custom={i}
                      variants={cardVariants}
                      initial="hidden"
                      animate="show"
                      exit="exit"
                      layout
                      whileHover={{ y: -4 }}
                      className="group relative rounded-2xl p-6 bg-white/[0.04] border border-white/10 backdrop-blur-sm
                        hover:border-cyan-400/40 hover:bg-white/[0.06] transition-colors duration-300
                        hover:shadow-[0_0_40px_-12px_rgba(34,211,238,0.35)]"
                    >
                      <div className="flex justify-between items-start gap-4">
                        <h2 className="text-lg font-bold text-slate-100 leading-snug">
                          {session.meetingTitle}
                        </h2>

                        <div className="flex flex-col items-end gap-1.5 shrink-0">
                          <span
                            className={`flex items-center gap-1.5 px-3 py-1 rounded-full text-xs font-semibold ${
                              isActive
                                ? "bg-emerald-500/15 text-emerald-300 border border-emerald-500/30"
                                : "bg-rose-500/15 text-rose-300 border border-rose-500/30"
                            }`}
                          >
                            <span className="relative flex w-1.5 h-1.5">
                              {isActive && (
                                <span className="absolute inline-flex w-full h-full rounded-full bg-emerald-400 opacity-75 animate-ping" />
                              )}
                              <span
                                className={`relative inline-flex w-1.5 h-1.5 rounded-full ${
                                  isActive ? "bg-emerald-400" : "bg-rose-400"
                                }`}
                              />
                            </span>
                            {session.status}
                          </span>

                          <span
                            className={`px-2.5 py-0.5 rounded-full text-[10px] font-semibold ${
                              isHost
                                ? "bg-amber-500/10 text-amber-300 border border-amber-400/20"
                                : "bg-sky-500/10 text-sky-300 border border-sky-400/20"
                            }`}
                          >
                            {isHost ? "Hosted by you" : "You joined"}
                          </span>
                        </div>
                      </div>

                      {session.description && (
                        <p className="mt-3 text-slate-400 text-sm leading-relaxed line-clamp-2">
                          {session.description}
                        </p>
                      )}

                      <div className="mt-5 grid grid-cols-2 gap-y-3 gap-x-4 text-sm text-slate-300">
                        <div className="flex items-center gap-2">
                          <FaCrown className="text-amber-400/80 text-xs" />
                          <span className="truncate">
                            {session.hostName || "Unknown host"}
                          </span>
                        </div>
                        <div className="flex items-center gap-2">
                          <FaUsers className="text-cyan-400/80 text-xs" />
                          <span>
                            {session.participants?.length || 0} participants
                          </span>
                        </div>
                        <div className="flex items-center gap-2">
                          <FaHashtag className="text-violet-400/80 text-xs" />
                          <span className="font-mono text-xs text-slate-400">
                            {session.roomId}
                          </span>
                        </div>
                        <div className="flex items-center gap-2">
                          <FaCalendarAlt className="text-slate-500 text-xs" />
                          <span>
                            {new Date(session.createdAt).toLocaleDateString()}
                          </span>
                        </div>
                      </div>

                      <div className="mt-6 flex items-center gap-3 flex-wrap">
                        <button
                          onClick={() => openSession(session)}
                          disabled={isBusy}
                          className="flex-1 flex items-center justify-center gap-2 px-5 py-2.5 rounded-xl font-semibold text-sm
                            text-[#05070d] bg-gradient-to-r from-cyan-300 to-violet-300
                            hover:shadow-[0_0_25px_-5px_rgba(34,211,238,0.6)] transition-shadow duration-300
                            disabled:opacity-60"
                        >
                          {isBusy ? "Opening…" : "View Session"}
                          <FaArrowRight className="text-xs transition-transform duration-300 group-hover:translate-x-1" />
                        </button>

                        {isActive && isHost && (
                          <button
                            onClick={(e) => handleEndMeeting(session, e)}
                            disabled={isBusy}
                            title="End Meeting"
                            className="shrink-0 w-11 h-11 flex items-center justify-center rounded-xl border border-rose-400/30
                              bg-rose-500/10 text-rose-300 hover:bg-rose-500/20 hover:border-rose-400/50 transition-colors duration-200 disabled:opacity-60"
                          >
                            <FaStopCircle size={14} />
                          </button>
                        )}

                        {isActive && !isHost && (
                          <button
                            onClick={(e) => handleLeave(session, e)}
                            disabled={isBusy}
                            title="Leave Session"
                            className="shrink-0 w-11 h-11 flex items-center justify-center rounded-xl border border-slate-400/30
                              bg-white/5 text-slate-300 hover:bg-white/10 hover:border-slate-400/50 transition-colors duration-200 disabled:opacity-60"
                          >
                            <FaSignOutAlt size={14} />
                          </button>
                        )}

                        {session.status === "ended" && isHost && (
                          <button
                            onClick={() => setCertModalSession(session)}
                            title="Generate Certificate"
                            className="shrink-0 w-11 h-11 flex items-center justify-center rounded-xl border border-amber-400/30
                              bg-amber-500/10 text-amber-300 hover:bg-amber-500/20 hover:border-amber-400/50 transition-colors duration-200"
                          >
                            <FaCertificate size={14} />
                          </button>
                        )}

                        {session.status === "ended" && !isHost && (
                          <span
                            title="Ask your host to issue your certificate — it'll show up under My Certificates"
                            className="shrink-0 w-11 h-11 flex items-center justify-center rounded-xl border border-white/10
                              bg-white/[0.03] text-slate-500"
                          >
                            <FaUserGraduate size={14} />
                          </span>
                        )}
                      </div>
                    </motion.div>
                  );
                })}
              </AnimatePresence>
            </div>
          )}
        </div>
      </div>

      {certModalSession && (
        <CertificateModal
          session={certModalSession}
          onClose={() => setCertModalSession(null)}
        />
      )}
    </div>
  );
}

function FilterGroup({ label, items, selected, onSelect }) {
  return (
    <div className="py-2">
      <p className="px-4 pt-2 pb-1 text-[10px] font-semibold uppercase tracking-wider text-slate-500">
        {label}
      </p>
      {items.map((item) => (
        <button
          key={item}
          onClick={() => onSelect(item)}
          className={`w-full text-left px-4 py-2.5 text-sm transition-colors ${
            selected === item
              ? "text-cyan-300 bg-cyan-500/10"
              : "text-slate-300 hover:bg-white/5"
          }`}
        >
          {item}
        </button>
      ))}
    </div>
  );
}

export default Filtersession;
