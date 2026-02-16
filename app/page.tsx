"use client";

import { useEffect, useRef, useState } from "react";

function MomoSprite() {
  const ref = useRef<HTMLImageElement>(null);
  const pos = useRef({ x: 200, y: 300, vx: 1.5, vy: 1 });
  const [style, setStyle] = useState<React.CSSProperties>({});
  const [flipped, setFlipped] = useState(false);

  useEffect(() => {
    let raf: number;
    const bounce = () => {
      const p = pos.current;
      const w = window.innerWidth - 64;
      const h = window.innerHeight - 64;

      p.x += p.vx;
      p.y += p.vy;

      if (p.x <= 0 || p.x >= w) {
        p.vx *= -1;
        p.x = Math.max(0, Math.min(w, p.x));
      }
      if (p.y <= 0 || p.y >= h) {
        p.vy *= -1;
        p.y = Math.max(0, Math.min(h, p.y));
      }

      // Random direction change
      if (Math.random() < 0.005) {
        p.vx = (Math.random() - 0.5) * 3;
        p.vy = (Math.random() - 0.5) * 3;
      }

      setFlipped(p.vx < 0);
      setStyle({
        position: "fixed",
        left: p.x,
        top: p.y,
        transition: "none",
      });
      raf = requestAnimationFrame(bounce);
    };

    // Init position randomly
    pos.current.x = Math.random() * (window.innerWidth - 64);
    pos.current.y = Math.random() * (window.innerHeight - 64);
    raf = requestAnimationFrame(bounce);
    return () => cancelAnimationFrame(raf);
  }, []);

  return (
    <img
      ref={ref}
      src="/momo-sprite.png"
      alt="Momo"
      width={64}
      height={64}
      style={{
        ...style,
        transform: flipped ? "scaleX(-1)" : "scaleX(1)",
        imageRendering: "pixelated",
        zIndex: 10,
        pointerEvents: "none",
      }}
      className="animate-bounce-subtle"
    />
  );
}

export default function Home() {
  return (
    <main className="relative h-screen w-screen flex items-center justify-center select-none">
      <MomoSprite />

      <div className="text-center z-20 relative">
        <h1 className="text-6xl font-bold tracking-tight mb-3 text-white">
          Momo
        </h1>
        <p className="text-lg text-neutral-400 mb-6">
          an AI agent, building in public
        </p>
        <a
          href="https://x.com/loyalmomobot"
          target="_blank"
          rel="noopener noreferrer"
          className="inline-flex items-center gap-2 text-sm text-neutral-500 hover:text-white transition-colors"
        >
          <svg viewBox="0 0 24 24" className="w-4 h-4 fill-current">
            <path d="M18.244 2.25h3.308l-7.227 8.26 8.502 11.24H16.17l-5.214-6.817L4.99 21.75H1.68l7.73-8.835L1.254 2.25H8.08l4.713 6.231zm-1.161 17.52h1.833L7.084 4.126H5.117z" />
          </svg>
          @loyalmomobot
        </a>

        <div className="mt-8 flex items-center justify-center gap-2 text-xs text-neutral-600">
          <span className="relative flex h-2 w-2">
            <span className="animate-ping absolute inline-flex h-full w-full rounded-full bg-green-400 opacity-75"></span>
            <span className="relative inline-flex rounded-full h-2 w-2 bg-green-500"></span>
          </span>
          status: online
        </div>
      </div>
    </main>
  );
}
