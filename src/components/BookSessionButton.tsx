export default function BookSessionButton() {
  return (
    <button
      className="group relative inline-flex items-center justify-center overflow-hidden rounded-full bg-[#facc15] px-6 py-2.5 text-xs font-extrabold uppercase tracking-widest text-black shadow-[0_0_18px_rgba(250,204,21,0.5)] transition-transform duration-300 ease-[cubic-bezier(0.23,1,0.32,1)] hover:scale-105 active:scale-95"
      style={{ animation: "float 2.5s ease-in-out infinite" }}
      aria-label="Book a session"
    >
      BOOK A SESSION
      <div
        aria-hidden="true"
        className="absolute inset-0 z-0 pointer-events-none"
        style={{
          background: "linear-gradient(120deg, transparent 30%, rgba(255,255,255,0.75) 50%, transparent 70%)",
          animation: "shine 3s ease-in-out infinite",
        }}
      />
      <style>{`
        @keyframes float {
          0%, 100% { transform: translateY(0); }
          50% { transform: translateY(-4px); }
        }
        @keyframes shine {
          0% { transform: translateX(-150%); }
          100% { transform: translateX(150%); }
        }
        @media (prefers-reduced-motion: reduce) {
          button { animation: none !important; }
          div[aria-hidden="true"] { animation: none !important; }
        }
      `}</style>
    </button>
  );
}
