"use client";

import { useState, useRef, useEffect } from "react";
import { motion, AnimatePresence } from "framer-motion";
import { Send, Sparkles } from "lucide-react";

interface ThoughtInputProps {
  onSubmit: (thought: string) => void;
  disabled?: boolean;
}

export default function ThoughtInput({ onSubmit, disabled }: ThoughtInputProps) {
  const [value, setValue] = useState("");
  const [focused, setFocused] = useState(false);
  const inputRef = useRef<HTMLInputElement>(null);

  useEffect(() => {
    // Auto-focus after short delay for cinematic feel
    const t = setTimeout(() => inputRef.current?.focus(), 1200);
    return () => clearTimeout(t);
  }, []);

  const handleSubmit = (e?: React.FormEvent) => {
    e?.preventDefault();
    const trimmed = value.trim();
    if (!trimmed || disabled) return;
    onSubmit(trimmed);
    setValue("");
  };

  return (
    <motion.div
      initial={{ opacity: 0, y: 30 }}
      animate={{ opacity: 1, y: 0 }}
      transition={{ delay: 0.8, duration: 0.8, ease: [0.22, 1, 0.36, 1] }}
      className="w-full max-w-xl mx-auto"
    >
      <form onSubmit={handleSubmit} className="relative">
        <div
          className={`
            relative flex items-center gap-3 rounded-2xl px-5 py-4
            bg-white/[0.03] backdrop-blur-xl
            border transition-all duration-500
            ${focused 
              ? "border-violet-500/50 shadow-[0_0_40px_rgba(124,92,255,0.15)]" 
              : "border-white/10 hover:border-white/20"
            }
          `}
        >
          <Sparkles
            className={`w-5 h-5 transition-colors duration-300 ${
              focused ? "text-violet-400" : "text-white/30"
            }`}
          />
          <input
            ref={inputRef}
            type="text"
            value={value}
            onChange={(e) => setValue(e.target.value)}
            onFocus={() => setFocused(true)}
            onBlur={() => setFocused(false)}
            placeholder="Speak a thought into the field..."
            disabled={disabled}
            className="flex-1 bg-transparent outline-none text-white/90 placeholder:text-white/25 text-[15px] font-light tracking-wide"
            maxLength={120}
            autoComplete="off"
          />
          <AnimatePresence>
            {value.trim() && (
              <motion.button
                type="submit"
                initial={{ scale: 0.6, opacity: 0 }}
                animate={{ scale: 1, opacity: 1 }}
                exit={{ scale: 0.6, opacity: 0 }}
                whileHover={{ scale: 1.08 }}
                whileTap={{ scale: 0.95 }}
                className="p-2 rounded-xl bg-violet-500/20 text-violet-300 hover:bg-violet-500/30 transition-colors"
              >
                <Send className="w-4 h-4" />
              </motion.button>
            )}
          </AnimatePresence>
        </div>
      </form>
      <p className="mt-3 text-center text-[11px] text-white/20 tracking-widest uppercase">
        Your words become memory
      </p>
    </motion.div>
  );
}
