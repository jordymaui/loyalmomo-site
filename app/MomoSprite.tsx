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
  runFrame: number;
  frameTick: number;
}

export default function MomoSprite() {
  const posRef = useRef<Position>({
    x: 0, y: 0, vx: 0, vy: 0,
    facingRight: true, state: "idle", stateTimer: 120,
    runFrame: 0, frameTick: 0,
  });
  const rafRef = useRef<number>(0);
  const elRef = useRef<HTMLDivElement>(null);
  const imgRef = useRef<HTMLImageElement>(null);
  const shadowRef = useRef<HTMLDivElement>(null);
  const [mounted, setMounted] = useState(false);

  const getSize = () => {
    if (typeof window === "undefined") return 160;
    if (window.innerWidth < 480) return 100;
    if (window.innerWidth < 768) return 130;
    return 180;
  };

  const sizeRef = useRef(getSize());

  // Pick targets near the center of the screen — within 30% margins
  const pickDirection = useCallback((pos: Position) => {
    const size = sizeRef.current;
    const centerX = window.innerWidth / 2;
    const centerY = window.innerHeight / 2;

    // Keep Momo in a tight zone around the centre — max 250px from centre on each axis
    const rangeX = Math.min(250, (window.innerWidth - size) / 2 - 20);
    const rangeY = Math.min(200, (window.innerHeight - size) / 2 - 20);
    const targetX = centerX - size / 2 + (Math.random() - 0.5) * rangeX * 2;
    const targetY = centerY - size / 2 + (Math.random() - 0.5) * rangeY * 2;

    const dx = targetX - pos.x;
    const dy = targetY - pos.y;
    const dist = Math.sqrt(dx * dx + dy * dy);
    const speed = 1.2 + Math.random() * 1.5;

    if (dist > 0) {
      pos.vx = (dx / dist) * speed;
      pos.vy = (dy / dist) * speed;
    }
    pos.facingRight = pos.vx >= 0;
    pos.state = "walk";
    pos.stateTimer = Math.min(dist / speed, 500);
    pos.runFrame = 0;
    pos.frameTick = 0;
  }, []);

  useEffect(() => {
    const pos = posRef.current;
    const size = sizeRef.current;

    // Start near center
    pos.x = (window.innerWidth - size) / 2 + (Math.random() - 0.5) * 200;
    pos.y = (window.innerHeight - size) / 2 + (Math.random() - 0.5) * 100;
    setMounted(true);

    const handleResize = () => { sizeRef.current = getSize(); };
    window.addEventListener("resize", handleResize);

    let lastTime = 0;
    const FRAME_MS = 1000 / 30;

    // Run animation keyframes — tilt + squash/stretch to simulate running
    const runStyles = [
      { rotate: -6, scaleX: 1.08, scaleY: 0.90, ty: 3 },   // stretch forward
      { rotate: 0, scaleX: 0.95, scaleY: 1.04, ty: -3 },    // bounce up
      { rotate: 6, scaleX: 1.08, scaleY: 0.90, ty: 3 },     // stretch other way
      { rotate: 0, scaleX: 0.92, scaleY: 1.08, ty: -5 },    // spring up
    ];

    const loop = (ts: number) => {
      rafRef.current = requestAnimationFrame(loop);
      if (ts - lastTime < FRAME_MS) return;
      lastTime = ts - ((ts - lastTime) % FRAME_MS);

      const size = sizeRef.current;
      pos.stateTimer--;

      if (pos.state === "walk") {
        pos.x += pos.vx;
        pos.y += pos.vy;

        // Hard clamp — never leave viewport
        const pad = 10;
        const maxX = window.innerWidth - size - pad;
        const maxY = window.innerHeight - size - pad;
        pos.x = Math.max(pad, Math.min(pos.x, maxX));
        pos.y = Math.max(pad, Math.min(pos.y, maxY));
        
        // If somehow near edge, redirect to centre
        if (pos.x <= pad || pos.x >= maxX || pos.y <= pad || pos.y >= maxY) {
          pickDirection(pos);
          return;
        }

        // Cycle run frames every 4 ticks (~8fps)
        pos.frameTick++;
        if (pos.frameTick >= 4) {
          pos.frameTick = 0;
          pos.runFrame = (pos.runFrame + 1) % 4;
        }

        if (pos.stateTimer <= 0) {
          pos.state = "idle";
          pos.stateTimer = 80 + Math.random() * 200;
          pos.vx = 0;
          pos.vy = 0;
          pos.runFrame = 0;
        }
      } else {
        pos.runFrame = 0;
        if (pos.stateTimer <= 0) pickDirection(pos);
      }

      // Apply position to container
      if (elRef.current) {
        elRef.current.style.transform = `translate(${pos.x}px, ${pos.y}px)`;
        elRef.current.style.width = `${size}px`;
        elRef.current.style.height = `${size}px`;
      }

      // Apply animation to sprite image
      if (imgRef.current) {
        const flip = pos.facingRight ? 1 : -1;
        if (pos.state === "walk") {
          const f = runStyles[pos.runFrame];
          imgRef.current.style.transform = `scaleX(${flip * f.scaleX}) scaleY(${f.scaleY}) rotate(${f.rotate}deg) translateY(${f.ty}px)`;
        } else {
          // Idle: gentle floating bob
          const bob = Math.sin(ts / 600) * 4;
          const tilt = Math.sin(ts / 1200) * 1.5;
          imgRef.current.style.transform = `scaleX(${flip}) translateY(${bob}px) rotate(${tilt}deg)`;
        }
      }

      // Shadow
      if (shadowRef.current) {
        if (pos.state === "walk") {
          const pulse = 0.6 + Math.abs(Math.sin(pos.runFrame * 0.8)) * 0.4;
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
    return () => {
      cancelAnimationFrame(rafRef.current);
      window.removeEventListener("resize", handleResize);
    };
  }, [pickDirection]);

  if (!mounted) return null;

  const size = sizeRef.current;

  return (
    <div
      ref={elRef}
      className="fixed z-30 pointer-events-none"
      style={{ width: size, height: size, willChange: "transform" }}
    >
      {/* Shadow */}
      <div
        ref={shadowRef}
        className="absolute bottom-0 left-1/2 rounded-full bg-black/25 blur-md"
        style={{ width: size * 0.5, height: size * 0.06, transition: "transform 0.1s, opacity 0.1s" }}
      />

      {/* Momo — the original good sprite */}
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
