// frontend/src/components/dashboard/DashboardLayout.jsx
import { useEffect, useState } from "react";
import { useNavigate, useLocation } from "react-router-dom";
import axios from "axios";
import { onProfileUpdate } from "../../utils/profileEvents";
import toast from "react-hot-toast";
import {
  FaVideo,
  FaUsers,
  FaChartLine,
  FaCog,
  FaBell,
  FaCalendarAlt,
  FaPlus,
  FaHistory,
  FaHome,
  FaClipboardList,
  FaShieldAlt,
  FaBars,
  FaAward,
  FaCompass,
} from "react-icons/fa";
import { HiOutlineVideoCamera } from "react-icons/hi2";
import { motion, AnimatePresence } from "framer-motion";

function DashboardLayout({ children }) {
  const [user, setUser] = useState(null);
  const [sidebarOpen, setSidebarOpen] = useState(true);
  const [profileOpen, setProfileOpen] = useState(false);
  const navigate = useNavigate();
  const location = useLocation();

  useEffect(() => {
    getUser();
    const unsubscribe = onProfileUpdate((updatedUser) => {
      setUser((prev) => ({ ...prev, ...updatedUser }));
    });
    return unsubscribe;
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

  const sidebarItems = [
    { icon: <FaHome />, name: "Home", path: "/dashboard" },
    { icon: <FaCompass />, name: "Explore", path: "/explore" },
    { icon: <FaVideo />, name: "My Sessions", path: "/my-sessions" },
    { icon: <FaPlus />, name: "Host Session", path: "/host" },
    {
      icon: <FaAward />,
      name: "Certificates",
      path: "/dashboard/certificates",
    },
    { icon: <FaUsers />, name: "Participants", path: null },
    { icon: <FaHistory />, name: "History", path: null },
    { icon: <FaClipboardList />, name: "Analytics", path: null },
    { icon: <FaShieldAlt />, name: "Security", path: null },
    { icon: <FaCog />, name: "Settings", path: "/dashboard/settings" },
  ];

  const handleNavClick = (item) => {
    if (!item.path) {
      toast("This module is coming soon", { icon: "🚧" });
      return;
    }
    navigate(item.path);
  };

  const isActive = (path) => {
    if (path === "/dashboard") return location.pathname === "/dashboard";
    return path && location.pathname.startsWith(path);
  };

  return (
    <div className="min-h-screen w-full bg-[#020617] text-white overflow-hidden relative">
      <div className="absolute inset-0">
        <div className="absolute top-0 left-0 w-[600px] h-[600px] bg-cyan-500/10 blur-[150px] rounded-full animate-pulse" />
        <div className="absolute bottom-0 right-0 w-[600px] h-[600px] bg-purple-500/10 blur-[150px] rounded-full animate-pulse" />
        <div className="absolute inset-0 bg-[linear-gradient(rgba(255,255,255,.03)_1px,transparent_1px),linear-gradient(90deg,rgba(255,255,255,.03)_1px,transparent_1px)] bg-[size:40px_40px]" />
      </div>

      <div className="relative z-10 flex min-h-screen">
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
                    onClick={() => handleNavClick(item)}
                    className={`w-full flex items-center gap-4 px-4 py-4 rounded-2xl border transition-all ${
                      isActive(item.path)
                        ? "bg-cyan-500/10 border-cyan-500/30 text-cyan-300"
                        : "border-transparent hover:bg-cyan-500/10 hover:border-cyan-500/20"
                    }`}
                  >
                    <span className="text-cyan-400">{item.icon}</span>
                    {item.name}
                  </button>
                ))}
              </div>
            </motion.div>
          )}
        </AnimatePresence>

        <div className="flex-1">
          <div className="border-b border-white/10 backdrop-blur-xl bg-white/5 px-8 py-5 flex justify-between items-center">
            <div className="flex items-center gap-5">
              <button
                onClick={() => setSidebarOpen(!sidebarOpen)}
                className="text-xl"
              >
                <FaBars />
              </button>

              <div className="relative flex items-center justify-center w-16 h-16">
                <span className="absolute w-16 h-16 rounded-full border-[3px] border-cyan-400/40 border-t-cyan-300 animate-spin"></span>
                <span
                  className="absolute w-12 h-12 rounded-full border-[2px] border-purple-400/50 border-b-purple-300"
                  style={{ animation: "spin 2.5s linear infinite reverse" }}
                ></span>
                <span className="absolute w-16 h-16 rounded-full bg-cyan-400/20 blur-xl animate-pulse"></span>
                <HiOutlineVideoCamera
                  className="relative text-cyan-300 text-4xl drop-shadow-[0_0_30px_rgba(34,211,238,1)]"
                  style={{ animation: "pulse 1.8s ease-in-out infinite" }}
                />
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
                    src={
                      user?.avatar
                        ? `http://localhost:7000${user.avatar}`
                        : `https://ui-avatars.com/api/?background=0D8ABC&color=fff&name=${user?.name}`
                    }
                    alt=""
                    className="w-12 h-12 rounded-full object-cover"
                  />
                  <div className="text-left">
                    <h3 className="font-semibold">{user?.name || "Loading"}</h3>
                    <p className="text-xs text-slate-400">{user?.email}</p>
                  </div>
                </button>
              </div>
            </div>
          </div>

          <div className="p-8">{children}</div>
        </div>
      </div>
    </div>
  );
}

export default DashboardLayout;
