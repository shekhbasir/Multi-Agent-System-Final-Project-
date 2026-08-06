// frontend/src/pages/MyCertificates.jsx
import { useEffect, useState } from "react";
import { FaAward, FaSyncAlt } from "react-icons/fa";
import certificateApi from "../config/certificateApi";
import CertificatePreview from "../components/certificate/CertificatePreview";

function MyCertificates() {
  const [certificates, setCertificates] = useState([]);
  const [loading, setLoading] = useState(true);
  const [refreshing, setRefreshing] = useState(false);
  const [openCertId, setOpenCertId] = useState(null);

  useEffect(() => {
    load();
  }, []);

  const load = async (isRefresh = false) => {
    try {
      isRefresh ? setRefreshing(true) : setLoading(true);
      const res = await certificateApi.get("/my-certificates");
      setCertificates(res.data.certificates || []);
    } catch (error) {
      console.log(error);
    } finally {
      setLoading(false);
      setRefreshing(false);
    }
  };

  const openCert = certificates.find((c) => c.certificateId === openCertId);

  return (
    <div className="min-h-screen bg-[#05070d] text-slate-100 px-6 md:px-10 py-10">
      <div className="max-w-5xl mx-auto">
        <div className="flex items-center justify-between gap-4 mb-8">
          <div>
            <p className="text-xs font-semibold tracking-[0.2em] text-cyan-400/80 uppercase mb-2">
              Achievements
            </p>
            <h1 className="text-3xl font-bold text-slate-100">
              My Certificates
            </h1>
            <p className="text-slate-400 mt-2 text-sm">
              Every certificate issued to you — download anytime, whether the
              session is still active or has ended.
            </p>
          </div>
          <button
            onClick={() => load(true)}
            disabled={refreshing}
            className="w-11 h-11 shrink-0 flex items-center justify-center rounded-xl bg-white/5 border border-white/10
              hover:border-cyan-400/50 hover:bg-white/[0.07] transition-colors disabled:opacity-60"
            title="Refresh"
          >
            <FaSyncAlt
              className={`text-slate-300 text-sm ${refreshing ? "animate-spin" : ""}`}
            />
          </button>
        </div>

        {openCert ? (
          <div>
            <button
              onClick={() => setOpenCertId(null)}
              className="mb-6 text-sm text-cyan-300 hover:text-cyan-200"
            >
              ← Back to all certificates
            </button>
            <CertificatePreview certificate={openCert} />
          </div>
        ) : loading ? (
          <div className="grid md:grid-cols-2 gap-5">
            {[0, 1].map((i) => (
              <div
                key={i}
                className="h-[160px] rounded-2xl bg-white/5 border border-white/10 animate-pulse"
              />
            ))}
          </div>
        ) : certificates.length === 0 ? (
          <div className="flex flex-col items-center justify-center text-center py-24 rounded-2xl border border-dashed border-white/10 bg-white/[0.02]">
            <div className="w-14 h-14 rounded-2xl bg-white/5 border border-white/10 flex items-center justify-center mb-4">
              <FaAward className="text-slate-500 text-xl" />
            </div>
            <h3 className="text-lg font-semibold text-slate-200">
              No certificates yet
            </h3>
            <p className="text-slate-500 text-sm mt-1 max-w-xs">
              Attend a session and ask the host to issue your certificate — once
              ended it'll appear here for you to download anytime.
            </p>
          </div>
        ) : (
          <div className="grid md:grid-cols-2 gap-5">
            {certificates.map((cert) => (
              <button
                key={cert.certificateId}
                onClick={() => setOpenCertId(cert.certificateId)}
                className="text-left rounded-2xl p-6 bg-white/[0.04] border border-white/10 hover:border-cyan-400/40
                  hover:bg-white/[0.06] transition-colors duration-300"
              >
                <div className="flex items-start justify-between gap-3">
                  <h2 className="font-bold text-slate-100">
                    {cert.meetingTitle}
                  </h2>
                  <FaAward className="text-amber-300 shrink-0" />
                </div>
                <p className="text-xs text-slate-400 mt-2 font-mono">
                  {cert.certificateId}
                </p>
                <p className="text-xs text-slate-500 mt-1">
                  Hosted by {cert.hostName} ·{" "}
                  {new Date(cert.meetingDate).toLocaleDateString()}
                </p>
              </button>
            ))}
          </div>
        )}
      </div>
    </div>
  );
}

export default MyCertificates;
