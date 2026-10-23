"use client";

import { useState, useCallback, useEffect } from "react";
import { motion, AnimatePresence } from "framer-motion";
import NeuralField from "@/components/NeuralField";
import ThoughtInput from "@/components/ThoughtInput";
import MemoryPanel from "@/components/MemoryPanel";

export default function Home() {
  const [thoughts, setThoughts] = useState<string[]>([]);
  const [intensity, setIntensity] = useState(0);
  const [booted, setBooted] = useState(false);
  const [pulseKey, setPulseKey] = useState(0);

  useEffect(() => {
    const t = setTimeout(() => setBooted(true), 400);
    return () => clearTimeout(t);
  }, []);

  const handleThought = useCallback((thought: string) => {
    setThoughts((prev) => [...prev, thought]);
    setIntensity((prev) => Math.min(1, prev + 0.18));
    setPulseKey((k) => k + 1);

    // Intensity slowly decays
    setTimeout(() => {
      setIntensity((prev) => Math.max(0, prev - 0.08));
    }, 2800);
  }, []);

  const handlePulse = useCallback(() => {
    // visual feedback handled in field
  }, []);

  return (
    <main className="relative w-full h-screen overflow-hidden bg-[#030308]">
      {/* Neural Field */}
      <NeuralField
        thoughts={thoughts}
        intensity={intensity}
        onPulse={handlePulse}
      />

      {/* Subtle vignette */}
      <div className="absolute inset-0 pointer-events-none bg-[radial-gradient(ellipse_at_center,transparent_40%,rgba(0,0,0,0.55)_100%)]" />

      {/* Top branding */}
      <AnimatePresence>
        {booted && (
          <motion.header
            initial={{ opacity: 0, y: -20 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ duration: 1, ease: [0.22, 1, 0.36, 1] }}
            className="absolute top-0 left-0 right-0 z-20 flex items-center justify-between px-8 py-6"
          >
            <div className="flex items-center gap-3">
              <div className="w-2 h-2 rounded-full bg-violet-400 shadow-[0_0_12px_#a78bfa] animate-pulse" />
              <span className="font-display text-sm tracking-[0.3em] uppercase text-white/70">
                Aether
              </span>
            </div>
            <div className="font-mono text-[10px] tracking-widest text-white/25 uppercase">
              Living Interface · v1.0
            </div>
          </motion.header>
        )}
      </AnimatePresence>

      {/* Memory Panel */}
      <MemoryPanel thoughts={thoughts} />

      {/* Center content */}
      <div className="absolute inset-0 z-10 flex flex-col items-center justify-center pointer-events-none">
        <AnimatePresence>
          {booted && thoughts.length === 0 && (
            <motion.div
              initial={{ opacity: 0, scale: 0.95 }}
              animate={{ opacity: 1, scale: 1 }}
              exit={{ opacity: 0, scale: 1.05, filter: "blur(8px)" }}
              transition={{ duration: 0.9, ease: [0.22, 1, 0.36, 1] }}
              className="text-center mb-16 px-6"
            >
              <h1 className="font-display text-4xl md:text-6xl font-light tracking-tight text-white/90 glow-text mb-4">
                Speak into the void
              </h1>
              <p className="text-white/35 text-sm md:text-base max-w-md mx-auto leading-relaxed">
                Every thought you release is absorbed into the field.
                <br />
                The particles remember. The space evolves.
              </p>
            </motion.div>
          )}
        </AnimatePresence>

        {/* Pulse ring on thought */}
        <AnimatePresence>
          {pulseKey > 0 && (
            <motion.div
              key={pulseKey}
              initial={{ scale: 0.4, opacity: 0.6 }}
              animate={{ scale: 2.8, opacity: 0 }}
              exit={{ opacity: 0 }}
              transition={{ duration: 1.4, ease: "easeOut" }}
              className="absolute w-32 h-32 rounded-full border border-violet-400/40 pointer-events-none"
            />
          )}
        </AnimatePresence>
      </div>

      {/* Input area */}
      <div className="absolute bottom-0 left-0 right-0 z-20 px-6 pb-10 pt-20 bg-gradient-to-t from-[#030308] via-[#030308]/80 to-transparent pointer-events-none">
        <div className="pointer-events-auto">
          <ThoughtInput onSubmit={handleThought} />
        </div>
      </div>

      {/* Bottom status */}
      <div className="absolute bottom-3 left-6 right-6 flex justify-between items-center text-[10px] font-mono text-white/15 tracking-wider uppercase pointer-events-none">
        <span>
          {thoughts.length === 0
            ? "Awaiting first resonance"
            : `${thoughts.length} memory node${thoughts.length > 1 ? "s" : ""} active`}
        </span>
        <span>Field intensity {Math.round(intensity * 100)}%</span>
      </div>
    </main>
  );
}
