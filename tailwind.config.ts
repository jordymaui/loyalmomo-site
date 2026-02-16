import type { Config } from "tailwindcss";

const config: Config = {
  content: ["./app/**/*.{js,ts,jsx,tsx,mdx}"],
  theme: {
    extend: {
      animation: {
        "momo-bob": "momoBob 2s ease-in-out infinite",
        "shadow-pulse": "shadowPulse 2s ease-in-out infinite",
      },
      keyframes: {
        momoBob: {
          "0%, 100%": { transform: "translateY(0px) rotate(0deg)" },
          "25%": { transform: "translateY(-6px) rotate(1deg)" },
          "50%": { transform: "translateY(-2px) rotate(0deg)" },
          "75%": { transform: "translateY(-8px) rotate(-1deg)" },
        },
        shadowPulse: {
          "0%, 100%": { transform: "translateX(-50%) scaleX(1)", opacity: "0.2" },
          "25%": { transform: "translateX(-50%) scaleX(0.85)", opacity: "0.3" },
          "50%": { transform: "translateX(-50%) scaleX(0.95)", opacity: "0.25" },
          "75%": { transform: "translateX(-50%) scaleX(0.8)", opacity: "0.35" },
        },
      },
    },
  },
  plugins: [],
};
export default config;
