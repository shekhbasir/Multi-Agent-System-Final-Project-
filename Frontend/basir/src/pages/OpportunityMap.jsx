import { useEffect, useState, useCallback, useMemo } from "react";
import { Link } from "react-router-dom";
import OpportunityGlobe3D from "../components/opportunity/OpportunityGlobe3D";
import OpportunityAssistant from "../components/opportunity/OpportunityAssistant";
import OpportunityAlerts from "../components/opportunity/OpportunityAlerts";
import SoundToggle from "../components/opportunity/SoundToggle";
import opportunityApi from "../config/opportunityApi";
import OpportunityCard from "../components/opportunity/OpportunityCard";
import OpportunityFilters from "../components/opportunity/OpportunityFilters";
import OpportunityDrawer from "../components/opportunity/OpportunityDrawer";

const PAGE_SIZE = 30;

const CATEGORIES = [
  { key: "", label: "All", emoji: "🌐", accent: "#8CA0B3" },
  { key: "job", label: "Jobs", emoji: "💼", accent: "#5B8DEF" },
  { key: "internship", label: "Internships", emoji: "🎓", accent: "#A78BFA" },
  { key: "hackathon", label: "Hackathons", emoji: "🏆", accent: "#F2A93B" },
  { key: "event", label: "Events", emoji: "🎤", accent: "#F472B6" },
  { key: "scholarship", label: "Scholarships", emoji: "💰", accent: "#3DDC97" },
];

/* ============================================================
   ICONS
============================================================ */

const IconHome = (props) => (
  <svg
    viewBox="0 0 24 24"
    fill="none"
    stroke="currentColor"
    strokeWidth="1.8"
    strokeLinecap="round"
    strokeLinejoin="round"
    {...props}
  >
    <path d="M3 11.5 12 4l9 7.5" />
    <path d="M5.5 10v9a1 1 0 0 0 1 1H10v-5.5a1 1 0 0 1 1-1h2a1 1 0 0 1 1 1V20h3.5a1 1 0 0 0 1-1v-9" />
  </svg>
);

const IconSearch = (props) => (
  <svg
    viewBox="0 0 24 24"
    fill="none"
    stroke="currentColor"
    strokeWidth="1.8"
    strokeLinecap="round"
    strokeLinejoin="round"
    {...props}
  >
    <circle cx="10.5" cy="10.5" r="6.5" />
    <path d="m20 20-4.8-4.8" />
  </svg>
);

const IconX = (props) => (
  <svg
    viewBox="0 0 24 24"
    fill="none"
    stroke="currentColor"
    strokeWidth="1.8"
    strokeLinecap="round"
    strokeLinejoin="round"
    {...props}
  >
    <path d="M5 5l14 14M19 5 5 19" />
  </svg>
);

const IconCheck = (props) => (
  <svg
    viewBox="0 0 24 24"
    fill="none"
    stroke="currentColor"
    strokeWidth="2"
    strokeLinecap="round"
    strokeLinejoin="round"
    {...props}
  >
    <path d="M4 12.5 9.5 18 20 6" />
  </svg>
);

const IconArrowUp = (props) => (
  <svg
    viewBox="0 0 24 24"
    fill="none"
    stroke="currentColor"
    strokeWidth="2"
    strokeLinecap="round"
    strokeLinejoin="round"
    {...props}
  >
    <path d="M12 19V5M5.5 11.5 12 5l6.5 6.5" />
  </svg>
);

const IconRefresh = (props) => (
  <svg
    viewBox="0 0 24 24"
    fill="none"
    stroke="currentColor"
    strokeWidth="1.8"
    strokeLinecap="round"
    strokeLinejoin="round"
    {...props}
  >
    <path d="M20 11a8 8 0 0 0-14.6-4.4M4 13a8 8 0 0 0 14.6 4.4" />
    <path d="M4.5 4.5v4.5H9M19.5 19.5V15H15" />
  </svg>
);

const IconCompass = (props) => (
  <svg
    viewBox="0 0 24 24"
    fill="none"
    stroke="currentColor"
    strokeWidth="1.6"
    strokeLinecap="round"
    strokeLinejoin="round"
    {...props}
  >
    <circle cx="12" cy="12" r="9" />
    <path d="m14.8 9.2-1.9 5.6-5.6 1.9 1.9-5.6z" />
  </svg>
);

const IconRadar = (props) => (
  <svg
    viewBox="0 0 24 24"
    fill="none"
    stroke="currentColor"
    strokeWidth="1.6"
    strokeLinecap="round"
    strokeLinejoin="round"
    {...props}
  >
    <circle cx="12" cy="12" r="9" />
    <circle cx="12" cy="12" r="5.2" opacity="0.5" />
    <circle cx="12" cy="12" r="1.4" fill="currentColor" stroke="none" />
  </svg>
);

const IconSparkles = (props) => (
  <svg
    viewBox="0 0 24 24"
    fill="none"
    stroke="currentColor"
    strokeWidth="1.7"
    strokeLinecap="round"
    strokeLinejoin="round"
    {...props}
  >
    <path d="m12 3-1.2 4.4L7 9l3.8 1.6L12 15l1.2-4.4L17 9l-3.8-1.6z" />
    <path d="m19 14-.7 2.3L16 17l2.3.7L19 20l.7-2.3L22 17l-2.3-.7z" />
    <path d="m5 14-.5 1.5L3 16l1.5.5L5 18l.5-1.5L7 16l-1.5-.5z" />
  </svg>
);

const IconArrowRight = (props) => (
  <svg
    viewBox="0 0 24 24"
    fill="none"
    stroke="currentColor"
    strokeWidth="1.8"
    strokeLinecap="round"
    strokeLinejoin="round"
    {...props}
  >
    <path d="M5 12h14" />
    <path d="m13 6 6 6-6 6" />
  </svg>
);

const IconFilter = (props) => (
  <svg
    viewBox="0 0 24 24"
    fill="none"
    stroke="currentColor"
    strokeWidth="1.7"
    strokeLinecap="round"
    strokeLinejoin="round"
    {...props}
  >
    <path d="M4 6h16M7 12h10M10 18h4" />
  </svg>
);

const IconActivity = (props) => (
  <svg
    viewBox="0 0 24 24"
    fill="none"
    stroke="currentColor"
    strokeWidth="1.7"
    strokeLinecap="round"
    strokeLinejoin="round"
    {...props}
  >
    <path d="M3 12h4l2.2-6 4.2 12 2.2-6H21" />
  </svg>
);

const IconZap = (props) => (
  <svg
    viewBox="0 0 24 24"
    fill="none"
    stroke="currentColor"
    strokeWidth="1.8"
    strokeLinecap="round"
    strokeLinejoin="round"
    {...props}
  >
    <path d="m13 2-9 12h7l-1 8 9-12h-7z" />
  </svg>
);

/* ============================================================
   PRESENTATIONAL HELPERS
============================================================ */

const StatPill = ({
  label,
  value,
  accentClass = "text-white",
  icon,
  accent = "#ffffff",
}) => (
  <div
    className="group relative min-w-[150px] flex-1 overflow-hidden rounded-2xl border border-white/[0.08] bg-white/[0.035] px-4 py-3.5 backdrop-blur-xl transition duration-300 hover:-translate-y-0.5 hover:border-white/[0.16] hover:bg-white/[0.055]"
    style={{
      boxShadow: `0 14px 40px -28px ${accent}`,
    }}
  >
    <div
      className="pointer-events-none absolute -right-8 -top-8 h-20 w-20 rounded-full opacity-20 blur-2xl transition duration-500 group-hover:opacity-35"
      style={{ background: accent }}
    />

    <div className="relative flex items-center justify-between gap-3">
      <div className="flex items-center gap-3">
        <div
          className="flex h-9 w-9 items-center justify-center rounded-xl border border-white/10 bg-white/[0.05]"
          style={{ color: accent }}
        >
          {icon}
        </div>

        <span className="text-[10px] font-mono uppercase tracking-[0.18em] text-white/40">
          {label}
        </span>
      </div>

      <span
        className={`font-mono text-xl font-semibold tabular-nums ${accentClass}`}
      >
        {value ?? 0}
      </span>
    </div>
  </div>
);

const CardSkeleton = () => (
  <div className="relative overflow-hidden rounded-3xl border border-white/[0.07] bg-white/[0.025] p-5">
    <div className="absolute inset-0 -translate-x-full animate-[shimmer_1.8s_infinite] bg-gradient-to-r from-transparent via-white/[0.045] to-transparent motion-reduce:hidden" />

    <div className="relative">
      <div className="h-3 w-16 rounded-full bg-white/10" />
      <div className="mt-4 h-5 w-3/4 rounded-full bg-white/10" />
      <div className="mt-2 h-3 w-1/2 rounded-full bg-white/[0.07]" />

      <div className="mt-7 h-3 w-full rounded-full bg-white/[0.06]" />
      <div className="mt-2 h-3 w-5/6 rounded-full bg-white/[0.06]" />

      <div className="mt-7 flex gap-2">
        <div className="h-7 w-16 rounded-full bg-white/[0.07]" />
        <div className="h-7 w-20 rounded-full bg-white/[0.07]" />
      </div>
    </div>
  </div>
);

const CategoryButton = ({ category, active, onClick }) => (
  <button
    type="button"
    onClick={onClick}
    aria-pressed={active}
    className={`group relative shrink-0 overflow-hidden whitespace-nowrap rounded-full border px-4 py-2.5 text-sm font-medium transition duration-300 focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-white/30 ${
      active
        ? "translate-y-[-1px] text-white"
        : "border-white/[0.1] bg-white/[0.025] text-white/65 hover:-translate-y-0.5 hover:border-white/[0.2] hover:bg-white/[0.055] hover:text-white"
    }`}
    style={
      active
        ? {
            background: `${category.accent}1F`,
            borderColor: `${category.accent}66`,
            boxShadow: `0 10px 30px -14px ${category.accent}90`,
          }
        : undefined
    }
  >
    <span
      className={`absolute inset-0 opacity-0 transition duration-300 group-hover:opacity-100 ${
        active ? "opacity-100" : ""
      }`}
      style={{
        background: `radial-gradient(circle at 50% 0%, ${category.accent}18, transparent 65%)`,
      }}
    />

    <span className="relative flex items-center gap-2">
      <span className="text-base transition duration-300 group-hover:scale-110">
        {category.emoji}
      </span>

      <span>{category.label}</span>

      {active && (
        <span
          className="h-1.5 w-1.5 rounded-full"
          style={{ background: category.accent }}
        />
      )}
    </span>
  </button>
);

/* ============================================================
   MAIN COMPONENT
============================================================ */

const OpportunityMap = () => {
  const [items, setItems] = useState([]);
  const [stats, setStats] = useState(null);

  const [q, setQ] = useState("");
  const [type, setType] = useState("");
  const [workMode, setWorkMode] = useState("");

  const [loading, setLoading] = useState(true);
  const [loadingMore, setLoadingMore] = useState(false);
  const [isRefreshing, setIsRefreshing] = useState(false);

  const [page, setPage] = useState(1);
  const [total, setTotal] = useState(0);
  const [hasMore, setHasMore] = useState(true);

  const [selected, setSelected] = useState(null);

  const [scrollProgress, setScrollProgress] = useState(0);
  const [showScrollTop, setShowScrollTop] = useState(false);

  /* ==========================================================
     FETCH FIRST PAGE
  ========================================================== */

  const fetchOpportunities = useCallback(async () => {
    setLoading(true);

    try {
      const res = await opportunityApi.get("/", {
        params: {
          q: q.trim(),
          type,
          workMode,
          page: 1,
          limit: PAGE_SIZE,
        },
      });

      const data = res.data;

      const newItems = Array.isArray(data.items) ? data.items : [];
      const totalCount = Number(data.total || 0);

      setItems(newItems);
      setPage(1);
      setTotal(totalCount);
      setHasMore(newItems.length < totalCount);
    } catch (error) {
      console.error(
        "Failed to fetch opportunities:",
        error?.response?.data || error.message,
      );

      setItems([]);
      setTotal(0);
      setPage(1);
      setHasMore(false);
    } finally {
      setLoading(false);
    }
  }, [q, type, workMode]);

  /* ==========================================================
     SEARCH / FILTER DEBOUNCE
  ========================================================== */

  useEffect(() => {
    const timer = setTimeout(() => {
      fetchOpportunities();
    }, 400);

    return () => clearTimeout(timer);
  }, [fetchOpportunities]);

  /* ==========================================================
     LOAD MORE
  ========================================================== */

  const loadMore = async () => {
    if (loadingMore || !hasMore) return;

    const nextPage = page + 1;

    setLoadingMore(true);

    try {
      const res = await opportunityApi.get("/", {
        params: {
          q: q.trim(),
          type,
          workMode,
          page: nextPage,
          limit: PAGE_SIZE,
        },
      });

      const data = res.data;

      const newItems = Array.isArray(data.items) ? data.items : [];
      const totalCount = Number(data.total || total);

      setItems((previousItems) => {
        const existingIds = new Set(previousItems.map((item) => item._id));

        const uniqueNewItems = newItems.filter(
          (item) => !existingIds.has(item._id),
        );

        return [...previousItems, ...uniqueNewItems];
      });

      setPage(nextPage);
      setTotal(totalCount);

      const loadedCount = page * PAGE_SIZE + newItems.length;

      setHasMore(loadedCount < totalCount);
    } catch (error) {
      console.error(
        "Failed to load more opportunities:",
        error?.response?.data || error.message,
      );
    } finally {
      setLoadingMore(false);
    }
  };

  /* ==========================================================
     STATS
  ========================================================== */

  const fetchStats = useCallback(async () => {
    try {
      const res = await opportunityApi.get("/stats");
      setStats(res.data.stats);
    } catch (error) {
      console.error(
        "Failed to fetch opportunity stats:",
        error?.response?.data || error.message,
      );

      setStats(null);
    }
  }, []);

  useEffect(() => {
    fetchStats();
  }, [fetchStats]);

  /* ==========================================================
     REFRESH
  ========================================================== */

  const handleRefresh = async () => {
    if (isRefreshing) return;

    setIsRefreshing(true);

    try {
      await Promise.all([fetchOpportunities(), fetchStats()]);
    } finally {
      setIsRefreshing(false);
    }
  };

  /* ==========================================================
     SCROLL
  ========================================================== */

  useEffect(() => {
    const handleScroll = () => {
      const scrollTop = window.scrollY;

      const docHeight =
        document.documentElement.scrollHeight - window.innerHeight;

      setScrollProgress(docHeight > 0 ? (scrollTop / docHeight) * 100 : 0);

      setShowScrollTop(scrollTop > 480);
    };

    window.addEventListener("scroll", handleScroll, {
      passive: true,
    });

    handleScroll();

    return () => window.removeEventListener("scroll", handleScroll);
  }, []);

  const scrollToTop = () => {
    window.scrollTo({
      top: 0,
      behavior: window.matchMedia("(prefers-reduced-motion: reduce)").matches
        ? "auto"
        : "smooth",
    });
  };

  /* ==========================================================
     FILTERS
  ========================================================== */

  const handleCategoryChange = (category) => {
    setType(category);
  };

  const handleWorkModeChange = (mode) => {
    setWorkMode(mode);
  };

  const clearFilters = () => {
    setQ("");
    setType("");
    setWorkMode("");
  };

  const hasActiveFilters = Boolean(q || type || workMode);

  const activeCategory = useMemo(
    () => CATEGORIES.find((category) => category.key === type) || CATEGORIES[0],
    [type],
  );

  const activeFilterCount =
    Number(Boolean(q)) + Number(Boolean(type)) + Number(Boolean(workMode));

  /* ==========================================================
     RENDER
  ========================================================== */

  return (
    <div className="relative min-h-screen overflow-x-hidden bg-[#040811] text-white selection:bg-emerald-400/30 selection:text-white">
      {/* ======================================================
          GLOBAL SCROLL PROGRESS
      ======================================================= */}

      <div className="fixed left-0 top-0 z-[100] h-[3px] w-full bg-transparent">
        <div
          className="h-full bg-gradient-to-r from-emerald-300 via-cyan-400 to-violet-500 shadow-[0_0_16px_rgba(52,211,153,0.8)] transition-[width] duration-150"
          style={{ width: `${scrollProgress}%` }}
        />
      </div>

      {/* ======================================================
          PREMIUM BACKGROUND
      ======================================================= */}

      <div className="pointer-events-none fixed inset-0 z-0 overflow-hidden">
        {/* Glow 1 */}
        <div className="absolute -left-40 -top-40 h-[34rem] w-[34rem] rounded-full bg-emerald-500/[0.055] blur-[130px] animate-[floatOne_12s_ease-in-out_infinite] motion-reduce:animate-none" />

        {/* Glow 2 */}
        <div className="absolute -right-48 top-[20%] h-[34rem] w-[34rem] rounded-full bg-blue-500/[0.055] blur-[140px] animate-[floatTwo_15s_ease-in-out_infinite] motion-reduce:animate-none" />

        {/* Glow 3 */}
        <div className="absolute bottom-[-12rem] left-[20%] h-[32rem] w-[32rem] rounded-full bg-violet-500/[0.045] blur-[140px] animate-[floatThree_18s_ease-in-out_infinite] motion-reduce:animate-none" />

        {/* Grid */}
        <div className="absolute inset-0 opacity-[0.025] [background-image:linear-gradient(to_right,white_1px,transparent_1px),linear-gradient(to_bottom,white_1px,transparent_1px)] [background-size:52px_52px]" />

        {/* Vignette */}
        <div className="absolute inset-0 bg-[radial-gradient(circle_at_center,transparent_25%,#040811_90%)]" />

        {/* Tiny particles */}
        <div className="absolute left-[14%] top-[18%] h-1 w-1 rounded-full bg-emerald-300/50 shadow-[0_0_12px_rgba(110,231,183,0.8)] animate-pulse" />
        <div className="absolute right-[22%] top-[38%] h-1 w-1 rounded-full bg-cyan-300/50 shadow-[0_0_12px_rgba(103,232,249,0.8)] animate-pulse [animation-delay:700ms]" />
        <div className="absolute bottom-[24%] left-[30%] h-1 w-1 rounded-full bg-violet-300/50 shadow-[0_0_12px_rgba(196,181,253,0.8)] animate-pulse [animation-delay:1200ms]" />
      </div>

      <div className="relative z-10 mx-auto w-full max-w-[1800px] px-4 py-5 sm:px-6 md:px-10 lg:px-12">
        {/* ====================================================
            PREMIUM HEADER
        ===================================================== */}

        <header className="sticky top-3 z-50 flex items-center justify-between gap-3 rounded-2xl border border-white/[0.08] bg-[#07101d]/75 px-3 py-2.5 shadow-2xl shadow-black/20 backdrop-blur-2xl md:px-4">
          {/* HOME */}
          <Link
            to="/"
            aria-label="Go to home page"
            className="group relative overflow-hidden rounded-xl border border-white/[0.1] bg-white/[0.035] px-3.5 py-2.5 text-sm text-white/75 transition duration-300 hover:-translate-y-0.5 hover:border-emerald-300/30 hover:bg-emerald-400/[0.07] hover:text-white hover:shadow-[0_10px_35px_-15px_rgba(52,211,153,0.55)] focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-emerald-400/50"
          >
            <span className="absolute inset-0 -translate-x-full bg-gradient-to-r from-transparent via-white/[0.08] to-transparent transition duration-700 group-hover:translate-x-full" />

            <span className="relative flex items-center gap-2">
              <span className="flex h-7 w-7 items-center justify-center rounded-lg bg-white/[0.06] transition duration-300 group-hover:bg-emerald-400/10">
                <IconHome className="h-4 w-4 transition duration-300 group-hover:-translate-y-0.5 group-hover:scale-110" />
              </span>

              <span className="hidden font-medium sm:inline">Home</span>

              <IconArrowRight className="hidden h-3.5 w-3.5 opacity-40 transition duration-300 group-hover:translate-x-0.5 group-hover:opacity-100 sm:block" />
            </span>
          </Link>

          {/* CENTER LIVE STATUS */}
          <div className="hidden items-center gap-2 rounded-full border border-emerald-300/10 bg-emerald-300/[0.035] px-4 py-2 text-[10px] font-mono uppercase tracking-[0.2em] text-emerald-200/70 sm:flex">
            <span className="relative flex h-2 w-2">
              <span className="absolute inline-flex h-full w-full animate-ping rounded-full bg-emerald-400 opacity-60 motion-reduce:animate-none" />
              <span className="relative inline-flex h-2 w-2 rounded-full bg-emerald-400 shadow-[0_0_10px_rgba(52,211,153,0.9)]" />
            </span>
            Live opportunity feed
          </div>

          {/* ACTIONS */}
          <div className="flex items-center gap-1.5 sm:gap-2">
            <button
              type="button"
              onClick={handleRefresh}
              disabled={isRefreshing}
              aria-label="Refresh opportunities"
              title="Refresh opportunities"
              className="group rounded-xl border border-white/[0.09] bg-white/[0.035] p-2.5 text-white/60 transition duration-300 hover:-translate-y-0.5 hover:border-cyan-300/25 hover:bg-cyan-300/[0.06] hover:text-white disabled:cursor-not-allowed disabled:opacity-40 focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-cyan-400/40"
            >
              <IconRefresh
                className={`h-4 w-4 transition-transform duration-700 ${
                  isRefreshing ? "animate-spin" : "group-hover:rotate-180"
                }`}
              />
            </button>

            <SoundToggle />
            <OpportunityAlerts />
          </div>
        </header>

        {/* ====================================================
            HERO
        ===================================================== */}

        <section className="relative mt-5 overflow-hidden rounded-[2rem] border border-white/[0.08] bg-gradient-to-br from-white/[0.055] via-white/[0.025] to-transparent px-5 py-9 shadow-[0_30px_100px_-55px_rgba(16,185,129,0.35)] sm:px-8 md:px-12 md:py-14">
          {/* Hero glow */}
          <div className="pointer-events-none absolute -right-28 -top-28 h-72 w-72 rounded-full bg-emerald-400/[0.08] blur-[90px]" />
          <div className="pointer-events-none absolute -bottom-32 left-1/3 h-72 w-72 rounded-full bg-violet-500/[0.06] blur-[100px]" />

          {/* Decorative orbital lines */}
          <div className="pointer-events-none absolute right-[-5rem] top-[-5rem] hidden h-80 w-80 rounded-full border border-emerald-300/[0.07] md:block">
            <div className="absolute inset-8 rounded-full border border-cyan-300/[0.06]" />
            <div className="absolute inset-16 rounded-full border border-violet-300/[0.06]" />

            <div className="absolute left-1/2 top-0 h-2 w-2 -translate-x-1/2 rounded-full bg-emerald-300 shadow-[0_0_20px_rgba(110,231,183,0.9)] animate-[orbitDot_5s_linear_infinite]" />
          </div>

          <div className="relative max-w-3xl animate-[fadeInUp_0.65s_ease-out] motion-reduce:animate-none">
            {/* Eyebrow */}
            <div className="inline-flex items-center gap-2 rounded-full border border-emerald-300/10 bg-emerald-300/[0.045] px-3 py-1.5 text-[10px] font-mono uppercase tracking-[0.18em] text-emerald-200/70">
              <IconCompass className="h-3.5 w-3.5" />
              Global opportunity radar
              <span className="ml-1 flex items-center gap-1.5 text-white/35">
                <span className="h-1 w-1 rounded-full bg-white/30" />
                Real-time discovery
              </span>
            </div>

            {/* Heading */}
            <h1 className="mt-5 text-4xl font-semibold tracking-[-0.04em] text-white sm:text-5xl md:text-6xl">
              Discover what’s
              <span className="relative ml-2 inline-block bg-gradient-to-r from-emerald-300 via-cyan-300 to-violet-400 bg-clip-text text-transparent">
                next.
              </span>
            </h1>

            <p className="mt-5 max-w-2xl text-sm leading-7 text-white/55 sm:text-base">
              Your opportunity radar for jobs, internships, hackathons, events
              and scholarships. Search smarter, explore faster and never miss
              your next big opportunity.
            </p>

            {/* Hero mini features */}
            <div className="mt-7 flex flex-wrap gap-2.5">
              <div className="inline-flex items-center gap-2 rounded-full border border-white/[0.07] bg-white/[0.025] px-3 py-2 text-xs text-white/55">
                <IconRadar className="h-3.5 w-3.5 text-emerald-300" />
                Live radar
              </div>

              <div className="inline-flex items-center gap-2 rounded-full border border-white/[0.07] bg-white/[0.025] px-3 py-2 text-xs text-white/55">
                <IconSparkles className="h-3.5 w-3.5 text-violet-300" />
                Smart discovery
              </div>

              <div className="inline-flex items-center gap-2 rounded-full border border-white/[0.07] bg-white/[0.025] px-3 py-2 text-xs text-white/55">
                <IconZap className="h-3.5 w-3.5 text-amber-300" />
                Fast matching
              </div>
            </div>
          </div>
        </section>

        {/* ====================================================
            STATS
        ===================================================== */}

        {stats && (
          <section className="mt-4 grid grid-cols-1 gap-3 sm:grid-cols-3">
            <StatPill
              label="Tracked"
              value={stats.total}
              accent="#94a3b8"
              icon={<IconRadar className="h-4 w-4" />}
            />

            <StatPill
              label="New today"
              value={stats.newToday}
              accent="#34d399"
              accentClass="text-emerald-300"
              icon={<IconActivity className="h-4 w-4" />}
            />

            <StatPill
              label="Closing soon"
              value={stats.closingSoon}
              accent="#fbbf24"
              accentClass="text-amber-300"
              icon={<IconZap className="h-4 w-4" />}
            />
          </section>
        )}

        {/* ====================================================
            GLOBE
        ===================================================== */}

        <section className="group relative mt-5 overflow-hidden rounded-[2rem] border border-white/[0.08] bg-white/[0.02] shadow-[0_35px_100px_-60px_rgba(56,189,248,0.35)]">
          <div className="pointer-events-none absolute inset-x-0 top-0 z-10 h-20 bg-gradient-to-b from-cyan-300/[0.04] to-transparent" />

          <div className="absolute left-4 top-4 z-20 flex items-center gap-2 rounded-full border border-white/[0.08] bg-black/20 px-3 py-1.5 text-[9px] font-mono uppercase tracking-[0.18em] text-white/40 backdrop-blur-xl">
            <span className="h-1.5 w-1.5 rounded-full bg-cyan-300 shadow-[0_0_10px_rgba(103,232,249,0.8)]" />
            Global radar
          </div>

          <div className="relative">
            <OpportunityGlobe3D />
          </div>
        </section>

        {/* ====================================================
            SEARCH AREA
        ===================================================== */}

        <section className="relative mt-7">
          <div className="mb-3 flex items-center justify-between gap-3">
            <div>
              <div className="flex items-center gap-2">
                <IconSearch className="h-4 w-4 text-emerald-300" />

                <h2 className="text-sm font-semibold text-white/85">
                  Find opportunities
                </h2>
              </div>

              <p className="mt-1 text-xs text-white/35">
                Search by title, skill, company, location or keyword.
              </p>
            </div>

            {hasActiveFilters && (
              <div className="hidden items-center gap-1.5 rounded-full border border-emerald-300/10 bg-emerald-300/[0.04] px-3 py-1.5 text-[10px] font-mono uppercase tracking-wider text-emerald-200/65 sm:flex">
                <IconFilter className="h-3 w-3" />
                {activeFilterCount} active
              </div>
            )}
          </div>

          <div className="group relative">
            <div className="pointer-events-none absolute -inset-0.5 rounded-[1.25rem] bg-gradient-to-r from-emerald-400/0 via-cyan-400/0 to-violet-400/0 opacity-0 blur transition duration-500 group-focus-within:from-emerald-400/15 group-focus-within:via-cyan-400/10 group-focus-within:to-violet-400/15 group-focus-within:opacity-100" />

            <div className="relative overflow-hidden rounded-[1.2rem] border border-white/[0.1] bg-white/[0.035] shadow-[0_20px_70px_-45px_rgba(0,0,0,0.8)] backdrop-blur-xl transition duration-300 focus-within:border-emerald-300/20 focus-within:bg-white/[0.045]">
              <IconSearch className="pointer-events-none absolute left-4 top-1/2 h-5 w-5 -translate-y-1/2 text-white/35 transition duration-300 group-focus-within:text-emerald-300/70" />

              <input
                value={q}
                onChange={(e) => setQ(e.target.value)}
                placeholder="Search opportunities..."
                aria-label="Search opportunities"
                className="w-full bg-transparent py-4 pl-12 pr-12 text-sm text-white outline-none placeholder:text-white/30"
              />

              {q ? (
                <button
                  type="button"
                  onClick={() => setQ("")}
                  aria-label="Clear search"
                  className="absolute right-3 top-1/2 flex h-8 w-8 -translate-y-1/2 items-center justify-center rounded-lg text-white/35 transition duration-200 hover:bg-white/10 hover:text-white focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-white/30"
                >
                  <IconX className="h-4 w-4" />
                </button>
              ) : (
                <div className="pointer-events-none absolute right-3 top-1/2 hidden -translate-y-1/2 rounded-md border border-white/[0.08] bg-white/[0.035] px-2 py-1 text-[9px] font-mono uppercase tracking-wider text-white/25 sm:block">
                  Search
                </div>
              )}
            </div>
          </div>
        </section>

        {/* ====================================================
            CATEGORIES
        ===================================================== */}

        <section className="mt-5">
          <div className="mb-3 flex items-center justify-between">
            <span className="text-[10px] font-mono uppercase tracking-[0.18em] text-white/30">
              Opportunity type
            </span>

            {type && (
              <span className="text-[10px] text-white/35">
                Active:{" "}
                <span className="text-white/70">
                  {activeCategory.emoji} {activeCategory.label}
                </span>
              </span>
            )}
          </div>

          <div className="flex gap-2 overflow-x-auto pb-2 [-ms-overflow-style:none] [scrollbar-width:none] [&::-webkit-scrollbar]:hidden">
            {CATEGORIES.map((category) => {
              const active = type === category.key;

              return (
                <CategoryButton
                  key={category.key}
                  category={category}
                  active={active}
                  onClick={() => handleCategoryChange(category.key)}
                />
              );
            })}
          </div>
        </section>

        {/* ====================================================
            WORK MODE
        ===================================================== */}

        <section className="mt-2">
          <OpportunityFilters
            workMode={workMode}
            setWorkMode={handleWorkModeChange}
          />
        </section>

        {/* ====================================================
            RESULT BAR
        ===================================================== */}

        {!loading && total > 0 && (
          <section className="mt-6 flex flex-col gap-3 border-t border-white/[0.07] pt-5 sm:flex-row sm:items-center sm:justify-between">
            <div className="flex items-center gap-3">
              <div className="flex h-8 w-8 items-center justify-center rounded-lg border border-white/[0.08] bg-white/[0.035]">
                <IconActivity className="h-3.5 w-3.5 text-emerald-300/70" />
              </div>

              <p className="font-mono text-[10px] uppercase tracking-[0.16em] text-white/35">
                Showing <span className="text-white/85">{items.length}</span> of{" "}
                <span className="text-white/85">{total}</span> opportunities
              </p>
            </div>

            {hasActiveFilters && (
              <button
                type="button"
                onClick={clearFilters}
                className="inline-flex w-fit items-center gap-2 rounded-full border border-white/[0.08] bg-white/[0.025] px-3 py-2 text-xs text-white/55 transition duration-300 hover:border-white/20 hover:bg-white/[0.06] hover:text-white focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-white/30"
              >
                <IconX className="h-3.5 w-3.5" />
                Clear all filters
              </button>
            )}
          </section>
        )}

        {/* ====================================================
            OPPORTUNITIES
        ===================================================== */}

        <main className="mt-6">
          {loading ? (
            <div
              className="grid grid-cols-1 gap-4 md:grid-cols-2 lg:grid-cols-3"
              aria-live="polite"
              aria-busy="true"
            >
              <span className="sr-only">Loading opportunities…</span>

              {Array.from({ length: 6 }).map((_, i) => (
                <CardSkeleton key={i} />
              ))}
            </div>
          ) : items.length === 0 ? (
            <div className="relative overflow-hidden rounded-[2rem] border border-white/[0.07] bg-white/[0.025] px-6 py-20 text-center">
              <div className="pointer-events-none absolute left-1/2 top-1/2 h-60 w-60 -translate-x-1/2 -translate-y-1/2 rounded-full bg-violet-400/[0.04] blur-[80px]" />

              <div className="relative">
                <div className="mx-auto flex h-16 w-16 items-center justify-center rounded-2xl border border-white/10 bg-white/[0.04] text-white/45 shadow-[0_20px_60px_-35px_rgba(167,139,250,0.7)]">
                  <IconRadar className="h-7 w-7 animate-[radarPulse_2s_ease-in-out_infinite] motion-reduce:animate-none" />
                </div>

                <p className="mt-6 text-xl font-semibold text-white/85">
                  No opportunities found
                </p>

                <p className="mx-auto mt-2 max-w-md text-sm leading-6 text-white/40">
                  Nothing matches your current search and filter combination.
                  Try another keyword or reset your filters to scan the full
                  opportunity network.
                </p>

                {hasActiveFilters && (
                  <button
                    type="button"
                    onClick={clearFilters}
                    className="group mt-7 inline-flex items-center gap-2 rounded-xl bg-white px-5 py-3 text-sm font-semibold text-black transition duration-300 hover:-translate-y-0.5 hover:bg-white/90 hover:shadow-[0_15px_40px_-18px_rgba(255,255,255,0.7)] focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-white/50"
                  >
                    Reset search
                    <IconArrowRight className="h-4 w-4 transition duration-300 group-hover:translate-x-1" />
                  </button>
                )}
              </div>
            </div>
          ) : (
            <>
              {/* CARDS */}

              <div className="grid grid-cols-1 gap-4 md:grid-cols-2 lg:grid-cols-3">
                {items.map((item, index) => (
                  <div
                    key={item._id}
                    className="group relative animate-[cardReveal_0.55s_ease-out_backwards] transition duration-300 hover:-translate-y-1"
                    style={{
                      animationDelay: `${Math.min(index, 14) * 45}ms`,
                    }}
                  >
                    <div className="pointer-events-none absolute -inset-1 rounded-[1.8rem] bg-gradient-to-br from-emerald-400/0 via-cyan-400/0 to-violet-400/0 opacity-0 blur-xl transition duration-500 group-hover:from-emerald-400/[0.08] group-hover:via-cyan-400/[0.04] group-hover:to-violet-400/[0.08] group-hover:opacity-100" />

                    <div className="relative">
                      <OpportunityCard
                        item={item}
                        onOpen={() => setSelected(item)}
                      />
                    </div>
                  </div>
                ))}
              </div>

              {/* LOAD MORE */}

              {hasMore && (
                <div className="mt-12 flex justify-center">
                  <button
                    type="button"
                    onClick={loadMore}
                    disabled={loadingMore}
                    className="group relative min-w-[240px] overflow-hidden rounded-2xl border border-white/[0.1] bg-white px-6 py-3.5 font-medium text-black shadow-[0_20px_50px_-30px_rgba(255,255,255,0.65)] transition duration-300 hover:-translate-y-1 hover:bg-white/90 hover:shadow-[0_25px_65px_-30px_rgba(255,255,255,0.8)] disabled:cursor-not-allowed disabled:opacity-50 focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-white/50"
                  >
                    <span className="absolute inset-0 -translate-x-full bg-gradient-to-r from-transparent via-black/[0.06] to-transparent transition duration-700 group-hover:translate-x-full" />

                    <span className="relative flex items-center justify-center gap-2">
                      {loadingMore ? (
                        <>
                          <IconRefresh className="h-4 w-4 animate-spin" />
                          Loading more…
                        </>
                      ) : (
                        <>
                          Load more opportunities
                          <IconArrowRight className="h-4 w-4 transition duration-300 group-hover:translate-x-1" />
                        </>
                      )}
                    </span>
                  </button>
                </div>
              )}

              {/* ALL LOADED */}

              {!hasMore && items.length > 0 && (
                <div className="mt-12 flex flex-col items-center justify-center pb-10 text-center">
                  <div className="relative flex h-11 w-11 items-center justify-center rounded-full border border-emerald-300/20 bg-emerald-300/[0.07] text-emerald-300">
                    <span className="absolute inset-0 animate-ping rounded-full border border-emerald-300/20 motion-reduce:animate-none" />
                    <IconCheck className="relative h-4 w-4" />
                  </div>

                  <p className="mt-4 text-sm text-white/40">
                    You've explored all{" "}
                    <span className="font-semibold text-white/80">
                      {items.length}
                    </span>{" "}
                    opportunities.
                  </p>

                  <p className="mt-1 text-xs text-white/25">
                    Your radar is fully scanned.
                  </p>
                </div>
              )}
            </>
          )}
        </main>

        {/* ====================================================
            DRAWER
        ===================================================== */}

        {selected && (
          <OpportunityDrawer
            item={selected}
            onClose={() => setSelected(null)}
          />
        )}

        {/* ====================================================
            AI ASSISTANT
        ===================================================== */}

        <OpportunityAssistant />
      </div>

      {/* ======================================================
          SCROLL TO TOP
      ======================================================= */}

      <button
        type="button"
        onClick={scrollToTop}
        aria-label="Scroll to top"
        title="Back to top"
        className={`group fixed bottom-5 right-5 z-40 flex h-12 w-12 items-center justify-center rounded-2xl border border-white/[0.1] bg-[#07101d]/75 text-white/70 shadow-2xl shadow-black/30 backdrop-blur-xl transition duration-300 hover:-translate-y-1 hover:border-emerald-300/30 hover:bg-emerald-300/[0.07] hover:text-white hover:shadow-[0_15px_45px_-18px_rgba(52,211,153,0.6)] focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-emerald-400/50 md:bottom-8 md:right-8 ${
          showScrollTop
            ? "translate-y-0 opacity-100"
            : "pointer-events-none translate-y-4 opacity-0"
        }`}
      >
        <IconArrowUp className="h-4 w-4 transition duration-300 group-hover:-translate-y-0.5" />

        <span className="pointer-events-none absolute -top-8 right-0 whitespace-nowrap rounded-md border border-white/10 bg-black/80 px-2 py-1 text-[9px] font-mono uppercase tracking-wider text-white/50 opacity-0 transition group-hover:opacity-100">
          Top
        </span>
      </button>

      {/* ======================================================
          GLOBAL ANIMATION CSS
      ======================================================= */}

      <style>{`
        @keyframes fadeInUp {
          from {
            opacity: 0;
            transform: translateY(18px);
          }
          to {
            opacity: 1;
            transform: translateY(0);
          }
        }

        @keyframes cardReveal {
          from {
            opacity: 0;
            transform: translateY(18px) scale(0.985);
          }
          to {
            opacity: 1;
            transform: translateY(0) scale(1);
          }
        }

        @keyframes shimmer {
          100% {
            transform: translateX(100%);
          }
        }

        @keyframes floatOne {
          0%,
          100% {
            transform: translate3d(0, 0, 0) scale(1);
          }

          50% {
            transform: translate3d(45px, 25px, 0) scale(1.06);
          }
        }

        @keyframes floatTwo {
          0%,
          100% {
            transform: translate3d(0, 0, 0) scale(1);
          }

          50% {
            transform: translate3d(-35px, 40px, 0) scale(1.08);
          }
        }

        @keyframes floatThree {
          0%,
          100% {
            transform: translate3d(0, 0, 0) scale(1);
          }

          50% {
            transform: translate3d(25px, -35px, 0) scale(1.05);
          }
        }

        @keyframes orbitDot {
          0% {
            transform: translateX(-50%) translateY(0);
          }

          25% {
            transform: translateX(130px) translateY(25px);
          }

          50% {
            transform: translateX(50px) translateY(150px);
          }

          75% {
            transform: translateX(-130px) translateY(90px);
          }

          100% {
            transform: translateX(-50%) translateY(0);
          }
        }

        @keyframes radarPulse {
          0%,
          100% {
            transform: scale(1);
            opacity: 0.55;
          }

          50% {
            transform: scale(1.08);
            opacity: 1;
          }
        }

        @media (prefers-reduced-motion: reduce) {
          *,
          *::before,
          *::after {
            animation-duration: 0.001ms !important;
            animation-iteration-count: 1 !important;
            transition-duration: 0.001ms !important;
            scroll-behavior: auto !important;
          }
        }
      `}</style>
    </div>
  );
};

export default OpportunityMap;
