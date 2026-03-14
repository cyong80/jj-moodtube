"use client";

import { motion } from "framer-motion";

/**
 * 로딩 시 MoodTube 로고 + 브리드 애니메이션
 */
export function LoadingLogo() {
  return (
    <div className="flex flex-col items-center justify-center gap-6">
      <motion.div
        className="flex flex-col items-center gap-3"
        initial="hidden"
        animate="visible"
        variants={{
          hidden: { opacity: 0 },
          visible: {
            opacity: 1,
            transition: {
              staggerChildren: 0.08,
              delayChildren: 0.05,
            },
          },
        }}
      >
        <motion.h1
          className="font-display text-4xl sm:text-5xl font-black tracking-tighter"
          variants={{
            hidden: { opacity: 0, y: 8 },
            visible: { opacity: 1, y: 0 },
          }}
          transition={{ type: "spring", stiffness: 400, damping: 25 }}
        >
          Mood<span className="text-primary">Tube</span>
        </motion.h1>
        <motion.div
          className="flex gap-1.5"
          variants={{
            hidden: { opacity: 0, scale: 0.8 },
            visible: { opacity: 1, scale: 1 },
          }}
          transition={{ type: "spring", stiffness: 400, damping: 25 }}
        >
          {[0, 1, 2].map((i) => (
            <motion.span
              key={i}
              className="w-2 h-2 rounded-full bg-primary"
              animate={{
                opacity: [0.4, 1, 0.4],
                scale: [0.9, 1.1, 0.9],
              }}
              transition={{
                duration: 1.2,
                repeat: Infinity,
                delay: i * 0.15,
              }}
            />
          ))}
        </motion.div>
      </motion.div>
    </div>
  );
}
