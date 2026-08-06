// DELETE OLD CODE COMPLETELY
// PASTE THIS ENTIRE FILE

import React, { useEffect, useRef, useState } from "react";
import sessionApi from "../../config/sessionApi";
import { useNavigate } from "react-router-dom";
import { motion, AnimatePresence } from "framer-motion";

import {
  FaDoorOpen,
  FaArrowRight,
  FaVideo,
  FaCheckCircle,
  FaUsers,
  FaGlobe,
  FaShieldAlt,
  FaBolt,
  FaClock,
  FaExclamationTriangle,
  FaPaste,
  FaCopy,
  FaHistory,
  FaTimes,
} from "react-icons/fa";

const RECENT_KEY = "recentJoinedRooms";
const REDIRECT_SECONDS = 3;

function DasJoinsession() {
  const navigate = useNavigate();

  const [roomId, setRoomId] = useState("");
  const [loading, setLoading] = useState(false);
  const [sessionData, setSessionData] = useState(null);
  const [error, setError] = useState("");
  const [recentRooms, setRecentRooms] = useState([]);
  const [copied, setCopied] = useState(false);
  const [countdown, setCountdown] = useState(REDIRECT_SECONDS);

  const inputRef = useRef(null);
  const redirectTimerRef = useRef(null);
  const countdownIntervalRef = useRef(null);

  useEffect(() => {
    try {
      const stored = JSON.parse(localStorage.getItem(RECENT_KEY) || "[]");
      setRecentRooms(stored);
    } catch {
      setRecentRooms([]);
    }
    inputRef.current?.focus();
  }, []);

  useEffect(() => {
    return () => {
      clearTimeout(redirectTimerRef.current);
      clearInterval(countdownIntervalRef.current);
    };
  }, []);

  const saveRecentRoom = (id) => {
    const updated = [id, ...recentRooms.filter((r) => r !== id)].slice(0, 3);
    setRecentRooms(updated);
    localStorage.setItem(RECENT_KEY, JSON.stringify(updated));
  };

  const validateRoomId = (id) => {
    if (!id.trim()) return "Please enter a Room ID";
    if (id.trim().length < 4) return "Room ID looks too short";
    return "";
  };

  const joinSession = async () => {
    const validationError = validateRoomId(roomId);
    if (validationError) {
      setError(validationError);
      return;
    }

    try {
      setError("");
      setLoading(true);

      const res = await sessionApi.post(`/join/${roomId}`);

      setSessionData(res.data.session);
      saveRecentRoom(roomId);
      setCountdown(REDIRECT_SECONDS);

      countdownIntervalRef.current = setInterval(() => {
        setCountdown((c) => (c > 0 ? c - 1 : 0));
      }, 1000);

      redirectTimerRef.current = setTimeout(() => {
        navigate(`/meeting/${roomId}`);
      }, REDIRECT_SECONDS * 1000);
    } catch (err) {
      setError(err?.response?.data?.message || "Failed to join session");
    } finally {
      setLoading(false);
    }
  };

  const cancelRedirect = () => {
    clearTimeout(redirectTimerRef.current);
    clearInterval(countdownIntervalRef.current);
    setSessionData(null);
    setCountdown(REDIRECT_SECONDS);
  };

  const handlePaste = async () => {
    try {
      const text = await navigator.clipboard.readText();
      if (text) setRoomId(text.trim().toUpperCase());
    } catch {
      setError("Couldn't read clipboard — paste manually instead");
    }
  };

  const handleCopyRoomId = async () => {
    if (!sessionData?.roomId) return;
    try {
      await navigator.clipboard.writeText(sessionData.roomId);
      setCopied(true);
      setTimeout(() => setCopied(false), 1500);
    } catch {
      // clipboard unavailable — silently ignore
    }
  };

  const handleKeyDown = (e) => {
    if (e.key === "Enter" && !loading) joinSession();
  };

  return (
    <div className="px-8 mt-10">
      <motion.div
        initial={{ opacity: 0 }}
        animate={{ opacity: 1 }}
        className="
      relative
      overflow-hidden
      rounded-[40px]
      border
      border-white/10
      bg-[#050b14]
      backdrop-blur-3xl
      shadow-[0_0_120px_rgba(6,182,212,0.08)]
      p-10
      "
      >
        {/* Animated Background */}

        <div className="absolute inset-0 overflow-hidden pointer-events-none">
          <div className="absolute -top-40 -left-40 w-[500px] h-[500px] bg-cyan-500/15 blur-[160px] rounded-full animate-pulse" />

          <div
            className="absolute bottom-0 right-0 w-[500px] h-[500px] bg-purple-500/15 blur-[160px] rounded-full animate-pulse"
            style={{ animationDuration: "5s" }}
          />

          <div className="absolute inset-0 bg-[linear-gradient(rgba(255,255,255,.03)_1px,transparent_1px),linear-gradient(90deg,rgba(255,255,255,.03)_1px,transparent_1px)] bg-[size:45px_45px]" />
        </div>

        <div className="relative z-10">
          {/* Header */}

          <div className="flex flex-col lg:flex-row justify-between gap-8">
            <motion.div
              initial={{ x: -30, opacity: 0 }}
              animate={{ x: 0, opacity: 1 }}
              className="flex items-center gap-5"
            >
              <div className="relative">
                <div className="absolute inset-0 bg-green-500 blur-2xl opacity-40 rounded-3xl" />

                <div className="relative w-20 h-20 rounded-3xl bg-gradient-to-r from-green-500 to-emerald-600 flex items-center justify-center">
                  <FaDoorOpen className="text-white text-4xl" />
                </div>
              </div>

              <div>
                <h2 className="text-5xl font-black text-white">Join Meeting</h2>

                <p className="text-slate-400 text-lg mt-2">
                  Connect instantly using Room ID.
                </p>
              </div>
            </motion.div>

            <div className="grid grid-cols-2 md:grid-cols-4 gap-4">
              <div className="bg-white/5 border border-white/10 rounded-2xl p-4">
                <FaVideo className="text-cyan-400 text-2xl mb-3" />
                <h3 className="text-white font-bold">HD Video</h3>
              </div>

              <div className="bg-white/5 border border-white/10 rounded-2xl p-4">
                <FaUsers className="text-purple-400 text-2xl mb-3" />
                <h3 className="text-white font-bold">Live Users</h3>
              </div>

              <div className="bg-white/5 border border-white/10 rounded-2xl p-4">
                <FaShieldAlt className="text-green-400 text-2xl mb-3" />
                <h3 className="text-white font-bold">Secure</h3>
              </div>

              <div className="bg-white/5 border border-white/10 rounded-2xl p-4">
                <FaBolt className="text-yellow-400 text-2xl mb-3" />
                <h3 className="text-white font-bold">Fast Join</h3>
              </div>
            </div>
          </div>

          {/* Input Section */}

          <div className="mt-12">
            <div className="flex items-center justify-between">
              <label className="text-slate-400 uppercase tracking-widest text-sm">
                Room ID
              </label>
              <button
                type="button"
                onClick={handlePaste}
                className="flex items-center gap-2 text-xs font-semibold text-cyan-400 hover:text-cyan-300 transition-colors"
              >
                <FaPaste />
                Paste
              </button>
            </div>

            <div className="relative mt-4">
              <input
                ref={inputRef}
                type="text"
                value={roomId}
                onChange={(e) => {
                  setRoomId(e.target.value.toUpperCase());
                  if (error) setError("");
                }}
                onKeyDown={handleKeyDown}
                placeholder="LIVE-ABCD12"
                className={`
              w-full
              bg-white/5
              border
              rounded-[24px]
              px-7
              py-6
              text-xl
              text-white
              outline-none
              focus:ring-4
              placeholder:text-slate-500
              transition-colors
              ${
                error
                  ? "border-red-500/60 focus:border-red-500 focus:ring-red-500/20"
                  : "border-white/10 focus:border-cyan-500 focus:ring-cyan-500/20"
              }
              `}
              />

              <div className="absolute right-6 top-1/2 -translate-y-1/2 text-cyan-400">
                <FaVideo size={24} />
              </div>
            </div>

            <AnimatePresence>
              {error && (
                <motion.div
                  initial={{ opacity: 0, y: -6, height: 0 }}
                  animate={{ opacity: 1, y: 0, height: "auto" }}
                  exit={{ opacity: 0, height: 0 }}
                  className="mt-3 flex items-center gap-3 bg-red-500/10 border border-red-500/25 rounded-2xl px-5 py-3"
                >
                  <FaExclamationTriangle className="text-red-400 shrink-0" />
                  <p className="text-red-300 text-sm font-medium">{error}</p>
                </motion.div>
              )}
            </AnimatePresence>

            {/* Recent rooms */}
            {recentRooms.length > 0 && (
              <div className="mt-5 flex flex-wrap items-center gap-2">
                <span className="flex items-center gap-2 text-xs text-slate-500 mr-1">
                  <FaHistory /> Recent:
                </span>
                {recentRooms.map((id) => (
                  <button
                    key={id}
                    onClick={() => setRoomId(id)}
                    className="px-4 py-2 rounded-full bg-white/5 border border-white/10 text-xs font-semibold text-slate-300
                      hover:border-cyan-400/40 hover:text-cyan-300 transition-colors"
                  >
                    {id}
                  </button>
                ))}
              </div>
            )}
          </div>

          {/* Join Button */}

          <motion.button
            whileHover={{ scale: 1.02 }}
            whileTap={{ scale: 0.98 }}
            onClick={joinSession}
            disabled={loading}
            className="
          mt-8
          w-full
          py-5
          rounded-[24px]
          font-bold
          text-lg
          bg-gradient-to-r
          from-green-500
          via-emerald-500
          to-green-600
          shadow-[0_0_50px_rgba(34,197,94,0.35)]
          flex
          justify-center
          items-center
          gap-4
          disabled:opacity-70
          disabled:cursor-not-allowed
          "
          >
            {loading ? (
              <>
                <div className="w-6 h-6 border-2 border-white border-t-transparent rounded-full animate-spin" />
                Joining Session...
              </>
            ) : (
              <>
                <FaArrowRight />
                Join Meeting Now
              </>
            )}
          </motion.button>

          {/* Features */}

          <div className="grid md:grid-cols-3 gap-5 mt-10">
            <div className="bg-white/5 border border-white/10 rounded-3xl p-5">
              <FaClock className="text-cyan-400 text-2xl mb-3" />
              <h3 className="font-bold text-white">Instant Access</h3>
              <p className="text-slate-400 mt-2">Join within seconds.</p>
            </div>

            <div className="bg-white/5 border border-white/10 rounded-3xl p-5">
              <FaShieldAlt className="text-green-400 text-2xl mb-3" />
              <h3 className="font-bold text-white">Encrypted</h3>
              <p className="text-slate-400 mt-2">Secure meeting rooms.</p>
            </div>

            <div className="bg-white/5 border border-white/10 rounded-3xl p-5">
              <FaGlobe className="text-purple-400 text-2xl mb-3" />
              <h3 className="font-bold text-white">Global Access</h3>
              <p className="text-slate-400 mt-2">Connect from anywhere.</p>
            </div>
          </div>

          {/* Session Preview */}

          <AnimatePresence>
            {sessionData && (
              <motion.div
                initial={{ opacity: 0, y: 40 }}
                animate={{ opacity: 1, y: 0 }}
                exit={{ opacity: 0 }}
                className="
              mt-10
              rounded-[30px]
              border
              border-green-500/20
              bg-gradient-to-br
              from-green-500/10
              to-cyan-500/5
              p-8
              "
              >
                <div className="flex items-center justify-between gap-4 mb-8">
                  <div className="flex items-center gap-4">
                    <div className="w-16 h-16 rounded-2xl bg-green-500 flex items-center justify-center">
                      <FaCheckCircle className="text-white text-3xl" />
                    </div>

                    <div>
                      <h3 className="text-3xl font-black text-green-400">
                        Session Found
                      </h3>

                      <p className="text-slate-400">
                        Redirecting in {countdown}s...
                      </p>
                    </div>
                  </div>

                  <button
                    onClick={cancelRedirect}
                    className="flex items-center gap-2 text-sm font-semibold text-slate-400 hover:text-white
                      bg-white/5 border border-white/10 rounded-xl px-4 py-2 transition-colors"
                  >
                    <FaTimes />
                    Cancel
                  </button>
                </div>

                <div className="grid md:grid-cols-2 gap-5">
                  <div className="bg-white/5 rounded-2xl p-5">
                    <p className="text-slate-500">Meeting Title</p>
                    <h3 className="text-xl font-bold mt-2 text-white">
                      {sessionData.meetingTitle}
                    </h3>
                  </div>

                  <div className="bg-white/5 rounded-2xl p-5">
                    <p className="text-slate-500">Host</p>
                    <h3 className="text-xl font-bold mt-2 text-white">
                      {sessionData.hostName}
                    </h3>
                  </div>

                  <div className="bg-white/5 rounded-2xl p-5">
                    <div className="flex items-center justify-between">
                      <p className="text-slate-500">Room ID</p>
                      <button
                        onClick={handleCopyRoomId}
                        className="text-xs font-semibold text-cyan-400 hover:text-cyan-300 flex items-center gap-1.5"
                      >
                        <FaCopy />
                        {copied ? "Copied" : "Copy"}
                      </button>
                    </div>
                    <h3 className="text-xl font-bold mt-2 text-cyan-400">
                      {sessionData.roomId}
                    </h3>
                  </div>

                  <div className="bg-white/5 rounded-2xl p-5">
                    <p className="text-slate-500">Participants</p>
                    <h3 className="text-xl font-bold mt-2 text-white">
                      {sessionData.participants?.length}
                    </h3>
                  </div>
                </div>

                <div className="mt-8 bg-green-500/10 border border-green-500/20 rounded-2xl p-5 overflow-hidden relative">
                  <div className="flex items-center gap-4">
                    <div className="w-3 h-3 bg-green-500 rounded-full animate-pulse" />

                    <p className="text-green-300 font-semibold">
                      Redirecting to meeting room...
                    </p>
                  </div>

                  <div className="mt-4 h-1.5 w-full bg-white/10 rounded-full overflow-hidden">
                    <motion.div
                      initial={{ width: "0%" }}
                      animate={{ width: "100%" }}
                      transition={{
                        duration: REDIRECT_SECONDS,
                        ease: "linear",
                      }}
                      className="h-full bg-gradient-to-r from-green-400 to-cyan-400"
                    />
                  </div>
                </div>
              </motion.div>
            )}
          </AnimatePresence>
        </div>
      </motion.div>
    </div>
  );
}

export default DasJoinsession;
