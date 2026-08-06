import {
  FaArrowRight,
  FaPlay,
  FaUsers,
  FaVideo,
  FaMapMarkedAlt,
  FaCompass,
} from "react-icons/fa";
import { motion } from "framer-motion";
import { Link } from "react-router-dom";
import { useEffect, useState } from "react";
import api from "../../config/Api";

function Upp1() {
  const [user, setUser] = useState(null);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    fetchUser();
  }, []);

  const fetchUser = async () => {
    try {
      setLoading(true);

      const res = await api.get("/alldata");

      setUser(res.data.sabdata);
    } catch (err) {
      setUser(null);
      console.log(err);
    } finally {
      setLoading(false);
    }
  };

  return (
    <section className="relative min-h-screen overflow-hidden bg-white pt-[90px] pb-20 px-6">
      {/* Background Blur */}
      <div className="absolute inset-0 overflow-hidden">
        <div className="absolute top-20 left-20 h-80 w-80 rounded-full bg-blue-100 blur-3xl opacity-60"></div>

        <div className="absolute bottom-20 right-20 h-80 w-80 rounded-full bg-cyan-100 blur-3xl opacity-60"></div>
      </div>

      <div className="relative max-w-7xl mx-auto grid lg:grid-cols-2 gap-20 items-center">
        {/* LEFT CONTENT */}
        <div>
          {/* Badge */}
          <motion.div
            initial={{ opacity: 0, y: -15 }}
            animate={{ opacity: 1, y: 0 }}
            className="inline-flex items-center gap-2 rounded-full border border-blue-100 bg-blue-50 px-4 py-2 text-sm font-semibold text-blue-700"
          >
            <span className="h-2 w-2 rounded-full bg-green-500 animate-pulse"></span>
            Live Video Platform
          </motion.div>

          {/* Heading */}
          <motion.h1
            initial={{ opacity: 0, y: 25 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ delay: 0.1 }}
            className="mt-8 text-[20px] md:text-6xl font-black leading-[1.05] tracking-tight text-gray-900"
          >
            Connect with your
            <span className="block bg-gradient-to-r from-blue-600 via-cyan-500 to-purple-600 bg-clip-text text-transparent">
              audience in real time
            </span>
          </motion.h1>

          {/* Description */}
          <motion.p
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            transition={{ delay: 0.2 }}
            className="mt-6 max-w-xl text-lg text-gray-600 leading-relaxed"
          >
            Host meetings, webinars, live classes and online events with crystal
            clear video, ultra-low latency and enterprise-grade reliability.
          </motion.p>

          {/* Buttons */}
          <motion.div
            initial={{ opacity: 0, y: 25 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ delay: 0.3 }}
            className="mt-10 flex flex-col sm:flex-row flex-wrap gap-4"
          >
            {/* MAIN AUTH BUTTON */}
            {loading ? (
              <div className="h-14 w-52 rounded-2xl bg-gray-200 animate-pulse"></div>
            ) : user ? (
              <Link
                to="/dashboard"
                className="group h-14 rounded-2xl bg-gradient-to-r from-blue-600 via-cyan-500 to-purple-600 px-8 flex items-center justify-center font-semibold text-white shadow-xl hover:scale-105 hover:shadow-2xl transition-all duration-300"
              >
                Go To Dashboard
                <FaArrowRight className="ml-3 group-hover:translate-x-1 transition-transform" />
              </Link>
            ) : (
              <Link
                to="/register"
                className="group h-14 rounded-2xl bg-gray-900 px-8 flex items-center justify-center font-semibold text-white hover:-translate-y-1 hover:shadow-2xl transition-all duration-300"
              >
                Get Started Free
                <FaArrowRight className="ml-3 group-hover:translate-x-1 transition-transform" />
              </Link>
            )}

            {/* WATCH DEMO */}
            <button className="group h-14 rounded-2xl border border-gray-200 bg-white px-8 font-semibold text-gray-800 hover:-translate-y-1 hover:shadow-lg transition-all duration-300">
              <span className="flex items-center gap-3">
                <FaPlay className="text-sm group-hover:scale-110 transition-transform" />
                Watch Demo
              </span>
            </button>

            {/* OPPORTUNITY MAP - ALWAYS VISIBLE */}
            <Link
              to="/opportunity-map"
              className="group relative h-14 overflow-hidden rounded-2xl p-[1.5px] shadow-lg hover:shadow-2xl hover:-translate-y-1 transition-all duration-300"
            >
              {/* Gradient Border */}
              <span className="absolute inset-0 bg-gradient-to-r from-blue-600 via-cyan-500 to-purple-600"></span>

              {/* Button Content */}
              <span className="relative flex h-full items-center justify-center gap-3 rounded-[14px] bg-white px-7 font-bold text-gray-800 transition-all duration-300 group-hover:bg-gray-50">
                {/* Icon Container */}
                <span className="flex h-9 w-9 items-center justify-center rounded-xl bg-gradient-to-br from-blue-600 via-cyan-500 to-purple-600 text-white shadow-md group-hover:rotate-6 group-hover:scale-110 transition-all duration-300">
                  <FaMapMarkedAlt className="text-sm" />
                </span>

                {/* Text */}
                <span className="flex flex-col items-start leading-none">
                  <span className="text-sm font-extrabold">
                    Opportunity Map
                  </span>

                  <span className="mt-1 text-[10px] font-medium text-gray-500">
                    Explore opportunities
                  </span>
                </span>

                {/* Arrow */}
                <FaArrowRight className="ml-1 text-xs text-blue-600 group-hover:translate-x-1 transition-transform duration-300" />
              </span>
            </Link>
          </motion.div>

          {/* Opportunity Map Small Highlight */}
          <motion.div
            initial={{ opacity: 0, x: -15 }}
            animate={{ opacity: 1, x: 0 }}
            transition={{ delay: 0.45 }}
            className="mt-5"
          >
            <Link
              to="/opportunity-map"
              className="group inline-flex items-center gap-2 text-sm font-medium text-gray-500 hover:text-blue-600 transition-colors"
            >
              <span className="flex h-7 w-7 items-center justify-center rounded-full bg-blue-50 text-blue-600 group-hover:bg-blue-600 group-hover:text-white transition-all duration-300">
                <FaCompass className="text-xs" />
              </span>

              <span>Discover jobs, internships & events around you</span>

              <FaArrowRight className="text-xs group-hover:translate-x-1 transition-transform duration-300" />
            </Link>
          </motion.div>

          {/* Stats */}
          <div className="mt-10 flex flex-wrap gap-6 text-sm font-medium text-gray-500">
            <span>
              <span className="h-[60px] w-[50px] rounded-full bg-green-400 text-white">
                ✓
              </span>{" "}
              No credit card
            </span>

            <span>
              <span className="h-[10%] w-[10%] rounded-full bg-green-400 text-white">
                ✓
              </span>{" "}
              Setup in minutes
            </span>

            <span>
              <span className="h-[60px] w-[50px] rounded-full bg-green-400 text-white">
                ✓
              </span>{" "}
              HD video
            </span>

            <span>
              <span className="h-[60px] w-[50px] rounded-full bg-green-400 text-white">
                ✓
              </span>{" "}
              99.9% uptime
            </span>
          </div>
        </div>

        {/* RIGHT PREVIEW */}
        <motion.div
          initial={{ opacity: 0, y: 60 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ delay: 0.4 }}
          className="relative"
        >
          {/* Active Users Card */}
          <motion.div
            animate={{ y: [0, -12, 0] }}
            transition={{
              duration: 4,
              repeat: Infinity,
            }}
            className="absolute -left-8 top-10 hidden lg:flex"
          >
            <div className="rounded-2xl bg-white p-5 border border-gray-100 shadow-xl cursor-pointer">
              <FaUsers className="text-blue-600 text-2xl" />

              <h3 className="mt-3 text-xl font-bold text-gray-900">12K+</h3>

              <p className="text-sm text-gray-500">Active Users</p>
            </div>
          </motion.div>

          {/* HD Card */}
          <motion.div
            animate={{ y: [0, 12, 0] }}
            transition={{
              duration: 5,
              repeat: Infinity,
            }}
            className="absolute -right-8 bottom-10 hidden lg:flex"
          >
            <div className="rounded-2xl bg-white p-5 border border-gray-100 shadow-xl cursor-pointer">
              <FaVideo className="text-purple-600 text-2xl" />

              <h3 className="mt-3 text-xl font-bold text-gray-900">4K HD</h3>

              <p className="text-sm text-gray-500">Streaming</p>
            </div>
          </motion.div>

          {/* Main Preview */}
          <div className="overflow-hidden rounded-[32px] border border-gray-100 bg-white shadow-[0_40px_120px_rgba(0,0,0,0.08)]">
            {/* Browser Top */}
            <div className="flex items-center gap-2 border-b border-gray-100 px-5 py-4">
              <div className="h-3 w-3 rounded-full bg-red-400"></div>

              <div className="h-3 w-3 rounded-full bg-yellow-400"></div>

              <div className="h-3 w-3 rounded-full bg-green-400"></div>
            </div>

            {/* Preview Area */}
            <div className="h-[450px] bg-gradient-to-br from-blue-50 via-white to-cyan-50 flex flex-col items-center justify-center">
              <div className="relative h-80 w-80 flex items-center justify-center">
                {/* Ring */}
                <div className="absolute h-64 w-64 rounded-full border border-blue-200"></div>

                <div className="absolute h-52 w-52 rounded-full border border-cyan-200"></div>

                {/* Globe */}
                <div className="relative h-36 w-36 rounded-full overflow-hidden bg-gradient-to-br from-blue-600 via-cyan-500 to-purple-600 shadow-2xl">
                  <div className="absolute inset-0 opacity-30">
                    <div className="absolute top-6 w-full border-t border-white"></div>

                    <div className="absolute top-12 w-full border-t border-white"></div>

                    <div className="absolute top-20 w-full border-t border-white"></div>

                    <div className="absolute left-6 h-full border-l border-white"></div>

                    <div className="absolute left-12 h-full border-l border-white"></div>

                    <div className="absolute left-20 h-full border-l border-white"></div>
                  </div>
                </div>

                {/* Moving Node 1 */}
                <div className="absolute orbit-1">
                  <div className="h-5 w-5 rounded-full bg-blue-500 shadow-[0_0_20px_#3b82f6]"></div>
                </div>

                {/* Moving Node 2 */}
                <div className="absolute orbit-2">
                  <div className="h-5 w-5 rounded-full bg-cyan-500 shadow-[0_0_20px_#06b6d4]"></div>
                </div>

                {/* Moving Node 3 */}
                <div className="absolute orbit-3">
                  <div className="h-5 w-5 rounded-full bg-purple-500 shadow-[0_0_20px_#8b5cf6]"></div>
                </div>

                {/* Connection Line */}
                <div className="network-line absolute h-64 w-[2px] bg-gradient-to-b from-transparent via-blue-500 to-transparent rotate-45"></div>

                <div className="network-line absolute h-64 w-[2px] bg-gradient-to-b from-transparent via-cyan-500 to-transparent -rotate-45"></div>
              </div>

              <h2 className="mt-6 text-3xl font-bold text-gray-900">
                Live Meeting Experience
              </h2>

              <p className="mt-3 text-gray-500">
                Crystal clear video conferencing
              </p>
            </div>
          </div>
        </motion.div>
      </div>
    </section>
  );
}

export default Upp1;
