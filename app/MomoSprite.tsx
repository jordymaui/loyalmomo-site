"use client";

import { useEffect, useRef, useState, useCallback } from "react";

interface Position {
  x: number;
  y: number;
  vx: number;
  vy: number;
  facingRight: boolean;
  state: "idle" | "walk";
  stateTimer: number;
}

export default function MomoSprite() {
  const posRef = useRef<Position>({
    x: 0, y: 0, vx: 0, vy: 0,
    facingRight: true, state: "idle", stateTimer: 120,
  });
  const rafRef = useRef<number>(0);
  const elRef = useRef<HTMLDivElement>(null);
  const [mounted, setMounted] = useState(false);

  const SIZE = typeof window !== "undefined" && window.innerWidth < 640 ? 120 : 200;

  const pickDirection = useCallback((pos: Position) => {
    const angle = Math.random() * Math.PI * 2;
    const speed = 0.8 + Math.random() * 1.2;
    pos.vx = Math.cos(angle) * speed;
    pos.vy = Math.sin(angle) * speed;
    pos.facingRight = pos.vx >= 0;
    pos.state = "walk";
    pos.stateTimer = 200 + Math.random() * 400;
  }, []);

  useEffect(() => {
    const pos = posRef.current;
    pos.x = Math.random() * (window.innerWidth - SIZE);
    pos.y = Math.random() * (window.innerHeight - SIZE);
    setMounted(true);

    let lastTime = 0;
    const FRAME_MS = 1000 / 30;

    const loop = (ts: number) => {
      rafRef.current = requestAnimationFrame(loop);
      if (ts - lastTime < FRAME_MS) return;
      lastTime = ts - ((ts - lastTime) % FRAME_MS);

      pos.stateTimer--;

      if (pos.state === "walk") {
        pos.x += pos.vx;
        pos.y += pos.vy;

        // Bounce off edges
        const maxX = window.innerWidth - SIZE;
        const maxY = window.innerHeight - SIZE;
        if (pos.x < 0) { pos.x = 0; pos.vx = Math.abs(pos.vx); pos.facingRight = true; }
        if (pos.x > maxX) { pos.x = maxX; pos.vx = -Math.abs(pos.vx); pos.facingRight = false; }
        if (pos.y < 0) { pos.y = 0; pos.vy = Math.abs(pos.vy); }
        if (pos.y > maxY) { pos.y = maxY; pos.vy = -Math.abs(pos.vy); }

        if (pos.stateTimer <= 0) {
          pos.state = "idle";
          pos.stateTimer = 100 + Math.random() * 200;
          pos.vx = 0;
          pos.vy = 0;
        }
        // Random direction change
        if (Math.random() < 0.005) pickDirection(pos);
      } else {
        if (pos.stateTimer <= 0) pickDirection(pos);
      }

      // Apply to DOM
      if (elRef.current) {
        elRef.current.style.transform = `translate(${pos.x}px, ${pos.y}px) scaleX(${pos.facingRight ? 1 : -1})`;
      }
    };

    rafRef.current = requestAnimationFrame(loop);
    return () => cancelAnimationFrame(rafRef.current);
  }, [SIZE, pickDirection]);

  if (!mounted) return null;

  return (
    <div
      ref={elRef}
      className="fixed z-10 pointer-events-none"
      style={{ width: SIZE, height: SIZE, willChange: "transform" }}
    >
      {/* Shadow */}
      <div
        className="absolute bottom-0 left-1/2 -translate-x-1/2 rounded-full bg-black/20 blur-sm animate-shadow-pulse"
        style={{ width: SIZE * 0.5, height: SIZE * 0.08 }}
      />

      {/* Momo sprite */}
      <img
        src="/momo-large.png"
        alt="Momo"
        className="w-full h-full object-contain animate-momo-bob"
        style={{ imageRendering: "pixelated" }}
        draggable={false}
      />
    </div>
  );
}
