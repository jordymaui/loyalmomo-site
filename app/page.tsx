"use client";

import dynamic from "next/dynamic";

const MomoCanvas = dynamic(() => import("./MomoCanvas"), { ssr: false });

export default function Home() {
  return (
    <main className="relative h-screen w-screen flex items-center justify-center select-none">
      <MomoCanvas />

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
