"use client";

import { useEffect, useRef, useState } from "react";

export default function MomoSprite() {
  const rafRef = useRef<number>(0);
  const elRef = useRef<HTMLDivElement>(null);
  const imgRef = useRef<HTMLImageElement>(null);
  const shadowRef = useRef<HTMLDivElement>(null);
  const [mounted, setMounted] = useState(false);

  const angleRef = useRef(-Math.PI / 2); // start at top
  const targetAngleRef = useRef(-Math.PI / 2);
  const stateRef = useRef<"walk" | "idle">("idle");
  const timerRef = useRef(90); // longer initial idle so you see him above text
  const runFrameRef = useRef(0);
  const tickRef = useRef(0);
  const prevXRef = useRef(0);

  const getSize = () => {
    if (typeof window === "undefined") return 120;
    if (window.innerWidth < 480) return 70;
    if (window.innerWidth < 768) return 90;
    return 120;
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

      // Find the content element and orbit around its centre
      const anchor = document.getElementById("content-anchor");
      let cx: number, cy: number;
      if (anchor) {
        const rect = anchor.getBoundingClientRect();
        cx = rect.left + rect.width / 2;
        cy = rect.top + rect.height / 2;
      } else {
        cx = window.innerWidth / 2;
        cy = window.innerHeight / 2;
      }

      // Tight orbit — sized relative to viewport, never bigger than needed
      const vw = window.innerWidth;
      const vh = window.innerHeight;
      const rx = Math.min(160, vw * 0.12);
      const ry = Math.min(120, vh * 0.12);

      timerRef.current--;

      if (stateRef.current === "idle") {
        if (timerRef.current <= 0) {
          const jump = (Math.PI / 3) + Math.random() * (2 * Math.PI / 3);
          const dir = Math.random() > 0.5 ? 1 : -1;
          targetAngleRef.current = angleRef.current + jump * dir;
          stateRef.current = "walk";
          timerRef.current = 120 + Math.random() * 200;
          runFrameRef.current = 0;
          tickRef.current = 0;
        }
      } else {
        const diff = targetAngleRef.current - angleRef.current;
        const step = 0.015 + Math.random() * 0.005;

        if (Math.abs(diff) < step) {
          angleRef.current = targetAngleRef.current;
          stateRef.current = "idle";
          timerRef.current = 60 + Math.random() * 120;
        } else {
          angleRef.current += Math.sign(diff) * step;
        }

        tickRef.current++;
        if (tickRef.current >= 4) {
          tickRef.current = 0;
          runFrameRef.current = (runFrameRef.current + 1) % 4;
        }
      }

      // Position on the orbit — clamped to viewport
      let px = cx + Math.cos(angleRef.current) * rx - size / 2;
      let py = cy + Math.sin(angleRef.current) * ry - size / 2;
      px = Math.max(0, Math.min(px, vw - size));
      py = Math.max(0, Math.min(py, vh - size));

      // Face the direction of horizontal movement
      const isMovingRight = px > prevXRef.current;
      prevXRef.current = px;
      const flip = isMovingRight ? 1 : -1;

      if (elRef.current) {
        elRef.current.style.transform = `translate(${px}px, ${py}px)`;
        elRef.current.style.width = `${size}px`;
        elRef.current.style.height = `${size}px`;
      }

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
