"use client";

import { motion, AnimatePresence } from "framer-motion";

interface MemoryPanelProps {
  thoughts: string[];
}

export default function MemoryPanel({ thoughts }: MemoryPanelProps) {
  if (thoughts.length === 0) return null;

  return (
    <motion.div
      initial={{ opacity: 0, x: 20 }}
      animate={{ opacity: 1, x: 0 }}
      className="absolute top-24 right-6 w-64 max-h-[50vh] overflow-y-auto pointer-events-none"
    >
      <div className="text-[10px] tracking-[0.25em] uppercase text-white/30 mb-3 font-mono">
        Memory Echoes
      </div>
      <div className="space-y-2">
        <AnimatePresence initial={false}>
          {thoughts
            .slice()
            .reverse()
            .slice(0, 8)
            .map((thought, i) => (
              <motion.div
                key={`${thought}-${thoughts.length - i}`}
                initial={{ opacity: 0, x: 30, filter: "blur(4px)" }}
                animate={{ opacity: 1 - i * 0.1, x: 0, filter: "blur(0px)" }}
                exit={{ opacity: 0, x: 20 }}
                transition={{ duration: 0.5, ease: [0.22, 1, 0.36, 1] }}
                className="text-sm text-white/50 leading-snug border-l border-violet-500/30 pl-3 py-1"
              >
                {thought}
              </motion.div>
            ))}
        </AnimatePresence>
      </div>
    </motion.div>
  );
}
