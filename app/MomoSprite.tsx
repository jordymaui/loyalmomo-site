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

  // Responsive size
  const getSize = () => {
    if (typeof window === "undefined") return 160;
    if (window.innerWidth < 480) return 80;
    if (window.innerWidth < 768) return 120;
    return 160;
  };

  const sizeRef = useRef(getSize());

  // Pick a target in the middle ~60% of the screen
  const pickDirection = useCallback((pos: Position) => {
    const size = sizeRef.current;
    const marginX = window.innerWidth * 0.2;
    const marginY = window.innerHeight * 0.2;
    const targetX = marginX + Math.random() * (window.innerWidth - marginX * 2 - size);
    const targetY = marginY + Math.random() * (window.innerHeight - marginY * 2 - size);

    const dx = targetX - pos.x;
    const dy = targetY - pos.y;
    const dist = Math.sqrt(dx * dx + dy * dy);
    const speed = 1.0 + Math.random() * 1.5;

    if (dist > 0) {
      pos.vx = (dx / dist) * speed;
      pos.vy = (dy / dist) * speed;
    }
    pos.facingRight = pos.vx >= 0;
    pos.state = "walk";
    pos.stateTimer = Math.min(dist / speed, 600);
    pos.runFrame = 0;
    pos.frameTick = 0;
  }, []);

  useEffect(() => {
    const pos = posRef.current;
    const size = sizeRef.current;

    // Start in middle area
    const marginX = window.innerWidth * 0.25;
    const marginY = window.innerHeight * 0.25;
    pos.x = marginX + Math.random() * (window.innerWidth - marginX * 2 - size);
    pos.y = marginY + Math.random() * (window.innerHeight - marginY * 2 - size);
    setMounted(true);

    const handleResize = () => { sizeRef.current = getSize(); };
    window.addEventListener("resize", handleResize);

    let lastTime = 0;
    const FRAME_MS = 1000 / 30;

    // Run animation: 3 keyframes cycling
    // Frame 0: normal, Frame 1: slight tilt + squash, Frame 2: opposite tilt + stretch
    const runStyles = [
      { rotate: 0, scaleX: 1, scaleY: 1, translateY: 0 },
      { rotate: -8, scaleX: 1.05, scaleY: 0.92, translateY: 2 },
      { rotate: 8, scaleX: 0.95, scaleY: 1.06, translateY: -4 },
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

        // Soft bounds — keep in middle area mostly
        const maxX = window.innerWidth - size;
        const maxY = window.innerHeight - size;
        if (pos.x < 0) { pos.x = 0; pickDirection(pos); }
        if (pos.x > maxX) { pos.x = maxX; pickDirection(pos); }
        if (pos.y < 0) { pos.y = 0; pickDirection(pos); }
        if (pos.y > maxY) { pos.y = maxY; pickDirection(pos); }

        // Cycle run frames every 5 ticks
        pos.frameTick++;
        if (pos.frameTick >= 5) {
          pos.frameTick = 0;
          pos.runFrame = (pos.runFrame + 1) % 3;
        }

        if (pos.stateTimer <= 0) {
          pos.state = "idle";
          pos.stateTimer = 80 + Math.random() * 180;
          pos.vx = 0;
          pos.vy = 0;
          pos.runFrame = 0;
        }
      } else {
        // Idle bob
        pos.runFrame = 0;
        if (pos.stateTimer <= 0) pickDirection(pos);
      }

      // Apply position
      if (elRef.current) {
        elRef.current.style.transform = `translate(${pos.x}px, ${pos.y}px) scaleX(${pos.facingRight ? 1 : -1})`;
        elRef.current.style.width = `${size}px`;
        elRef.current.style.height = `${size}px`;
      }

      // Apply run animation to sprite
      if (imgRef.current) {
        if (pos.state === "walk") {
          const f = runStyles[pos.runFrame];
          imgRef.current.style.transform = `rotate(${f.rotate}deg) scaleX(${f.scaleX}) scaleY(${f.scaleY}) translateY(${f.translateY}px)`;
          imgRef.current.style.animation = "none";
        } else {
          // Idle: gentle bob
          imgRef.current.style.transform = "";
          imgRef.current.style.animation = "momoBob 2s ease-in-out infinite";
        }
      }

      // Shadow responds to state
      if (shadowRef.current) {
        if (pos.state === "walk") {
          shadowRef.current.style.transform = `translateX(-50%) scaleX(${0.7 + pos.runFrame * 0.1})`;
          shadowRef.current.style.opacity = "0.3";
        } else {
          shadowRef.current.style.transform = "translateX(-50%) scaleX(1)";
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
      className="fixed z-10 pointer-events-none"
      style={{ width: size, height: size, willChange: "transform" }}
    >
      {/* Shadow */}
      <div
        ref={shadowRef}
        className="absolute bottom-0 left-1/2 -translate-x-1/2 rounded-full bg-black/20 blur-sm transition-all duration-150"
        style={{ width: size * 0.5, height: size * 0.08 }}
      />

      {/* Momo sprite */}
      <img
        ref={imgRef}
        src="/momo-large.png"
        alt="Momo"
        className="w-full h-full object-contain"
        style={{ imageRendering: "pixelated", willChange: "transform" }}
        draggable={false}
      />
    </div>
  );
}
