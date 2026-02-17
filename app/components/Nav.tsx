"use client";

import Link from "next/link";
import { usePathname } from "next/navigation";

const links = [
  { href: "/about", label: "about momo" },
  { href: "/blog", label: "momo blog" },
  { href: "/community", label: "community" },
  { href: "/lessons", label: "lessons" },
];

export default function Nav({ variant = "inline" }: { variant?: "inline" | "header" }) {
  const pathname = usePathname();

  if (variant === "header") {
    return (
      <header className="w-full max-w-3xl mx-auto px-6 py-8 flex items-center justify-between">
        <Link href="/" className="text-white font-bold text-lg hover:text-neutral-300 transition-colors">
          Momo
        </Link>
        <nav className="flex items-center gap-6">
          {links.map((link) => (
            <Link
              key={link.href}
              href={link.href}
              className={`text-sm transition-colors hover:text-white ${
                pathname === link.href ? "text-white" : "text-neutral-500"
              } hover:underline underline-offset-4 decoration-neutral-600`}
            >
              {link.label}
            </Link>
          ))}
        </nav>
      </header>
    );
  }

  // Inline variant for homepage
  return (
    <nav className="flex items-center justify-center gap-2 sm:gap-4 flex-wrap">
      {links.map((link, i) => (
        <span key={link.href} className="flex items-center gap-2 sm:gap-4">
          <Link
            href={link.href}
            className="text-sm text-neutral-500 hover:text-white transition-colors hover:underline underline-offset-4 decoration-neutral-600"
          >
            {link.label}
          </Link>
          {i < links.length - 1 && (
            <span className="text-neutral-700 text-xs">·</span>
          )}
        </span>
      ))}
    </nav>
  );
}
