import { useState } from "react";
import { motion, AnimatePresence } from "framer-motion";
import {
  FaTimes,
  FaCertificate,
  FaUserGraduate,
  FaSpinner,
  FaCheckCircle,
} from "react-icons/fa";
import certificateApi from "../../config/certificateApi";
import CertificatePreview from "./CertificatePreview";

function CertificateModal({ session, onClose }) {
  const [selectedParticipant, setSelectedParticipant] = useState(null);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState("");
  const [certificate, setCertificate] = useState(null);

  // Host should not appear in participant list
  const eligibleParticipants = (session?.participants || []).filter(
    (p) => p.role !== "host",
  );

  const handleGenerate = async () => {
    if (!selectedParticipant || loading) return;

    try {
      setLoading(true);
      setError("");

      const res = await certificateApi.post("/generate", {
        roomId: session.roomId,
        participantId: selectedParticipant.userId,
      });

      if (!res.data?.certificate) {
        throw new Error("Certificate was not returned by the server");
      }

      setCertificate(res.data.certificate);
    } catch (err) {
      console.error("CERTIFICATE GENERATION ERROR:", err);

      setError(
        err?.response?.data?.message ||
          err?.message ||
          "Failed to generate certificate",
      );
    } finally {
      setLoading(false);
    }
  };

  return (
    <AnimatePresence>
      <motion.div
        initial={{ opacity: 0 }}
        animate={{ opacity: 1 }}
        exit={{ opacity: 0 }}
        className="fixed inset-0 z-[200] bg-black/70 backdrop-blur-sm flex items-center justify-center p-4"
        onClick={onClose}
      >
        <motion.div
          initial={{ opacity: 0, scale: 0.95, y: 12 }}
          animate={{ opacity: 1, scale: 1, y: 0 }}
          exit={{ opacity: 0, scale: 0.95, y: 12 }}
          transition={{
            type: "spring",
            stiffness: 300,
            damping: 28,
          }}
          onClick={(e) => e.stopPropagation()}
          className={`relative w-full ${
            certificate ? "max-w-4xl" : "max-w-lg"
          } max-h-[90vh] overflow-y-auto rounded-2xl bg-[#0b0f1a] border border-white/10 shadow-[0_30px_80px_-20px_rgba(0,0,0,0.7)]`}
        >
          {/* HEADER */}
          <div className="sticky top-0 z-10 flex items-center justify-between px-6 py-5 border-b border-white/10 bg-[#0b0f1a]/95 backdrop-blur">
            <div className="flex items-center gap-3">
              <div className="h-10 w-10 rounded-xl bg-cyan-500/15 border border-cyan-500/30 flex items-center justify-center">
                <FaCertificate className="text-cyan-300" size={16} />
              </div>

              <div>
                <h2 className="text-base font-bold text-slate-100">
                  Generate Certificate
                </h2>

                <p className="text-xs text-slate-500">
                  {session?.meetingTitle}
                </p>
              </div>
            </div>

            <button
              onClick={onClose}
              className="w-9 h-9 flex items-center justify-center rounded-lg bg-white/5 hover:bg-white/10 text-slate-400 hover:text-white transition-colors"
            >
              <FaTimes size={14} />
            </button>
          </div>

          <div className="p-6">
            {certificate ? (
              <CertificatePreview certificate={certificate} onClose={onClose} />
            ) : (
              <>
                {eligibleParticipants.length === 0 ? (
                  <div className="text-center py-10">
                    <FaUserGraduate
                      className="mx-auto text-slate-600"
                      size={28}
                    />

                    <p className="mt-3 text-sm text-slate-400">
                      No participants attended this meeting yet.
                    </p>

                    <p className="mt-1 text-xs text-slate-600">
                      A participant must join the meeting before a certificate
                      can be issued.
                    </p>
                  </div>
                ) : (
                  <>
                    <div className="mb-5">
                      <p className="text-sm text-slate-300">
                        Select a participant to issue their certificate of
                        attendance.
                      </p>

                      <p className="text-xs text-slate-500 mt-1">
                        Certificates are available for both active and ended
                        sessions.
                      </p>
                    </div>

                    <div className="space-y-2 max-h-64 overflow-y-auto pr-1">
                      {eligibleParticipants.map((p) => (
                        <button
                          key={p.userId}
                          type="button"
                          onClick={() => {
                            setSelectedParticipant(p);
                            setError("");
                          }}
                          className={`w-full flex items-center gap-3 px-4 py-3 rounded-xl border text-left transition-colors ${
                            selectedParticipant?.userId === p.userId
                              ? "border-cyan-400/60 bg-cyan-500/10"
                              : "border-white/10 bg-white/[0.03] hover:bg-white/[0.06]"
                          }`}
                        >
                          <div className="h-8 w-8 rounded-full bg-gradient-to-br from-cyan-400 to-violet-400 flex items-center justify-center text-[11px] font-bold text-[#05070d]">
                            {p.userName?.charAt(0)?.toUpperCase() || "?"}
                          </div>

                          <span className="text-sm text-slate-200">
                            {p.userName || "Participant"}
                          </span>

                          {selectedParticipant?.userId === p.userId && (
                            <FaCheckCircle
                              className="ml-auto text-cyan-300"
                              size={14}
                            />
                          )}
                        </button>
                      ))}
                    </div>

                    {error && (
                      <div className="mt-4 px-4 py-3 rounded-xl border border-rose-500/20 bg-rose-500/10">
                        <p className="text-sm text-rose-400">{error}</p>
                      </div>
                    )}

                    <button
                      type="button"
                      onClick={handleGenerate}
                      disabled={!selectedParticipant || loading}
                      className="mt-6 w-full flex items-center justify-center gap-2 px-5 py-3 rounded-xl font-semibold text-sm text-[#05070d] bg-gradient-to-r from-cyan-300 to-violet-300 hover:shadow-[0_0_25px_-5px_rgba(34,211,238,0.6)] transition-shadow duration-300 disabled:opacity-50 disabled:cursor-not-allowed"
                    >
                      {loading ? (
                        <>
                          <FaSpinner className="animate-spin" size={14} />
                          Generating...
                        </>
                      ) : (
                        <>
                          <FaCertificate size={14} />
                          Generate Certificate
                        </>
                      )}
                    </button>
                  </>
                )}
              </>
            )}
          </div>
        </motion.div>
      </motion.div>
    </AnimatePresence>
  );
}

export default CertificateModal;
