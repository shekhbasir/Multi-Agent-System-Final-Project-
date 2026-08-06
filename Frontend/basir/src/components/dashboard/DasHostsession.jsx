import React, { useState, useEffect, useCallback } from "react";
import sessionApi from "../../config/sessionApi";
import { useNavigate } from "react-router-dom";
import {
  FaVideo,
  FaPlus,
  FaCopy,
  FaRocket,
  FaTimes,
  FaLock,
  FaGlobe,
  FaUsers,
  FaBolt,
  FaCheck,
  FaChevronDown,
  FaChevronRight,
  FaCalendarAlt,
  FaClock,
  FaEye,
  FaEyeSlash,
  FaWhatsapp,
  FaEnvelope,
  FaQrcode,
  FaHistory,
  FaExclamationCircle,
  FaCog,
  FaVideoSlash,
  FaMicrophoneSlash,
  FaDoorClosed,
  FaCircle,
} from "react-icons/fa";
import { motion, AnimatePresence } from "framer-motion";

/* ------------------------------------------------------------------ */
/* Toast System                                                        */
/* ------------------------------------------------------------------ */
function ToastContainer({ toasts, removeToast }) {
  return (
    <div className="fixed top-6 right-6 z-[100] flex flex-col gap-3 pointer-events-none">
      <AnimatePresence>
        {toasts.map((toast) => (
          <motion.div
            key={toast.id}
            initial={{ opacity: 0, x: 80, scale: 0.9 }}
            animate={{ opacity: 1, x: 0, scale: 1 }}
            exit={{ opacity: 0, x: 80, scale: 0.9 }}
            transition={{ type: "spring", stiffness: 300, damping: 25 }}
            className={`pointer-events-auto min-w-[280px] max-w-sm rounded-2xl px-5 py-4 shadow-2xl border backdrop-blur-xl flex items-start gap-3 ${
              toast.type === "success"
                ? "bg-green-500/10 border-green-500/30 shadow-green-500/10"
                : toast.type === "error"
                  ? "bg-red-500/10 border-red-500/30 shadow-red-500/10"
                  : "bg-cyan-500/10 border-cyan-500/30 shadow-cyan-500/10"
            }`}
          >
            <div
              className={`h-8 w-8 shrink-0 rounded-xl flex items-center justify-center ${
                toast.type === "success"
                  ? "bg-green-500/20 text-green-400"
                  : toast.type === "error"
                    ? "bg-red-500/20 text-red-400"
                    : "bg-cyan-500/20 text-cyan-400"
              }`}
            >
              {toast.type === "success" ? (
                <FaCheck size={14} />
              ) : toast.type === "error" ? (
                <FaExclamationCircle size={14} />
              ) : (
                <FaBolt size={14} />
              )}
            </div>
            <div className="flex-1 pt-0.5">
              <p className="text-sm font-semibold text-white">{toast.title}</p>
              {toast.message && (
                <p className="text-xs text-slate-400 mt-0.5">{toast.message}</p>
              )}
            </div>
            <button
              onClick={() => removeToast(toast.id)}
              className="text-slate-500 hover:text-white transition-colors"
            >
              <FaTimes size={12} />
            </button>
          </motion.div>
        ))}
      </AnimatePresence>
    </div>
  );
}

function DasHostsession() {
  const navigate = useNavigate();

  /* ---------------- Core state ---------------- */
  const [showModal, setShowModal] = useState(false);
  const [step, setStep] = useState(1); // 1: Details, 2: Settings, 3: Success
  const [meetingTitle, setMeetingTitle] = useState("");
  const [description, setDescription] = useState("");
  const [meetingType, setMeetingType] = useState("private");
  const [maxParticipants, setMaxParticipants] = useState(100);
  const [loading, setLoading] = useState(false);
  const [createdRoom, setCreatedRoom] = useState(null);

  /* ---------------- New feature state ---------------- */
  const [errors, setErrors] = useState({});
  const [password, setPassword] = useState("");
  const [showPassword, setShowPassword] = useState(false);
  const [advancedOpen, setAdvancedOpen] = useState(false);
  const [waitingRoom, setWaitingRoom] = useState(true);
  const [muteOnJoin, setMuteOnJoin] = useState(false);
  const [cameraOffOnJoin, setCameraOffOnJoin] = useState(false);
  const [allowRecording, setAllowRecording] = useState(false);
  const [scheduleType, setScheduleType] = useState("instant"); // instant | scheduled
  const [scheduleDate, setScheduleDate] = useState("");
  const [scheduleTime, setScheduleTime] = useState("");
  const [copiedId, setCopiedId] = useState(false);
  const [copiedLink, setCopiedLink] = useState(false);
  const [recentMeetings, setRecentMeetings] = useState([]);
  const [toasts, setToasts] = useState([]);

  /* ---------------- Toast helpers ---------------- */
  const pushToast = useCallback((type, title, message) => {
    const id = Date.now() + Math.random();
    setToasts((prev) => [...prev, { id, type, title, message }]);
    setTimeout(() => {
      setToasts((prev) => prev.filter((t) => t.id !== id));
    }, 4000);
  }, []);

  const removeToast = (id) => {
    setToasts((prev) => prev.filter((t) => t.id !== id));
  };

  /* ---------------- Load recent meetings ---------------- */
  useEffect(() => {
    try {
      const stored = JSON.parse(localStorage.getItem("recentMeetings") || "[]");
      setRecentMeetings(stored.slice(0, 3));
    } catch {
      setRecentMeetings([]);
    }
  }, []);

  const saveRecentMeeting = (config) => {
    try {
      const stored = JSON.parse(localStorage.getItem("recentMeetings") || "[]");
      const updated = [config, ...stored].slice(0, 3);
      localStorage.setItem("recentMeetings", JSON.stringify(updated));
      setRecentMeetings(updated);
    } catch {
      /* ignore storage errors */
    }
  };

  const applyRecentMeeting = (config) => {
    setMeetingTitle(config.meetingTitle || "");
    setDescription(config.description || "");
    setMeetingType(config.meetingType || "private");
    setMaxParticipants(config.maxParticipants || 100);
    setWaitingRoom(config.waitingRoom ?? true);
    setMuteOnJoin(config.muteOnJoin ?? false);
    setCameraOffOnJoin(config.cameraOffOnJoin ?? false);
    setAllowRecording(config.allowRecording ?? false);
    setShowModal(true);
    setStep(1);
    pushToast("info", "Template Loaded", "Recent meeting settings applied.");
  };

  /* ---------------- Validation ---------------- */
  const validateStep1 = () => {
    const newErrors = {};
    if (!meetingTitle.trim()) {
      newErrors.meetingTitle = "Meeting title is required";
    } else if (meetingTitle.trim().length < 3) {
      newErrors.meetingTitle = "Title must be at least 3 characters";
    }

    if (
      !maxParticipants ||
      Number(maxParticipants) < 2 ||
      Number(maxParticipants) > 1000
    ) {
      newErrors.maxParticipants = "Participants must be between 2 and 1000";
    }

    if (meetingType === "private" && password && password.length < 4) {
      newErrors.password = "Password must be at least 4 characters";
    }

    if (scheduleType === "scheduled") {
      if (!scheduleDate) newErrors.scheduleDate = "Pick a date";
      if (!scheduleTime) newErrors.scheduleTime = "Pick a time";
    }

    setErrors(newErrors);
    return Object.keys(newErrors).length === 0;
  };

  const goToSettings = () => {
    if (validateStep1()) {
      setStep(2);
    } else {
      pushToast("error", "Fix the errors", "Some fields need your attention.");
    }
  };

  /* ---------------- Create session ---------------- */
  const createSession = async () => {
    try {
      setLoading(true);

      const payload = {
        meetingTitle,
        description,
        meetingType,
        maxParticipants,
        password: meetingType === "private" ? password : undefined,
        waitingRoom,
        muteOnJoin,
        cameraOffOnJoin,
        allowRecording,
        scheduleType,
        scheduledFor:
          scheduleType === "scheduled"
            ? `${scheduleDate}T${scheduleTime}`
            : null,
      };

      const res = await sessionApi.post("/create", payload);

      setCreatedRoom(res.data.roomId);
      setStep(3);
      saveRecentMeeting(payload);
      pushToast(
        "success",
        "Meeting Created 🎉",
        scheduleType === "scheduled"
          ? "Your meeting has been scheduled."
          : "Your meeting is ready to start.",
      );
    } catch (error) {
      pushToast(
        "error",
        "Failed to create session",
        error?.response?.data?.message || "Please try again.",
      );
    } finally {
      setLoading(false);
    }
  };

  /* ---------------- Copy / Share helpers ---------------- */
  const copyRoomId = () => {
    navigator.clipboard.writeText(createdRoom);
    setCopiedId(true);
    pushToast("success", "Room ID Copied");
    setTimeout(() => setCopiedId(false), 2000);
  };

  const copyLink = () => {
    navigator.clipboard.writeText(
      `${window.location.origin}/meeting/${createdRoom}`,
    );
    setCopiedLink(true);
    pushToast("success", "Meeting Link Copied");
    setTimeout(() => setCopiedLink(false), 2000);
  };

  const meetingLink = createdRoom
    ? `${window.location.origin}/meeting/${createdRoom}`
    : "";

  const shareWhatsapp = () => {
    const text = encodeURIComponent(
      `Join my meeting "${meetingTitle}": ${meetingLink}`,
    );
    window.open(`https://wa.me/?text=${text}`, "_blank");
  };

  const shareEmail = () => {
    const subject = encodeURIComponent(`Invitation: ${meetingTitle}`);
    const body = encodeURIComponent(
      `You're invited to join "${meetingTitle}".\n\nJoin here: ${meetingLink}\nRoom ID: ${createdRoom}`,
    );
    window.location.href = `mailto:?subject=${subject}&body=${body}`;
  };

  const startMeeting = () => {
    navigate(`/meeting/${createdRoom}`);
  };

  const closeModal = () => {
    setShowModal(false);
    setTimeout(() => {
      setCreatedRoom(null);
      setStep(1);
      setMeetingTitle("");
      setDescription("");
      setMeetingType("private");
      setMaxParticipants(100);
      setPassword("");
      setShowPassword(false);
      setAdvancedOpen(false);
      setWaitingRoom(true);
      setMuteOnJoin(false);
      setCameraOffOnJoin(false);
      setAllowRecording(false);
      setScheduleType("instant");
      setScheduleDate("");
      setScheduleTime("");
      setErrors({});
    }, 250);
  };

  const stepLabels = ["Details", "Settings", "Success"];

  return (
    <>
      <ToastContainer toasts={toasts} removeToast={removeToast} />

      <div className="px-4 md:px-8 mt-8  bg-[#020617] ">
        <div className="relative overflow-hidden rounded-[35px] border border-white/10 bg-white/5 backdrop-blur-2xl p-6 md:p-8">
          <div className="absolute -top-40 -right-40 h-96 w-96 rounded-full bg-cyan-500/10 blur-[120px]" />
          <div className="absolute -bottom-40 -left-40 h-96 w-96 rounded-full bg-purple-500/10 blur-[120px]" />

          <div className="relative z-10 flex flex-col lg:flex-row justify-between gap-10">
            <div className="flex-1">
              <div className="flex items-center gap-3 mb-5">
                <div className="h-14 w-14 rounded-2xl bg-cyan-500/20 flex items-center justify-center">
                  <FaVideo className="text-cyan-400 text-2xl" />
                </div>

                <div>
                  <h2 className="text-3xl md:text-4xl font-black text-white">
                    Host New Meeting
                  </h2>
                  <p className="text-slate-400 mt-1">
                    Create secure professional meetings instantly.
                  </p>
                </div>
              </div>

              <div className="grid sm:grid-cols-2 lg:grid-cols-3 gap-4 mt-8">
                <motion.div
                  whileHover={{ y: -4 }}
                  className="bg-white/5 border border-white/10 rounded-3xl p-5 transition-colors hover:border-cyan-500/30"
                >
                  <FaLock className="text-cyan-400 text-3xl mb-3" />
                  <h3 className="font-bold text-white">Private Rooms</h3>
                  <p className="text-slate-400 text-sm mt-2">
                    Password protected, invitation only meetings.
                  </p>
                </motion.div>

                <motion.div
                  whileHover={{ y: -4 }}
                  className="bg-white/5 border border-white/10 rounded-3xl p-5 transition-colors hover:border-purple-500/30"
                >
                  <FaUsers className="text-purple-400 text-3xl mb-3" />
                  <h3 className="font-bold text-white">Team Collaboration</h3>
                  <p className="text-slate-400 text-sm mt-2">
                    Invite and manage up to 1000 participants.
                  </p>
                </motion.div>

                <motion.div
                  whileHover={{ y: -4 }}
                  className="bg-white/5 border border-white/10 rounded-3xl p-5 transition-colors hover:border-yellow-500/30"
                >
                  <FaBolt className="text-yellow-400 text-3xl mb-3" />
                  <h3 className="font-bold text-white">Instant or Scheduled</h3>
                  <p className="text-slate-400 text-sm mt-2">
                    Launch now or plan meetings ahead of time.
                  </p>
                </motion.div>
              </div>

              {recentMeetings.length > 0 && (
                <div className="mt-8">
                  <div className="flex items-center gap-2 mb-3">
                    <FaHistory className="text-slate-400" />
                    <h4 className="text-slate-300 font-semibold text-sm">
                      Recent Meeting Templates
                    </h4>
                  </div>
                  <div className="flex flex-wrap gap-3">
                    {recentMeetings.map((m, idx) => (
                      <button
                        key={idx}
                        onClick={() => applyRecentMeeting(m)}
                        className="px-4 py-2.5 rounded-2xl bg-white/5 border border-white/10 text-sm text-slate-300 hover:border-cyan-500/40 hover:text-white transition-colors flex items-center gap-2"
                      >
                        {m.meetingType === "private" ? (
                          <FaLock className="text-cyan-400" size={12} />
                        ) : (
                          <FaGlobe className="text-green-400" size={12} />
                        )}
                        {m.meetingTitle || "Untitled Meeting"}
                      </button>
                    ))}
                  </div>
                </div>
              )}
            </div>

            <div className="flex items-center">
              <motion.button
                whileHover={{ scale: 1.05 }}
                whileTap={{ scale: 0.95 }}
                onClick={() => {
                  setShowModal(true);
                  setStep(1);
                }}
                className="bg-gradient-to-r from-cyan-500 to-blue-600 px-8 py-5 rounded-3xl font-bold text-lg flex items-center gap-4 shadow-2xl shadow-cyan-500/20 text-white whitespace-nowrap"
              >
                <FaPlus />
                Create Meeting
              </motion.button>
            </div>
          </div>
        </div>
      </div>

      <AnimatePresence>
        {showModal && (
          <motion.div
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            exit={{ opacity: 0 }}
            className="fixed inset-0 bg-black/80 backdrop-blur-md z-50 flex justify-center items-center p-4 md:p-5"
          >
            <motion.div
              initial={{ y: 80, opacity: 0 }}
              animate={{ y: 0, opacity: 1 }}
              exit={{ y: 80, opacity: 0 }}
              className="w-full max-w-4xl bg-[#0f172a] border border-white/10 rounded-[40px] p-6 md:p-8 max-h-[90vh] overflow-y-auto"
            >
              <div className="flex justify-between items-center mb-6">
                <div>
                  <h2 className="text-3xl md:text-4xl font-black text-white">
                    Create New Meeting
                  </h2>
                  <p className="text-slate-400 mt-2">
                    Configure your meeting settings.
                  </p>
                </div>

                <button
                  onClick={closeModal}
                  className="h-12 w-12 shrink-0 rounded-xl bg-red-500/20 text-red-400 flex items-center justify-center hover:bg-red-500/30 transition-colors"
                >
                  <FaTimes />
                </button>
              </div>

              {/* Step progress bar */}
              <div className="flex items-center gap-2 mb-8">
                {stepLabels.map((label, idx) => {
                  const stepNum = idx + 1;
                  const isActive = step === stepNum;
                  const isDone = step > stepNum;
                  return (
                    <React.Fragment key={label}>
                      <div className="flex items-center gap-2">
                        <div
                          className={`h-8 w-8 rounded-full flex items-center justify-center text-xs font-bold transition-colors ${
                            isDone
                              ? "bg-green-500 text-white"
                              : isActive
                                ? "bg-cyan-500 text-white"
                                : "bg-white/10 text-slate-500"
                          }`}
                        >
                          {isDone ? <FaCheck size={11} /> : stepNum}
                        </div>
                        <span
                          className={`text-sm font-medium hidden sm:inline ${
                            isActive || isDone ? "text-white" : "text-slate-500"
                          }`}
                        >
                          {label}
                        </span>
                      </div>
                      {idx < stepLabels.length - 1 && (
                        <div
                          className={`flex-1 h-0.5 rounded-full transition-colors ${
                            step > stepNum ? "bg-green-500" : "bg-white/10"
                          }`}
                        />
                      )}
                    </React.Fragment>
                  );
                })}
              </div>

              <AnimatePresence mode="wait">
                {/* STEP 1: Details */}
                {step === 1 && (
                  <motion.div
                    key="step1"
                    initial={{ opacity: 0, x: 20 }}
                    animate={{ opacity: 1, x: 0 }}
                    exit={{ opacity: 0, x: -20 }}
                    className="space-y-6"
                  >
                    <div>
                      <label className="text-slate-300 mb-2 block text-sm font-medium">
                        Meeting Title
                      </label>
                      <input
                        value={meetingTitle}
                        onChange={(e) => setMeetingTitle(e.target.value)}
                        placeholder="Frontend Interview Meeting"
                        className={`w-full bg-slate-800/70 border rounded-2xl px-5 py-4 outline-none transition-colors text-white ${
                          errors.meetingTitle
                            ? "border-red-500/60 focus:border-red-500"
                            : "border-white/10 focus:border-cyan-500"
                        }`}
                      />
                      {errors.meetingTitle && (
                        <motion.p
                          initial={{ opacity: 0, x: -5 }}
                          animate={{ opacity: 1, x: 0 }}
                          className="text-red-400 text-xs mt-2 flex items-center gap-1"
                        >
                          <FaExclamationCircle size={10} />
                          {errors.meetingTitle}
                        </motion.p>
                      )}
                    </div>

                    <div>
                      <label className="text-slate-300 mb-2 block text-sm font-medium">
                        Description
                      </label>
                      <textarea
                        value={description}
                        onChange={(e) => setDescription(e.target.value)}
                        placeholder="Describe meeting..."
                        className="w-full h-32 bg-slate-800/70 border border-white/10 rounded-2xl px-5 py-4 outline-none focus:border-cyan-500 transition-colors text-white resize-none"
                      />
                    </div>

                    <div className="grid md:grid-cols-2 gap-5">
                      <div>
                        <label className="text-slate-300 mb-2 block text-sm font-medium">
                          Meeting Type
                        </label>
                        <select
                          value={meetingType}
                          onChange={(e) => setMeetingType(e.target.value)}
                          className="w-full bg-slate-800/70 border border-white/10 rounded-2xl px-5 py-4 text-white focus:border-cyan-500 outline-none transition-colors"
                        >
                          <option value="private">🔒 Private Meeting</option>
                          <option value="public">🌍 Public Meeting</option>
                        </select>
                      </div>

                      <div>
                        <label className="text-slate-300 mb-2 block text-sm font-medium">
                          Participants
                        </label>
                        <input
                          type="number"
                          value={maxParticipants}
                          onChange={(e) => setMaxParticipants(e.target.value)}
                          className={`w-full bg-slate-800/70 border rounded-2xl px-5 py-4 text-white outline-none transition-colors ${
                            errors.maxParticipants
                              ? "border-red-500/60 focus:border-red-500"
                              : "border-white/10 focus:border-cyan-500"
                          }`}
                        />
                        {errors.maxParticipants && (
                          <motion.p
                            initial={{ opacity: 0, x: -5 }}
                            animate={{ opacity: 1, x: 0 }}
                            className="text-red-400 text-xs mt-2 flex items-center gap-1"
                          >
                            <FaExclamationCircle size={10} />
                            {errors.maxParticipants}
                          </motion.p>
                        )}
                      </div>
                    </div>

                    <AnimatePresence>
                      {meetingType === "private" && (
                        <motion.div
                          initial={{ opacity: 0, height: 0 }}
                          animate={{ opacity: 1, height: "auto" }}
                          exit={{ opacity: 0, height: 0 }}
                        >
                          <label className="text-slate-300 mb-2 block text-sm font-medium">
                            Password (optional)
                          </label>
                          <div className="relative">
                            <input
                              type={showPassword ? "text" : "password"}
                              value={password}
                              onChange={(e) => setPassword(e.target.value)}
                              placeholder="Set a room password"
                              className={`w-full bg-slate-800/70 border rounded-2xl px-5 py-4 pr-14 text-white outline-none transition-colors ${
                                errors.password
                                  ? "border-red-500/60 focus:border-red-500"
                                  : "border-white/10 focus:border-cyan-500"
                              }`}
                            />
                            <button
                              type="button"
                              onClick={() => setShowPassword((p) => !p)}
                              className="absolute right-5 top-1/2 -translate-y-1/2 text-slate-400 hover:text-white transition-colors"
                            >
                              {showPassword ? (
                                <FaEyeSlash size={16} />
                              ) : (
                                <FaEye size={16} />
                              )}
                            </button>
                          </div>
                          {errors.password && (
                            <motion.p
                              initial={{ opacity: 0, x: -5 }}
                              animate={{ opacity: 1, x: 0 }}
                              className="text-red-400 text-xs mt-2 flex items-center gap-1"
                            >
                              <FaExclamationCircle size={10} />
                              {errors.password}
                            </motion.p>
                          )}
                        </motion.div>
                      )}
                    </AnimatePresence>

                    <div>
                      <label className="text-slate-300 mb-3 block text-sm font-medium">
                        When
                      </label>
                      <div className="grid grid-cols-2 gap-4 mb-4">
                        <button
                          onClick={() => setScheduleType("instant")}
                          className={`py-4 rounded-2xl font-semibold flex items-center justify-center gap-2 border transition-colors ${
                            scheduleType === "instant"
                              ? "bg-cyan-500/20 border-cyan-500 text-cyan-300"
                              : "bg-slate-800/70 border-white/10 text-slate-400"
                          }`}
                        >
                          <FaBolt size={14} /> Instant
                        </button>
                        <button
                          onClick={() => setScheduleType("scheduled")}
                          className={`py-4 rounded-2xl font-semibold flex items-center justify-center gap-2 border transition-colors ${
                            scheduleType === "scheduled"
                              ? "bg-purple-500/20 border-purple-500 text-purple-300"
                              : "bg-slate-800/70 border-white/10 text-slate-400"
                          }`}
                        >
                          <FaCalendarAlt size={14} /> Schedule
                        </button>
                      </div>

                      <AnimatePresence>
                        {scheduleType === "scheduled" && (
                          <motion.div
                            initial={{ opacity: 0, height: 0 }}
                            animate={{ opacity: 1, height: "auto" }}
                            exit={{ opacity: 0, height: 0 }}
                            className="grid md:grid-cols-2 gap-5"
                          >
                            <div>
                              <label className="text-slate-400 mb-2 flex items-center gap-2 text-sm">
                                <FaCalendarAlt size={12} /> Date
                              </label>
                              <input
                                type="date"
                                value={scheduleDate}
                                onChange={(e) =>
                                  setScheduleDate(e.target.value)
                                }
                                className={`w-full bg-slate-800/70 border rounded-2xl px-5 py-4 text-white outline-none transition-colors ${
                                  errors.scheduleDate
                                    ? "border-red-500/60"
                                    : "border-white/10 focus:border-cyan-500"
                                }`}
                              />
                            </div>
                            <div>
                              <label className="text-slate-400 mb-2 flex items-center gap-2 text-sm">
                                <FaClock size={12} /> Time
                              </label>
                              <input
                                type="time"
                                value={scheduleTime}
                                onChange={(e) =>
                                  setScheduleTime(e.target.value)
                                }
                                className={`w-full bg-slate-800/70 border rounded-2xl px-5 py-4 text-white outline-none transition-colors ${
                                  errors.scheduleTime
                                    ? "border-red-500/60"
                                    : "border-white/10 focus:border-cyan-500"
                                }`}
                              />
                            </div>
                          </motion.div>
                        )}
                      </AnimatePresence>
                    </div>

                    <motion.button
                      whileHover={{ scale: 1.01 }}
                      whileTap={{ scale: 0.98 }}
                      onClick={goToSettings}
                      className="w-full py-5 rounded-2xl font-bold text-lg bg-gradient-to-r from-cyan-500 to-blue-600 text-white flex items-center justify-center gap-2"
                    >
                      Continue to Settings
                      <FaChevronRight size={14} />
                    </motion.button>
                  </motion.div>
                )}

                {/* STEP 2: Settings */}
                {step === 2 && (
                  <motion.div
                    key="step2"
                    initial={{ opacity: 0, x: 20 }}
                    animate={{ opacity: 1, x: 0 }}
                    exit={{ opacity: 0, x: -20 }}
                    className="space-y-4"
                  >
                    <button
                      onClick={() => setAdvancedOpen((o) => !o)}
                      className="w-full flex items-center justify-between px-5 py-4 bg-white/5 border border-white/10 rounded-2xl text-white"
                    >
                      <span className="flex items-center gap-3 font-semibold">
                        <FaCog className="text-cyan-400" />
                        Advanced Meeting Controls
                      </span>
                      <motion.span
                        animate={{ rotate: advancedOpen ? 180 : 0 }}
                        transition={{ duration: 0.2 }}
                      >
                        <FaChevronDown className="text-slate-400" />
                      </motion.span>
                    </button>

                    <AnimatePresence>
                      {(advancedOpen || true) && (
                        <motion.div
                          initial={false}
                          animate={{
                            height: advancedOpen ? "auto" : 0,
                            opacity: advancedOpen ? 1 : 0,
                          }}
                          className="overflow-hidden"
                        >
                          <div className="space-y-3 pt-2">
                            <ToggleRow
                              icon={<FaDoorClosed className="text-cyan-400" />}
                              label="Waiting Room"
                              description="Host approves each participant before they join."
                              checked={waitingRoom}
                              onChange={() => setWaitingRoom((v) => !v)}
                            />
                            <ToggleRow
                              icon={
                                <FaMicrophoneSlash className="text-purple-400" />
                              }
                              label="Mute Participants on Join"
                              description="Everyone joins muted by default."
                              checked={muteOnJoin}
                              onChange={() => setMuteOnJoin((v) => !v)}
                            />
                            <ToggleRow
                              icon={
                                <FaVideoSlash className="text-yellow-400" />
                              }
                              label="Disable Camera on Join"
                              description="Participants join with camera off."
                              checked={cameraOffOnJoin}
                              onChange={() => setCameraOffOnJoin((v) => !v)}
                            />
                            <ToggleRow
                              icon={<FaCircle className="text-red-400" />}
                              label="Allow Recording"
                              description="Host can record this session."
                              checked={allowRecording}
                              onChange={() => setAllowRecording((v) => !v)}
                            />
                          </div>
                        </motion.div>
                      )}
                    </AnimatePresence>

                    <div className="flex gap-4 pt-4">
                      <button
                        onClick={() => setStep(1)}
                        className="flex-1 py-5 rounded-2xl font-bold text-lg bg-white/5 border border-white/10 text-slate-300 hover:bg-white/10 transition-colors"
                      >
                        Back
                      </button>
                      <motion.button
                        whileHover={{ scale: 1.01 }}
                        whileTap={{ scale: 0.98 }}
                        onClick={createSession}
                        disabled={loading}
                        className="flex-[2] py-5 rounded-2xl font-bold text-lg bg-gradient-to-r from-cyan-500 to-blue-600 text-white flex items-center justify-center gap-3 disabled:opacity-60"
                      >
                        {loading ? (
                          <>
                            <motion.span
                              animate={{ rotate: 360 }}
                              transition={{
                                repeat: Infinity,
                                duration: 0.8,
                                ease: "linear",
                              }}
                              className="h-5 w-5 border-2 border-white/30 border-t-white rounded-full"
                            />
                            Creating Meeting...
                          </>
                        ) : (
                          "Create Meeting"
                        )}
                      </motion.button>
                    </div>
                  </motion.div>
                )}

                {/* STEP 3: Success */}
                {step === 3 && createdRoom && (
                  <motion.div
                    key="step3"
                    initial={{ opacity: 0, scale: 0.95 }}
                    animate={{ opacity: 1, scale: 1 }}
                    exit={{ opacity: 0 }}
                    className="bg-green-500/10 border border-green-500/20 rounded-3xl p-6 md:p-8"
                  >
                    <motion.h3
                      initial={{ opacity: 0, y: -10 }}
                      animate={{ opacity: 1, y: 0 }}
                      className="text-2xl md:text-3xl font-black text-green-400"
                    >
                      Meeting Created Successfully 🎉
                    </motion.h3>

                    <div className="mt-8 grid md:grid-cols-2 gap-6">
                      <div className="space-y-5">
                        <div className="bg-slate-800 p-4 rounded-2xl flex justify-between items-center text-white">
                          <span>{createdRoom}</span>
                          <button
                            onClick={copyRoomId}
                            className="text-slate-300 hover:text-white transition-colors"
                          >
                            <AnimatePresence mode="wait">
                              {copiedId ? (
                                <motion.span
                                  key="check"
                                  initial={{ scale: 0 }}
                                  animate={{ scale: 1 }}
                                  exit={{ scale: 0 }}
                                >
                                  <FaCheck className="text-green-400" />
                                </motion.span>
                              ) : (
                                <motion.span
                                  key="copy"
                                  initial={{ scale: 0 }}
                                  animate={{ scale: 1 }}
                                  exit={{ scale: 0 }}
                                >
                                  <FaCopy />
                                </motion.span>
                              )}
                            </AnimatePresence>
                          </button>
                        </div>

                        <div className="bg-slate-800 p-4 rounded-2xl flex justify-between items-center text-white">
                          <span className="truncate">{meetingLink}</span>
                          <button
                            onClick={copyLink}
                            className="text-slate-300 hover:text-white transition-colors shrink-0 ml-3"
                          >
                            <AnimatePresence mode="wait">
                              {copiedLink ? (
                                <motion.span
                                  key="check2"
                                  initial={{ scale: 0 }}
                                  animate={{ scale: 1 }}
                                  exit={{ scale: 0 }}
                                >
                                  <FaCheck className="text-green-400" />
                                </motion.span>
                              ) : (
                                <motion.span
                                  key="copy2"
                                  initial={{ scale: 0 }}
                                  animate={{ scale: 1 }}
                                  exit={{ scale: 0 }}
                                >
                                  <FaCopy />
                                </motion.span>
                              )}
                            </AnimatePresence>
                          </button>
                        </div>

                        <div className="flex gap-3">
                          <button
                            onClick={shareWhatsapp}
                            className="flex-1 py-3.5 rounded-2xl bg-green-600/20 text-green-400 border border-green-600/30 flex items-center justify-center gap-2 font-semibold hover:bg-green-600/30 transition-colors"
                          >
                            <FaWhatsapp /> WhatsApp
                          </button>
                          <button
                            onClick={shareEmail}
                            className="flex-1 py-3.5 rounded-2xl bg-cyan-600/20 text-cyan-400 border border-cyan-600/30 flex items-center justify-center gap-2 font-semibold hover:bg-cyan-600/30 transition-colors"
                          >
                            <FaEnvelope /> Email
                          </button>
                        </div>

                        <motion.button
                          whileHover={{ scale: 1.02 }}
                          whileTap={{ scale: 0.98 }}
                          onClick={startMeeting}
                          className="w-full py-5 rounded-2xl bg-green-500 font-bold flex items-center justify-center gap-3 text-white"
                        >
                          <FaRocket />
                          Start Meeting
                        </motion.button>
                      </div>

                      <div className="flex flex-col items-center justify-center bg-white/5 border border-white/10 rounded-3xl p-6">
                        <div className="flex items-center gap-2 text-slate-400 mb-4 text-sm">
                          <FaQrcode /> Scan to Join
                        </div>
                        <div className="bg-white p-3 rounded-2xl">
                          <img
                            src={`https://api.qrserver.com/v1/create-qr-code/?size=180x180&data=${encodeURIComponent(
                              meetingLink,
                            )}`}
                            alt="Meeting QR Code"
                            width={160}
                            height={160}
                          />
                        </div>
                      </div>
                    </div>
                  </motion.div>
                )}
              </AnimatePresence>
            </motion.div>
          </motion.div>
        )}
      </AnimatePresence>
    </>
  );
}

/* ------------------------------------------------------------------ */
/* Reusable Toggle Row                                                  */
/* ------------------------------------------------------------------ */
function ToggleRow({ icon, label, description, checked, onChange }) {
  return (
    <div className="flex items-center justify-between px-5 py-4 bg-white/5 border border-white/10 rounded-2xl">
      <div className="flex items-center gap-4">
        <div className="h-10 w-10 rounded-xl bg-white/5 flex items-center justify-center">
          {icon}
        </div>
        <div>
          <p className="text-white font-semibold text-sm">{label}</p>
          <p className="text-slate-400 text-xs mt-0.5">{description}</p>
        </div>
      </div>
      <button
        onClick={onChange}
        className={`relative h-7 w-12 rounded-full transition-colors shrink-0 ${
          checked ? "bg-cyan-500" : "bg-slate-700"
        }`}
      >
        <motion.div
          animate={{ x: checked ? 22 : 2 }}
          transition={{ type: "spring", stiffness: 500, damping: 30 }}
          className="absolute top-1 h-5 w-5 bg-white rounded-full shadow"
        />
      </button>
    </div>
  );
}

export default DasHostsession;
