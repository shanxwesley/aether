"use client";

import { useEffect, useRef, useCallback } from "react";

interface Particle {
  x: number;
  y: number;
  vx: number;
  vy: number;
  size: number;
  life: number;
  maxLife: number;
  hue: number;
  targetX?: number;
  targetY?: number;
  isMemory: boolean;
  memoryStrength: number;
}

interface NeuralFieldProps {
  thoughts: string[];
  intensity: number;
  onPulse?: () => void;
}

export default function NeuralField({ thoughts, intensity, onPulse }: NeuralFieldProps) {
  const canvasRef = useRef<HTMLCanvasElement>(null);
  const particlesRef = useRef<Particle[]>([]);
  const mouseRef = useRef({ x: 0, y: 0, active: false });
  const animationRef = useRef<number>(0);
  const timeRef = useRef(0);
  const memoryNodesRef = useRef<{ x: number; y: number; strength: number; text: string }[]>([]);

  const initParticles = useCallback((width: number, height: number) => {
    const count = Math.min(180, Math.floor((width * height) / 8000));
    const particles: Particle[] = [];
    for (let i = 0; i < count; i++) {
      particles.push({
        x: Math.random() * width,
        y: Math.random() * height,
        vx: (Math.random() - 0.5) * 0.4,
        vy: (Math.random() - 0.5) * 0.4,
        size: Math.random() * 2.2 + 0.6,
        life: 1,
        maxLife: 1,
        hue: 250 + Math.random() * 60,
        isMemory: false,
        memoryStrength: 0,
      });
    }
    particlesRef.current = particles;
  }, []);

  // When a new thought arrives, inject memory nodes + attract particles
  useEffect(() => {
    if (thoughts.length === 0) return;
    const canvas = canvasRef.current;
    if (!canvas) return;

    const lastThought = thoughts[thoughts.length - 1];
    const cx = canvas.width * (0.3 + Math.random() * 0.4);
    const cy = canvas.height * (0.25 + Math.random() * 0.5);

    memoryNodesRef.current.push({
      x: cx,
      y: cy,
      strength: 1,
      text: lastThought.slice(0, 40),
    });

    // Pull nearby particles into a memory formation
    particlesRef.current.forEach((p, i) => {
      const dx = cx - p.x;
      const dy = cy - p.y;
      const dist = Math.sqrt(dx * dx + dy * dy);
      if (dist < 280) {
        p.targetX = cx + Math.cos(i * 0.7) * (40 + Math.random() * 80);
        p.targetY = cy + Math.sin(i * 0.7) * (40 + Math.random() * 80);
        p.isMemory = true;
        p.memoryStrength = 1;
        p.hue = 270 + Math.random() * 40;
      }
    });

    if (onPulse) onPulse();
  }, [thoughts, onPulse]);

  useEffect(() => {
    const canvas = canvasRef.current;
    if (!canvas) return;

    const ctx = canvas.getContext("2d", { alpha: false });
    if (!ctx) return;

    const resize = () => {
      const dpr = Math.min(window.devicePixelRatio || 1, 2);
      canvas.width = window.innerWidth * dpr;
      canvas.height = window.innerHeight * dpr;
      canvas.style.width = `${window.innerWidth}px`;
      canvas.style.height = `${window.innerHeight}px`;
      ctx.scale(dpr, dpr);
      initParticles(window.innerWidth, window.innerHeight);
    };

    resize();
    window.addEventListener("resize", resize);

    const handleMouse = (e: MouseEvent) => {
      mouseRef.current.x = e.clientX;
      mouseRef.current.y = e.clientY;
      mouseRef.current.active = true;
    };
    const handleLeave = () => {
      mouseRef.current.active = false;
    };

    window.addEventListener("mousemove", handleMouse);
    window.addEventListener("mouseleave", handleLeave);

    const draw = () => {
      timeRef.current += 0.016;
      const w = window.innerWidth;
      const h = window.innerHeight;

      // Deep void background with subtle gradient
      const gradient = ctx.createRadialGradient(
        w * 0.5,
        h * 0.4,
        0,
        w * 0.5,
        h * 0.5,
        Math.max(w, h) * 0.8
      );
      gradient.addColorStop(0, "#0a0a18");
      gradient.addColorStop(0.6, "#05050c");
      gradient.addColorStop(1, "#030308");
      ctx.fillStyle = gradient;
      ctx.fillRect(0, 0, w, h);

      // Soft ambient glow orbs
      const t = timeRef.current;
      for (let i = 0; i < 3; i++) {
        const gx = w * (0.2 + 0.3 * i) + Math.sin(t * 0.3 + i) * 80;
        const gy = h * 0.35 + Math.cos(t * 0.2 + i * 1.5) * 60;
        const g = ctx.createRadialGradient(gx, gy, 0, gx, gy, 180);
        g.addColorStop(0, `rgba(124, 92, 255, ${0.04 + intensity * 0.03})`);
        g.addColorStop(1, "transparent");
        ctx.fillStyle = g;
        ctx.fillRect(0, 0, w, h);
      }

      const particles = particlesRef.current;
      const mouse = mouseRef.current;

      // Update & draw particles
      for (let i = 0; i < particles.length; i++) {
        const p = particles[i];

        // Memory attraction
        if (p.targetX !== undefined && p.targetY !== undefined) {
          const dx = p.targetX - p.x;
          const dy = p.targetY - p.y;
          p.vx += dx * 0.008;
          p.vy += dy * 0.008;
          p.memoryStrength *= 0.997;
          if (p.memoryStrength < 0.15) {
            p.targetX = undefined;
            p.targetY = undefined;
            p.isMemory = false;
          }
        }

        // Mouse interaction
        if (mouse.active) {
          const dx = mouse.x - p.x;
          const dy = mouse.y - p.y;
          const dist = Math.sqrt(dx * dx + dy * dy);
          if (dist < 160) {
            const force = (160 - dist) / 160;
            p.vx -= (dx / dist) * force * 0.35;
            p.vy -= (dy / dist) * force * 0.35;
          }
        }

        // Soft drift + intensity boost
        p.vx += (Math.random() - 0.5) * 0.02 * (1 + intensity);
        p.vy += (Math.random() - 0.5) * 0.02 * (1 + intensity);
        p.vx *= 0.98;
        p.vy *= 0.98;

        p.x += p.vx;
        p.y += p.vy;

        // Wrap around
        if (p.x < -20) p.x = w + 20;
        if (p.x > w + 20) p.x = -20;
        if (p.y < -20) p.y = h + 20;
        if (p.y > h + 20) p.y = -20;

        // Draw particle
        const alpha = p.isMemory ? 0.5 + p.memoryStrength * 0.5 : 0.35 + Math.sin(t + i) * 0.15;
        ctx.beginPath();
        ctx.arc(p.x, p.y, p.size * (p.isMemory ? 1.4 : 1), 0, Math.PI * 2);
        ctx.fillStyle = `hsla(${p.hue}, 80%, 70%, ${alpha})`;
        ctx.fill();

        // Soft glow for memory particles
        if (p.isMemory && p.memoryStrength > 0.3) {
          ctx.beginPath();
          ctx.arc(p.x, p.y, p.size * 4, 0, Math.PI * 2);
          ctx.fillStyle = `hsla(${p.hue}, 90%, 60%, ${p.memoryStrength * 0.12})`;
          ctx.fill();
        }
      }

      // Draw connections (neural links)
      ctx.lineWidth = 0.6;
      for (let i = 0; i < particles.length; i++) {
        for (let j = i + 1; j < particles.length; j++) {
          const a = particles[i];
          const b = particles[j];
          const dx = a.x - b.x;
          const dy = a.y - b.y;
          const dist = Math.sqrt(dx * dx + dy * dy);
          if (dist < 90) {
            const alpha = (1 - dist / 90) * 0.18 * (1 + intensity * 0.5);
            ctx.beginPath();
            ctx.moveTo(a.x, a.y);
            ctx.lineTo(b.x, b.y);
            ctx.strokeStyle = `rgba(167, 139, 250, ${alpha})`;
            ctx.stroke();
          }
        }
      }

      // Draw memory nodes (subtle)
      memoryNodesRef.current.forEach((node, idx) => {
        node.strength *= 0.9995;
        if (node.strength < 0.05) return;

        const pulse = 0.6 + Math.sin(t * 2 + idx) * 0.4;
        ctx.beginPath();
        ctx.arc(node.x, node.y, 3 + pulse * 2, 0, Math.PI * 2);
        ctx.fillStyle = `rgba(244, 114, 182, ${node.strength * 0.7})`;
        ctx.fill();

        ctx.beginPath();
        ctx.arc(node.x, node.y, 18 + pulse * 8, 0, Math.PI * 2);
        ctx.strokeStyle = `rgba(244, 114, 182, ${node.strength * 0.15})`;
        ctx.lineWidth = 1;
        ctx.stroke();
      });

      // Clean weak memory nodes
      memoryNodesRef.current = memoryNodesRef.current.filter((n) => n.strength > 0.05);

      animationRef.current = requestAnimationFrame(draw);
    };

    draw();

    return () => {
      cancelAnimationFrame(animationRef.current);
      window.removeEventListener("resize", resize);
      window.removeEventListener("mousemove", handleMouse);
      window.removeEventListener("mouseleave", handleLeave);
    };
  }, [initParticles, intensity]);

  return (
    <canvas
      ref={canvasRef}
      className="absolute inset-0 w-full h-full"
      style={{ touchAction: "none" }}
    />
  );
}
