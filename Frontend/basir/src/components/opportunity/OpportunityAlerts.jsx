import { useEffect, useRef, useState } from "react";
import { AnimatePresence, motion, useReducedMotion } from "framer-motion";
import { Bell, Plus, X, BellRing } from "lucide-react";
import opportunityApi from "../../config/opportunityApi";
import { playAlertSound } from "../../utils/opportunitySounds";

const OpportunityAlerts = () => {
  const [alerts, setAlerts] = useState([]);
  const [matches, setMatches] = useState([]);
  const [keyword, setKeyword] = useState("");
  const [open, setOpen] = useState(false);
  const [justRang, setJustRang] = useState(false);

  const panelRef = useRef(null);
  const prefersReducedMotion = useReducedMotion();

  const loadAlerts = () => {
    opportunityApi.get("/alerts").then((res) => setAlerts(res.data.alerts));
  };

  const pollMatches = async () => {
    try {
      const res = await opportunityApi.get("/alerts/matches");
      if (res.data.unreadCount > matches.length) {
        playAlertSound();
        setJustRang(true);
        setTimeout(() => setJustRang(false), 1000);
      }
      setMatches(res.data.matches);
    } catch (error) {
      // silent — polling failure shouldn't break the page
    }
  };

  useEffect(() => {
    loadAlerts();
    pollMatches();
    const interval = setInterval(pollMatches, 60000);
    return () => clearInterval(interval);
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, []);

  useEffect(() => {
    if (!open) return;

    const handleClickOutside = (e) => {
      if (panelRef.current && !panelRef.current.contains(e.target)) {
        setOpen(false);
      }
    };
    const handleKeyDown = (e) => {
      if (e.key === "Escape") setOpen(false);
    };

    document.addEventListener("mousedown", handleClickOutside);
    document.addEventListener("keydown", handleKeyDown);
    return () => {
      document.removeEventListener("mousedown", handleClickOutside);
      document.removeEventListener("keydown", handleKeyDown);
    };
  }, [open]);

  const createAlert = async () => {
    if (!keyword.trim()) return;
    await opportunityApi.post("/alerts", { keyword: keyword.trim() });
    setKeyword("");
    loadAlerts();
  };

  const handleKeywordKeyDown = (e) => {
    if (e.key === "Enter") createAlert();
  };

  const removeAlert = async (id) => {
    await opportunityApi.delete(`/alerts/${id}`);
    loadAlerts();
  };

  const markSeen = async () => {
    await opportunityApi.patch("/alerts/matches/seen");
    setMatches([]);
  };

  return (
    <div className="relative" ref={panelRef}>
      <motion.button
        onClick={() => setOpen((o) => !o)}
        aria-label="Opportunity alerts"
        aria-expanded={open}
        whileHover={prefersReducedMotion ? undefined : { scale: 1.08 }}
        whileTap={prefersReducedMotion ? undefined : { scale: 0.92 }}
        className="relative rounded-lg p-1.5 text-white/70 transition-colors hover:text-white focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-blue-400/50"
      >
        <motion.span
          animate={
            justRang && !prefersReducedMotion
              ? { rotate: [0, -12, 10, -8, 6, 0] }
              : { rotate: 0 }
          }
          transition={{ duration: 0.5 }}
          className="block"
        >
          {justRang ? (
            <BellRing className="h-5 w-5" strokeWidth={2} />
          ) : (
            <Bell className="h-5 w-5" strokeWidth={2} />
          )}
        </motion.span>

        <AnimatePresence>
          {matches.length > 0 && (
            <motion.span
              initial={{ scale: 0, opacity: 0 }}
              animate={{ scale: 1, opacity: 1 }}
              exit={{ scale: 0, opacity: 0 }}
              transition={{ duration: 0.2, ease: "easeOut" }}
              className="absolute -right-1.5 -top-1 rounded-full bg-red-500 px-1.5 py-0.5 text-[10px] font-medium leading-none text-white"
            >
              {matches.length}
            </motion.span>
          )}
        </AnimatePresence>
      </motion.button>

      <AnimatePresence>
        {open && (
          <motion.div
            initial={{ opacity: 0, y: -6, scale: 0.97 }}
            animate={{ opacity: 1, y: 0, scale: 1 }}
            exit={{ opacity: 0, y: -6, scale: 0.97 }}
            transition={{ duration: 0.18, ease: [0.16, 1, 0.3, 1] }}
            className="absolute right-0 z-40 mt-2 w-80 rounded-xl border border-white/10 bg-[#0d1424] p-4 shadow-xl shadow-black/40"
          >
            <div className="flex gap-2">
              <input
                value={keyword}
                onChange={(e) => setKeyword(e.target.value)}
                onKeyDown={handleKeywordKeyDown}
                placeholder="e.g. React internship"
                aria-label="New alert keyword"
                className="flex-1 rounded-lg bg-white/5 px-3 py-2 text-sm text-white/90 outline-none transition-colors placeholder:text-white/30 focus:bg-white/[0.08] focus:ring-2 focus:ring-blue-400/40"
              />
              <motion.button
                onClick={createAlert}
                whileHover={prefersReducedMotion ? undefined : { y: -1 }}
                whileTap={prefersReducedMotion ? undefined : { scale: 0.94 }}
                className="flex items-center gap-1 rounded-lg bg-white px-3 text-sm font-medium text-black transition-colors hover:bg-white/90 focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-blue-400/50"
              >
                <Plus className="h-3.5 w-3.5" strokeWidth={2.5} />
                Add
              </motion.button>
            </div>

            <div className="mt-3 space-y-1">
              {alerts.length === 0 ? (
                <p className="py-3 text-center text-xs text-white/30">
                  No alerts yet — add a keyword to get notified.
                </p>
              ) : (
                alerts.map((a) => (
                  <div
                    key={a._id}
                    className="group flex items-center justify-between rounded-lg px-2 py-1.5 text-xs text-white/70 transition-colors hover:bg-white/5"
                  >
                    <span className="flex items-center gap-1.5 truncate">
                      <Bell
                        className="h-3 w-3 shrink-0 text-white/30"
                        strokeWidth={2}
                      />
                      {a.keyword}
                    </span>
                    <button
                      onClick={() => removeAlert(a._id)}
                      aria-label={`Remove alert: ${a.keyword}`}
                      className="shrink-0 rounded p-1 text-white/30 opacity-0 transition-all hover:text-white/70 group-hover:opacity-100 focus-visible:opacity-100 focus-visible:outline-none focus-visible:ring-1 focus-visible:ring-blue-400/50"
                    >
                      <X className="h-3 w-3" strokeWidth={2} />
                    </button>
                  </div>
                ))
              )}
            </div>

            {matches.length > 0 && (
              <div className="mt-4 border-t border-white/10 pt-3">
                <div className="flex items-center justify-between">
                  <span className="text-xs text-white/50">New matches</span>
                  <button
                    onClick={markSeen}
                    className="text-xs text-white/40 transition-colors hover:text-white/70"
                  >
                    Mark all read
                  </button>
                </div>
                <div className="mt-2 max-h-40 space-y-1 overflow-y-auto">
                  {matches.map((m) => (
                    <a
                      key={m._id}
                      href={m.opportunity?.applyUrl}
                      target="_blank"
                      rel="noopener noreferrer"
                      className="flex items-center gap-2 rounded-lg px-2 py-1.5 text-xs text-white/80 transition-colors hover:bg-white/5 hover:text-white"
                    >
                      <span className="h-1.5 w-1.5 shrink-0 rounded-full bg-blue-400" />
                      <span className="truncate">
                        {m.opportunity?.title} — {m.opportunity?.company}
                      </span>
                    </a>
                  ))}
                </div>
              </div>
            )}
          </motion.div>
        )}
      </AnimatePresence>
    </div>
  );
};

export default OpportunityAlerts;
