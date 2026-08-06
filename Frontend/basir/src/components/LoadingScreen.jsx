import { useEffect, useState } from "react";
import { motion, AnimatePresence } from "framer-motion";
import { GoDeviceCameraVideo } from "react-icons/go";

const MIN_VISIBLE_MS = 2200;

function LoadingScreen({
  show,
  onExitComplete,
  label = " Stacked & Built by Basir",
}) {
  const particles = Array.from({ length: 10 }, (_, i) => {
    const angle = (i / 10) * Math.PI * 2;
    const radius = 70;
    return {
      id: i,
      sx: Math.cos(angle) * radius,
      sy: Math.sin(angle) * radius,
      delay: 0.15 + i * 0.03,
    };
  });

  return (
    <AnimatePresence onExitComplete={onExitComplete}>
      {show && (
        <motion.div
          key="loading-screen"
          className="fixed inset-0 z-[999] flex flex-col items-center justify-center bg-[#05070d]"
          initial={{ opacity: 1 }}
          exit={{ opacity: 0, scale: 1.03 }}
          transition={{ duration: 0.55, ease: "easeInOut" }}
        >
          <motion.div
            className="absolute h-[520px] w-[520px] rounded-full blur-md"
            style={{
              background:
                "radial-gradient(circle, rgba(37,99,235,0.45) 0%, rgba(37,99,235,0) 70%)",
            }}
            initial={{ opacity: 0, scale: 0.7 }}
            animate={{ opacity: 0.35, scale: 1 }}
            transition={{ duration: 1.6, ease: "easeOut" }}
          />

          <div className="relative flex h-[148px] w-[148px] items-center justify-center">
            {particles.map((p) => (
              <motion.span
                key={p.id}
                className="absolute left-1/2 top-1/2 h-1 w-1 rounded-full bg-blue-600"
                initial={{ opacity: 0, x: p.sx, y: p.sy, scale: 1.4 }}
                animate={{ opacity: [0, 1, 0.9, 0], x: 0, y: 0, scale: 0.3 }}
                transition={{
                  duration: 1.1,
                  delay: p.delay,
                  ease: [0.2, 0.7, 0.3, 1],
                }}
              />
            ))}

            <motion.div
              className="absolute h-24 w-24 rounded-full border border-blue-600/35"
              initial={{ opacity: 0, rotate: 0 }}
              animate={{ opacity: 1, rotate: 360 }}
              transition={{
                opacity: { duration: 0.5, delay: 0.9 },
                rotate: {
                  duration: 7,
                  repeat: Infinity,
                  ease: "linear",
                  delay: 1.4,
                },
              }}
            />
            <motion.div
              className="absolute h-[132px] w-[132px] rounded-full border border-pink-500/25"
              initial={{ opacity: 0, rotate: 0 }}
              animate={{ opacity: 1, rotate: -360 }}
              transition={{
                opacity: { duration: 0.5, delay: 0.9 },
                rotate: {
                  duration: 11,
                  repeat: Infinity,
                  ease: "linear",
                  delay: 1.4,
                },
              }}
            />

            <motion.div
              className="relative flex h-14 w-14 items-center justify-center rounded-2xl bg-blue-600"
              initial={{ opacity: 0, scale: 0.4 }}
              animate={{
                opacity: 1,
                scale: 1,
                boxShadow: "0 0 28px 2px rgba(37,99,235,0.45)",
              }}
              transition={{
                duration: 0.55,
                delay: 0.95,
                ease: [0.34, 1.56, 0.64, 1],
              }}
            >
              <motion.span
                className="absolute inset-0 rounded-2xl border-[1.5px] border-blue-600"
                initial={{ opacity: 0, scale: 1 }}
                animate={{ opacity: [0.6, 0], scale: [1, 1.9] }}
                transition={{
                  duration: 1.8,
                  repeat: Infinity,
                  ease: "easeOut",
                  delay: 1.7,
                }}
              />
              <GoDeviceCameraVideo size={22} className="text-white" />
            </motion.div>
          </div>

          <div className="mt-6 h-[22px] overflow-hidden">
            <motion.span
              className="inline-block bg-gradient-to-r from-red-500 via-orange-500 to-pink-500 bg-clip-text text-[17px] font-black tracking-[0.12em] text-transparent"
              initial={{ y: "100%", opacity: 0 }}
              animate={{ y: 0, opacity: 1 }}
              transition={{
                duration: 0.6,
                delay: 1.5,
                ease: [0.22, 1, 0.36, 1],
              }}
            >
              TalkSphere
            </motion.span>
          </div>

          <motion.p
            className="mt-2.5 text-xs text-slate-500"
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            transition={{ duration: 0.5, delay: 1.8 }}
          >
            {label}
          </motion.p>

          <motion.div
            className="mt-5 h-0.5 w-40 overflow-hidden rounded-full bg-white/[0.08]"
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            transition={{ duration: 0.4, delay: 1.8 }}
          >
            <motion.div
              className="h-full rounded-full bg-gradient-to-r from-red-500 via-orange-500 to-pink-500"
              initial={{ width: "0%" }}
              animate={{ width: "100%" }}
              transition={{
                duration: 1.05,
                delay: 1.85,
                ease: [0.4, 0, 0.2, 1],
              }}
            />
          </motion.div>
        </motion.div>
      )}
    </AnimatePresence>
  );
}

export default LoadingScreen;
