import Navbar from "./Navbar";
import { CiLogin } from "react-icons/ci";
import { FaSpinner, FaEnvelope, FaLock, FaArrowRight } from "react-icons/fa";
import { Link, useNavigate, useLocation } from "react-router-dom";
import { useState } from "react";
import { useAuth } from "../context/AuthContext";

function Login() {
  const [email, setemail] = useState("");
  const [password, setpassword] = useState("");
  const [loading, setloading] = useState(false);
  const [error, seterror] = useState("");
  const navigate = useNavigate();
  const location = useLocation();
  const { login } = useAuth();

  const Handlelogin = async (e) => {
    e.preventDefault();
    seterror("");

    if (email === "") {
      return seterror("Please enter your email");
    }
    if (password === "") {
      return seterror("Please enter your password");
    }

    try {
      setloading(true);
      await login(email, password);
      const redirectTo = location.state?.from || "/";
      navigate(redirectTo, { replace: true });
    } catch (error) {
      seterror(error.response?.data?.message || "Login failed");
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
              <CiLogin size={26} className="text-white cursor-pointer " />
            </div>

            <h1 className="text-white text-2xl font-bold mb-1">Welcome Back</h1>

            <p className="text-slate-400 text-sm"></p>
          </div>

          {/* Form Card */}
          <div className="bg-white/5 backdrop-blur-2xl border border-white/10 rounded-3xl p-5 shadow-2xl">
            <h2 className="text-white text-xl font-bold mb-1 ml-[50px]">
              Login To Your Account
            </h2>

            <p className="text-slate-400 text-sm mb-5 ml-[70px]">
              Login to access all features.
            </p>
            {error && (
              <p className="text-red-500 font-semibold text-sm mb-3 text-center">
                {error}
              </p>
            )}

            <form className="space-y-3" onSubmit={Handlelogin}>
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
                      Logging in...
                    </>
                  ) : (
                    <>
                      Login
                      <FaArrowRight className="group-hover:translate-x-1 transition-all duration-300" />
                    </>
                  )}
                </span>
              </button>
            </form>

            {/* Signup Link */}
            <div className="mt-5 text-center">
              <p className="text-slate-400 text-sm">
                Don't have an account?
                <span className="text-cyan-400 font-semibold ml-2 cursor-pointer hover:text-cyan-300 transition-all">
                  <Link to="/register">Signup</Link>
                </span>
              </p>
            </div>
          </div>
        </div>
      </div>
    </>
  );
}

export default Login;
