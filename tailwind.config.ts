import type { Config } from "tailwindcss";

const config: Config = {
  theme: {
    extend: {
      keyframes: {
        shimmer: {
          "100%": { transform: "translateX(100%)" },
        },
        breathe: {
          "0%, 100%": { boxShadow: "0 0 15px rgba(250,204,21,0.35)" },
          "50%": { boxShadow: "0 0 28px rgba(250,204,21,0.65)" },
        },
        float: {
          "0%, 100%": { transform: "translateY(0)" },
          "50%": { transform: "translateY(-3px)" },
        },
      },
      animation: {
        shimmer: "shimmer 3s ease-in-out infinite",
        breathe: "breathe 3.5s ease-in-out infinite",
        float: "float 3s ease-in-out infinite",
      },
    },
  },
};

export default config;
