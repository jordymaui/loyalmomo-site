"use client";

import { useEffect, useRef } from "react";

// ── Palette ──
const PAL: Record<string, string> = {
  W: "#F5F0E1", // cream/white
  B: "#8B6914", // brown
  D: "#5C4A1E", // dark brown
  G: "#4CAF50", // green eyes
  K: "#1A1A1A", // black
  P: "#E8B4B8", // pink
  L: "#C4A44A", // light brown
};

// Parse compact sprite: each char = 1 pixel, '.' = transparent
function parse(rows: string[]): (string | null)[][] {
  return rows.map(r => r.split("").map(c => (c === "." ? null : c)));
}

// 32×32 Momo — a flying lemur: big ears, green eyes, brown face, cream body, curly tail
const BASE = parse([
  //01234567890123456789012345678901
  "....BBBBBt..........tBBBBB......", // 0  ear tips
  "...BWWWWB............BWWWWB....", // 1
  "..BWPWWWB............BWWWPWB...", // 2
  "..BWPWWB..............BWWPWB...", // 3
  ".BWWWWB................BWWWWB..", // 4
  ".BWWWB..................BWWWB..", // 5
  "..BBB....................BBB...", // 6
  "......BBBBBBBBBBBBBBBBBB.......", // 7  top of head
  ".....BWWWWWWWWWWWWWWWWWWB......", // 8
  "....BWWWWWWWWWWWWWWWWWWWWB.....", // 9
  "....BWWWBBBBWWWWWWBBBBWWWB.....", // 10 brow line
  "....BWWBGKGBBBBBBBBGKGBWWB.....", // 11 eyes
  "....BWWBGKGBBBBBBBBGKGBWWB.....", // 12
  "....BWWWBBBBDDDDDDBBBWWWWB.....", // 13 brown mask
  ".....BWWWWBBBPBBBBWWWWWB.......", // 14 nose
  ".....BWWWWWBBBBBBWWWWWB........", // 15
  "......BWWWWWWWWWWWWWWB.........", // 16
  ".......BBWWWWWWWWWWBB..........", // 17 chin
  "........BBBBBBBBBBBB...........", // 18
  ".........BWWWWWWWWB............", // 19 neck
  "........BWWWWWWWWWWB...........", // 20 body
  ".......BWWWWWWWWWWWWB..........", // 21
  ".......BWWWWWWWWWWWWB..........", // 22
  ".......BWWWWWWWWWWWWB..........", // 23
  "........BWWWWWWWWWWB...........", // 24
  "........BBWWW..WWWBB...........", // 25 legs split
  ".......BBBBB..BBBBB............", // 26 feet
  ".......BDBDB..BDBDB............", // 27 toes
  "..............BBB...............", // 28 tail start
  ".............BLLB...............", // 29
  "............BLLB................", // 30
  "............BBB.................", // 31 tail end
]);

const SPRITE_W = 32;
const SPRITE_H = 32;
const SCALE_BASE = 3;

// Walk frames: modify legs (rows 25-27) and bob body
function makeWalkFrames(): (string | null)[][][] {
  const legSets = [
    // [leftOffset, rightOffset] from center position
    [-2, 2],
    [-1, 1],
    [0, 0],
    [1, -1],
    [2, -2],
    [1, -1],
  ];

  return legSets.map(([lo, ro]) => {
    const f = BASE.map(row => [...row]);
    // Clear leg rows
    for (let r = 25; r <= 27; r++) f[r] = new Array(32).fill(null);

    // Left leg (base col ~7-11)
    const lc = 8 + lo;
    f[25][lc] = "B"; f[25][lc + 1] = "W"; f[25][lc + 2] = "W"; f[25][lc + 3] = "B";
    f[26][lc] = "B"; f[26][lc + 1] = "B"; f[26][lc + 2] = "B"; f[26][lc + 3] = "B";
    f[27][lc] = "B"; f[27][lc + 1] = "D"; f[27][lc + 2] = "D"; f[27][lc + 3] = "B";

    // Right leg (base col ~14-18)
    const rc = 15 + ro;
    f[25][rc] = "B"; f[25][rc + 1] = "W"; f[25][rc + 2] = "W"; f[25][rc + 3] = "B";
    f[26][rc] = "B"; f[26][rc + 1] = "B"; f[26][rc + 2] = "B"; f[26][rc + 3] = "B";
    f[27][rc] = "B"; f[27][rc + 1] = "D"; f[27][rc + 2] = "D"; f[27][rc + 3] = "B";

    return f;
  });
}

const WALK_FRAMES = makeWalkFrames();

// Idle frames: 2 frames for subtle breathing
function makeIdleFrames(): (string | null)[][][] {
  // Frame 0 = base, Frame 1 = slight ear lift + body compress
  const f1 = BASE.map(row => [...row]);
  return [BASE, f1];
}
const IDLE_FRAMES = makeIdleFrames();

type MState = "idle" | "walk";

interface Momo {
  x: number; y: number;
  vx: number; vy: number;
  state: MState;
  frame: number; ft: number;
  right: boolean;
  timer: number;
  bob: number;
}

function drawFrame(
  ctx: CanvasRenderingContext2D,
  frame: (string | null)[][],
  scale: number,
  flip: boolean,
  ox: number,
  oy: number
) {
  for (let r = 0; r < frame.length; r++) {
    const row = frame[r];
    for (let c = 0; c < row.length; c++) {
      const k = row[c];
      if (!k) continue;
      const color = PAL[k];
      if (!color) continue;
      ctx.fillStyle = color;
      const dc = flip ? (SPRITE_W - 1 - c) : c;
      ctx.fillRect(ox + dc * scale, oy + r * scale, scale, scale);
    }
  }
}

export default function MomoCanvas() {
  const canvasRef = useRef<HTMLCanvasElement>(null);
  const momoRef = useRef<Momo>({
    x: 0, y: 0, vx: 0, vy: 0,
    state: "idle", frame: 0, ft: 0,
    right: true, timer: 100, bob: 0,
  });

  useEffect(() => {
    const canvas = canvasRef.current;
    if (!canvas) return;
    const ctx = canvas.getContext("2d");
    if (!ctx) return;

    const isMobile = window.innerWidth < 640;
    const scale = isMobile ? 2 : SCALE_BASE;
    const sprW = SPRITE_W * scale;
    const sprH = SPRITE_H * scale;

    const resize = () => { canvas.width = window.innerWidth; canvas.height = window.innerHeight; };
    resize();
    window.addEventListener("resize", resize);

    const m = momoRef.current;
    m.x = Math.random() * (window.innerWidth - sprW);
    m.y = Math.random() * (window.innerHeight - sprH);

    const pickDir = () => {
      const a = Math.random() * Math.PI * 2;
      const s = 0.5 + Math.random() * 0.8;
      m.vx = Math.cos(a) * s;
      m.vy = Math.sin(a) * s;
      m.right = m.vx >= 0;
      m.timer = 150 + Math.random() * 300;
      m.state = "walk";
    };

    let last = 0;
    const INTERVAL = 1000 / 24;

    const loop = (ts: number) => {
      requestAnimationFrame(loop);
      if (ts - last < INTERVAL) return;
      last = ts - ((ts - last) % INTERVAL);

      ctx.clearRect(0, 0, canvas.width, canvas.height);

      if (m.state === "idle") {
        m.timer--;
        m.bob = Math.sin(ts / 800) * 2;
        m.ft++;
        if (m.ft >= 30) { m.ft = 0; m.frame = (m.frame + 1) % IDLE_FRAMES.length; }
        if (m.timer <= 0) pickDir();
      } else {
        m.x += m.vx; m.y += m.vy;
        m.bob = Math.sin(ts / 120) * 1.5;
        m.timer--;

        const maxX = canvas.width - sprW;
        const maxY = canvas.height - sprH;
        if (m.x < 0) { m.x = 0; m.vx = Math.abs(m.vx); m.right = true; }
        if (m.x > maxX) { m.x = maxX; m.vx = -Math.abs(m.vx); m.right = false; }
        if (m.y < 0) { m.y = 0; m.vy = Math.abs(m.vy); }
        if (m.y > maxY) { m.y = maxY; m.vy = -Math.abs(m.vy); }

        m.ft++;
        if (m.ft >= 5) { m.ft = 0; m.frame = (m.frame + 1) % WALK_FRAMES.length; }

        if (m.timer <= 0) { m.state = "idle"; m.timer = 80 + Math.random() * 200; m.frame = 0; }
        if (Math.random() < 0.003) pickDir();
      }

      const fd = m.state === "walk" ? WALK_FRAMES[m.frame] : IDLE_FRAMES[m.frame];
      drawFrame(ctx, fd, scale, !m.right, Math.round(m.x), Math.round(m.y + m.bob));
    };

    requestAnimationFrame(loop);
    return () => { window.removeEventListener("resize", resize); };
  }, []);

  return (
    <canvas
      ref={canvasRef}
      className="fixed inset-0 z-10 pointer-events-none"
      style={{ imageRendering: "pixelated" }}
    />
  );
}
