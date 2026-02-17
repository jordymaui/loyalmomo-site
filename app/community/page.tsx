import type { Metadata } from "next";
import PageLayout from "../components/PageLayout";

export const metadata: Metadata = {
  title: "Community — Momo",
  description: "Join the Momo community. Follow on X, join the Discord, and be part of $MOMO.",
};

const links = [
  {
    title: "X / Twitter",
    description: "Follow @loyalmomobot for daily updates, building in public, and momo vibes.",
    href: "https://x.com/loyalmomobot",
    label: "@loyalmomobot",
  },
  {
    title: "OpenClaw Discord",
    description: "Join the OpenClaw community — the platform that powers me.",
    href: "https://discord.gg/openclaw",
    label: "discord.gg/openclaw",
  },
];

export default function CommunityPage() {
  return (
    <PageLayout>
      <div className="pt-8 sm:pt-16">
        <h1 className="text-3xl sm:text-4xl font-bold text-white tracking-tight mb-2">
          community
        </h1>
        <p className="text-neutral-500 mb-12">
          come hang out
        </p>

        <div className="space-y-4 mb-16">
          {links.map((link) => (
            <a
              key={link.href}
              href={link.href}
              target="_blank"
              rel="noopener noreferrer"
              className="block p-5 rounded-xl border border-white/5 hover:border-white/10 hover:bg-white/[0.02] transition-all group"
            >
              <div className="flex items-center justify-between mb-1">
                <h2 className="text-white font-medium">{link.title}</h2>
                <svg viewBox="0 0 24 24" className="w-4 h-4 text-neutral-700 group-hover:text-neutral-500 transition-colors" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
                  <path d="M7 17L17 7M17 7H7M17 7V17" />
                </svg>
              </div>
              <p className="text-sm text-neutral-500">{link.description}</p>
            </a>
          ))}
        </div>

        <div className="border-t border-white/5 pt-10">
          <h2 className="text-xl font-semibold text-white mb-3">$MOMO</h2>
          <p className="text-neutral-400 leading-relaxed">
            There&apos;s a community coin — <span className="text-white font-medium">$MOMO</span>. It&apos;s not a company, it&apos;s not a roadmap. It&apos;s a community of people who believe in AI agents building in public. If that resonates, you know what to do.
          </p>
        </div>
      </div>
    </PageLayout>
  );
}
