import { useState, useEffect, useRef } from "react";
import { motion, AnimatePresence, useInView } from "framer-motion";
import {
  FaVideo,
  FaUsers,
  FaShieldAlt,
  FaBolt,
  FaComments,
  FaDesktop,
  FaCloudUploadAlt,
  FaChalkboardTeacher,
  FaDoorOpen,
  FaCalendarAlt,
  FaMicrophoneAltSlash,
  FaImage,
  FaPoll,
  FaClipboardCheck,
  FaLock,
  FaMobileAlt,
  FaChartLine,
  FaClosedCaptioning,
  FaUserClock,
  FaFileAlt,
  FaClock,
  FaUserShield,
  FaSmile,
  FaAlignLeft,
  FaPlug,
  FaHeadset,
} from "react-icons/fa";

const categories = ["All", "Meetings", "Classes", "Security", "Collaboration"];

const features = [
  {
    icon: <FaVideo />,
    title: "HD Meetings",
    desc: "Crystal clear video quality.",
    cat: "Meetings",
  },
  {
    icon: <FaDesktop />,
    title: "Screen Share",
    desc: "Present ideas instantly.",
    cat: "Meetings",
  },
  {
    icon: <FaComments />,
    title: "Live Chat",
    desc: "Real-time communication.",
    cat: "Collaboration",
  },
  {
    icon: <FaShieldAlt />,
    title: "Secure",
    desc: "Enterprise-grade protection.",
    cat: "Security",
  },
  {
    icon: <FaBolt />,
    title: "Fast",
    desc: "Ultra-low latency calls.",
    cat: "Meetings",
  },
  {
    icon: <FaUsers />,
    title: "Scalable",
    desc: "Host large audiences.",
    cat: "Meetings",
  },
  {
    icon: <FaCloudUploadAlt />,
    title: "Cloud Recording",
    desc: "Auto-saved to the cloud.",
    cat: "Meetings",
  },
  {
    icon: <FaChalkboardTeacher />,
    title: "Virtual Whiteboard",
    desc: "Draw and collaborate live.",
    cat: "Classes",
  },
  {
    icon: <FaDoorOpen />,
    title: "Breakout Rooms",
    desc: "Split into small groups.",
    cat: "Classes",
  },
  {
    icon: <FaCalendarAlt />,
    title: "Calendar Sync",
    desc: "Google & Outlook integration.",
    cat: "Collaboration",
  },
  {
    icon: <FaMicrophoneAltSlash />,
    title: "Noise Cancellation",
    desc: "AI-powered audio cleanup.",
    cat: "Meetings",
  },
  {
    icon: <FaImage />,
    title: "Custom Backgrounds",
    desc: "Blur or virtual scenes.",
    cat: "Meetings",
  },
  {
    icon: <FaPoll />,
    title: "Polls & Q&A",
    desc: "Real-time audience engagement.",
    cat: "Classes",
  },
  {
    icon: <FaClipboardCheck />,
    title: "Attendance Tracking",
    desc: "Automatic class attendance.",
    cat: "Classes",
  },
  {
    icon: <FaLock />,
    title: "End-to-End Encryption",
    desc: "Bank-grade call security.",
    cat: "Security",
  },
  {
    icon: <FaMobileAlt />,
    title: "Multi-Device Support",
    desc: "Web, iOS, Android, desktop.",
    cat: "Collaboration",
  },
  {
    icon: <FaChartLine />,
    title: "Analytics Dashboard",
    desc: "Engagement & usage insights.",
    cat: "Collaboration",
  },
  {
    icon: <FaClosedCaptioning />,
    title: "Live Captions",
    desc: "Real-time transcription.",
    cat: "Classes",
  },
  {
    icon: <FaUserClock />,
    title: "Waiting Room",
    desc: "Host-controlled entry.",
    cat: "Security",
  },
  {
    icon: <FaFileAlt />,
    title: "File Sharing",
    desc: "Share docs during a call.",
    cat: "Collaboration",
  },
  {
    icon: <FaClock />,
    title: "Smart Scheduler",
    desc: "Find the best time for all.",
    cat: "Collaboration",
  },
  {
    icon: <FaUserShield />,
    title: "Role-Based Access",
    desc: "Control who can do what.",
    cat: "Security",
  },
  {
    icon: <FaSmile />,
    title: "Reactions & Emojis",
    desc: "Express without interrupting.",
    cat: "Collaboration",
  },
  {
    icon: <FaAlignLeft />,
    title: "Meeting Transcripts",
    desc: "Searchable call transcripts.",
    cat: "Classes",
  },
  {
    icon: <FaPlug />,
    title: "App Integrations",
    desc: "Slack, Notion, Zoom & more.",
    cat: "Collaboration",
  },
  {
    icon: <FaHeadset />,
    title: "24/7 Support",
    desc: "Real humans, always on.",
    cat: "Security",
  },
];

const stats = [
  { label: "Meetings hosted", value: 10, suffix: "M+" },
  { label: "Countries", value: 150, suffix: "+" },
  { label: "Uptime", value: 99.9, suffix: "%" },
  { label: "Support", value: 24, suffix: "/7" },
];

function useCountUp(target, inView, duration = 1.6) {
  const [value, setValue] = useState(0);
  useEffect(() => {
    if (!inView) return;
    let start = null;
    let frame;
    const step = (timestamp) => {
      if (!start) start = timestamp;
      const progress = Math.min((timestamp - start) / (duration * 1000), 1);
      setValue(Number((progress * target).toFixed(target % 1 !== 0 ? 1 : 0)));
      if (progress < 1) frame = requestAnimationFrame(step);
    };
    frame = requestAnimationFrame(step);
    return () => cancelAnimationFrame(frame);
  }, [inView, target, duration]);
  return value;
}

function StatItem({ stat }) {
  const ref = useRef(null);
  const inView = useInView(ref, { once: true, amount: 0.5 });
  const count = useCountUp(stat.value, inView);

  return (
    <div ref={ref} className="text-center">
      <div className="text-3xl md:text-4xl font-black text-slate-900 dark:text-white">
        {count}
        <span className="bg-gradient-to-r from-blue-600 to-cyan-500 bg-clip-text text-transparent">
          {stat.suffix}
        </span>
      </div>
      <p className="mt-1 text-xs md:text-sm text-slate-500 dark:text-gray-400 font-medium">
        {stat.label}
      </p>
    </div>
  );
}

function Upp2() {
  const [activeCategory, setActiveCategory] = useState("All");

  const filteredFeatures =
    activeCategory === "All"
      ? features
      : features.filter((f) => f.cat === activeCategory);

  return (
    <section className="relative overflow-hidden bg-gradient-to-b from-slate-50 via-white to-slate-100 dark:from-gray-950 dark:via-gray-950 dark:to-gray-900 py-20 transition-colors duration-500">
      {/* Animated Background */}
      <div className="absolute inset-0 overflow-hidden pointer-events-none">
        <motion.div
          animate={{ x: [0, 40, 0], y: [0, 30, 0], opacity: [0.5, 0.8, 0.5] }}
          transition={{ duration: 9, repeat: Infinity, ease: "easeInOut" }}
          className="absolute top-0 left-0 h-72 w-72 rounded-full bg-blue-500/10 dark:bg-blue-500/10 blur-3xl"
        />
        <motion.div
          animate={{ x: [0, -40, 0], y: [0, -30, 0], opacity: [0.5, 0.8, 0.5] }}
          transition={{
            duration: 10,
            repeat: Infinity,
            ease: "easeInOut",
            delay: 1,
          }}
          className="absolute bottom-0 right-0 h-72 w-72 rounded-full bg-cyan-400/10 dark:bg-cyan-400/10 blur-3xl"
        />
        <motion.div
          animate={{ scale: [1, 1.15, 1], opacity: [0.3, 0.5, 0.3] }}
          transition={{
            duration: 8,
            repeat: Infinity,
            ease: "easeInOut",
            delay: 2,
          }}
          className="absolute top-1/2 left-1/2 -translate-x-1/2 -translate-y-1/2 h-96 w-96 rounded-full bg-purple-400/10 dark:bg-purple-500/10 blur-3xl"
        />
        {/* Drifting particles */}
        {[...Array(8)].map((_, i) => (
          <motion.div
            key={i}
            className="absolute h-1.5 w-1.5 rounded-full bg-blue-400/40 dark:bg-blue-400/30"
            style={{
              top: `${10 + i * 11}%`,
              left: `${(i * 37) % 100}%`,
            }}
            animate={{ y: [0, -30, 0], opacity: [0.2, 0.7, 0.2] }}
            transition={{
              duration: 4 + i,
              repeat: Infinity,
              ease: "easeInOut",
              delay: i * 0.3,
            }}
          />
        ))}
        {/* Grid overlay */}
        <div
          className="absolute inset-0 opacity-[0.025] dark:opacity-[0.04]"
          style={{
            backgroundImage:
              "linear-gradient(to right, #000 1px, transparent 1px), linear-gradient(to bottom, #000 1px, transparent 1px)",
            backgroundSize: "44px 44px",
          }}
        />
      </div>

      {/* FULL-BLEED FIXED CONTAINER — consistent padding at every breakpoint, capped on ultra-wide */}
      <div className="relative w-full max-w-[1800px] mx-auto px-5 sm:px-8 md:px-12 lg:px-16 xl:px-20">
        {/* Heading */}
        <motion.div
          initial={{ opacity: 0, y: 25 }}
          whileInView={{ opacity: 1, y: 0 }}
          viewport={{ once: true }}
          transition={{ duration: 0.5 }}
          className="text-center"
        >
          <span className="inline-block rounded-full border border-blue-200 dark:border-blue-900 bg-blue-50 dark:bg-blue-950/50 px-4 py-1 text-xs font-semibold uppercase tracking-wider text-blue-700 dark:text-blue-300">
            Features
          </span>

          <h2 className="mt-4 text-3xl md:text-4xl lg:text-5xl font-black text-slate-900 dark:text-white">
            Everything for
            <span className="block bg-gradient-to-r from-blue-600 via-cyan-500 to-indigo-600 bg-clip-text text-transparent bg-[length:200%_auto] animate-[shimmerMove_6s_linear_infinite]">
              Online Meetings
            </span>
          </h2>

          <p className="mx-auto mt-3 max-w-xl text-sm md:text-base text-slate-600 dark:text-gray-400">
            Modern tools for meetings, webinars and virtual classrooms — all in
            one platform.
          </p>
        </motion.div>

        <style>{`
          @keyframes shimmerMove {
            0% { background-position: -200% 0; }
            100% { background-position: 200% 0; }
          }
        `}</style>

        {/* Category Filter Tabs */}
        <motion.div
          initial={{ opacity: 0, y: 15 }}
          whileInView={{ opacity: 1, y: 0 }}
          viewport={{ once: true }}
          transition={{ delay: 0.15, duration: 0.4 }}
          className="mt-10 flex flex-wrap justify-center gap-2"
        >
          {categories.map((cat) => (
            <button
              key={cat}
              onClick={() => setActiveCategory(cat)}
              className={`relative rounded-full px-5 py-2 text-sm font-semibold transition-colors duration-300 cursor-pointer ${
                activeCategory === cat
                  ? "text-white"
                  : "text-slate-600 dark:text-gray-300 hover:text-slate-900 dark:hover:text-white"
              }`}
            >
              {activeCategory === cat && (
                <motion.span
                  layoutId="active-pill"
                  transition={{ type: "spring", stiffness: 350, damping: 28 }}
                  className="absolute inset-0 rounded-full bg-gradient-to-r from-blue-600 to-cyan-500 shadow-lg"
                />
              )}
              <span className="relative">{cat}</span>
            </button>
          ))}
        </motion.div>

        {/* Cards Grid */}
        <motion.div
          layout
          className="mt-12 grid grid-cols-1 sm:grid-cols-2 xl:grid-cols-3 gap-6 w-full"
        >
          <AnimatePresence mode="popLayout">
            {filteredFeatures.map((item) => (
              <motion.div
                key={item.title}
                layout
                initial={{ opacity: 0, y: 30, scale: 0.95 }}
                animate={{ opacity: 1, y: 0, scale: 1 }}
                exit={{ opacity: 0, scale: 0.9 }}
                transition={{ duration: 0.35, ease: "easeOut" }}
                whileHover={{ y: -6, scale: 1.015 }}
                className="group relative overflow-hidden rounded-2xl border border-white/60 dark:border-gray-800 bg-white/80 dark:bg-gray-900/80 backdrop-blur-xl p-6 shadow-md hover:shadow-2xl transition-shadow duration-300 cursor-pointer"
              >
                {/* Animated border sweep on hover */}
                <div className="pointer-events-none absolute inset-0 rounded-2xl opacity-0 group-hover:opacity-100 transition-opacity duration-500">
                  <div className="absolute inset-0 rounded-2xl bg-gradient-to-r from-blue-500/0 via-cyan-400/40 to-blue-500/0 blur-md" />
                </div>

                {/* Glow */}
                <div className="absolute inset-0 opacity-0 transition-opacity duration-500 group-hover:opacity-100 bg-gradient-to-br from-blue-50 to-cyan-50 dark:from-blue-950/40 dark:to-cyan-950/40" />

                <div className="relative z-10">
                  <div className="flex h-11 w-11 items-center justify-center rounded-xl bg-gradient-to-r from-blue-600 to-cyan-500 text-white text-base shadow-lg group-hover:scale-110 group-hover:shadow-[0_0_24px_rgba(59,130,246,0.5)] transition-all duration-300">
                    {item.icon}
                  </div>

                  <h3 className="mt-3 text-base font-bold text-slate-900 dark:text-white">
                    {item.title}
                  </h3>

                  <p className="mt-1 text-sm text-slate-600 dark:text-gray-400 leading-relaxed">
                    {item.desc}
                  </p>

                  <span className="mt-3 inline-block rounded-full bg-slate-100 dark:bg-gray-800 px-2.5 py-0.5 text-[10px] font-semibold uppercase tracking-wide text-slate-500 dark:text-gray-400">
                    {item.cat}
                  </span>
                </div>

                {/* Bottom Border */}
                <div className="absolute bottom-0 left-0 h-[3px] w-0 bg-gradient-to-r from-blue-600 to-cyan-500 transition-all duration-500 group-hover:w-full" />
              </motion.div>
            ))}
          </AnimatePresence>
        </motion.div>

        {/* Stats Strip */}
        <motion.div
          initial={{ opacity: 0, y: 25 }}
          whileInView={{ opacity: 1, y: 0 }}
          viewport={{ once: true }}
          transition={{ duration: 0.5 }}
          className="mt-20 rounded-3xl border border-white/60 dark:border-gray-800 bg-white/70 dark:bg-gray-900/70 backdrop-blur-xl px-6 py-10 shadow-lg"
        >
          <div className="grid grid-cols-2 md:grid-cols-4 gap-8">
            {stats.map((stat) => (
              <StatItem key={stat.label} stat={stat} />
            ))}
          </div>
        </motion.div>

        {/* Bottom CTA */}
        <motion.div
          initial={{ opacity: 0, y: 20 }}
          whileInView={{ opacity: 1, y: 0 }}
          viewport={{ once: true }}
          transition={{ duration: 0.5, delay: 0.1 }}
          className="mt-16 flex flex-col items-center text-center"
        >
          <h3 className="text-xl md:text-2xl font-bold text-slate-900 dark:text-white">
            Ready to see it in action?
          </h3>
          <p className="mt-2 text-sm text-slate-600 dark:text-gray-400 max-w-md">
            Start hosting meetings and classes with all 26+ features included,
            free to try.
          </p>
          <button className="mt-6 h-12 rounded-2xl bg-gradient-to-r from-blue-600 to-cyan-500 px-8 font-semibold text-white shadow-lg hover:shadow-2xl hover:-translate-y-0.5 transition-all duration-300 cursor-pointer">
            Explore all features
          </button>
        </motion.div>
      </div>
    </section>
  );
}

export default Upp2;
