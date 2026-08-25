"use client";

import React from "react";

export default function Footer() {
  return (
    <footer className="w-full border-t border-white/10 bg-neutral-950/50 backdrop-blur-md mt-auto">
      <div className="max-w-6xl mx-auto px-6 py-10 flex flex-col md:flex-row items-center justify-between gap-6">
        <div className="text-center md:text-left">
          <p className="text-sm font-semibold text-neutral-400">© {new Date().getFullYear()} Medfender. All rights reserved.</p>
        </div>
        <div className="flex items-center gap-6 text-sm font-medium text-neutral-300">
          <a href="#audio" className="hover:text-cyan-300 transition">Audio</a>
          <a href="#store" className="hover:text-cyan-300 transition">Store</a>
          <a href="#media" className="hover:text-cyan-300 transition">Media</a>
          <a href="#contact" className="hover:text-cyan-300 transition">Contact</a>
        </div>
        <div className="flex items-center gap-4">
          <a href="#" aria-label="YouTube" className="text-neutral-400 hover:text-cyan-300 transition text-lg">▶</a>
          <a href="#" aria-label="Instagram" className="text-neutral-400 hover:text-cyan-300 transition text-lg">◉</a>
          <a href="#" aria-label="GitHub" className="text-neutral-400 hover:text-cyan-300 transition text-lg">◈</a>
        </div>
      </div>
    </footer>
  );
}
