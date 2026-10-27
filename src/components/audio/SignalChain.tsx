"use client";

import React, { useEffect, useState } from "react";
import { useAudio } from "@/context/AudioContext";

type ChainNode = {
  id: string;
  label: string;
  sub: string;
  active: boolean;
  icon: React.ReactNode;
};

export default function SignalChain() {
  const { isPlaying, transportState } = useAudio();
  const [activity, setActivity] = useState(0);

  // Animate amber activity pills when playing
  useEffect(() => {
    if (!isPlaying) {
      setActivity(0);
      return;
    }
    let frame = 0;
    const id = setInterval(() => {
      frame = (frame + 1) % 12;
      setActivity(frame);
    }, 100);
    return () => clearInterval(id);
  }, [isPlaying]);

  const nodes: ChainNode[] = [
    {
      id: "input",
      label: "Guitar",
      sub: "1/4\" TRS",
      active: isPlaying,
      icon: (
        <svg width="20" height="20" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.5" strokeLinecap="round" strokeLinejoin="round" aria-hidden="true">
          <path d="M3 17V7a2 2 0 0 1 2-2h2" />
          <path d="M21 17V7a2 2 0 0 0-2-2h-2" />
          <rect x="5" y="9" width="14" height="6" rx="1" />
          <circle cx="12" cy="12" r="1.2" fill="currentColor" />
        </svg>
      ),
    },
    {
      id: "tonex",
      label: "TONEX",
      sub: "192 kHz · 32-bit",
      active: isPlaying,
      icon: (
        <svg width="20" height="20" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.5" strokeLinecap="round" strokeLinejoin="round" aria-hidden="true">
          <circle cx="12" cy="12" r="10" />
          <path d="M8 12 Q10 8 12 12 Q14 16 16 12" />
          <circle cx="12" cy="12" r="2" fill="currentColor" />
        </svg>
      ),
    },
    {
      id: "hx",
      label: "HX Stomp",
      sub: "4× Stereo Path",
      active: isPlaying,
      icon: (
        <svg width="20" height="20" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.5" strokeLinecap="round" strokeLinejoin="round" aria-hidden="true">
          <rect x="2" y="7" width="20" height="14" rx="2" />
          <path d="M8 7V5a2 2 0 0 1 2-2h4a2 2 0 0 1 2 2v2" />
          <circle cx="9" cy="13" r="1" fill="currentColor" />
          <circle cx="15" cy="13" r="1" fill="currentColor" />
        </svg>
      ),
    },
    {
      id: "interface",
      label: "Interface",
      sub: "USB-C · ADAT",
      active: isPlaying,
      icon: (
        <svg width="20" height="20" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.5" strokeLinecap="round" strokeLinejoin="round" aria-hidden="true">
          <rect x="4" y="4" width="16" height="16" rx="2" />
          <path d="M9 9h6v6H9z" />
          <path d="M2 12h2M20 12h2M12 2v2M12 20v2" />
        </svg>
      ),
    },
    {
      id: "daw",
      label: "DAW",
      sub: "Stereo Out",
      active: isPlaying,
      icon: (
        <svg width="20" height="20" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.5" strokeLinecap="round" strokeLinejoin="round" aria-hidden="true">
          <path d="M3 18V6a2 2 0 0 1 2-2h14a2 2 0 0 1 2 2v12a2 2 0 0 1-2 2H5a2 2 0 0 1-2-2z" />
          <path d="M7 14h2M11 10h2M15 12h2" />
        </svg>
      ),
    },
  ];

  return (
    <section
      className="w-full"
      style={{
        borderTop: "1px solid rgba(201,168,76,0.1)",
        padding: "clamp(1.5rem, 3vw, 2.5rem) 0",
      }}
    >
      <div
        style={{ maxWidth: "900px", margin: "0 auto", paddingInline: "clamp(0.75rem, 4vw, 3rem)" }}
      >
        {/* Header */}
        <div
          className="flex items-center gap-3 mb-5 sm:mb-6"
          style={{ justifyContent: "center" }}
        >
          <div
            className="h-px"
            style={{
              width: "clamp(2rem, 8vw, 5rem)",
              background: "linear-gradient(to right, transparent, rgba(201,168,76,0.4))",
            }}
          />
          <h3
            style={{
              fontFamily: "'Courier Prime', monospace",
              fontSize: "clamp(9px, 1.2vw, 11px)",
              letterSpacing: "0.4em",
              color: "#D0C0A6",
              textTransform: "uppercase",
              fontWeight: 700,
            }}
          >
            Signal Chain
          </h3>
          <div
            className="h-px"
            style={{
              width: "clamp(2rem, 8vw, 5rem)",
              background: "linear-gradient(to left, transparent, rgba(201,168,76,0.4))",
            }}
          />
        </div>

        {/* Chain — node cards + connectors */}
        <div className="relative">
          <div
            className="flex items-stretch justify-between gap-1 sm:gap-2 overflow-x-auto pb-2"
            style={{ scrollbarWidth: "thin", scrollbarColor: "rgba(201,168,76,0.3) transparent" }}
          >
            {nodes.map((node, i) => (
              <React.Fragment key={node.id}>
                {/* Node card */}
                <div
                  className="flex flex-col items-center gap-2 min-w-0 flex-shrink-0 flex-1 max-w-[150px]"
                  style={{ maxWidth: "150px" }}
                >
                  {/* Card body */}
                  <div
                    style={{
                      width: "clamp(48px, 7vw, 60px)",
                      height: "clamp(48px, 7vw, 60px)",
                      borderRadius: "2px",
                      border: node.active
                        ? "1px solid rgba(201,168,76,0.5)"
                        : "1px solid rgba(201,168,76,0.12)",
                      background: node.active
                        ? "linear-gradient(135deg, rgba(201,168,76,0.12) 0%, rgba(201,168,76,0.04) 100%)"
                        : "linear-gradient(135deg, #1c0f08 0%, #0d0a07 100%)",
                      display: "flex",
                      alignItems: "center",
                      justifyContent: "center",
                      color: node.active ? "#D0C0A6" : "#a99e8c",
                      boxShadow: node.active
                        ? "0 0 16px rgba(201,168,76,0.2), inset 0 1px 0 rgba(255,255,255,0.05)"
                        : "inset 0 2px 8px rgba(0,0,0,0.5)",
                      transition: "all 0.3s ease",
                    }}
                  >
                    {node.icon}
                    {/* Amber activity dot */}
                    {node.active && (
                      <span
                        style={{
                          position: "absolute",
                          top: "-4px",
                          right: "-4px",
                          width: "8px",
                          height: "8px",
                          borderRadius: "50%",
                          background: "#ff8c00",
                          boxShadow: "0 0 8px rgba(255,140,0,0.8)",
                          opacity: 0.5 + (activity % 3) * 0.2,
                        }}
                      />
                    )}
                  </div>

                  {/* Label */}
                  <div className="text-center min-w-0 w-full">
                    <div
                      style={{
                        fontFamily: "'Courier Prime', monospace",
                        fontSize: "clamp(8px, 1vw, 10px)",
                        letterSpacing: "0.15em",
                        textTransform: "uppercase",
                        fontWeight: node.active ? 700 : 400,
                        color: node.active ? "#D0C0A6" : "#a99e8c",
                        overflow: "hidden",
                        textOverflow: "ellipsis",
                        whiteSpace: "nowrap",
                      }}
                    >
                      {node.label}
                    </div>
                    <div
                      style={{
                        fontFamily: "'Courier Prime', monospace",
                        fontSize: "clamp(7px, 0.9vw, 8px)",
                        letterSpacing: "0.12em",
                        textTransform: "uppercase",
                        color: "#a99e8c",
                        marginTop: "1px",
                        overflow: "hidden",
                        textOverflow: "ellipsis",
                        whiteSpace: "nowrap",
                      }}
                    >
                      {node.sub}
                    </div>
                  </div>
                </div>

                {/* Connector arrow */}
                {i < nodes.length - 1 && (
                  <div
                    style={{
                      display: "flex",
                      alignItems: "center",
                      flexShrink: 0,
                      alignSelf: "center",
                      marginTop: "-1.2rem",
                    }}
                  >
                    <svg
                      width="clamp(20px, 4vw, 32px)"
                      height="14"
                      viewBox="0 0 32 14"
                      className="overflow-visible"
                      aria-hidden="true"
                    >
                      <line
                        x1="0"
                        y1="7"
                        x2="28"
                        y2="7"
                        stroke={isPlaying ? "rgba(201,168,76,0.5)" : "rgba(201,168,76,0.1)"}
                        strokeWidth="1"
                        strokeDasharray="3 2"
                      />
                      <polygon
                        points="28,4 32,7 28,10"
                        fill={isPlaying ? "rgba(201,168,76,0.7)" : "rgba(201,168,76,0.2)"}
                      />
                      {isPlaying && (activity + i) % 4 < 2 && (
                        <circle
                          cx="14"
                          cy="7"
                          r="2"
                          fill="#ff8c00"
                          opacity="0.8"
                        >
                          <animate
                            attributeName="opacity"
                            values="0.2;1;0.2"
                            dur="1.2s"
                            repeatCount="indefinite"
                          />
                        </circle>
                      )}
                    </svg>
                  </div>
                )}
              </React.Fragment>
            ))}
          </div>
        </div>

        {/* Status row */}
        <div
          style={{
            display: "flex",
            flexWrap: "wrap",
            alignItems: "center",
            justifyContent: "center",
            gap: "0.5rem 1.5rem",
            marginTop: "1.5rem",
            fontFamily: "'Courier Prime', monospace",
            fontSize: "clamp(8px, 1vw, 9px)",
            letterSpacing: "0.2em",
            textTransform: "uppercase",
            color: "#a99e8c",
          }}
        >
          <div style={{ display: "flex", alignItems: "center", gap: "6px" }}>
            <span
              style={{
                width: "6px",
                height: "6px",
                borderRadius: "50%",
                background: isPlaying ? "#ff8c00" : "#a99e8c",
                boxShadow: isPlaying ? "0 0 6px rgba(255,140,0,0.6)" : "none",
                display: "inline-block",
              }}
            />
            <span>State · {transportState}</span>
          </div>
          <div style={{ width: "1px", height: "10px", background: "rgba(201,168,76,0.15)", display: "none" }} className="sm:block" />
          <div style={{ display: "flex", alignItems: "center", gap: "6px" }}>
            <span
              style={{
                width: "6px",
                height: "6px",
                borderRadius: "50%",
                background: "#D0C0A6",
                opacity: "0.5",
                display: "inline-block",
              }}
            />
            <span>192 kHz / 32-bit</span>
          </div>
          <div style={{ width: "1px", height: "10px", background: "rgba(201,168,76,0.15)", display: "none" }} className="sm:block" />
          <div style={{ display: "flex", alignItems: "center", gap: "6px" }}>
            <span
              style={{
                width: "6px",
                height: "6px",
                borderRadius: "50%",
                background: "#D0C0A6",
                opacity: "0.5",
                display: "inline-block",
              }}
            />
            <span>Round-trip &lt; 1 ms</span>
          </div>
        </div>
      </div>
    </section>
  );
}
