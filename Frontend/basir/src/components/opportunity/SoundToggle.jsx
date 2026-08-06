import { useState } from "react";
import { AnimatePresence, motion, useReducedMotion } from "framer-motion";
import { Volume2, VolumeX } from "lucide-react";
import { isSoundEnabled, toggleSound } from "../../utils/opportunitySounds";

const SoundToggle = () => {
  const [enabled, setEnabled] = useState(isSoundEnabled());
  const prefersReducedMotion = useReducedMotion();

  return (
    <motion.button
      type="button"
      onClick={() => setEnabled(toggleSound())}
      aria-label={enabled ? "Mute sound" : "Unmute sound"}
      aria-pressed={enabled}
      title="Toggle sound"
      whileHover={prefersReducedMotion ? undefined : { scale: 1.1 }}
      whileTap={prefersReducedMotion ? undefined : { scale: 0.9 }}
      className="rounded-lg p-1 text-white/50 transition-colors hover:text-white/80 focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-blue-400/50"
    >
      <AnimatePresence mode="wait" initial={false}>
        {enabled ? (
          <motion.span
            key="on"
            initial={{ opacity: 0, scale: 0.7, rotate: -10 }}
            animate={{ opacity: 1, scale: 1, rotate: 0 }}
            exit={{ opacity: 0, scale: 0.7, rotate: 10 }}
            transition={{ duration: 0.15 }}
            className="block"
          >
            <Volume2 className="h-4 w-4" strokeWidth={2} />
          </motion.span>
        ) : (
          <motion.span
            key="off"
            initial={{ opacity: 0, scale: 0.7, rotate: 10 }}
            animate={{ opacity: 1, scale: 1, rotate: 0 }}
            exit={{ opacity: 0, scale: 0.7, rotate: -10 }}
            transition={{ duration: 0.15 }}
            className="block"
          >
            <VolumeX className="h-4 w-4" strokeWidth={2} />
          </motion.span>
        )}
      </AnimatePresence>
    </motion.button>
  );
};

export default SoundToggle;
