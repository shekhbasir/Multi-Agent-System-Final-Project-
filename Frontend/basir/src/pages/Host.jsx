// frontend/src/pages/Host.jsx
import DasHostsession from "../components/dashboard/DasHostsession";

function Host() {
  return (
    <div className="min-h-screen bg-[#05070d] px-6 md:px-10 py-10">
      <div className="max-w-3xl mx-auto">
        <p className="text-xs font-semibold tracking-[0.2em] text-cyan-400/80 uppercase mb-2">
          Get started
        </p>
        <h1 className="text-3xl font-bold text-slate-100 mb-8">
          Host a New Session
        </h1>
        <DasHostsession />
      </div>
    </div>
  );
}

export default Host;
