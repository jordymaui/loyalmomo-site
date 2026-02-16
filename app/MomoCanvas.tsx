"use client";

import { useEffect, useRef, useState, useCallback } from "react";

interface Position {
  x: number;
  y: number;
}

type MomoState = "idle" | "walking";

export default function MomoCanvas() {
  const [pos, setPos] = useState<Position>({ x: 50, y: 70 });
  const [state, setState] = useState<MomoState>("idle");
  const [facingLeft, setFacingLeft] = useState(false);
  const targetRef = useRef<Position>({ x: 50, y: 70 });
  const rafRef = useRef<number>(0);
  const timerRef = useRef<ReturnType<typeof setTimeout>>();
  const containerRef = useRef<HTMLDivElement>(null);

  const pickTarget = useCallback(() => {
    targetRef.current = {
      x: 10 + Math.random() * 80,
      y: 20 + Math.random() * 60,
    };
    setState("walking");
  }, []);

  const scheduleNext = useCallback(() => {
    const delay = 2000 + Math.random() * 4000;
    timerRef.current = setTimeout(() => {
      pickTarget();
    }, delay);
  }, [pickTarget]);

  useEffect(() => {
    const speed = 0.03; // % per frame

    const animate = () => {
      setPos((prev) => {
        const tx = targetRef.current.x;
        const ty = targetRef.current.y;
        const dx = tx - prev.x;
        const dy = ty - prev.y;
        const dist = Math.sqrt(dx * dx + dy * dy);

        if (dist < 0.5) {
          setState("idle");
          scheduleNext();
          return { x: tx, y: ty };
        }

        const nx = prev.x + (dx / dist) * speed * 16;
        const ny = prev.y + (dy / dist) * speed * 16;

        if (dx !== 0) {
          setFacingLeft(dx < 0);
        }

        return { x: nx, y: ny };
      });

      rafRef.current = requestAnimationFrame(animate);
    };

    rafRef.current = requestAnimationFrame(animate);
    // Start first movement after a short delay
    timerRef.current = setTimeout(pickTarget, 1500);

    return () => {
      cancelAnimationFrame(rafRef.current);
      if (timerRef.current) clearTimeout(timerRef.current);
    };
  }, [pickTarget, scheduleNext]);

  return (
    <div
      ref={containerRef}
      className="absolute inset-0 overflow-hidden pointer-events-none z-10"
    >
      <div
        className="absolute transition-none"
        style={{
          left: `${pos.x}%`,
          top: `${pos.y}%`,
          transform: `translate(-50%, -50%) scaleX(${facingLeft ? -1 : 1})`,
        }}
      >
        {/* Shadow */}
        <div
          className={`absolute -bottom-2 left-1/2 -translate-x-1/2 rounded-full bg-black/20 blur-sm ${
            state === "walking" ? "animate-shadow-walk" : "animate-shadow-idle"
          }`}
          style={{ width: "60%", height: "8px" }}
        />

        {/* Momo sprite */}
        <img
          src="/momo-sprite.png"
          alt="Momo"
          draggable={false}
          className={`w-[60px] md:w-[100px] h-auto ${
            state === "walking" ? "animate-walk" : "animate-idle"
          }`}
          style={{ imageRendering: "pixelated" }}
        />
      </div>
    </div>
  );
}
