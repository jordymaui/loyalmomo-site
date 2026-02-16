"use client";

import { useEffect, useRef, useState } from "react";

export default function MomoSprite() {
  const rafRef = useRef<number>(0);
  const elRef = useRef<HTMLDivElement>(null);
  const imgRef = useRef<HTMLImageElement>(null);
  const shadowRef = useRef<HTMLDivElement>(null);
  const [mounted, setMounted] = useState(false);

  // Angle along the orbit
  const angleRef = useRef(-Math.PI / 2); // start at top
  const targetAngleRef = useRef(-Math.PI / 2);
  const stateRef = useRef<"walk" | "idle">("idle");
  const timerRef = useRef(60);
  const runFrameRef = useRef(0);
  const tickRef = useRef(0);

  const getSize = () => {
    if (typeof window === "undefined") return 150;
    if (window.innerWidth < 480) return 90;
    if (window.innerWidth < 768) return 120;
    return 150;
  };

  useEffect(() => {
    setMounted(true);

    let lastTime = 0;
    const FRAME_MS = 1000 / 30;

    const runStyles = [
      { rotate: -6, sx: 1.08, sy: 0.90, ty: 3 },
      { rotate: 0, sx: 0.95, sy: 1.04, ty: -3 },
      { rotate: 6, sx: 1.08, sy: 0.90, ty: 3 },
      { rotate: 0, sx: 0.92, sy: 1.08, ty: -5 },
    ];

    const loop = (ts: number) => {
      rafRef.current = requestAnimationFrame(loop);
      if (ts - lastTime < FRAME_MS) return;
      lastTime = ts - ((ts - lastTime) % FRAME_MS);

      const size = getSize();
      const cx = window.innerWidth / 2;
      const cy = window.innerHeight / 2;

      // Orbit radii — tight around text
      const rx = Math.min(220, window.innerWidth * 0.2);
      const ry = Math.min(160, window.innerHeight * 0.18);

      timerRef.current--;

      if (stateRef.current === "idle") {
        // Idle — stay put
        if (timerRef.current <= 0) {
          // Pick new target angle — jump 60-180 degrees
          const jump = (Math.PI / 3) + Math.random() * (2 * Math.PI / 3);
          const dir = Math.random() > 0.5 ? 1 : -1;
          targetAngleRef.current = angleRef.current + jump * dir;
          stateRef.current = "walk";
          timerRef.current = 120 + Math.random() * 200;
          runFrameRef.current = 0;
          tickRef.current = 0;
        }
      } else {
        // Walk — move angle towards target
        const diff = targetAngleRef.current - angleRef.current;
        const step = 0.015 + Math.random() * 0.005;
        
        if (Math.abs(diff) < step) {
          angleRef.current = targetAngleRef.current;
          stateRef.current = "idle";
          timerRef.current = 60 + Math.random() * 120;
        } else {
          angleRef.current += Math.sign(diff) * step;
        }

        // Run frame cycle
        tickRef.current++;
        if (tickRef.current >= 4) {
          tickRef.current = 0;
          runFrameRef.current = (runFrameRef.current + 1) % 4;
        }
      }

      // Calculate position on orbit
      const px = cx + Math.cos(angleRef.current) * rx - size / 2;
      const py = cy + Math.sin(angleRef.current) * ry - size / 2;

      // Determine facing direction based on movement
      const movingRight = Math.sin(angleRef.current) > 0 ? 
        Math.cos(angleRef.current) < 0 : Math.cos(angleRef.current) > 0;
      // Simpler: face the direction of angular movement
      const angularDir = targetAngleRef.current > angleRef.current ? 1 : -1;
      const facingRight = angularDir > 0 ? 
        Math.cos(angleRef.current + 0.1) > Math.cos(angleRef.current) || Math.sin(angleRef.current) < 0
        : true;
      
      // Even simpler — face right if x is increasing
      const nextPx = cx + Math.cos(angleRef.current + 0.01 * Math.sign(targetAngleRef.current - angleRef.current)) * rx;
      const isMovingRight = nextPx > (px + size / 2);
      const flip = isMovingRight ? 1 : -1;

      // Apply position
      if (elRef.current) {
        elRef.current.style.transform = `translate(${px}px, ${py}px)`;
        elRef.current.style.width = `${size}px`;
        elRef.current.style.height = `${size}px`;
      }

      // Apply sprite animation
      if (imgRef.current) {
        if (stateRef.current === "walk") {
          const f = runStyles[runFrameRef.current];
          imgRef.current.style.transform = `scaleX(${flip * f.sx}) scaleY(${f.sy}) rotate(${f.rotate}deg) translateY(${f.ty}px)`;
        } else {
          const bob = Math.sin(ts / 600) * 4;
          const tilt = Math.sin(ts / 1200) * 1.5;
          imgRef.current.style.transform = `scaleX(${flip}) translateY(${bob}px) rotate(${tilt}deg)`;
        }
      }

      // Shadow
      if (shadowRef.current) {
        if (stateRef.current === "walk") {
          const pulse = 0.6 + Math.abs(Math.sin(runFrameRef.current * 0.8)) * 0.4;
          shadowRef.current.style.transform = `translateX(-50%) scaleX(${pulse})`;
          shadowRef.current.style.opacity = "0.25";
        } else {
          const breathe = 0.8 + Math.sin(ts / 600) * 0.2;
          shadowRef.current.style.transform = `translateX(-50%) scaleX(${breathe})`;
          shadowRef.current.style.opacity = "0.15";
        }
      }
    };

    rafRef.current = requestAnimationFrame(loop);
    return () => cancelAnimationFrame(rafRef.current);
  }, []);

  if (!mounted) return null;

  const size = getSize();

  return (
    <div
      ref={elRef}
      className="fixed z-30 pointer-events-none"
      style={{ width: size, height: size, willChange: "transform" }}
    >
      <div
        ref={shadowRef}
        className="absolute bottom-0 left-1/2 rounded-full bg-black/25 blur-md"
        style={{ width: size * 0.5, height: size * 0.06, transition: "transform 0.1s, opacity 0.1s" }}
      />
      <img
        ref={imgRef}
        src="/momo-large.png"
        alt="Momo"
        className="w-full h-full object-contain"
        style={{ imageRendering: "pixelated", willChange: "transform", transition: "transform 0.08s ease" }}
        draggable={false}
      />
    </div>
  );
}
