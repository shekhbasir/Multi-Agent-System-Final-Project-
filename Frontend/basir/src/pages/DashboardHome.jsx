import { useEffect, useState } from "react";
import axios from "axios";
import { FaVideo, FaUsers, FaChartLine, FaCalendarAlt } from "react-icons/fa";
import DasHostsession from "../components/dashboard/DasHostsession";
import DasJoinsession from "../components/dashboard/DasJoinsession";
import Filtersession from "../components/dashboard/Filtersession";
import { onProfileUpdate } from "../utils/profileEvents";

const sessionApi = axios.create({
  baseURL: "http://localhost:7000/api/session",
  withCredentials: true,
});

function DashboardHome() {
  const [user, setUser] = useState(null);
  const [totalSessions, setTotalSessions] = useState(0);
  const [activeSessions, setActiveSessions] = useState(0);

  useEffect(() => {
    getUser();
    getMySessions();
    getActiveSessions();
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

  return (
    <>
      <div className="rounded-[40px] bg-white/5 border border-white/10 backdrop-blur-2xl p-10">
        <div className="flex justify-between flex-wrap gap-10">
          <div>
            <div className="mb-5">
              {user?.avatar ? (
                <img
                  src={`http://localhost:7000${user.avatar}`}
                  className="h-14 w-14 rounded-full object-cover border border-white/10"
                  alt="avatar"
                />
              ) : (
                <div className="h-14 w-14 rounded-full bg-gradient-to-br from-cyan-400 to-purple-500 flex items-center justify-center text-lg font-bold">
                  {user?.name?.[0]?.toUpperCase()}
                </div>
              )}
            </div>
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
          </div>

          <div className="bg-white/5 border border-white/10 rounded-3xl p-6 w-[250px]">
            <FaCalendarAlt className="text-cyan-400 text-3xl mb-4" />
            <p className="text-slate-400">Today</p>
            <h3 className="text-2xl font-bold mt-2">
              {new Date().toDateString()}
            </h3>
          </div>
        </div>

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
            <h2 className="text-4xl font-bold mt-2 text-green-400">Online</h2>
          </div>
        </div>
      </div>

      <DasHostsession />
      <DasJoinsession />
      <Filtersession />
    </>
  );
}

export default DashboardHome;
