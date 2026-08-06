import { useEffect, useMemo, useState } from "react";
import { AnimatePresence, motion, useReducedMotion } from "framer-motion";

import {
  X,
  MapPin,
  Wallet,
  Tag,
  Clock3,
  Heart,
  ExternalLink,
  Building2,
  Loader2,
  Link2,
  Check,
  Sparkles,
  BriefcaseBusiness,
  CalendarDays,
  ShieldCheck,
  Zap,
  ArrowUpRight,
  Globe2,
  CircleCheck,
  Copy,
  Timer,
  Info,
  ChevronRight,
  Star,
} from "lucide-react";

import opportunityApi from "../../config/opportunityApi";
import { playSavedSound } from "../../utils/opportunitySounds";

/* =========================================================
   HELPERS
========================================================= */

const getUrgency = (deadline) => {
  if (!deadline) return null;

  const deadlineDate = new Date(deadline);

  if (Number.isNaN(deadlineDate.getTime())) return null;

  const days = Math.ceil((deadlineDate.getTime() - Date.now()) / 86400000);

  if (days < 0) return null;

  if (days < 3) {
    return {
      label: days === 0 ? "Due today" : `${days}d left`,
      color: "#f87171",
      soft: "rgba(248,113,113,0.10)",
      border: "rgba(248,113,113,0.22)",
      glow: "rgba(248,113,113,0.32)",
      pct: 92,
      level: "Critical",
    };
  }

  if (days < 7) {
    return {
      label: `${days}d left`,
      color: "#fb923c",
      soft: "rgba(251,146,60,0.10)",
      border: "rgba(251,146,60,0.22)",
      glow: "rgba(251,146,60,0.28)",
      pct: 70,
      level: "High",
    };
  }

  if (days < 14) {
    return {
      label: `${days}d left`,
      color: "#facc15",
      soft: "rgba(250,204,21,0.10)",
      border: "rgba(250,204,21,0.22)",
      glow: "rgba(250,204,21,0.24)",
      pct: 45,
      level: "Medium",
    };
  }

  return {
    label: `${days}d left`,
    color: "#4ade80",
    soft: "rgba(74,222,128,0.10)",
    border: "rgba(74,222,128,0.22)",
    glow: "rgba(74,222,128,0.20)",
    pct: 20,
    level: "Low",
  };
};

const formatDate = (date) => {
  if (!date) return "Not specified";

  const parsed = new Date(date);

  if (Number.isNaN(parsed.getTime())) {
    return "Not specified";
  }

  return parsed.toLocaleDateString(undefined, {
    day: "numeric",
    month: "short",
    year: "numeric",
  });
};

const formatFetchedDate = (date) => {
  if (!date) return "Recently";

  const parsed = new Date(date);

  if (Number.isNaN(parsed.getTime())) {
    return "Recently";
  }

  return parsed.toLocaleString(undefined, {
    day: "numeric",
    month: "short",
    hour: "numeric",
    minute: "2-digit",
  });
};

/* =========================================================
   ANIMATION
========================================================= */

const contentVariants = {
  hidden: {
    opacity: 0,
    y: 16,
  },

  visible: (i) => ({
    opacity: 1,
    y: 0,
    transition: {
      delay: 0.08 + i * 0.055,
      duration: 0.42,
      ease: [0.16, 1, 0.3, 1],
    },
  }),
};

const staggerContainer = {
  hidden: {},
  visible: {
    transition: {
      staggerChildren: 0.06,
    },
  },
};

/* =========================================================
   SMALL UI COMPONENTS
========================================================= */

const SectionHeading = ({ icon: Icon, children }) => {
  return (
    <div className="mb-3 flex items-center gap-2">
      <div className="flex h-7 w-7 items-center justify-center rounded-lg border border-white/10 bg-white/[0.05]">
        <Icon className="h-3.5 w-3.5 text-white/60" strokeWidth={1.8} />
      </div>

      <h3 className="text-xs font-semibold uppercase tracking-[0.16em] text-white/45">
        {children}
      </h3>
    </div>
  );
};

const MetaCard = ({ icon: Icon, label, value, accent = "blue" }) => {
  const accentClasses = {
    blue: "text-blue-300 bg-blue-400/10 border-blue-400/15",
    violet: "text-violet-300 bg-violet-400/10 border-violet-400/15",
    green: "text-emerald-300 bg-emerald-400/10 border-emerald-400/15",
    orange: "text-orange-300 bg-orange-400/10 border-orange-400/15",
  };

  return (
    <motion.div
      variants={contentVariants}
      className="group rounded-2xl border border-white/[0.08] bg-white/[0.035] p-3.5 transition-all duration-300 hover:-translate-y-0.5 hover:border-white/[0.16] hover:bg-white/[0.055]"
    >
      <div className="flex items-start gap-3">
        <div
          className={`flex h-9 w-9 shrink-0 items-center justify-center rounded-xl border ${accentClasses[accent]}`}
        >
          <Icon className="h-4 w-4" strokeWidth={1.8} />
        </div>

        <div className="min-w-0">
          <p className="text-[10px] font-medium uppercase tracking-[0.12em] text-white/35">
            {label}
          </p>

          <p className="mt-1 truncate text-xs font-medium text-white/75">
            {value || "Not specified"}
          </p>
        </div>
      </div>
    </motion.div>
  );
};

/* =========================================================
   MAIN COMPONENT
========================================================= */

const OpportunityDrawer = ({ item, onClose }) => {
  const prefersReducedMotion = useReducedMotion();

  const [saveState, setSaveState] = useState("idle");
  const [copyState, setCopyState] = useState("idle");

  const urgency = useMemo(() => getUrgency(item?.deadline), [item?.deadline]);

  const skills = item?.skills ?? [];

  const description = item?.description?.trim();

  /* =======================================================
     ESCAPE
  ======================================================= */

  useEffect(() => {
    const handleKeyDown = (event) => {
      if (event.key === "Escape") {
        onClose?.();
      }
    };

    document.addEventListener("keydown", handleKeyDown);

    return () => {
      document.removeEventListener("keydown", handleKeyDown);
    };
  }, [onClose]);

  /* =======================================================
     BODY LOCK
  ======================================================= */

  useEffect(() => {
    const originalOverflow = document.body.style.overflow;

    document.body.style.overflow = "hidden";

    return () => {
      document.body.style.overflow = originalOverflow;
    };
  }, []);

  /* =======================================================
     SAVE
  ======================================================= */

  const handleSave = async () => {
    if (saveState === "saving" || saveState === "saved") {
      return;
    }

    setSaveState("saving");

    try {
      await opportunityApi.post(`/${item._id}/save`);

      playSavedSound();

      setSaveState("saved");
    } catch (error) {
      console.error("Failed to save opportunity:", error);
      setSaveState("error");
    }
  };

  /* =======================================================
     COPY
  ======================================================= */

  const handleCopyLink = async () => {
    if (!item?.applyUrl) return;

    try {
      await navigator.clipboard.writeText(item.applyUrl);

      setCopyState("copied");

      setTimeout(() => {
        setCopyState("idle");
      }, 1800);
    } catch (error) {
      console.error("Failed to copy application link:", error);
    }
  };

  /* =======================================================
     BACKDROP CLICK
  ======================================================= */

  const handleBackdropClick = (event) => {
    if (event.target === event.currentTarget) {
      onClose?.();
    }
  };

  /* =======================================================
     MOTION SETTINGS
  ======================================================= */

  const drawerInitial = prefersReducedMotion
    ? {
        opacity: 0,
      }
    : {
        x: "100%",
      };

  const drawerAnimate = prefersReducedMotion
    ? {
        opacity: 1,
      }
    : {
        x: 0,
      };

  const drawerExit = prefersReducedMotion
    ? {
        opacity: 0,
      }
    : {
        x: "100%",
      };

  /* =======================================================
     RETURN
  ======================================================= */

  return (
    <AnimatePresence mode="wait">
      <motion.div
        key="opportunity-overlay"
        role="presentation"
        initial={{ opacity: 0 }}
        animate={{ opacity: 1 }}
        exit={{ opacity: 0 }}
        transition={{ duration: 0.25 }}
        onClick={handleBackdropClick}
        className="fixed inset-0 z-[100] flex justify-end bg-black/70 backdrop-blur-[5px]"
      >
        {/* =================================================
            AMBIENT BACKGROUND LIGHT
        ================================================= */}

        <div className="pointer-events-none absolute inset-0 overflow-hidden">
          <motion.div
            animate={
              prefersReducedMotion
                ? undefined
                : {
                    opacity: [0.12, 0.2, 0.12],
                    scale: [1, 1.08, 1],
                  }
            }
            transition={{
              duration: 5,
              repeat: Infinity,
              ease: "easeInOut",
            }}
            className="absolute right-0 top-10 h-[420px] w-[420px] rounded-full bg-blue-500/10 blur-[100px]"
          />

          <motion.div
            animate={
              prefersReducedMotion
                ? undefined
                : {
                    opacity: [0.08, 0.15, 0.08],
                    scale: [1.05, 1, 1.05],
                  }
            }
            transition={{
              duration: 7,
              repeat: Infinity,
              ease: "easeInOut",
            }}
            className="absolute bottom-0 right-[20%] h-[300px] w-[300px] rounded-full bg-violet-500/10 blur-[100px]"
          />
        </div>

        {/* =================================================
            DRAWER
        ================================================= */}

        <motion.aside
          role="dialog"
          aria-modal="true"
          aria-labelledby="opportunity-drawer-title"
          initial={drawerInitial}
          animate={drawerAnimate}
          exit={drawerExit}
          transition={{
            duration: 0.48,
            ease: [0.16, 1, 0.3, 1],
          }}
          onClick={(event) => event.stopPropagation()}
          style={{
            boxShadow: urgency
              ? `-45px 0 100px -50px ${urgency.glow}`
              : "-45px 0 100px -50px rgba(99,102,241,0.22)",
          }}
          className="relative flex h-full w-full max-w-[620px] flex-col overflow-hidden border-l border-white/[0.10] bg-[#080d18]"
        >
          {/* =================================================
              TOP GRADIENT LINE
          ================================================= */}

          <div
            className="absolute left-0 right-0 top-0 z-30 h-[2px]"
            style={{
              background: urgency
                ? `linear-gradient(90deg, transparent, ${urgency.color}, #818cf8, transparent)`
                : "linear-gradient(90deg, transparent, #60a5fa, #a78bfa, transparent)",
            }}
          />

          {/* =================================================
              HEADER
          ================================================= */}

          <header className="relative shrink-0 overflow-hidden border-b border-white/[0.08] bg-[#0b1220]/90 backdrop-blur-2xl">
            {/* Decorative grid */}
            <div
              className="pointer-events-none absolute inset-0 opacity-[0.035]"
              style={{
                backgroundImage:
                  "linear-gradient(rgba(255,255,255,.5) 1px, transparent 1px), linear-gradient(90deg, rgba(255,255,255,.5) 1px, transparent 1px)",
                backgroundSize: "24px 24px",
              }}
            />

            <div className="relative p-5 sm:p-6">
              <div className="flex items-start justify-between gap-4">
                <motion.div
                  initial={{ opacity: 0, y: 10 }}
                  animate={{ opacity: 1, y: 0 }}
                  transition={{
                    duration: 0.45,
                    ease: [0.16, 1, 0.3, 1],
                  }}
                  className="min-w-0 flex-1"
                >
                  {/* Top labels */}
                  <div className="mb-3 flex flex-wrap items-center gap-2">
                    <span className="inline-flex items-center gap-1.5 rounded-full border border-blue-400/15 bg-blue-400/[0.08] px-2.5 py-1 text-[10px] font-semibold uppercase tracking-[0.12em] text-blue-300">
                      <Sparkles className="h-3 w-3" />
                      Opportunity
                    </span>

                    {urgency && (
                      <motion.span
                        initial={{ opacity: 0, scale: 0.9 }}
                        animate={{ opacity: 1, scale: 1 }}
                        transition={{ delay: 0.18 }}
                        className="inline-flex items-center gap-1.5 rounded-full border px-2.5 py-1 text-[10px] font-semibold"
                        style={{
                          color: urgency.color,
                          background: urgency.soft,
                          borderColor: urgency.border,
                        }}
                      >
                        <Zap className="h-3 w-3" />
                        {urgency.label}
                      </motion.span>
                    )}
                  </div>

                  <h2
                    id="opportunity-drawer-title"
                    className="max-w-[460px] text-xl font-bold leading-tight tracking-[-0.02em] text-white sm:text-2xl"
                  >
                    {item.title}
                  </h2>

                  <div className="mt-2.5 flex min-w-0 items-center gap-2">
                    <div className="flex h-7 w-7 shrink-0 items-center justify-center rounded-lg border border-white/10 bg-white/[0.05]">
                      <Building2
                        className="h-3.5 w-3.5 text-white/55"
                        strokeWidth={1.8}
                      />
                    </div>

                    <span className="truncate text-sm font-medium text-white/60">
                      {item.company}
                    </span>

                    <CircleCheck className="h-3.5 w-3.5 shrink-0 text-emerald-400/70" />
                  </div>
                </motion.div>

                {/* Close */}
                <motion.button
                  type="button"
                  onClick={onClose}
                  aria-label="Close opportunity details"
                  whileHover={
                    prefersReducedMotion
                      ? undefined
                      : {
                          scale: 1.05,
                          rotate: 3,
                        }
                  }
                  whileTap={
                    prefersReducedMotion
                      ? undefined
                      : {
                          scale: 0.92,
                        }
                  }
                  className="group flex h-10 w-10 shrink-0 items-center justify-center rounded-xl border border-white/10 bg-white/[0.04] text-white/45 transition-all duration-200 hover:border-white/20 hover:bg-white/[0.08] hover:text-white focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-blue-400/50"
                >
                  <X className="h-4 w-4 transition-transform duration-200 group-hover:rotate-90" />
                </motion.button>
              </div>

              {/* Quick stats */}
              <motion.div
                variants={staggerContainer}
                initial="hidden"
                animate="visible"
                className="mt-5 grid grid-cols-2 gap-2 sm:grid-cols-4"
              >
                <MetaCard
                  icon={MapPin}
                  label="Location"
                  value={item.location}
                  accent="blue"
                />

                <MetaCard
                  icon={Globe2}
                  label="Work mode"
                  value={item.workMode}
                  accent="violet"
                />

                <MetaCard
                  icon={Wallet}
                  label="Compensation"
                  value={item.salary || "Not listed"}
                  accent="green"
                />

                <MetaCard
                  icon={CalendarDays}
                  label="Deadline"
                  value={formatDate(item.deadline)}
                  accent="orange"
                />
              </motion.div>
            </div>
          </header>

          {/* =================================================
              SCROLLABLE CONTENT
          ================================================= */}

          <main className="min-h-0 flex-1 overflow-y-auto overscroll-contain">
            <div className="p-5 sm:p-6">
              {/* =============================================
                  URGENCY CARD
              ============================================= */}

              {urgency && (
                <motion.section
                  initial={{ opacity: 0, y: 12 }}
                  animate={{ opacity: 1, y: 0 }}
                  transition={{
                    delay: 0.12,
                    duration: 0.4,
                  }}
                  className="relative mb-6 overflow-hidden rounded-2xl border p-4"
                  style={{
                    borderColor: urgency.border,
                    background: urgency.soft,
                  }}
                >
                  {/* Glow */}
                  <div
                    className="pointer-events-none absolute -right-12 -top-12 h-32 w-32 rounded-full blur-3xl"
                    style={{
                      background: urgency.color,
                      opacity: 0.12,
                    }}
                  />

                  <div className="relative">
                    <div className="flex items-center justify-between gap-3">
                      <div className="flex items-center gap-2.5">
                        <div
                          className="flex h-8 w-8 items-center justify-center rounded-xl"
                          style={{
                            background: `${urgency.color}15`,
                            color: urgency.color,
                          }}
                        >
                          <Timer className="h-4 w-4" />
                        </div>

                        <div>
                          <p className="text-xs font-semibold text-white/80">
                            Application urgency
                          </p>

                          <p className="mt-0.5 text-[11px] text-white/40">
                            {urgency.level} priority
                          </p>
                        </div>
                      </div>

                      <span
                        className="text-xs font-semibold"
                        style={{
                          color: urgency.color,
                        }}
                      >
                        {urgency.label}
                      </span>
                    </div>

                    <div className="mt-4 h-1.5 overflow-hidden rounded-full bg-white/10">
                      <motion.div
                        initial={{ width: 0 }}
                        animate={{
                          width: `${urgency.pct}%`,
                        }}
                        transition={{
                          duration: 0.9,
                          delay: 0.35,
                          ease: [0.16, 1, 0.3, 1],
                        }}
                        className="relative h-full rounded-full"
                        style={{
                          background: `linear-gradient(90deg, ${urgency.color}, ${urgency.color}99)`,
                        }}
                      >
                        <div className="absolute right-0 top-1/2 h-2.5 w-2.5 -translate-y-1/2 rounded-full bg-white/90 shadow-lg" />
                      </motion.div>
                    </div>

                    <div className="mt-2 flex items-center justify-between text-[10px] text-white/30">
                      <span>Deadline</span>
                      <span>{formatDate(item.deadline)}</span>
                    </div>
                  </div>
                </motion.section>
              )}

              {/* =============================================
                  OPPORTUNITY OVERVIEW
              ============================================= */}

              <motion.section
                custom={0}
                variants={contentVariants}
                initial="hidden"
                animate="visible"
              >
                <SectionHeading icon={Info}>Overview</SectionHeading>

                <div className="grid grid-cols-1 gap-2 sm:grid-cols-2">
                  <div className="group flex items-center gap-3 rounded-2xl border border-white/[0.07] bg-white/[0.025] p-3.5 transition-colors hover:border-white/[0.13]">
                    <div className="flex h-9 w-9 items-center justify-center rounded-xl bg-white/[0.05]">
                      <BriefcaseBusiness className="h-4 w-4 text-blue-300/80" />
                    </div>

                    <div className="min-w-0">
                      <p className="text-[10px] uppercase tracking-[0.12em] text-white/30">
                        Position
                      </p>

                      <p className="mt-1 truncate text-xs font-medium text-white/70">
                        {item.title}
                      </p>
                    </div>
                  </div>

                  <div className="group flex items-center gap-3 rounded-2xl border border-white/[0.07] bg-white/[0.025] p-3.5 transition-colors hover:border-white/[0.13]">
                    <div className="flex h-9 w-9 items-center justify-center rounded-xl bg-white/[0.05]">
                      <Building2 className="h-4 w-4 text-violet-300/80" />
                    </div>

                    <div className="min-w-0">
                      <p className="text-[10px] uppercase tracking-[0.12em] text-white/30">
                        Company
                      </p>

                      <p className="mt-1 truncate text-xs font-medium text-white/70">
                        {item.company}
                      </p>
                    </div>
                  </div>
                </div>
              </motion.section>

              {/* =============================================
                  DESCRIPTION
              ============================================= */}

              {description && (
                <motion.section
                  custom={1}
                  variants={contentVariants}
                  initial="hidden"
                  animate="visible"
                  className="mt-7"
                >
                  <SectionHeading icon={BriefcaseBusiness}>
                    About this opportunity
                  </SectionHeading>

                  <div className="relative overflow-hidden rounded-2xl border border-white/[0.07] bg-white/[0.025] p-4">
                    <div className="pointer-events-none absolute left-0 top-0 h-full w-[2px] bg-gradient-to-b from-blue-400/60 via-violet-400/30 to-transparent" />

                    <p className="whitespace-pre-line text-sm leading-7 text-white/60">
                      {description}
                    </p>
                  </div>
                </motion.section>
              )}

              {/* =============================================
                  SKILLS
              ============================================= */}

              {skills.length > 0 && (
                <motion.section
                  custom={2}
                  variants={contentVariants}
                  initial="hidden"
                  animate="visible"
                  className="mt-7"
                >
                  <div className="flex items-center justify-between">
                    <SectionHeading icon={Tag}>
                      Skills & requirements
                    </SectionHeading>

                    <span className="mb-3 rounded-full border border-white/10 bg-white/[0.03] px-2 py-1 text-[10px] font-medium text-white/35">
                      {skills.length} {skills.length === 1 ? "skill" : "skills"}
                    </span>
                  </div>

                  <div className="flex flex-wrap gap-2">
                    {skills.map((skill, index) => (
                      <motion.span
                        key={`${skill}-${index}`}
                        initial={
                          prefersReducedMotion
                            ? undefined
                            : {
                                opacity: 0,
                                scale: 0.92,
                                y: 5,
                              }
                        }
                        animate={
                          prefersReducedMotion
                            ? undefined
                            : {
                                opacity: 1,
                                scale: 1,
                                y: 0,
                              }
                        }
                        transition={{
                          delay: 0.2 + index * 0.035,
                          duration: 0.3,
                        }}
                        whileHover={
                          prefersReducedMotion
                            ? undefined
                            : {
                                y: -2,
                                scale: 1.025,
                              }
                        }
                        className="group inline-flex cursor-default items-center gap-1.5 rounded-xl border border-white/[0.09] bg-white/[0.035] px-3 py-2 text-xs font-medium text-white/60 transition-colors duration-200 hover:border-blue-400/25 hover:bg-blue-400/[0.06] hover:text-blue-200"
                      >
                        <span className="h-1.5 w-1.5 rounded-full bg-blue-400/50 transition-colors group-hover:bg-blue-300" />
                        {skill}
                      </motion.span>
                    ))}
                  </div>
                </motion.section>
              )}

              {/* =============================================
                  DETAILS
              ============================================= */}

              <motion.section
                custom={3}
                variants={contentVariants}
                initial="hidden"
                animate="visible"
                className="mt-7"
              >
                <SectionHeading icon={ShieldCheck}>
                  Opportunity details
                </SectionHeading>

                <div className="overflow-hidden rounded-2xl border border-white/[0.07] bg-white/[0.025]">
                  <div className="divide-y divide-white/[0.06]">
                    <div className="flex items-center justify-between gap-4 px-4 py-3.5">
                      <div className="flex items-center gap-3">
                        <MapPin className="h-4 w-4 text-white/30" />
                        <span className="text-xs text-white/40">Location</span>
                      </div>

                      <span className="max-w-[55%] truncate text-right text-xs font-medium text-white/70">
                        {item.location || "Not specified"}
                      </span>
                    </div>

                    <div className="flex items-center justify-between gap-4 px-4 py-3.5">
                      <div className="flex items-center gap-3">
                        <Globe2 className="h-4 w-4 text-white/30" />
                        <span className="text-xs text-white/40">Work mode</span>
                      </div>

                      <span className="max-w-[55%] truncate text-right text-xs font-medium text-white/70">
                        {item.workMode || "Not specified"}
                      </span>
                    </div>

                    <div className="flex items-center justify-between gap-4 px-4 py-3.5">
                      <div className="flex items-center gap-3">
                        <Wallet className="h-4 w-4 text-white/30" />
                        <span className="text-xs text-white/40">
                          Compensation
                        </span>
                      </div>

                      <span className="max-w-[55%] truncate text-right text-xs font-medium text-white/70">
                        {item.salary || "Not listed"}
                      </span>
                    </div>

                    <div className="flex items-center justify-between gap-4 px-4 py-3.5">
                      <div className="flex items-center gap-3">
                        <CalendarDays className="h-4 w-4 text-white/30" />
                        <span className="text-xs text-white/40">Deadline</span>
                      </div>

                      <span className="text-right text-xs font-medium text-white/70">
                        {formatDate(item.deadline)}
                      </span>
                    </div>
                  </div>
                </div>
              </motion.section>

              {/* =============================================
                  SOURCE
              ============================================= */}

              <motion.section
                custom={4}
                variants={contentVariants}
                initial="hidden"
                animate="visible"
                className="mt-7"
              >
                <div className="rounded-2xl border border-white/[0.07] bg-gradient-to-br from-white/[0.035] to-transparent p-4">
                  <div className="flex items-start gap-3">
                    <div className="flex h-9 w-9 shrink-0 items-center justify-center rounded-xl border border-emerald-400/10 bg-emerald-400/[0.06]">
                      <ShieldCheck className="h-4 w-4 text-emerald-300/70" />
                    </div>

                    <div className="min-w-0 flex-1">
                      <div className="flex items-center justify-between gap-3">
                        <p className="text-xs font-semibold text-white/70">
                          Opportunity source
                        </p>

                        <span className="inline-flex items-center gap-1 text-[10px] font-medium text-emerald-300/70">
                          <CircleCheck className="h-3 w-3" />
                          Verified source
                        </span>
                      </div>

                      <p className="mt-1 text-xs text-white/40">
                        {item.source || "Unknown source"}
                      </p>

                      <p className="mt-2 text-[10px] text-white/25">
                        Last fetched {formatFetchedDate(item.fetchedAt)}
                      </p>
                    </div>
                  </div>
                </div>
              </motion.section>

              {/* Bottom spacing for mobile */}
              <div className="h-5" />
            </div>
          </main>

          {/* =================================================
              FOOTER
          ================================================= */}

          <footer className="relative shrink-0 border-t border-white/[0.08] bg-[#090f1c]/95 p-4 backdrop-blur-2xl sm:p-5">
            {/* Footer glow */}
            <div className="pointer-events-none absolute inset-x-0 bottom-0 h-24 bg-gradient-to-t from-blue-500/[0.035] to-transparent" />

            <div className="relative">
              {/* Error */}
              <AnimatePresence>
                {saveState === "error" && (
                  <motion.div
                    initial={{
                      opacity: 0,
                      height: 0,
                      y: -5,
                    }}
                    animate={{
                      opacity: 1,
                      height: "auto",
                      y: 0,
                    }}
                    exit={{
                      opacity: 0,
                      height: 0,
                      y: -5,
                    }}
                    className="mb-3 overflow-hidden"
                  >
                    <div className="rounded-xl border border-red-400/15 bg-red-400/[0.06] px-3 py-2.5 text-xs text-red-300/80">
                      Couldn't save this opportunity. Please try again.
                    </div>
                  </motion.div>
                )}
              </AnimatePresence>

              {/* CTA */}
              <div className="flex gap-2.5">
                {/* Save */}
                <motion.button
                  type="button"
                  onClick={handleSave}
                  disabled={saveState === "saving" || saveState === "saved"}
                  whileHover={
                    prefersReducedMotion
                      ? undefined
                      : {
                          y: -2,
                        }
                  }
                  whileTap={
                    prefersReducedMotion
                      ? undefined
                      : {
                          scale: 0.97,
                        }
                  }
                  className={`group relative flex min-w-0 flex-1 items-center justify-center gap-2 overflow-hidden rounded-xl border py-3 text-xs font-semibold transition-all duration-300 focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-blue-400/50 ${
                    saveState === "saved"
                      ? "border-pink-400/20 bg-pink-400/[0.08] text-pink-300"
                      : "border-white/10 bg-white/[0.06] text-white/75 hover:border-white/20 hover:bg-white/[0.10] hover:text-white"
                  }`}
                >
                  {saveState === "saved" && !prefersReducedMotion && (
                    <motion.span
                      initial={{
                        scale: 0,
                        opacity: 0.5,
                      }}
                      animate={{
                        scale: 3,
                        opacity: 0,
                      }}
                      transition={{
                        duration: 0.55,
                        ease: "easeOut",
                      }}
                      className="absolute h-8 w-8 rounded-full bg-pink-400/30"
                    />
                  )}

                  {saveState === "saving" ? (
                    <Loader2 className="h-4 w-4 animate-spin" />
                  ) : (
                    <motion.span
                      animate={
                        saveState === "saved" && !prefersReducedMotion
                          ? {
                              scale: [1, 1.3, 1],
                            }
                          : {
                              scale: 1,
                            }
                      }
                      transition={{
                        duration: 0.4,
                      }}
                    >
                      <Heart
                        className="h-4 w-4"
                        fill={saveState === "saved" ? "currentColor" : "none"}
                      />
                    </motion.span>
                  )}

                  <span>
                    {saveState === "saving"
                      ? "Saving..."
                      : saveState === "saved"
                        ? "Saved"
                        : "Save"}
                  </span>
                </motion.button>

                {/* Copy */}
                <motion.button
                  type="button"
                  onClick={handleCopyLink}
                  disabled={!item.applyUrl}
                  aria-label="Copy application link"
                  title="Copy application link"
                  whileHover={
                    prefersReducedMotion
                      ? undefined
                      : {
                          y: -2,
                        }
                  }
                  whileTap={
                    prefersReducedMotion
                      ? undefined
                      : {
                          scale: 0.94,
                        }
                  }
                  className="group flex h-[44px] w-[44px] shrink-0 items-center justify-center rounded-xl border border-white/10 bg-white/[0.06] text-white/50 transition-all duration-200 hover:border-white/20 hover:bg-white/[0.10] hover:text-white disabled:cursor-not-allowed disabled:opacity-40 focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-blue-400/50"
                >
                  <AnimatePresence mode="wait" initial={false}>
                    {copyState === "copied" ? (
                      <motion.div
                        key="check"
                        initial={{
                          opacity: 0,
                          scale: 0.6,
                        }}
                        animate={{
                          opacity: 1,
                          scale: 1,
                        }}
                        exit={{
                          opacity: 0,
                          scale: 0.6,
                        }}
                      >
                        <Check className="h-4 w-4 text-emerald-400" />
                      </motion.div>
                    ) : (
                      <motion.div
                        key="copy"
                        initial={{
                          opacity: 0,
                          scale: 0.6,
                        }}
                        animate={{
                          opacity: 1,
                          scale: 1,
                        }}
                        exit={{
                          opacity: 0,
                          scale: 0.6,
                        }}
                      >
                        <Copy className="h-4 w-4" />
                      </motion.div>
                    )}
                  </AnimatePresence>
                </motion.button>

                {/* Apply */}
                <motion.a
                  href={item.applyUrl || "#"}
                  target="_blank"
                  rel="noopener noreferrer"
                  aria-disabled={!item.applyUrl}
                  onClick={(event) => {
                    if (!item.applyUrl) {
                      event.preventDefault();
                    }
                  }}
                  whileHover={
                    prefersReducedMotion
                      ? undefined
                      : {
                          y: -2,
                        }
                  }
                  whileTap={
                    prefersReducedMotion
                      ? undefined
                      : {
                          scale: 0.975,
                        }
                  }
                  className={`group relative flex flex-[1.4] items-center justify-center gap-2 overflow-hidden rounded-xl py-3 text-xs font-bold transition-all duration-300 focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-blue-400/50 ${
                    item.applyUrl
                      ? "bg-white text-[#080d18] shadow-[0_8px_30px_rgba(255,255,255,0.08)] hover:bg-blue-50"
                      : "cursor-not-allowed bg-white/10 text-white/30"
                  }`}
                >
                  {item.applyUrl && (
                    <motion.span
                      initial={{ x: "-120%" }}
                      animate={{
                        x: "120%",
                      }}
                      transition={{
                        duration: 2.4,
                        repeat: Infinity,
                        repeatDelay: 3,
                        ease: "easeInOut",
                      }}
                      className="pointer-events-none absolute inset-y-0 w-20 -skew-x-12 bg-gradient-to-r from-transparent via-white/30 to-transparent"
                    />
                  )}

                  <span className="relative">Apply now</span>

                  <ArrowUpRight
                    className="relative h-4 w-4 transition-transform duration-200 group-hover:-translate-y-0.5 group-hover:translate-x-0.5"
                    strokeWidth={2.2}
                  />
                </motion.a>
              </div>

              {/* Footer hint */}
              <div className="mt-3 flex items-center justify-center gap-1.5 text-[10px] text-white/25">
                <Sparkles className="h-3 w-3" />

                <span>Review the opportunity carefully before applying</span>

                <ChevronRight className="h-3 w-3" />
              </div>
            </div>
          </footer>
        </motion.aside>
      </motion.div>
    </AnimatePresence>
  );
};

export default OpportunityDrawer;
