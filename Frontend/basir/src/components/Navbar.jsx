// frontend/src/components/Navbar.jsx
import { GoDeviceCameraVideo } from "react-icons/go";
import {
  FiSearch,
  FiBell,
  FiMenu,
  FiX,
  FiHome,
  FiCompass,
  FiVideo,
  FiSettings,
  FiHelpCircle,
  FiLogOut,
  FiChevronDown,
  FiSun,
  FiMoon,
  FiUsers,
  FiAward,
} from "react-icons/fi";
import { useState, useEffect, useRef, useCallback } from "react";
import { Link, useLocation, useNavigate } from "react-router-dom";
import { useAuth } from "../context/AuthContext";
import sessionApi from "../config/sessionApi";
import socket from "../config/socket";

// ---------------------------------------------------------------------------
// Static nav config — edit routes/labels here, everything else adapts.
// ---------------------------------------------------------------------------
const NAV_LINKS = [
  { label: "Dashboard", to: "/dashboard", icon: FiHome },
  { label: "Explore", to: "/explore", icon: FiCompass },
  { label: "My Sessions", to: "/my-sessions", icon: FiVideo },
];

const PROFILE_LINKS = [
  { label: "My Sessions", icon: FiVideo, to: "/my-sessions" },
  { label: "Explore", icon: FiUsers, to: "/explore" },
  { label: "My Certificates", icon: FiAward, to: "/dashboard/certificates" },
  { label: "Settings", icon: FiSettings, to: "/dashboard/settings" },
];

function Navbar() {
  const location = useLocation();
  const navigate = useNavigate();
  const { user, loading: userLoading, logout } = useAuth();

  // ----- ui state -----
  const [showProfile, setShowProfile] = useState(false);
  const [confirmingLogout, setConfirmingLogout] = useState(false);
  const [scrolled, setScrolled] = useState(false);
  const [searchOpen, setSearchOpen] = useState(false);
  const [searchValue, setSearchValue] = useState("");
  const [searchResults, setSearchResults] = useState([]);
  const [searching, setSearching] = useState(false);
  const [notifOpen, setNotifOpen] = useState(false);
  const [mobileOpen, setMobileOpen] = useState(false);
  const [darkMode, setDarkMode] = useState(false);

  // ----- real, socket-driven notifications (session lifecycle events
  // relevant to sessions this user hosts) -----
  const [notifications, setNotifications] = useState([]);
  const hostedRoomIdsRef = useRef(new Set());

  const unreadCount = notifications.filter((n) => n.unread).length;

  // ----- refs for click-outside handling -----
  const profileRef = useRef(null);
  const notifRef = useRef(null);
  const searchRef = useRef(null);

  const logoutdata = async () => {
    await logout();
    setShowProfile(false);
    setConfirmingLogout(false);
    navigate("/");
  };

  const handleHostSession = () => {
    if (user) {
      navigate("/host");
    } else {
      navigate("/login", { state: { from: "/host" } });
    }
  };

  // ---------------------------------------------------------------------
  // Track which live sessions belong to this user, so we know which
  // realtime events are actually "mine" to notify about.
  // ---------------------------------------------------------------------
  const refreshHostedRoomIds = useCallback(async () => {
    if (!user) return;
    try {
      const res = await sessionApi.get("/my-sessions");
      const hosted = (res.data.sessions || [])
        .filter((s) => s.myRole === "host" && s.status === "active")
        .map((s) => s.roomId);
      hostedRoomIdsRef.current = new Set(hosted);
    } catch {
      // silent — notifications are a nice-to-have, not critical path
    }
  }, [user]);

  useEffect(() => {
    refreshHostedRoomIds();
  }, [refreshHostedRoomIds]);

  useEffect(() => {
    if (!user) return;

    const pushNotification = (title, detail) => {
      setNotifications((prev) =>
        [
          {
            id: Date.now() + Math.random(),
            title,
            detail,
            time: "now",
            unread: true,
          },
          ...prev,
        ].slice(0, 20),
      );
    };

    const onParticipantUpdate = ({ roomId, participantCount }) => {
      if (!hostedRoomIdsRef.current.has(roomId)) return;
      pushNotification(
        "New participant joined",
        `Your session now has ${participantCount} participant${
          participantCount === 1 ? "" : "s"
        }`,
      );
    };

    const onEnded = ({ roomId }) => {
      if (hostedRoomIdsRef.current.has(roomId)) {
        hostedRoomIdsRef.current.delete(roomId);
      }
    };

    const onCreated = () => {
      refreshHostedRoomIds();
    };

    socket.on("session:participant-update", onParticipantUpdate);
    socket.on("session:ended", onEnded);
    socket.on("session:created", onCreated);

    return () => {
      socket.off("session:participant-update", onParticipantUpdate);
      socket.off("session:ended", onEnded);
      socket.off("session:created", onCreated);
    };
  }, [user, refreshHostedRoomIds]);

  const markAllRead = () => {
    setNotifications((prev) => prev.map((n) => ({ ...n, unread: false })));
  };

  // ---------------------------------------------------------------------
  // Live search — debounced, hits the real backend.
  // ---------------------------------------------------------------------
  useEffect(() => {
    if (!searchValue.trim()) {
      setSearchResults([]);
      setSearching(false);
      return;
    }

    setSearching(true);
    const timer = setTimeout(async () => {
      try {
        const res = await sessionApi.get("/search", {
          params: { q: searchValue.trim() },
        });
        setSearchResults(res.data.sessions || []);
      } catch {
        setSearchResults([]);
      } finally {
        setSearching(false);
      }
    }, 300);

    return () => clearTimeout(timer);
  }, [searchValue]);

  const handleResultClick = async (session) => {
    try {
      await sessionApi.post(`/join/${session.roomId}`);
      setSearchOpen(false);
      setSearchValue("");
      navigate(`/meeting/${session.roomId}`);
    } catch {
      navigate(`/meeting/${session.roomId}`);
    }
  };

  // ---------------------------------------------------------------------
  // Scroll awareness — navbar tightens up + gains depth once you scroll
  // ---------------------------------------------------------------------
  useEffect(() => {
    const onScroll = () => setScrolled(window.scrollY > 10);
    onScroll();
    window.addEventListener("scroll", onScroll, { passive: true });
    return () => window.removeEventListener("scroll", onScroll);
  }, []);

  // ---------------------------------------------------------------------
  // Theme toggle — persists on <html class="dark">
  // ---------------------------------------------------------------------
  useEffect(() => {
    const stored = localStorage.getItem("lc-theme");
    const isDark = stored === "dark";
    setDarkMode(isDark);
    document.documentElement.classList.toggle("dark", isDark);
  }, []);

  const toggleTheme = () => {
    setDarkMode((prev) => {
      const next = !prev;
      document.documentElement.classList.toggle("dark", next);
      localStorage.setItem("lc-theme", next ? "dark" : "light");
      return next;
    });
  };

  // ---------------------------------------------------------------------
  // Click-outside + Escape to close any open dropdown
  // ---------------------------------------------------------------------
  useEffect(() => {
    const handleClick = (e) => {
      if (profileRef.current && !profileRef.current.contains(e.target)) {
        setShowProfile(false);
        setConfirmingLogout(false);
      }
      if (notifRef.current && !notifRef.current.contains(e.target)) {
        setNotifOpen(false);
      }
      if (searchRef.current && !searchRef.current.contains(e.target)) {
        setSearchOpen(false);
      }
    };
    const handleEscape = (e) => {
      if (e.key === "Escape") {
        setShowProfile(false);
        setNotifOpen(false);
        setSearchOpen(false);
        setMobileOpen(false);
        setConfirmingLogout(false);
      }
    };
    document.addEventListener("mousedown", handleClick);
    document.addEventListener("keydown", handleEscape);
    return () => {
      document.removeEventListener("mousedown", handleClick);
      document.removeEventListener("keydown", handleEscape);
    };
  }, []);

  // Lock body scroll while the mobile drawer is open
  useEffect(() => {
    document.body.style.overflow = mobileOpen ? "hidden" : "";
    return () => {
      document.body.style.overflow = "";
    };
  }, [mobileOpen]);

  // ⌘K / Ctrl+K opens search (logged-in users only)
  useEffect(() => {
    const handler = (e) => {
      if ((e.metaKey || e.ctrlKey) && e.key.toLowerCase() === "k" && user) {
        e.preventDefault();
        setSearchOpen(true);
      }
    };
    window.addEventListener("keydown", handler);
    return () => window.removeEventListener("keydown", handler);
  }, [user]);

  const isActive = (to) => location.pathname === to;

  return (
    <>
      <header
        className={`fixed top-0 left-0 z-50 w-full transition-all duration-300 ${
          scrolled
            ? "h-[58px] bg-white/80 dark:bg-slate-900/80 shadow-lg shadow-slate-900/5"
            : "h-[68px] bg-white/95 dark:bg-slate-900/95 shadow-sm"
        } backdrop-blur-xl border-b border-slate-200/70 dark:border-slate-800`}
      >
        {/* signature top hairline gradient */}
        <div className="absolute top-0 left-0 h-[2px] w-full bg-gradient-to-r from-blue-500 via-cyan-400 to-purple-500" />

        <div className="h-full w-full flex items-center px-4 md:px-8 max-w-[1600px] mx-auto">
          {/* Brand */}
          <Link to="/" className="flex items-center gap-3 shrink-0 group">
            <div className="relative h-[42px] w-[42px] bg-blue-50/80 dark:bg-blue-500/10 border border-blue-100 dark:border-blue-500/30 rounded-xl flex items-center justify-center shadow-sm transition-all duration-300 group-hover:bg-blue-600 group-hover:shadow-blue-200 dark:group-hover:shadow-blue-950 group-hover:shadow-lg group-hover:scale-105">
              <GoDeviceCameraVideo
                size={22}
                className="text-blue-600 dark:text-blue-400 transition-colors duration-300 group-hover:text-white"
              />
            </div>

            <div className="hidden sm:flex items-center gap-2">
              <span className="text-red-500 animate-pulse text-base leading-none">
                )))
              </span>
              <h1 className="text-[21px] font-black tracking-wider bg-gradient-to-r from-red-500 via-orange-500 to-pink-500 bg-clip-text text-transparent whitespace-nowrap">
                LIVE CLASSES
              </h1>
              <span className="text-red-500 animate-pulse text-base leading-none">
                (((
              </span>
            </div>
          </Link>

          {/* Primary nav links — desktop only */}
          <nav className="hidden lg:flex items-center gap-1 ml-10">
            {NAV_LINKS.map(({ label, to, icon: Icon }) => (
              <Link
                key={to}
                to={to}
                className={`relative flex items-center gap-2 px-4 py-2 rounded-lg text-sm font-semibold transition-colors duration-200 ${
                  isActive(to)
                    ? "text-blue-600 dark:text-blue-400"
                    : "text-slate-500 dark:text-slate-400 hover:text-slate-800 dark:hover:text-slate-200"
                }`}
              >
                <Icon size={16} />
                {label}
                <span
                  className={`absolute left-4 right-4 -bottom-[1px] h-[2px] rounded-full bg-gradient-to-r from-blue-600 to-cyan-500 origin-left transition-transform duration-300 ${
                    isActive(to) ? "scale-x-100" : "scale-x-0"
                  }`}
                />
              </Link>
            ))}
          </nav>

          {/* Right side cluster */}
          <div className="flex items-center gap-2 md:gap-3 ml-auto">
            {/* Search — logged-in only, real backend search */}
            {user && (
              <div ref={searchRef} className="relative hidden sm:block">
                {searchOpen ? (
                  <div className="flex flex-col">
                    <div className="flex items-center gap-2 bg-slate-100 dark:bg-slate-800 rounded-xl px-3 h-10 w-[220px] md:w-[280px] transition-all duration-300 ring-2 ring-blue-500/40">
                      <FiSearch size={16} className="text-slate-400 shrink-0" />
                      <input
                        autoFocus
                        value={searchValue}
                        onChange={(e) => setSearchValue(e.target.value)}
                        placeholder="Search sessions, host, room ID..."
                        className="bg-transparent outline-none text-sm w-full text-slate-700 dark:text-slate-200 placeholder:text-slate-400"
                      />
                      <button
                        onClick={() => {
                          setSearchOpen(false);
                          setSearchValue("");
                        }}
                        aria-label="Close search"
                        className="text-slate-400 hover:text-slate-600 dark:hover:text-slate-200 cursor-pointer shrink-0"
                      >
                        <FiX size={16} />
                      </button>
                    </div>

                    {searchValue.trim() && (
                      <div className="absolute top-11 left-0 w-full min-w-[280px] bg-white dark:bg-slate-900 rounded-2xl border border-slate-200 dark:border-slate-800 shadow-2xl overflow-hidden">
                        {searching ? (
                          <div className="px-4 py-4 text-xs text-slate-400">
                            Searching…
                          </div>
                        ) : searchResults.length === 0 ? (
                          <div className="px-4 py-4 text-xs text-slate-400">
                            No live sessions match "{searchValue}"
                          </div>
                        ) : (
                          <div className="max-h-[280px] overflow-y-auto">
                            {searchResults.map((s) => (
                              <button
                                key={s.roomId}
                                onClick={() => handleResultClick(s)}
                                className="w-full text-left flex items-center justify-between gap-3 px-4 py-2.5 hover:bg-slate-50 dark:hover:bg-slate-800/60 transition-colors border-b border-slate-50 dark:border-slate-800/60 last:border-0"
                              >
                                <div className="min-w-0">
                                  <p className="text-sm font-semibold text-slate-800 dark:text-slate-100 truncate">
                                    {s.meetingTitle}
                                  </p>
                                  <p className="text-xs text-slate-500 dark:text-slate-400 truncate">
                                    {s.hostName} · {s.roomId}
                                  </p>
                                </div>
                                <span className="shrink-0 text-[10px] font-semibold text-emerald-500">
                                  live
                                </span>
                              </button>
                            ))}
                          </div>
                        )}
                      </div>
                    )}
                  </div>
                ) : (
                  <button
                    onClick={() => setSearchOpen(true)}
                    aria-label="Open search"
                    className="flex items-center gap-2 h-10 px-3 rounded-xl bg-slate-100 dark:bg-slate-800 text-slate-500 dark:text-slate-400 hover:bg-slate-200 dark:hover:bg-slate-700 transition-all duration-200 cursor-pointer"
                  >
                    <FiSearch size={16} />
                    <span className="hidden md:inline text-sm">Search</span>
                    <kbd className="hidden md:inline-flex items-center gap-0.5 text-[10px] font-semibold text-slate-400 bg-white dark:bg-slate-900 border border-slate-200 dark:border-slate-700 rounded px-1.5 py-0.5">
                      ⌘K
                    </kbd>
                  </button>
                )}
              </div>
            )}

            {/* Theme toggle */}
            <button
              onClick={toggleTheme}
              aria-label="Toggle theme"
              className="relative h-10 w-10 rounded-xl flex items-center justify-center text-slate-500 dark:text-slate-400 hover:bg-slate-100 dark:hover:bg-slate-800 transition-all duration-300 cursor-pointer overflow-hidden"
            >
              <FiSun
                size={18}
                className={`absolute transition-all duration-500 ${
                  darkMode
                    ? "opacity-0 rotate-90 scale-50"
                    : "opacity-100 rotate-0 scale-100"
                }`}
              />
              <FiMoon
                size={18}
                className={`absolute transition-all duration-500 ${
                  darkMode
                    ? "opacity-100 rotate-0 scale-100"
                    : "opacity-0 -rotate-90 scale-50"
                }`}
              />
            </button>

            {/* Notifications — real, socket-driven */}
            {user && (
              <div ref={notifRef} className="relative">
                <button
                  onClick={() => {
                    setNotifOpen((v) => !v);
                    if (!notifOpen) markAllRead();
                  }}
                  aria-label="Notifications"
                  aria-expanded={notifOpen}
                  className="relative h-10 w-10 rounded-xl flex items-center justify-center text-slate-500 dark:text-slate-400 hover:bg-slate-100 dark:hover:bg-slate-800 transition-all duration-200 cursor-pointer"
                >
                  <FiBell size={18} />
                  {unreadCount > 0 && (
                    <span className="absolute top-1.5 right-1.5 h-4 min-w-4 px-1 rounded-full bg-red-500 text-white text-[10px] font-bold flex items-center justify-center ring-2 ring-white dark:ring-slate-900">
                      {unreadCount}
                    </span>
                  )}
                </button>

                <div
                  className={`absolute right-0 mt-3 w-[340px] bg-white dark:bg-slate-900 rounded-2xl border border-slate-200 dark:border-slate-800 shadow-2xl overflow-hidden transition-all duration-250 origin-top-right ${
                    notifOpen
                      ? "opacity-100 scale-100 translate-y-0"
                      : "opacity-0 scale-95 -translate-y-2 pointer-events-none"
                  }`}
                >
                  <div className="flex items-center justify-between px-4 py-3 border-b border-slate-100 dark:border-slate-800">
                    <h3 className="font-bold text-slate-800 dark:text-slate-100 text-sm">
                      Notifications
                    </h3>
                  </div>

                  <div className="max-h-[320px] overflow-y-auto">
                    {notifications.length === 0 ? (
                      <div className="px-4 py-8 text-center text-xs text-slate-400">
                        Nothing yet — you'll see it here the moment someone
                        joins a session you're hosting.
                      </div>
                    ) : (
                      notifications.map((n) => (
                        <div
                          key={n.id}
                          className="flex gap-3 px-4 py-3 hover:bg-slate-50 dark:hover:bg-slate-800/60 transition-colors duration-150 border-b border-slate-50 dark:border-slate-800/60 last:border-0"
                        >
                          <span
                            className={`mt-1.5 h-2 w-2 rounded-full shrink-0 ${
                              n.unread ? "bg-blue-500" : "bg-transparent"
                            }`}
                          />
                          <div className="min-w-0">
                            <p className="text-sm font-semibold text-slate-800 dark:text-slate-100 truncate">
                              {n.title}
                            </p>
                            <p className="text-xs text-slate-500 dark:text-slate-400 line-clamp-2">
                              {n.detail}
                            </p>
                            <p className="text-[11px] text-slate-400 dark:text-slate-500 mt-0.5">
                              {n.time}
                            </p>
                          </div>
                        </div>
                      ))
                    )}
                  </div>
                </div>
              </div>
            )}

            {/* Host Session CTA — gated */}
            <button
              onClick={handleHostSession}
              className="hidden md:flex items-center gap-2 h-10 px-4 rounded-xl bg-gradient-to-r from-blue-600 via-cyan-500 to-purple-600 text-white text-sm font-bold shadow-md shadow-blue-500/20 hover:shadow-lg hover:shadow-blue-500/40 hover:scale-[1.03] active:scale-95 transition-all duration-200 cursor-pointer"
            >
              <FiVideo size={16} />
              Host Session
            </button>

            {/* ------------------------------------------------------ */}
            {/* Auth area */}
            {/* ------------------------------------------------------ */}
            {userLoading ? (
              <div className="h-10 w-10 rounded-full bg-slate-200 dark:bg-slate-800 animate-pulse" />
            ) : user ? (
              <div ref={profileRef} className="relative">
                <button
                  onClick={() => setShowProfile((v) => !v)}
                  aria-expanded={showProfile}
                  className="flex items-center gap-2 cursor-pointer group pl-1 pr-1 md:pr-2 py-1 rounded-full hover:bg-slate-100 dark:hover:bg-slate-800 transition-all duration-200"
                >
                  <div className="relative h-9 w-9 rounded-full bg-gradient-to-r from-blue-600 via-cyan-500 to-purple-600 flex items-center justify-center text-white font-bold text-sm shadow-md group-hover:scale-105 transition-all duration-300">
                    {user?.name?.charAt(0).toUpperCase()}
                    <span className="absolute -bottom-0.5 -right-0.5 h-3 w-3 rounded-full bg-emerald-400 ring-2 ring-white dark:ring-slate-900">
                      <span className="absolute inset-0 rounded-full bg-emerald-400 animate-ping opacity-75" />
                    </span>
                  </div>

                  <div className="hidden md:flex flex-col items-start leading-tight">
                    <span className="font-semibold text-slate-800 dark:text-slate-100 text-sm max-w-[110px] truncate">
                      {user?.name}
                    </span>
                    <span className="text-[11px] text-emerald-500 font-medium">
                      Online
                    </span>
                  </div>

                  <FiChevronDown
                    size={16}
                    className={`hidden md:block text-slate-400 transition-transform duration-300 ${
                      showProfile ? "rotate-180" : ""
                    }`}
                  />
                </button>

                {/* Dropdown */}
                <div
                  className={`absolute right-0 mt-3 w-[300px] bg-white dark:bg-slate-900 rounded-3xl border border-slate-200 dark:border-slate-800 shadow-2xl overflow-hidden transition-all duration-300 origin-top-right ${
                    showProfile
                      ? "opacity-100 scale-100 translate-y-0"
                      : "opacity-0 scale-95 -translate-y-2 pointer-events-none"
                  }`}
                >
                  {/* Header */}
                  <div className="bg-gradient-to-r from-blue-600 via-cyan-500 to-purple-600 p-6 text-white">
                    <div className="h-16 w-16 mx-auto rounded-full bg-white/20 backdrop-blur-lg flex items-center justify-center text-2xl font-bold border border-white/20">
                      {user?.name?.charAt(0).toUpperCase()}
                    </div>
                    <h2 className="text-center text-lg font-bold mt-3 truncate">
                      {user?.name}
                    </h2>
                    <p className="text-center text-xs text-white/80 truncate">
                      {user?.email}
                    </p>
                  </div>

                  {/* Quick links */}
                  <div className="p-2">
                    {PROFILE_LINKS.map(({ label, icon: Icon, to }, idx) => (
                      <Link
                        key={to}
                        to={to}
                        onClick={() => setShowProfile(false)}
                        style={{
                          transitionDelay: showProfile
                            ? `${idx * 30}ms`
                            : "0ms",
                        }}
                        className={`flex items-center gap-3 px-4 py-2.5 rounded-xl text-sm font-medium text-slate-600 dark:text-slate-300 hover:bg-slate-50 dark:hover:bg-slate-800 hover:text-slate-900 dark:hover:text-white transition-all duration-200 ${
                          showProfile
                            ? "opacity-100 translate-x-0"
                            : "opacity-0 -translate-x-2"
                        }`}
                      >
                        <Icon size={16} />
                        {label}
                      </Link>
                    ))}
                  </div>

                  {/* Logout */}
                  <div className="px-3 pb-3">
                    {confirmingLogout ? (
                      <div className="flex gap-2">
                        <button
                          onClick={logoutdata}
                          className="flex-1 h-11 rounded-xl bg-red-500 text-white font-semibold text-sm hover:bg-red-600 transition-all duration-200 cursor-pointer"
                        >
                          Confirm logout
                        </button>
                        <button
                          onClick={() => setConfirmingLogout(false)}
                          className="h-11 px-4 rounded-xl bg-slate-100 dark:bg-slate-800 text-slate-600 dark:text-slate-300 font-semibold text-sm hover:bg-slate-200 dark:hover:bg-slate-700 transition-all duration-200 cursor-pointer"
                        >
                          Cancel
                        </button>
                      </div>
                    ) : (
                      <button
                        onClick={() => setConfirmingLogout(true)}
                        className="w-full flex items-center justify-center gap-2 h-11 rounded-xl bg-red-50 dark:bg-red-500/10 text-red-500 font-semibold text-sm hover:bg-red-500 hover:text-white transition-all duration-200 cursor-pointer"
                      >
                        <FiLogOut size={16} />
                        Logout
                      </button>
                    )}
                  </div>
                </div>
              </div>
            ) : (
              <div className="hidden sm:flex gap-3">
                <Link
                  to="/register"
                  className="h-10 px-4 flex items-center justify-center rounded-xl border border-slate-200 dark:border-slate-700 text-slate-700 dark:text-slate-200 font-semibold text-sm hover:bg-slate-50 dark:hover:bg-slate-800 transition-all duration-200"
                >
                  Sign up
                </Link>
                <Link
                  to="/login"
                  className="h-10 px-4 flex items-center justify-center rounded-xl bg-gradient-to-r from-blue-600 via-cyan-500 to-purple-600 text-white font-semibold text-sm shadow-md shadow-blue-500/20 hover:shadow-lg hover:shadow-blue-500/40 hover:scale-[1.03] active:scale-95 transition-all duration-200"
                >
                  Login
                </Link>
              </div>
            )}

            {/* Mobile menu trigger */}
            <button
              onClick={() => setMobileOpen(true)}
              aria-label="Open menu"
              className="lg:hidden h-10 w-10 rounded-xl flex items-center justify-center text-slate-600 dark:text-slate-300 hover:bg-slate-100 dark:hover:bg-slate-800 transition-all duration-200 cursor-pointer"
            >
              <FiMenu size={20} />
            </button>
          </div>
        </div>
      </header>

      {/* Mobile drawer */}
      <div
        className={`fixed inset-0 z-[60] lg:hidden transition-all duration-300 ${
          mobileOpen ? "pointer-events-auto" : "pointer-events-none"
        }`}
      >
        <div
          onClick={() => setMobileOpen(false)}
          className={`absolute inset-0 bg-slate-900/50 backdrop-blur-sm transition-opacity duration-300 ${
            mobileOpen ? "opacity-100" : "opacity-0"
          }`}
        />

        <div
          className={`absolute top-0 right-0 h-full w-[82%] max-w-[340px] bg-white dark:bg-slate-900 shadow-2xl flex flex-col transition-transform duration-300 ease-out ${
            mobileOpen ? "translate-x-0" : "translate-x-full"
          }`}
        >
          <div className="flex items-center justify-between px-5 h-[68px] border-b border-slate-100 dark:border-slate-800">
            <span className="font-black tracking-wider bg-gradient-to-r from-red-500 via-orange-500 to-pink-500 bg-clip-text text-transparent">
              LIVE CLASSES
            </span>
            <button
              onClick={() => setMobileOpen(false)}
              aria-label="Close menu"
              className="h-9 w-9 rounded-xl flex items-center justify-center text-slate-500 hover:bg-slate-100 dark:hover:bg-slate-800 transition-all duration-200"
            >
              <FiX size={20} />
            </button>
          </div>

          {user && (
            <div className="flex items-center gap-3 px-5 py-4 border-b border-slate-100 dark:border-slate-800">
              <div className="h-11 w-11 rounded-full bg-gradient-to-r from-blue-600 via-cyan-500 to-purple-600 flex items-center justify-center text-white font-bold shrink-0">
                {user?.name?.charAt(0).toUpperCase()}
              </div>
              <div className="min-w-0">
                <p className="font-semibold text-slate-800 dark:text-slate-100 text-sm truncate">
                  {user?.name}
                </p>
                <p className="text-xs text-slate-500 dark:text-slate-400 truncate">
                  {user?.email}
                </p>
              </div>
            </div>
          )}
          <nav className="flex flex-col p-3 gap-1 overflow-y-auto">
            {NAV_LINKS.map(({ label, to, icon: Icon }) => (
              <Link
                key={to}
                to={to}
                onClick={() => setMobileOpen(false)}
                className={`flex items-center gap-3 px-4 py-3 rounded-xl text-sm font-semibold transition-all duration-200 ${
                  isActive(to)
                    ? "bg-blue-50 dark:bg-blue-500/10 text-blue-600 dark:text-blue-400"
                    : "text-slate-600 dark:text-slate-300 hover:bg-slate-50 dark:hover:bg-slate-800"
                }`}
              >
                <Icon size={18} />
                {label}
              </Link>
            ))}

            <div className="h-px bg-slate-100 dark:bg-slate-800 my-2" />

            <button
              onClick={() => {
                setMobileOpen(false);
                handleHostSession();
              }}
              className="flex items-center gap-3 px-4 py-3 rounded-xl text-sm font-bold text-white bg-gradient-to-r from-blue-600 via-cyan-500 to-purple-600 shadow-md shadow-blue-500/20"
            >
              <FiVideo size={18} />
              Host Session
            </button>
          </nav>
          <div className="mt-auto p-3 border-t border-slate-100 dark:border-slate-800">
            {user ? (
              <button
                onClick={() => {
                  logoutdata();
                  setMobileOpen(false);
                }}
                className="w-full flex items-center justify-center gap-2 h-11 rounded-xl bg-red-50 dark:bg-red-500/10 text-red-500 font-semibold text-sm hover:bg-red-500 hover:text-white transition-all duration-200"
              >
                <FiLogOut size={16} />
                Logout
              </button>
            ) : (
              <div className="flex flex-col gap-2">
                <Link
                  to="/login"
                  onClick={() => setMobileOpen(false)}
                  className="h-11 flex items-center justify-center rounded-xl bg-gradient-to-r from-blue-600 via-cyan-500 to-purple-600 text-white font-semibold text-sm"
                >
                  Login
                </Link>
                <Link
                  to="/register"
                  onClick={() => setMobileOpen(false)}
                  className="h-11 flex items-center justify-center rounded-xl border border-slate-200 dark:border-slate-700 text-slate-700 dark:text-slate-200 font-semibold text-sm"
                >
                  Sign up
                </Link>
              </div>
            )}
          </div>
        </div>
      </div>
    </>
  );
}

export default Navbar;
