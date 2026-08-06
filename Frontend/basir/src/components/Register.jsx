import Navbar from "./Navbar";
import { SiGnuprivacyguard } from "react-icons/si";
import {
  FaSpinner,
  FaUser,
  FaEnvelope,
  FaLock,
  FaArrowRight,
} from "react-icons/fa";
import { Link, useNavigate } from "react-router-dom";
import { useState } from "react";
import { useAuth } from "../context/AuthContext";

function Register() {
  const navigate = useNavigate();
  const { register } = useAuth();
  const [name, setname] = useState("");
  const [email, setemail] = useState("");
  const [password, setpassword] = useState("");
  const [conformpassword, setconformpassword] = useState("");
  const [error, seterror] = useState("");
  const [loading, setloading] = useState(false);

  const Handlesubmit = async (e) => {
    e.preventDefault();
    seterror("");

    if (
      name === "" ||
      email === "" ||
      password === "" ||
      conformpassword === ""
    ) {
      return seterror("Please fill in all fields");
    }
    if (password !== conformpassword) {
      return seterror("Passwords do not match");
    }

    try {
      setloading(true);
      await register(name, email, password);
      navigate("/login");
    } catch (error) {
      seterror(error.response?.data?.message || "Registration failed");
    } finally {
      setloading(false);
    }
  };

  return (
    <>
      <Navbar />

      <div className="min-h-screen w-full bg-gradient-to-br from-slate-950 via-slate-900 to-black pt-[80px] px-4 flex justify-center items-center overflow-hidden">
        {/* Background Glow */}
        <div className="absolute top-20 left-10 h-72 w-72 bg-blue-500/20 blur-[120px] rounded-full animate-pulse"></div>
        <div className="absolute bottom-20 right-10 h-72 w-72 bg-cyan-500/20 blur-[120px] rounded-full animate-pulse"></div>

        <div className="relative w-full max-w-[340px]">
          {/* Top Section */}
          <div className="text-center mb-4">
            <div className="inline-flex justify-center items-center h-14 w-14 rounded-2xl bg-gradient-to-r from-blue-600 to-cyan-500 shadow-lg shadow-blue-500/20 mb-3">
              <SiGnuprivacyguard
                size={26}
                className="text-white cursor-pointer "
              />
            </div>

            <h1 className="text-white text-2xl font-bold mb-1">
              Join Live Session
            </h1>

            <p className="text-slate-400 text-sm">
              Start your hosting and joining journey today.
            </p>
          </div>

          {/* Form Card */}
          <div className="bg-white/5 backdrop-blur-2xl border border-white/10 rounded-3xl p-5 shadow-2xl">
            <h2 className="text-white text-xl font-bold mb-1 ml-[70px]">
              Create Account
            </h2>

            <p className="text-slate-400 text-sm mb-5 ml-[50px]">
              Sign up to access all features.
            </p>
            {error && (
              <p className="text-red-500 font-semibold text-sm mb-3 text-center">
                {error}
              </p>
            )}

            <form className="space-y-3" onSubmit={Handlesubmit}>
              {/* Full Name */}
              <div className="relative">
                <FaUser className="absolute left-4 top-1/2 -translate-y-1/2 text-slate-400 text-sm" />
                <input
                  type="text"
                  value={name}
                  onChange={(e) => setname(e.target.value)}
                  placeholder="Full Name"
                  className="w-full h-11 pl-11 pr-4 rounded-xl bg-white/5 border border-white/10 text-white text-sm placeholder:text-slate-500 focus:outline-none focus:border-blue-500 transition-all duration-300"
                />
              </div>

              {/* Email */}
              <div className="relative">
                <FaEnvelope className="absolute left-4 top-1/2 -translate-y-1/2 text-slate-400 text-sm" />
                <input
                  type="email"
                  value={email}
                  onChange={(e) => setemail(e.target.value)}
                  placeholder="Email Address"
                  className="w-full h-11 pl-11 pr-4 rounded-xl bg-white/5 border border-white/10 text-white text-sm placeholder:text-slate-500 focus:outline-none focus:border-cyan-500 transition-all duration-300"
                />
              </div>

              {/* Password */}
              <div className="relative">
                <FaLock className="absolute left-4 top-1/2 -translate-y-1/2 text-slate-400 text-sm" />
                <input
                  type="password"
                  value={password}
                  onChange={(e) => setpassword(e.target.value)}
                  placeholder="Password"
                  className="w-full h-11 pl-11 pr-4 rounded-xl bg-white/5 border border-white/10 text-white text-sm placeholder:text-slate-500 focus:outline-none focus:border-blue-500 transition-all duration-300"
                />
              </div>

              {/* Confirm Password */}
              <div className="relative">
                <FaLock className="absolute left-4 top-1/2 -translate-y-1/2 text-slate-400 text-sm" />
                <input
                  type="password"
                  value={conformpassword}
                  onChange={(e) => setconformpassword(e.target.value)}
                  placeholder="Confirm Password"
                  className="w-full h-11 pl-11 pr-4 rounded-xl bg-white/5 border border-white/10 text-white text-sm placeholder:text-slate-500 focus:outline-none focus:border-blue-500 transition-all duration-300"
                />
              </div>

              {/* Submit Button */}
              <button
                type="submit"
                disabled={loading}
                className="group w-full h-11 rounded-xl bg-gradient-to-r from-blue-600 to-cyan-500 text-white font-semibold text-sm hover:scale-[1.02] disabled:scale-100 disabled:opacity-70 transition-all duration-300 shadow-lg shadow-blue-500/20 cursor-pointer disabled:cursor-not-allowed"
              >
                <span className="flex justify-center items-center gap-2">
                  {loading ? (
                    <>
                      <FaSpinner className="animate-spin text-lg" />
                      Creating Account...
                    </>
                  ) : (
                    <>
                      Sign Up
                      <FaArrowRight className="group-hover:translate-x-1 transition-all duration-300" />
                    </>
                  )}
                </span>
              </button>
            </form>

            {/* Login Link */}
            <div className="mt-5 text-center">
              <p className="text-slate-400 text-sm">
                Already have an account?
                <span className="text-cyan-400 font-semibold ml-2 cursor-pointer hover:text-cyan-300 transition-all">
                  <Link to="/login">Login</Link>
                </span>
              </p>
            </div>
          </div>
        </div>
      </div>
    </>
  );
}

export default Register;
