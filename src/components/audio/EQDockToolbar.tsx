"use client";

import React from "react";
import { audioTickController, EQBand, FilterType } from "@/lib/audio/AudioTickController";

const BAND_TYPES: FilterType[] = ["lowcut", "lowshelf", "peaking", "highshelf", "highcut"];

interface EQDockToolbarProps {
  selectedBandId: number | null;
  setSelectedBandId: (id: number | null) => void;
  /** Drive active pill underline — passed from parent so refs don't need prop-drilling */
  activeType: FilterType | null;
}

export function EQDockToolbar({ selectedBandId, setSelectedBandId, activeType }: EQDockToolbarProps) {
  const setHoverType = (type: FilterType) => {
    const id = selectedBandId;
    if (id != null) audioTickController.setBandType(id, type);
  };

  const toggleSelected = () => {
    const id = selectedBandId;
    if (id != null) audioTickController.toggleBand(id);
  };

  const deleteSelected = () => {
    const id = selectedBandId;
    if (id != null) {
      audioTickController.removeBand(id);
      setSelectedBandId(null);
    }
  };

  const resetAll = () => {
    audioTickController.resetAll();
    setSelectedBandId(null);
  };

  const btnBase: React.CSSProperties = {
    position: "relative",
    padding: "5px 11px",
    fontSize: 10,
    fontFamily: "'Courier Prime', 'JetBrains Mono', monospace",
    letterSpacing: "0.08em",
    textTransform: "lowercase",
    background: "transparent",
    border: "1px solid rgba(148,163,184,0.2)",
    borderRadius: 20,
    cursor: "pointer",
    transition: "color 0.2s ease, background 0.2s ease, border-color 0.2s ease, box-shadow 0.2s ease",
  };

  return (
    <div
      style={{
        display: "flex",
        alignItems: "center",
        justifyContent: "center",
        gap: 8,
        padding: "7px 14px",
        background: "rgba(6,8,12,0.72)",
        border: "1px solid rgba(0,216,246,0.15)",
        borderRadius: 28,
        backdropFilter: "blur(20px)",
        WebkitBackdropFilter: "blur(20px)",
        boxShadow:
          "0 0 0 1px rgba(0,216,246,0.04) inset, 0 4px 32px rgba(0,216,246,0.06), inset 0 1px 0 rgba(255,255,255,0.05)",
        width: "fit-content",
        margin: "0 auto",
      }}
    >
      {/* Filter-type pills */}
      {BAND_TYPES.map((t) => {
        const isActive = activeType === t;
        return (
          <button
            key={t}
            onClick={() => setHoverType(t)}
            disabled={selectedBandId == null}
            style={{
              ...btnBase,
              color: isActive ? "#00d8f6" : selectedBandId != null ? "#94a3b8" : "#475569",
              background: isActive ? "rgba(0,216,246,0.08)" : "transparent",
              border: isActive ? "1px solid rgba(0,216,246,0.3)" : "1px solid rgba(148,163,184,0.2)",
              boxShadow: isActive ? "0 0 6px rgba(0,216,246,0.15)" : "none",
              opacity: selectedBandId != null ? 1 : 0.5,
              cursor: selectedBandId != null ? "pointer" : "not-allowed",
            }}
          >
            {t}
            {isActive && (
              <span
                style={{
                  position: "absolute",
                  bottom: 2,
                  left: 8,
                  right: 8,
                  height: 1,
                  background: "#00d8f6",
                  borderRadius: 1,
                  opacity: 0.8,
                }}
              />
            )}
          </button>
        );
      })}

      {/* Divider */}
      <div style={{ width: 1, height: 18, background: "rgba(0,216,246,0.15)", borderRadius: 1 }} />

      {/* Toggle */}
      <button
        onClick={toggleSelected}
        disabled={selectedBandId == null}
        style={{
          ...btnBase,
          color: selectedBandId != null ? "#f2e6c8" : "#475569",
          background: selectedBandId != null ? "rgba(242,230,200,0.07)" : "transparent",
          border: selectedBandId != null ? "1px solid rgba(242,230,200,0.25)" : "1px solid rgba(148,163,184,0.2)",
          opacity: selectedBandId != null ? 1 : 0.5,
          cursor: selectedBandId != null ? "pointer" : "not-allowed",
        }}
      >
        Toggle
      </button>

      {/* Del */}
      <button
        onClick={deleteSelected}
        disabled={selectedBandId == null}
        style={{
          ...btnBase,
          color: selectedBandId != null ? "#f2e6c8" : "#475569",
          opacity: selectedBandId != null ? 1 : 0.5,
          cursor: selectedBandId != null ? "pointer" : "not-allowed",
        }}
      >
        Del
      </button>

      {/* Flat */}
      <button
        onClick={resetAll}
        style={{
          ...btnBase,
          color: "#f87171",
          border: "1px solid rgba(248,113,113,0.2)",
        }}
      >
        Flat
      </button>
    </div>
  );
}
