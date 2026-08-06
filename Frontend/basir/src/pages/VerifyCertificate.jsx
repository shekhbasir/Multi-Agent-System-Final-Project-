import { useEffect, useState } from "react";
import { useParams, Link } from "react-router-dom";
import axios from "axios";
import {
  FaCheckCircle,
  FaTimesCircle,
  FaSpinner,
  FaArrowLeft,
} from "react-icons/fa";
import { GoDeviceCameraVideo } from "react-icons/go";

function VerifyCertificate() {
  const { certificateId } = useParams();
  const [status, setStatus] = useState("loading"); // loading | valid | invalid
  const [certificate, setCertificate] = useState(null);

  useEffect(() => {
    const run = async () => {
      try {
        const res = await axios.get(
          `http://localhost:7000/api/certificate/verify/${certificateId}`,
        );
        setCertificate(res.data.certificate);
        setStatus("valid");
      } catch {
        setStatus("invalid");
      }
    };
    run();
  }, [certificateId]);

  return (
    <div className="min-h-screen bg-[#05070d] text-slate-100 flex items-center justify-center px-6 py-16">
      <div className="w-full max-w-lg">
        <Link
          to="/"
          className="inline-flex items-center gap-2 text-sm text-slate-400 hover:text-white mb-8 transition-colors"
        >
          <FaArrowLeft size={12} /> Back to home
        </Link>

        <div className="flex items-center gap-2 mb-8">
          <div className="h-9 w-9 rounded-lg bg-blue-600 flex items-center justify-center">
            <GoDeviceCameraVideo size={18} className="text-white" />
          </div>
          <span className="text-lg font-black tracking-wider bg-gradient-to-r from-red-500 via-orange-500 to-pink-500 bg-clip-text text-transparent">
            LIVE CLASSES
          </span>
        </div>

        <div className="rounded-2xl border border-white/10 bg-white/[0.03] p-8">
          {status === "loading" && (
            <div className="flex flex-col items-center py-10 text-slate-400">
              <FaSpinner className="animate-spin" size={22} />
              <p className="mt-3 text-sm">Verifying certificate…</p>
            </div>
          )}

          {status === "invalid" && (
            <div className="flex flex-col items-center py-10 text-center">
              <FaTimesCircle className="text-rose-400" size={36} />
              <h2 className="mt-4 text-lg font-bold text-slate-100">
                Certificate Not Found
              </h2>
              <p className="mt-2 text-sm text-slate-500">
                We couldn't find a certificate with ID{" "}
                <span className="font-mono text-slate-400">
                  {certificateId}
                </span>
                .
              </p>
            </div>
          )}

          {status === "valid" && certificate && (
            <div>
              <div className="flex flex-col items-center text-center pb-6 border-b border-white/10">
                <FaCheckCircle className="text-emerald-400" size={36} />
                <h2 className="mt-4 text-lg font-bold text-slate-100">
                  Valid Certificate
                </h2>
                <p className="mt-1 text-xs text-slate-500 font-mono">
                  {certificate.certificateId}
                </p>
              </div>

              <div className="mt-6 space-y-4 text-sm">
                <Row label="Participant" value={certificate.participantName} />
                <Row label="Meeting" value={certificate.meetingTitle} />
                <Row label="Hosted By" value={certificate.hostName} />
                <Row label="Room ID" value={certificate.roomId} mono />
                <Row
                  label="Date"
                  value={new Date(certificate.meetingDate).toLocaleDateString(
                    "en-US",
                    { year: "numeric", month: "long", day: "numeric" },
                  )}
                />
                <Row
                  label="Duration"
                  value={
                    certificate.durationMinutes >= 60
                      ? `${Math.floor(certificate.durationMinutes / 60)}h ${
                          certificate.durationMinutes % 60
                        }m`
                      : `${certificate.durationMinutes} min`
                  }
                />
              </div>
            </div>
          )}
        </div>
      </div>
    </div>
  );
}

function Row({ label, value, mono }) {
  return (
    <div className="flex items-center justify-between gap-4">
      <span className="text-slate-500">{label}</span>
      <span
        className={`text-slate-200 font-medium text-right ${mono ? "font-mono" : ""}`}
      >
        {value}
      </span>
    </div>
  );
}

export default VerifyCertificate;
