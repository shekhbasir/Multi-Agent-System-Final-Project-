import { Link } from "react-router-dom";
import { FaArrowRight, FaVideo } from "react-icons/fa";

function PageNot() {
  return (
    <section className="relative h-screen w-full overflow-hidden bg-slate-950 flex items-center justify-center">
      {/* Animated Background */}
      <div className="absolute inset-0">
        <div className="absolute top-20 left-20 w-64 h-64 bg-blue-500/10 blur-3xl rounded-full animate-pulse" />
        <div className="absolute bottom-20 right-20 w-64 h-64 bg-indigo-500/10 blur-3xl rounded-full animate-pulse" />
      </div>

      {/* Main Content */}
      <div className="relative z-10 w-full px-6 text-center">
        {/* 404 */}
        <h1 className="text-[120px] md:text-[260px] font-black leading-none tracking-tight text-white">
          404
        </h1>

        {/* Running Animation Area */}
        <div className="relative w-full h-[180px] overflow-hidden mt-[-20px]">
          {/* Speed Lines */}
          <div className="absolute top-[90px] left-0 w-full">
            <div className="speed speed1"></div>
            <div className="speed speed2"></div>
            <div className="speed speed3"></div>
            <div className="speed speed4"></div>
            <div className="speed speed5"></div>
          </div>

          {/* Running Man */}
          <div className="runner">
            <svg
              width="90"
              height="90"
              viewBox="0 0 24 24"
              fill="none"
              className="text-white"
            >
              <circle cx="12" cy="4" r="2.5" fill="currentColor" />
              <path
                d="M12 7L9 12L12 14L15 11L18 15"
                stroke="currentColor"
                strokeWidth="2.5"
                strokeLinecap="round"
                strokeLinejoin="round"
              />
              <path
                d="M9 12L6 18"
                stroke="currentColor"
                strokeWidth="2.5"
                strokeLinecap="round"
              />
              <path
                d="M12 14L10 21"
                stroke="currentColor"
                strokeWidth="2.5"
                strokeLinecap="round"
              />
              <path
                d="M15 11L20 8"
                stroke="currentColor"
                strokeWidth="2.5"
                strokeLinecap="round"
              />
            </svg>
          </div>

          {/* Camera Chasing */}
          <div className="camera">
            <FaVideo className="text-6xl text-blue-500 drop-shadow-[0_0_20px_rgba(59,130,246,0.8)]" />
          </div>
        </div>

        {/* Text */}
        <h2 className="text-3xl md:text-5xl font-bold text-white mt-2">
          Meeting Escaped
        </h2>

        <p className="text-slate-400 mt-4 text-lg">
          The room you're looking for couldn't be found.
        </p>

        {/* Button */}
        <Link
          to="/"
          className="inline-flex items-center gap-3 mt-10 px-8 py-4 rounded-2xl bg-blue-600 hover:bg-blue-700 text-white font-semibold transition-all duration-300 hover:scale-105 shadow-lg shadow-blue-600/20"
        >
          Go Home
          <FaArrowRight />
        </Link>
      </div>

      {/* Styles */}
      <style>{`
        .runner {
          position: absolute;
          top: 40px;
          animation: run 6s linear infinite;
        }

        .camera {
          position: absolute;
          top: 55px;
          animation: chase 6s linear infinite;
        }

        @keyframes run {
          0% {
            left: -120px;
            transform: translateY(0px);
          }

          25% {
            transform: translateY(-10px);
          }

          50% {
            transform: translateY(0px);
          }

          75% {
            transform: translateY(-10px);
          }

          100% {
            left: calc(100% + 100px);
            transform: translateY(0px);
          }
        }

        @keyframes chase {
          0% {
            left: -260px;
            transform: rotate(-12deg);
          }

          100% {
            left: calc(100% - 40px);
            transform: rotate(12deg);
          }
        }

        .speed {
          position: absolute;
          height: 4px;
          border-radius: 999px;
          background: rgba(255,255,255,0.18);
          animation: moveSpeed 1.2s linear infinite;
        }

        .speed1 {
          width: 180px;
          top: 0;
          left: 10%;
        }

        .speed2 {
          width: 120px;
          top: 20px;
          left: 35%;
        }

        .speed3 {
          width: 220px;
          top: 40px;
          left: 60%;
        }

        .speed4 {
          width: 100px;
          top: 60px;
          left: 20%;
        }

        .speed5 {
          width: 160px;
          top: 80px;
          left: 75%;
        }

        @keyframes moveSpeed {
          0% {
            opacity: 0;
            transform: translateX(-150px);
          }

          50% {
            opacity: 1;
          }

          100% {
            opacity: 0;
            transform: translateX(150px);
          }
        }
      `}</style>
    </section>
  );
}

export default PageNot;
