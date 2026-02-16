"use client";

import { useEffect, useRef } from "react";

export default function MomoSprite() {
  const elRef = useRef<HTMLDivElement>(null);
  const imgRef = useRef<HTMLImageElement>(null);
  const shadowRef = useRef<HTMLDivElement>(null);
  const rafRef = useRef<number>(0);

  useEffect(() => {
    const el = elRef.current;
    const img = imgRef.current;
    const shadow = shadowRef.current;
    if (!el || !img || !shadow) return;

    let angle = -Math.PI / 2; // start at top
    let targetAngle = -Math.PI / 2;
    let state: "walk" | "idle" = "idle";
    let timer = 90;
    let runFrame = 0;
    let tick = 0;
    let prevX = 0;
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

      // Orbit radii in px — relative to parent container
      // Parent is the content div (~max-w-md = 448px wide, ~300px tall)
      const rx = 180;
      const ry = 140;

      timer--;

      if (state === "idle") {
        if (timer <= 0) {
          const jump = (Math.PI / 3) + Math.random() * (2 * Math.PI / 3);
          const dir = Math.random() > 0.5 ? 1 : -1;
          targetAngle = angle + jump * dir;
          state = "walk";
          timer = 120 + Math.random() * 200;
          runFrame = 0;
          tick = 0;
        }
      } else {
        const diff = targetAngle - angle;
        const step = 0.015 + Math.random() * 0.005;

        if (Math.abs(diff) < step) {
          angle = targetAngle;
          state = "idle";
          timer = 60 + Math.random() * 120;
        } else {
          angle += Math.sign(diff) * step;
        }

        tick++;
        if (tick >= 4) {
          tick = 0;
          runFrame = (runFrame + 1) % 4;
        }
      }

      // Position relative to center of parent (0,0 = center of content div)
      const px = Math.cos(angle) * rx;
      const py = Math.sin(angle) * ry;

      const isMovingRight = px > prevX;
      prevX = px;
      const flip = state === "walk" ? (isMovingRight ? 1 : -1) : 1;

      // Transform relative to center (the div is already centered via CSS)
      el.style.transform = `translate(${px}px, ${py}px)`;

      if (state === "walk") {
        const f = runStyles[runFrame];
        img.style.transform = `scaleX(${flip * f.sx}) scaleY(${f.sy}) rotate(${f.rotate}deg) translateY(${f.ty}px)`;
      } else {
        const bob = Math.sin(ts / 600) * 4;
        const tilt = Math.sin(ts / 1200) * 1.5;
        img.style.transform = `scaleX(${flip}) translateY(${bob}px) rotate(${tilt}deg)`;
      }

      if (state === "walk") {
        const pulse = 0.6 + Math.abs(Math.sin(runFrame * 0.8)) * 0.4;
        shadow.style.transform = `translateX(-50%) scaleX(${pulse})`;
        shadow.style.opacity = "0.25";
      } else {
        const breathe = 0.8 + Math.sin(ts / 600) * 0.2;
        shadow.style.transform = `translateX(-50%) scaleX(${breathe})`;
        shadow.style.opacity = "0.15";
      }
    };

    rafRef.current = requestAnimationFrame(loop);
    return () => cancelAnimationFrame(rafRef.current);
  }, []);

  return (
    <div className="absolute left-1/2 top-0 -translate-x-1/2 -translate-y-1/2 z-30 pointer-events-none">
      <div
        ref={elRef}
        className="relative"
        style={{ width: 160, height: 160, willChange: "transform" }}
      >
        <div
          ref={shadowRef}
          className="absolute bottom-0 left-1/2 rounded-full bg-black/25 blur-md"
          style={{ width: 80, height: 8, transition: "transform 0.1s, opacity 0.1s" }}
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
    </div>
  );
}
