import { motion, useReducedMotion } from "framer-motion";
import { Sparkles, Globe, Building2, MapPin } from "lucide-react";

const MODES = [
  { key: "", label: "Any", icon: Sparkles },
  { key: "remote", label: "Remote", icon: Globe },
  { key: "hybrid", label: "Hybrid", icon: Building2 },
  { key: "onsite", label: "On-site", icon: MapPin },
];

const OpportunityFilters = ({ workMode, setWorkMode }) => {
  const prefersReducedMotion = useReducedMotion();

  return (
    <div
      role="radiogroup"
      aria-label="Filter by work mode"
      className="mt-4 flex flex-wrap gap-2"
    >
      {MODES.map((m) => {
        const isActive = workMode === m.key;
        const Icon = m.icon;

        return (
          <motion.button
            key={m.key}
            type="button"
            role="radio"
            aria-checked={isActive}
            onClick={() => setWorkMode(m.key)}
            whileHover={prefersReducedMotion ? undefined : { y: -1 }}
            whileTap={prefersReducedMotion ? undefined : { scale: 0.96 }}
            className={`relative flex items-center gap-1.5 rounded-lg border px-3 py-1.5 text-xs font-medium transition-colors focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-blue-400/50 ${
              isActive
                ? "border-white text-black"
                : "border-white/15 text-white/70 hover:border-white/30 hover:text-white"
            }`}
          >
            {isActive && (
              <motion.span
                layoutId="workmode-pill"
                transition={{ type: "spring", stiffness: 500, damping: 35 }}
                className="absolute inset-0 rounded-lg bg-white"
              />
            )}
            <span className="relative flex items-center gap-1.5">
              <Icon className="h-3.5 w-3.5" strokeWidth={2} />
              {m.label}
            </span>
          </motion.button>
        );
      })}
    </div>
  );
};

export default OpportunityFilters;
