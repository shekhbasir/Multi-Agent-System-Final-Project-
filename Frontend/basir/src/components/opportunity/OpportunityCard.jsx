import { motion, useReducedMotion } from "framer-motion";
import {
  ArrowUpRight,
  BriefcaseBusiness,
  Building2,
  CalendarDays,
  CheckCircle2,
  Clock3,
  Code2,
  ExternalLink,
  Flame,
  Globe2,
  GraduationCap,
  Heart,
  MapPin,
  Rocket,
  Sparkles,
  Star,
  Trophy,
  Users,
  Wallet,
  Zap,
} from "lucide-react";

/* =========================================================
   DATE HELPERS
========================================================= */

const safeDate = (value) => {
  if (!value) return null;

  const date = new Date(value);

  return Number.isNaN(date.getTime()) ? null : date;
};

const formatDate = (value) => {
  const date = safeDate(value);

  if (!date) return null;

  return date.toLocaleDateString(undefined, {
    month: "short",
    day: "numeric",
    year: "numeric",
  });
};

/* =========================================================
   DEADLINE META
========================================================= */

const getDeadlineMeta = (deadline) => {
  const date = safeDate(deadline);

  if (!date) return null;

  const now = new Date();

  const days = Math.ceil((date.getTime() - now.getTime()) / 86400000);

  if (days < 0) {
    return {
      days,
      label: "Expired",
      urgency: "expired",
      color: "text-white/35",
      bg: "bg-white/[0.04]",
      border: "border-white/[0.08]",
      dot: "bg-white/25",
    };
  }

  if (days === 0) {
    return {
      days,
      label: "Ends today",
      urgency: "critical",
      color: "text-red-300",
      bg: "bg-red-500/10",
      border: "border-red-400/25",
      dot: "bg-red-400",
    };
  }

  if (days === 1) {
    return {
      days,
      label: "1 day left",
      urgency: "critical",
      color: "text-red-300",
      bg: "bg-red-500/10",
      border: "border-red-400/25",
      dot: "bg-red-400",
    };
  }

  if (days < 3) {
    return {
      days,
      label: `${days} days left`,
      urgency: "critical",
      color: "text-red-300",
      bg: "bg-red-500/10",
      border: "border-red-400/25",
      dot: "bg-red-400",
    };
  }

  if (days < 7) {
    return {
      days,
      label: `${days} days left`,
      urgency: "high",
      color: "text-orange-300",
      bg: "bg-orange-500/10",
      border: "border-orange-400/25",
      dot: "bg-orange-400",
    };
  }

  if (days < 14) {
    return {
      days,
      label: `${days} days left`,
      urgency: "medium",
      color: "text-yellow-300",
      bg: "bg-yellow-500/10",
      border: "border-yellow-400/25",
      dot: "bg-yellow-400",
    };
  }

  return {
    days,
    label: `${days} days left`,
    urgency: "safe",
    color: "text-emerald-300",
    bg: "bg-emerald-500/10",
    border: "border-emerald-400/25",
    dot: "bg-emerald-400",
  };
};

/* =========================================================
   TYPE META
========================================================= */

const getTypeMeta = (type) => {
  const normalized = String(type || "")
    .toLowerCase()
    .trim();

  const configs = {
    job: {
      label: "Job",
      icon: BriefcaseBusiness,
      iconBg: "bg-blue-500/15",
      iconColor: "text-blue-300",
      className: "border-blue-400/25 bg-blue-500/10 text-blue-300",
      glow: "rgba(59,130,246,0.18)",
    },

    internship: {
      label: "Internship",
      icon: GraduationCap,
      iconBg: "bg-violet-500/15",
      iconColor: "text-violet-300",
      className: "border-violet-400/25 bg-violet-500/10 text-violet-300",
      glow: "rgba(139,92,246,0.18)",
    },

    hackathon: {
      label: "Hackathon",
      icon: Trophy,
      iconBg: "bg-amber-500/15",
      iconColor: "text-amber-300",
      className: "border-amber-400/25 bg-amber-500/10 text-amber-300",
      glow: "rgba(245,158,11,0.18)",
    },

    competition: {
      label: "Competition",
      icon: Trophy,
      iconBg: "bg-pink-500/15",
      iconColor: "text-pink-300",
      className: "border-pink-400/25 bg-pink-500/10 text-pink-300",
      glow: "rgba(236,72,153,0.18)",
    },

    event: {
      label: "Event",
      icon: CalendarDays,
      iconBg: "bg-cyan-500/15",
      iconColor: "text-cyan-300",
      className: "border-cyan-400/25 bg-cyan-500/10 text-cyan-300",
      glow: "rgba(6,182,212,0.18)",
    },

    scholarship: {
      label: "Scholarship",
      icon: Wallet,
      iconBg: "bg-emerald-500/15",
      iconColor: "text-emerald-300",
      className: "border-emerald-400/25 bg-emerald-500/10 text-emerald-300",
      glow: "rgba(16,185,129,0.18)",
    },

    fellowship: {
      label: "Fellowship",
      icon: Sparkles,
      iconBg: "bg-indigo-500/15",
      iconColor: "text-indigo-300",
      className: "border-indigo-400/25 bg-indigo-500/10 text-indigo-300",
      glow: "rgba(99,102,241,0.18)",
    },

    workshop: {
      label: "Workshop",
      icon: Sparkles,
      iconBg: "bg-orange-500/15",
      iconColor: "text-orange-300",
      className: "border-orange-400/25 bg-orange-500/10 text-orange-300",
      glow: "rgba(249,115,22,0.18)",
    },

    "career-fair": {
      label: "Career Fair",
      icon: Users,
      iconBg: "bg-teal-500/15",
      iconColor: "text-teal-300",
      className: "border-teal-400/25 bg-teal-500/10 text-teal-300",
      glow: "rgba(20,184,166,0.18)",
    },

    freelance: {
      label: "Freelance",
      icon: BriefcaseBusiness,
      iconBg: "bg-fuchsia-500/15",
      iconColor: "text-fuchsia-300",
      className: "border-fuchsia-400/25 bg-fuchsia-500/10 text-fuchsia-300",
      glow: "rgba(217,70,239,0.18)",
    },
  };

  return (
    configs[normalized] || {
      label: type || "Opportunity",
      icon: Sparkles,
      iconBg: "bg-white/[0.06]",
      iconColor: "text-white/60",
      className: "border-white/10 bg-white/[0.05] text-white/60",
      glow: "rgba(148,163,184,0.12)",
    }
  );
};

/* =========================================================
   TYPE BADGE
========================================================= */

const TypeBadge = ({ type }) => {
  const meta = getTypeMeta(type);
  const Icon = meta.icon;

  return (
    <motion.div
      whileHover={{ y: -2 }}
      className={`
        inline-flex
        items-center
        gap-1.5
        rounded-full
        border
        px-2.5
        py-1.5
        text-[10px]
        font-bold
        uppercase
        tracking-[0.09em]
        ${meta.className}
      `}
    >
      <Icon className="h-3.5 w-3.5" strokeWidth={2.2} />

      {meta.label}
    </motion.div>
  );
};

/* =========================================================
   MATCH SCORE
========================================================= */

const MatchScore = ({ score, reducedMotion }) => {
  if (typeof score !== "number") return null;

  const safeScore = Math.max(0, Math.min(100, Math.round(score)));

  const scoreColor =
    safeScore >= 85
      ? "text-emerald-300"
      : safeScore >= 70
        ? "text-cyan-300"
        : safeScore >= 50
          ? "text-yellow-300"
          : "text-orange-300";

  const ringColor =
    safeScore >= 85
      ? "rgba(52,211,153,0.95)"
      : safeScore >= 70
        ? "rgba(34,211,238,0.95)"
        : safeScore >= 50
          ? "rgba(250,204,21,0.95)"
          : "rgba(251,146,60,0.95)";

  return (
    <div
      className="
        relative
        flex
        shrink-0
        items-center
        gap-2
        rounded-full
        border
        border-white/10
        bg-black/20
        px-2
        py-1
        backdrop-blur-md
      "
    >
      <div className="relative h-7 w-7">
        <svg viewBox="0 0 36 36" className="-rotate-90 h-7 w-7">
          <circle
            cx="18"
            cy="18"
            r="14"
            fill="none"
            stroke="currentColor"
            strokeWidth="3"
            className="text-white/[0.07]"
          />

          <motion.circle
            cx="18"
            cy="18"
            r="14"
            fill="none"
            stroke={ringColor}
            strokeWidth="3"
            strokeLinecap="round"
            strokeDasharray={`${safeScore * 0.88} 100`}
            initial={reducedMotion ? false : { strokeDasharray: "0 100" }}
            animate={{
              strokeDasharray: `${safeScore * 0.88} 100`,
            }}
            transition={{
              duration: 0.9,
              ease: "easeOut",
            }}
          />
        </svg>

        <span
          className={`
            absolute
            inset-0
            flex
            items-center
            justify-center
            text-[8px]
            font-bold
            ${scoreColor}
          `}
        >
          {safeScore}
        </span>
      </div>

      <div className="hidden sm:block">
        <p className={`text-[10px] font-bold ${scoreColor}`}>Great match</p>

        <p className="text-[9px] text-white/30">AI relevance</p>
      </div>

      <Flame className={`h-3.5 w-3.5 ${scoreColor}`} strokeWidth={2.2} />
    </div>
  );
};

/* =========================================================
   DEADLINE BADGE
========================================================= */

const DeadlineBadge = ({ deadline, reducedMotion }) => {
  const meta = getDeadlineMeta(deadline);

  if (!meta) return null;

  return (
    <motion.div
      initial={reducedMotion ? false : { opacity: 0, scale: 0.9 }}
      animate={{ opacity: 1, scale: 1 }}
      whileHover={reducedMotion ? undefined : { y: -2 }}
      className={`
        inline-flex
        shrink-0
        items-center
        gap-1.5
        rounded-full
        border
        px-2.5
        py-1.5
        text-[10px]
        font-semibold
        ${meta.border}
        ${meta.bg}
        ${meta.color}
      `}
    >
      <span
        className={`
          h-1.5
          w-1.5
          rounded-full
          ${meta.dot}
          ${meta.urgency === "critical" ? "animate-pulse" : ""}
        `}
      />

      <Clock3 className="h-3 w-3" strokeWidth={2.2} />

      {meta.label}
    </motion.div>
  );
};

/* =========================================================
   COMPANY AVATAR
========================================================= */

const CompanyAvatar = ({ item, reducedMotion }) => {
  return (
    <motion.div
      whileHover={
        reducedMotion
          ? undefined
          : {
              scale: 1.05,
              rotate: 2,
            }
      }
      className="
        relative
        flex
        h-12
        w-12
        shrink-0
        items-center
        justify-center
        overflow-hidden
        rounded-2xl
        border
        border-white/10
        bg-gradient-to-br
        from-white/[0.10]
        to-white/[0.025]
        shadow-[inset_0_1px_0_rgba(255,255,255,0.08)]
      "
    >
      {item.companyLogo ? (
        <img
          src={item.companyLogo}
          alt=""
          className="h-full w-full object-cover"
          loading="lazy"
          onError={(event) => {
            event.currentTarget.style.display = "none";
          }}
        />
      ) : (
        <Building2 className="h-5 w-5 text-white/35" strokeWidth={1.7} />
      )}

      <div
        className="
          pointer-events-none
          absolute
          inset-0
          bg-gradient-to-br
          from-white/10
          via-transparent
          to-transparent
        "
      />
    </motion.div>
  );
};

/* =========================================================
   META CHIP
========================================================= */

const MetaChip = ({ icon: Icon, children, color = "text-white/55" }) => {
  if (!children) return null;

  return (
    <div
      className="
        inline-flex
        max-w-full
        items-center
        gap-1.5
        rounded-xl
        border
        border-white/[0.07]
        bg-white/[0.025]
        px-2.5
        py-1.5
        text-[10px]
        font-medium
        transition-all
        duration-200
        hover:border-white/[0.14]
        hover:bg-white/[0.05]
      "
    >
      <Icon className={`h-3.5 w-3.5 shrink-0 ${color}`} strokeWidth={2} />

      <span className="truncate text-white/50">{children}</span>
    </div>
  );
};

/* =========================================================
   SKILL CHIP
========================================================= */

const SkillChip = ({ skill, index, reducedMotion }) => {
  return (
    <motion.span
      initial={
        reducedMotion
          ? false
          : {
              opacity: 0,
              y: 4,
            }
      }
      animate={{
        opacity: 1,
        y: 0,
      }}
      transition={{
        delay: reducedMotion ? 0 : index * 0.035,
      }}
      whileHover={
        reducedMotion
          ? undefined
          : {
              y: -3,
              scale: 1.04,
            }
      }
      className="
        inline-flex
        items-center
        gap-1
        rounded-lg
        border
        border-white/[0.08]
        bg-white/[0.035]
        px-2
        py-1.5
        text-[10px]
        font-medium
        text-white/55
        shadow-[inset_0_1px_0_rgba(255,255,255,0.03)]
        transition-colors
        duration-200
        hover:border-cyan-400/20
        hover:bg-cyan-400/[0.06]
        hover:text-cyan-200
      "
    >
      <Code2 className="h-3 w-3 text-white/25" strokeWidth={2} />

      {skill}
    </motion.span>
  );
};

/* =========================================================
   MAIN OPPORTUNITY CARD
========================================================= */

const OpportunityCard = ({ item, onOpen }) => {
  const prefersReducedMotion = useReducedMotion();

  const typeMeta = getTypeMeta(item.type);
  const deadlineMeta = getDeadlineMeta(item.deadline);

  const visibleSkills = Array.isArray(item.skills)
    ? item.skills.slice(0, 4)
    : [];

  const remainingSkillsCount = Math.max(
    0,
    (item.skills?.length || 0) - visibleSkills.length,
  );

  const handleKeyDown = (event) => {
    if (event.key === "Enter" || event.key === " ") {
      event.preventDefault();
      onOpen?.();
    }
  };

  const cardInitial = prefersReducedMotion
    ? false
    : {
        opacity: 0,
        y: 18,
        scale: 0.985,
      };

  const cardAnimate = {
    opacity: 1,
    y: 0,
    scale: 1,
  };

  return (
    <motion.article
      initial={cardInitial}
      animate={cardAnimate}
      transition={{
        duration: 0.55,
        ease: [0.16, 1, 0.3, 1],
      }}
      whileHover={
        prefersReducedMotion
          ? undefined
          : {
              y: -7,
              transition: {
                duration: 0.25,
                ease: "easeOut",
              },
            }
      }
      whileTap={
        prefersReducedMotion
          ? undefined
          : {
              scale: 0.985,
            }
      }
      role="button"
      tabIndex={0}
      onClick={onOpen}
      onKeyDown={handleKeyDown}
      aria-label={`Open ${item.title} at ${item.company}`}
      style={{
        "--card-glow": typeMeta.glow,
      }}
      className="
        group
        relative
        isolate
        flex
        min-h-[365px]
        cursor-pointer
        flex-col
        overflow-hidden
        rounded-[26px]
        border
        border-white/[0.09]
        bg-[#0a1020]/95
        p-5
        shadow-[0_12px_45px_rgba(0,0,0,0.18)]
        backdrop-blur-2xl
        transition-all
        duration-500
        hover:border-white/[0.18]
        hover:bg-[#0d1528]
        hover:shadow-[0_25px_80px_rgba(0,0,0,0.35)]
        focus-visible:outline-none
        focus-visible:ring-2
        focus-visible:ring-cyan-400/60
        focus-visible:ring-offset-2
        focus-visible:ring-offset-[#070b14]
      "
    >
      {/* =====================================================
          AMBIENT COLOR GLOW
      ====================================================== */}

      <div
        aria-hidden="true"
        className="
          pointer-events-none
          absolute
          -right-24
          -top-24
          h-56
          w-56
          rounded-full
          bg-[var(--card-glow)]
          blur-[70px]
          opacity-50
          transition-all
          duration-700
          group-hover:scale-125
          group-hover:opacity-100
        "
      />

      <div
        aria-hidden="true"
        className="
          pointer-events-none
          absolute
          -bottom-32
          -left-24
          h-64
          w-64
          rounded-full
          bg-violet-500/[0.035]
          blur-[80px]
          transition-all
          duration-700
          group-hover:bg-violet-500/[0.08]
        "
      />

      {/* =====================================================
          TOP SHINE
      ====================================================== */}

      <div
        aria-hidden="true"
        className="
          pointer-events-none
          absolute
          inset-x-0
          top-0
          h-px
          bg-gradient-to-r
          from-transparent
          via-white/30
          to-transparent
          opacity-50
          transition-opacity
          duration-500
          group-hover:opacity-100
        "
      />

      {/* =====================================================
          MOVING LIGHT
      ====================================================== */}

      {!prefersReducedMotion && (
        <motion.div
          aria-hidden="true"
          className="
            pointer-events-none
            absolute
            -left-1/2
            top-0
            h-full
            w-1/3
            rotate-[18deg]
            bg-gradient-to-r
            from-transparent
            via-white/[0.035]
            to-transparent
            opacity-0
            blur-xl
            group-hover:animate-[shine_1.3s_ease-in-out]
            group-hover:opacity-100
          "
        />
      )}

      {/* =====================================================
          TOP HEADER
      ====================================================== */}

      <div className="relative z-10 flex items-center justify-between gap-3">
        <TypeBadge type={item.type} />

        <div className="flex items-center gap-2">
          {item.isFeatured && (
            <motion.div
              animate={
                prefersReducedMotion
                  ? undefined
                  : {
                      scale: [1, 1.05, 1],
                    }
              }
              transition={{
                duration: 2,
                repeat: Infinity,
              }}
              className="
                hidden
                items-center
                gap-1
                rounded-full
                border
                border-amber-400/20
                bg-amber-400/10
                px-2
                py-1
                text-[9px]
                font-bold
                text-amber-300
                sm:inline-flex
              "
            >
              <Star className="h-3 w-3" fill="currentColor" />
              FEATURED
            </motion.div>
          )}

          <MatchScore
            score={item.matchScore}
            reducedMotion={prefersReducedMotion}
          />
        </div>
      </div>

      {/* =====================================================
          COMPANY / TITLE
      ====================================================== */}

      <div className="relative z-10 mt-5">
        <div className="flex items-start gap-3">
          <CompanyAvatar item={item} reducedMotion={prefersReducedMotion} />

          <div className="min-w-0 flex-1">
            <h3
              title={item.title}
              className="
                line-clamp-2
                text-[16px]
                font-bold
                leading-[1.35]
                tracking-[-0.015em]
                text-white
                transition-all
                duration-300
                group-hover:text-cyan-50
              "
            >
              {item.title}
            </h3>

            <div className="mt-1.5 flex min-w-0 items-center gap-1.5">
              <Building2
                className="h-3.5 w-3.5 shrink-0 text-white/30"
                strokeWidth={2}
              />

              <span className="truncate text-xs font-medium text-white/45">
                {item.company || "Unknown company"}
              </span>

              {item.verified && (
                <CheckCircle2
                  className="h-3.5 w-3.5 shrink-0 text-cyan-400"
                  fill="rgba(34,211,238,0.12)"
                />
              )}
            </div>
          </div>

          {/* =================================================
              ARROW
          ================================================= */}

          <motion.div
            whileHover={
              prefersReducedMotion
                ? undefined
                : {
                    scale: 1.12,
                    rotate: 6,
                  }
            }
            className="
              flex
              h-9
              w-9
              shrink-0
              items-center
              justify-center
              rounded-full
              border
              border-white/[0.08]
              bg-white/[0.025]
              text-white/25
              opacity-60
              transition-all
              duration-300
              group-hover:border-cyan-400/20
              group-hover:bg-cyan-400/[0.07]
              group-hover:text-cyan-200
              group-hover:opacity-100
            "
          >
            <ArrowUpRight className="h-4 w-4" strokeWidth={2} />
          </motion.div>
        </div>
      </div>

      {/* =====================================================
          QUICK INFO
      ====================================================== */}

      <div className="relative z-10 mt-4 flex flex-wrap gap-2">
        <MetaChip icon={MapPin} color="text-blue-300/70">
          {item.location || "Location unspecified"}
        </MetaChip>

        <MetaChip icon={Globe2} color="text-cyan-300/70">
          {item.workMode || "Flexible"}
        </MetaChip>

        {item.salary && (
          <MetaChip icon={Wallet} color="text-emerald-300/70">
            {item.salary}
          </MetaChip>
        )}
      </div>

      {/* =====================================================
          DESCRIPTION
      ====================================================== */}

      {item.description && (
        <div className="relative z-10 mt-4">
          <p
            className="
              line-clamp-2
              text-[11px]
              leading-[1.7]
              text-white/40
            "
          >
            {item.description}
          </p>
        </div>
      )}

      {/* =====================================================
          SKILLS
      ====================================================== */}

      {visibleSkills.length > 0 && (
        <div className="relative z-10 mt-4">
          <div className="mb-2 flex items-center gap-1.5">
            <Code2 className="h-3 w-3 text-white/25" strokeWidth={2} />

            <span className="text-[9px] font-bold uppercase tracking-[0.12em] text-white/25">
              Skills
            </span>
          </div>

          <div className="flex flex-wrap gap-1.5">
            {visibleSkills.map((skill, index) => (
              <SkillChip
                key={`${skill}-${index}`}
                skill={skill}
                index={index}
                reducedMotion={prefersReducedMotion}
              />
            ))}

            {remainingSkillsCount > 0 && (
              <motion.span
                whileHover={
                  prefersReducedMotion
                    ? undefined
                    : {
                        y: -2,
                      }
                }
                className="
                  inline-flex
                  items-center
                  rounded-lg
                  border
                  border-white/[0.07]
                  bg-white/[0.02]
                  px-2
                  py-1.5
                  text-[10px]
                  font-semibold
                  text-white/30
                "
              >
                +{remainingSkillsCount} more
              </motion.span>
            )}
          </div>
        </div>
      )}

      {/* =====================================================
          AI MATCH BAR
      ====================================================== */}

      {typeof item.matchScore === "number" && (
        <div className="relative z-10 mt-4">
          <div className="mb-1.5 flex items-center justify-between">
            <div className="flex items-center gap-1.5">
              <Sparkles className="h-3 w-3 text-cyan-300" strokeWidth={2} />

              <span className="text-[9px] font-semibold text-white/30">
                AI opportunity match
              </span>
            </div>

            <span className="text-[9px] font-bold text-cyan-300/70">
              {Math.round(Math.max(0, Math.min(100, item.matchScore)))}%
            </span>
          </div>

          <div className="h-1 overflow-hidden rounded-full bg-white/[0.06]">
            <motion.div
              initial={
                prefersReducedMotion
                  ? false
                  : {
                      width: 0,
                    }
              }
              animate={{
                width: `${Math.max(0, Math.min(100, item.matchScore))}%`,
              }}
              transition={{
                duration: 1,
                delay: 0.2,
                ease: [0.16, 1, 0.3, 1],
              }}
              className="
                relative
                h-full
                rounded-full
                bg-gradient-to-r
                from-blue-500
                via-cyan-400
                to-violet-400
              "
            >
              <span
                className="
                  absolute
                  right-0
                  top-1/2
                  h-2
                  w-2
                  -translate-y-1/2
                  rounded-full
                  bg-white
                  shadow-[0_0_10px_rgba(255,255,255,0.8)]
                "
              />
            </motion.div>
          </div>
        </div>
      )}

      {/* =====================================================
          BOTTOM FOOTER
      ====================================================== */}

      <div
        className="
          relative
          z-10
          mt-auto
          flex
          items-end
          justify-between
          gap-3
          border-t
          border-white/[0.06]
          pt-4
        "
      >
        <div className="min-w-0">
          <div className="flex items-center gap-1.5">
            <span
              className="
                relative
                flex
                h-2
                w-2
                items-center
                justify-center
              "
            >
              <span
                className="
                  absolute
                  h-2
                  w-2
                  animate-ping
                  rounded-full
                  bg-emerald-400/30
                "
              />

              <span
                className="
                  relative
                  h-1.5
                  w-1.5
                  rounded-full
                  bg-emerald-400
                  shadow-[0_0_8px_rgba(52,211,153,0.6)]
                "
              />
            </span>

            <span className="truncate text-[9px] font-semibold text-white/30">
              {item.source || "External source"}
            </span>
          </div>

          {item.postedAt && (
            <div className="mt-1.5 flex items-center gap-1.5">
              <CalendarDays className="h-3 w-3 text-white/20" strokeWidth={2} />

              <span className="text-[9px] text-white/25">
                Posted {formatDate(item.postedAt)}
              </span>
            </div>
          )}
        </div>

        <div className="flex items-center gap-2">
          {deadlineMeta?.urgency === "critical" && (
            <motion.div
              animate={
                prefersReducedMotion
                  ? undefined
                  : {
                      scale: [1, 1.06, 1],
                    }
              }
              transition={{
                duration: 1.5,
                repeat: Infinity,
              }}
              className="
                hidden
                items-center
                gap-1
                rounded-full
                border
                border-red-400/20
                bg-red-400/[0.06]
                px-2
                py-1
                text-[9px]
                font-bold
                text-red-300
                sm:inline-flex
              "
            >
              <Zap className="h-3 w-3" fill="currentColor" />
              URGENT
            </motion.div>
          )}

          <DeadlineBadge
            deadline={item.deadline}
            reducedMotion={prefersReducedMotion}
          />
        </div>
      </div>

      {/* =====================================================
          HOVER BORDER
      ====================================================== */}

      <div
        aria-hidden="true"
        className="
          pointer-events-none
          absolute
          inset-0
          rounded-[26px]
          border
          border-cyan-400/0
          transition-all
          duration-500
          group-hover:border-cyan-400/[0.10]
        "
      />

      {/* =====================================================
          BOTTOM CTA HINT
      ====================================================== */}

      <div
        className="
          pointer-events-none
          absolute
          bottom-0
          left-1/2
          h-[2px]
          w-0
          -translate-x-1/2
          rounded-full
          bg-gradient-to-r
          from-blue-400
          via-cyan-400
          to-violet-400
          opacity-0
          shadow-[0_0_15px_rgba(34,211,238,0.5)]
          transition-all
          duration-500
          group-hover:w-1/2
          group-hover:opacity-100
        "
      />

      {/* =====================================================
          CORNER SPARK
      ====================================================== */}

      {!prefersReducedMotion && (
        <motion.div
          aria-hidden="true"
          className="
            pointer-events-none
            absolute
            right-5
            bottom-5
            h-1
            w-1
            rounded-full
            bg-cyan-300
            opacity-0
            shadow-[0_0_10px_rgba(103,232,249,0.9)]
            transition-opacity
            duration-300
            group-hover:opacity-100
          "
          animate={{
            y: [0, -8, 0],
            opacity: [0.25, 1, 0.25],
          }}
          transition={{
            duration: 2,
            repeat: Infinity,
            ease: "easeInOut",
          }}
        />
      )}
    </motion.article>
  );
};

export default OpportunityCard;
