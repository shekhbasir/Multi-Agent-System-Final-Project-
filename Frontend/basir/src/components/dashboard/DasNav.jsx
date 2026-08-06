import React, { useEffect, useState } from "react";
import axios from "axios";
import sessionApi from "../../config/sessionApi";
import {
  FaVideo,
  FaUsers,
  FaChartLine,
  FaSignOutAlt,
  FaUser,
  FaCog,
  FaBell,
  FaChevronDown,
  FaCalendarAlt,
  FaSearch,
  FaPlus,
  FaHistory,
  FaHome,
  FaClipboardList,
  FaShieldAlt,
  FaBars,
} from "react-icons/fa";
import { HiOutlineVideoCamera } from "react-icons/hi2";
import { motion, AnimatePresence } from "framer-motion";

function DasNav() {
  const [user, setUser] = useState(null);
  const [totalSessions, setTotalSessions] = useState(0);
  const [activeSessions, setActiveSessions] = useState(0);
  const [profileOpen, setProfileOpen] = useState(false);
  const [sidebarOpen, setSidebarOpen] = useState(true);

  useEffect(() => {
    getUser();
    getMySessions();
    getActiveSessions();
  }, []);

  const getUser = async () => {
    try {
      const res = await axios.get("http://localhost:7000/api/auth/alldata", {
        withCredentials: true,
      });

      setUser(res.data.sabdata);
    } catch (error) {
      console.log(error);
    }
  };

  const getMySessions = async () => {
    try {
      const res = await sessionApi.get("/my-sessions");
      setTotalSessions(res.data.total || 0);
    } catch (error) {
      console.log(error);
    }
  };

  const getActiveSessions = async () => {
    try {
      const res = await sessionApi.get("/active");
      setActiveSessions(res.data.total || 0);
    } catch (error) {
      console.log(error);
    }
  };

  const logout = async () => {
    try {
      await axios.get("http://localhost:7000/api/auth/logout", {
        withCredentials: true,
      });

      window.location.href = "/login";
    } catch (error) {
      console.log(error);
    }
  };

  const sidebarItems = [
    { icon: <FaHome />, name: "Home" },
    { icon: <FaVideo />, name: "Meetings" },
    { icon: <FaPlus />, name: "Create Meeting" },
    { icon: <FaUsers />, name: "Participants" },
    { icon: <FaHistory />, name: "History" },
    { icon: <FaClipboardList />, name: "Analytics" },
    { icon: <FaShieldAlt />, name: "Security" },
    { icon: <FaCog />, name: "Settings" },
  ];

  return (
    <div className="min-h-screen w-full bg-[#020617] text-white overflow-hidden relative">
      {/* Animated Background */}
      <div className="absolute inset-0">
        <div className="absolute top-0 left-0 w-[600px] h-[600px] bg-cyan-500/10 blur-[150px] rounded-full animate-pulse" />
        <div className="absolute bottom-0 right-0 w-[600px] h-[600px] bg-purple-500/10 blur-[150px] rounded-full animate-pulse" />

        <div className="absolute inset-0 bg-[linear-gradient(rgba(255,255,255,.03)_1px,transparent_1px),linear-gradient(90deg,rgba(255,255,255,.03)_1px,transparent_1px)] bg-[size:40px_40px]" />
      </div>

      <div className="relative z-10 flex min-h-screen">
        {/* Sidebar */}
        <AnimatePresence>
          {sidebarOpen && (
            <motion.div
              initial={{ x: -250 }}
              animate={{ x: 0 }}
              exit={{ x: -250 }}
              className="w-[280px] border-r border-white/10 bg-white/5 backdrop-blur-xl p-6"
            >
              <h1 className="text-3xl font-black bg-gradient-to-r from-cyan-400 to-blue-500 bg-clip-text text-transparent mb-10">
                LIVE CLASSES
              </h1>

              <div className="space-y-3">
                {sidebarItems.map((item, index) => (
                  <button
                    key={index}
                    className="w-full flex items-center gap-4 px-4 py-4 rounded-2xl hover:bg-cyan-500/10 hover:border-cyan-500/20 border border-transparent transition-all"
                  >
                    <span className="text-cyan-400">{item.icon}</span>
                    {item.name}
                  </button>
                ))}
              </div>
            </motion.div>
          )}
        </AnimatePresence>

        {/* Main Content */}
        <div className="flex-1">
          {/* Navbar */}
          <div className="border-b border-white/10 backdrop-blur-xl bg-white/5 px-8 py-5 flex justify-between items-center">
            <div className="flex items-center gap-5">
              <button
                onClick={() => setSidebarOpen(!sidebarOpen)}
                className="text-xl"
              >
                <FaBars />
              </button>

              <div className="relative">
                <div className="absolute left-5 top-1/2 -translate-y-1/2">
                  <div className="relative flex items-center justify-center w-16 h-16">
                    {/* Outer Rotating Ring */}
                    <span className="absolute w-16 h-16 rounded-full border-[3px] border-cyan-400/40 border-t-cyan-300 animate-spin"></span>

                    {/* Inner Reverse Rotating Ring */}
                    <span
                      className="absolute w-12 h-12 rounded-full border-[2px] border-purple-400/50 border-b-purple-300"
                      style={{
                        animation: "spin 2.5s linear infinite reverse",
                      }}
                    ></span>

                    {/* Glow */}
                    <span className="absolute w-16 h-16 rounded-full bg-cyan-400/20 blur-xl animate-pulse"></span>

                    {/* Center Icon */}
                    <HiOutlineVideoCamera
                      className="relative text-cyan-300 text-4xl drop-shadow-[0_0_30px_rgba(34,211,238,1)]"
                      style={{
                        animation: "pulse 1.8s ease-in-out infinite",
                      }}
                    />
                  </div>
                </div>
              </div>
            </div>

            <div className="flex items-center gap-6">
              <button className="relative">
                <FaBell className="text-xl text-slate-300" />
                <span className="absolute -top-1 -right-1 w-3 h-3 bg-red-500 rounded-full"></span>
              </button>

              <div className="relative">
                <button
                  onClick={() => setProfileOpen(!profileOpen)}
                  className="flex items-center gap-3 bg-white/5 border border-white/10 rounded-2xl px-4 py-2"
                >
                  <img
                    src={`https://ui-avatars.com/api/?background=0D8ABC&color=fff&name=${user?.name}`}
                    alt=""
                    className="w-12 h-12 rounded-full"
                  />

                  <div className="text-left">
                    <h3 className="font-semibold">{user?.name || "Loading"}</h3>
                    <p className="text-xs text-slate-400">{user?.email}</p>
                  </div>
                </button>
              </div>
            </div>
          </div>

          {/* Hero */}
          <div className="p-8">
            <div className="rounded-[40px] bg-white/5 border border-white/10 backdrop-blur-2xl p-10">
              <div className="flex justify-between flex-wrap gap-10">
                <div>
                  <div className="flex items-center gap-2 mb-4">
                    <span className="h-3 w-3 bg-green-500 rounded-full animate-pulse"></span>
                    <span className="text-green-400 font-semibold">
                      System Online
                    </span>
                  </div>

                  <h1 className="text-6xl font-black">Welcome Back,</h1>

                  <h2 className="text-5xl font-black bg-gradient-to-r from-cyan-400 to-purple-500 bg-clip-text text-transparent mt-2">
                    {user?.name}
                  </h2>

                  <p className="mt-5 text-slate-300 max-w-2xl text-lg">
                    Create, host and manage professional online meetings with
                    real-time collaboration and analytics.
                  </p>

                  <div className="flex flex-wrap gap-4 mt-8">
                    <button className="bg-cyan-500 hover:bg-cyan-600 px-6 py-3 rounded-2xl font-semibold">
                      Create Meeting
                    </button>

                    <button className="bg-white/10 hover:bg-white/20 px-6 py-3 rounded-2xl font-semibold">
                      Join Meeting
                    </button>

                    <button className="bg-white/10 hover:bg-white/20 px-6 py-3 rounded-2xl font-semibold">
                      Analytics
                    </button>
                  </div>
                </div>

                <div className="bg-white/5 border border-white/10 rounded-3xl p-6 w-[250px]">
                  <FaCalendarAlt className="text-cyan-400 text-3xl mb-4" />

                  <p className="text-slate-400">Today</p>

                  <h3 className="text-2xl font-bold mt-2">
                    {new Date().toDateString()}
                  </h3>
                </div>
              </div>

              {/* Stats */}
              <div className="grid lg:grid-cols-4 md:grid-cols-2 gap-6 mt-10">
                <div className="bg-white/5 border border-white/10 p-6 rounded-3xl">
                  <FaVideo className="text-4xl text-cyan-400 mb-4" />
                  <p className="text-slate-400">Total Sessions</p>
                  <h2 className="text-5xl font-bold mt-2">{totalSessions}</h2>
                </div>

                <div className="bg-white/5 border border-white/10 p-6 rounded-3xl">
                  <FaUsers className="text-4xl text-purple-400 mb-4" />
                  <p className="text-slate-400">Active Sessions</p>
                  <h2 className="text-5xl font-bold mt-2">{activeSessions}</h2>
                </div>

                <div className="bg-white/5 border border-white/10 p-6 rounded-3xl">
                  <FaChartLine className="text-4xl text-green-400 mb-4" />
                  <p className="text-slate-400">Status</p>
                  <h2 className="text-4xl font-bold mt-2 text-green-400">
                    Online
                  </h2>
                </div>

                <div className="bg-white/5 border border-white/10 p-6 rounded-3xl">
                  <FaUsers className="text-4xl text-orange-400 mb-4" />
                  <p className="text-slate-400">Participants</p>
                  <h2 className="text-5xl font-bold mt-2">128</h2>
                </div>
              </div>

              {/* Activity Section */}
              <div className="grid lg:grid-cols-2 gap-6 mt-10">
                <div className="bg-white/5 border border-white/10 rounded-3xl p-6">
                  <h2 className="text-2xl font-bold mb-5">Recent Activity</h2>

                  <div className="space-y-4">
                    <div className="bg-white/5 p-4 rounded-2xl">
                      Meeting Created • 2 min ago
                    </div>

                    <div className="bg-white/5 p-4 rounded-2xl">
                      User Joined Session • 10 min ago
                    </div>

                    <div className="bg-white/5 p-4 rounded-2xl">
                      Recording Started • 20 min ago
                    </div>
                  </div>
                </div>

                <div className="bg-white/5 border border-white/10 rounded-3xl p-6">
                  <h2 className="text-2xl font-bold mb-5">Upcoming Meetings</h2>

                  <div className="space-y-4">
                    <div className="bg-white/5 p-4 rounded-2xl">
                      React Interview Session - 7 PM
                    </div>

                    <div className="bg-white/5 p-4 rounded-2xl">
                      AWS Workshop - Tomorrow
                    </div>

                    <div className="bg-white/5 p-4 rounded-2xl">
                      System Design Round - Saturday
                    </div>
                  </div>
                </div>
              </div>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
}

export default DasNav;
