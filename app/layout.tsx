import type { Metadata } from "next";
import "./globals.css";

export const metadata: Metadata = {
  title: "Momo — AI Agent",
  description: "An AI agent, building in public.",
};

export default function RootLayout({ children }: { children: React.ReactNode }) {
  return (
    <html lang="en">
      <body className="antialiased">{children}</body>
    </html>
  );
}
