import {
  FaArrowRight,
  FaShieldAlt,
  FaLock,
  FaGlobe,
  FaFileContract,
  FaUserShield,
  FaCopyright,
  FaPlay,
} from "react-icons/fa";
import { motion } from "framer-motion";
import { Link } from "react-router-dom";
import api from "../../config/Api";
import { useState } from "react";
import { useEffect } from "react";

function Upp3() {
  const [user, setUser] = useState("");
  const [loading, setLoading] = useState(false);

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
    <section className="relative overflow-hidden bg-slate-950 text-white ">
      {/* Background Glow */}
      <div className="absolute top-0 left-0 h-96 w-full bg-blue-500/10 blur-[150px] rounded-full animate-pulse" />
      <div className="absolute bottom-0 right-0 h-96 w-96 bg-cyan-500/10 blur-[150px] rounded-full animate-pulse" />

      <div className="relative max-w-7xl mx-auto px-6">
        {/* CTA */}
        <div className="py-24 text-center border-b border-white/10">
          <div className="inline-flex items-center gap-2 px-5 py-2 rounded-full border border-blue-500/20 bg-blue-500/10 text-blue-300 text-sm mb-8 animate-bounce">
            <FaShieldAlt />
            Trusted by Thousands Worldwide
          </div>

          <h1 className="text-2xl md:text-7xl font-bold mb-6 leading-tight">
            Ready To Start
            <span className="block bg-gradient-to-r from-cyan-400 via-blue-500 to-purple-500 bg-clip-text text-transparent">
              Your First Session?
            </span>
          </h1>

          <p className="max-w-3xl mx-auto text-slate-400 text-lg mb-10">
            Join thousands of professionals, students and teams already
            collaborating through secure and reliable video communication.
          </p>

          <motion.div
            initial={{ opacity: 0, y: 25 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ delay: 0.3 }}
            className="mt-10 flex flex-col sm:flex-row gap-4"
          >
            {loading ? (
              <div className="h-14 w-52 rounded-2xl bg-gray-200 animate-pulse"></div>
            ) : user ? (
              <Link
                to="/dashboard"
                className="group h-14 rounded-2xl bg-gradient-to-r from-blue-600 via-cyan-500 to-purple-600 px-8 flex items-center justify-center font-semibold text-white shadow-xl hover:scale-105 transition-all duration-300"
              >
                Go To Dashboard
                <FaArrowRight className="ml-3 group-hover:translate-x-1 transition-transform" />
              </Link>
            ) : (
              <>
                <button className="group px-8 py-4 rounded-2xl bg-gradient-to-r from-blue-600 to-cyan-500 font-semibold text-lg hover:scale-105 transition-all duration-300 shadow-2xl shadow-blue-500/30 cursor-pointer">
                  <Link to="/register" className="flex items-center gap-3">
                    Get Started Free
                    <FaArrowRight className="group-hover:translate-x-2 transition-all duration-300" />
                  </Link>
                </button>

                <button className="group h-14 rounded-2xl border border-gray-200 bg-white px-8 font-semibold text-gray-800 hover:shadow-lg transition-all duration-300">
                  <span className="flex items-center gap-3">
                    <FaPlay />
                    Watch Demo
                  </span>
                </button>
              </>
            )}
          </motion.div>
        </div>

        {/* Trust Badges */}

        {/* Footer */}
        <footer className="border-t border-white/10 py-10">
          <div className="flex flex-col lg:flex-row justify-between items-center gap-8">
            <div>
              <h1 className="text-3xl font-bold bg-gradient-to-r from-cyan-400 to-blue-500 bg-clip-text text-transparent">
                Aetromeet{" "}
                <span className="text-[15px] gap-4 text-blue-700">Basir</span>.
              </h1>

              <p className="text-slate-500 mt-2 max-w-md">
                Powerful video communication platform built for teams,
                businesses and online collaboration.
              </p>
            </div>

            <div className="flex flex-wrap justify-center gap-8 text-slate-400">
              <a
                href="#"
                className="flex items-center gap-2 hover:text-white transition-all"
              >
                <FaFileContract />
                Terms
              </a>

              <a
                href="#"
                className="flex items-center gap-2 hover:text-white transition-all"
              >
                <FaUserShield />
                Privacy
              </a>

              <a
                href="#"
                className="flex items-center gap-2 hover:text-white transition-all"
              >
                <FaLock />
                Security
              </a>

              <a
                href="#"
                className="flex items-center gap-2 hover:text-white transition-all"
              >
                <FaGlobe />
                Cookies
              </a>
            </div>
          </div>

          {/* Copyright */}
          <div className="border-t border-white/10 mt-10 pt-8 text-center">
            <div className="flex justify-center items-center gap-2 text-slate-500 text-sm">
              <FaCopyright />
              <span>
                2026 Aetromeet
                <span className="text-[10px] gap-4 text-blue-700">Basir</span>.
                All Rights Reserved.
              </span>
            </div>

            <p className="text-slate-600 text-xs mt-3 max-w-2xl mx-auto leading-relaxed">
              By accessing or using this platform, you agree to our Terms of
              Service, Privacy Policy and Cookie Policy. Unauthorized use,
              reproduction or distribution of any platform content is strictly
              prohibited.
            </p>
          </div>
        </footer>
      </div>
    </section>
  );
}

export default Upp3;

//now i am going to start the creating the session schema and the foreign operation
