"use client";

import React, { useState, useRef, useEffect, useCallback, useMemo } from "react";
import { useAudio } from "@/context/AudioContext";
import { useAudioTick } from "@/lib/audio/useAudioTick";
import { deckControls } from "@/lib/audio/DeckControls";
import { featuredArtists } from "@/data/trackList";
import { useResolvedThumbnail } from "@/lib/audio/thumbnailResolver";
import { Disc3 } from "lucide-react";

const ARM_LAND_DELAY_MS = 1000; // headshell-gate: music waits for arm to land

function clean(name: string): string {
  return (name || "").trim();
}

export default function Turntable({
  transportState = 'stopped',
  isPendingPlay = false,
  className,
  progress,
  onTogglePlay,
  onStop,
  onNeedleDrop,
  onPlay,
  onPause,
  bpm = 0,
}: {
  transportState?: 'playing' | 'paused' | 'stopped';
  isPendingPlay?: boolean;
  className?: string;
  progress?: number;
  onTogglePlay?: () => void;
  onStop?: () => void;
  onNeedleDrop?: () => void;
  onPlay?: () => void;
  onPause?: () => void;
  bpm?: number | 'CAL';
}) {
  // Global audio context — single source of truth for power state
  const { isPowered, isPlaying, togglePower, setIsPowered, setPlaybackRate, currentTrack, currentTime, audioRef, playTrack } = useAudio();

  // ── Movement flag (blocks parent audio play during arm swing) ───────────────
  const isArmMovingRef = useRef(false);

  // ─── Center label thumbnail — shared resolver (same patterns as sticky + playlist) ───
  // Uses the same hook as StickyTransport and PlaylistPanel so thumbnails stay in sync.
  const labelThumbnail = useResolvedThumbnail(currentTrack as any);
  const rawName = (currentTrack as any)?.name || (currentTrack as any)?.title || "";
  const trackName = clean(rawName);
  // labelFailed: true only when the shared hook returned null (no pattern matched)
  const labelFailed = !labelThumbnail;

  // Reconcile turntable power when external playback triggers it
  // (e.g. vinyl player play button). Keeps physical button in sync.
  useEffect(() => {
    if (isPlaying && !isPowered) {
      setIsPowered(true);
    }
  }, [isPlaying, isPowered, setIsPowered]);

  // ── Power button (Master Rule §2) ──────────────────────────────────────────
  // OFF  → ON  : power on; transportState stays 'stopped' (arm rests).
  // ON   → OFF : kill switch; cut audio immediately via togglePower().
  //   When coming from play/pause, also flip localTransport='stopped' so the
  //   choreography effect runs the same lift→rotate→rest animation as the
  //   stop button. (Moved below localTransport declaration to fix TDZ.)
  // ── Cue Switch Choreography (Single Source of Truth) ───────────────────────
  // All physical arm state — isLifted, armAngle, isLeverEngaged — is driven
  // EXCLUSIVELY by the cue switch handler through a single useEffect that
  // keys off `cuePhase`. No other useEffect may touch these values.
  //
  // cuePhase state machine:
  //   'rest'        : arm at rest, headshell off the record
  //   'cueing'      : OFF→ON sequence active (lift → rotate → drop)
  //   'onDisk'      : headshell physically connected to the vinyl
  //   'killing'     : ON→OFF sequence active (lift → rotate-to-rest)
  type CuePhase = 'rest' | 'cueing' | 'onDisk' | 'killing';
  const [cuePhase, setCuePhase] = useState<CuePhase>('rest');
  const [isLifted, setIsLifted] = useState(false);
  const [armAngle, setArmAngle] = useState(0);
  const [isLeverEngaged, setIsLeverEngaged] = useState(false);

  // Fast-mode flag: only applied for the quick lift/drop of pause/resume
  // (play→pause and pause→play), not for the full stop rest animation.
  const [isQuickLift, setIsQuickLift] = useState(false);
  const isQuickLiftRef = useRef(false);

  // Optimistic transport state — mirrors what the tonearm is physically doing
  const [localTransport, setLocalTransport] = useState<'playing' | 'paused' | 'stopped'>('stopped');
  const playTimerRef = useRef<ReturnType<typeof setTimeout> | null>(null);
  const isCueSwitchBusyRef = useRef(false); // Prevent reentrancy

  // isResting is the master "tonearm is mid-animation" flag. It is true
  // whenever the choreography is moving the arm (kill, stop, play→stop,
  // pause→stop). The CSS transition strings key off `(isPowered || killPhase
  // || isResting)` so the 1.2s cubic-bezier rotation and 0.4s lift are
  // always active during an in-flight sequence — even after `isPowered`
  // flips to false. Without this, hitting the power button from play/pause
  // disables the CSS transition mid-flight and the arm snaps to rest.
  const [isResting, setIsResting] = useState(false);

  // STOP button: arm rest animation ONLY — cue switch untouched (no setIsLeverEngaged)
  const runStopRestAnimation = useCallback((audio?: HTMLAudioElement | null) => {
    setIsResting(true);
    setIsLifted(true);
    setCuePhase('killing');
    if (audio) { try { audio.pause(); } catch {} try { audio.currentTime = 0; } catch {} }
    const rotateTimer = setTimeout(() => {
      setArmAngle(0);
      // NOTE: isLeverEngaged NOT modified — cue switch stays where it was
      const dropTimer = setTimeout(() => {
        setIsLifted(false);
        setCuePhase('rest');
        setIsResting(false);
      }, 1400);
      return () => clearTimeout(dropTimer);
    }, 200);
    return () => clearTimeout(rotateTimer);
  }, []);

  // Centralized tonearm rest animation — used by STOP button, Power-off, Cue-off.
  // This is the exact animation sequence: lift → rotate to 0° → drop at rest.
  const runRestAnimation = useCallback((audio?: HTMLAudioElement | null) => {
    setIsResting(true);
    setIsLifted(true);
    setCuePhase('killing');
    if (audio) {
      try { audio.pause(); } catch { /* ignore */ }
      try { audio.currentTime = 0; } catch { /* ignore */ }
    }
    const rotateTimer = setTimeout(() => {
      setArmAngle(0);
      setIsLeverEngaged(false);
      const dropTimer = setTimeout(() => {
        setIsLifted(false);
        setCuePhase('rest');
        setIsResting(false);
      }, 1400);
      return () => clearTimeout(dropTimer);
    }, 200);
    return () => clearTimeout(rotateTimer);
  }, []);
  useEffect(() => {
    return () => {
      if (playTimerRef.current) clearTimeout(playTimerRef.current);
    };
  }, []);

  // Tracks localTransport so the choreography can detect transitions.
  // Declared here (before the power effect) so power-off can sync it.
  const prevLocalTransportRef = useRef<'playing' | 'stopped' | 'paused'>(localTransport);

  // ── Power button (Master Rule §2) ──────────────────────────────────────────
  // OFF  → ON  : power on + start playing (loads first track if none active).
  // ON   → OFF : kill switch; cut audio immediately + rest animation.
  // Power off uses the same lift→rotate→rest animation as the STOP button
  // when coming from play or pause. From stop: just flip transport.
  const handlePowerButton = useCallback(() => {
    if (!isPowered) {
      // Power on + always start playing (load first track if empty)
      setIsPowered(true);
      if (currentTrack == null && playTrack) {
        const first = featuredArtists[0];
        playTrack({
          id: first.id,
          name: first.name,
          gearTag: first.gearTag,
          audioUrl: first.audioUrl,
          thumbnail: first.thumbnail,
        } as any);
      }
      setLocalTransport('playing');
    } else {
      const audio = audioRef?.current;
      if (prevLocalTransportRef.current === 'playing' || prevLocalTransportRef.current === 'paused') {
        runRestAnimation(audio);
        setLocalTransport('stopped');
        // Defer power off until after drop completes (rotate 1.4s + drop 1.4s)
        setTimeout(() => togglePower(), 3000);
      } else {
        setLocalTransport('stopped');
        togglePower();
      }
    }
  }, [isPowered, setIsPowered, togglePower, runRestAnimation, audioRef, currentTrack, playTrack]);

  // ═══════════════════════════════════════════════════════════════════════════
  // CUE SWITCH — power toggle ONLY; arm animation is a separate user action.
  // OFF → ON: power on, arm stays at rest, no playback triggered.
  // ON  → OFF: power off (with rest animation if currently playing/paused).
  // ═══════════════════════════════════════════════════════════════════════════
  // Register with shared singleton so StickyTransport, PlaylistPanel buttons route here.
  useEffect(() => {
    const loadFirst = () => {
      if (currentTrack == null && playTrack) {
        const first = featuredArtists[0];
        playTrack({
          id: first.id,
          name: first.name,
          gearTag: first.gearTag,
          audioUrl: first.audioUrl,
          thumbnail: first.thumbnail,
        } as any);
      }
    };
    deckControls.register({
      play: () => {
        // Selecting a new track while playing must stay playing (never pause).
        // Force power on, load first track if empty, and always set playing.
        if (!isPowered) {
          setIsPowered(true);
          loadFirst();
        }
        setLocalTransport('playing');
      },
      pause: () => {
        if (isPowered && localTransport === 'playing') {
          setLocalTransport('paused');
        }
      },
      toggle: () => {
        if (!isPowered) {
          // Off → power on + play (with first-track fallback for empty state)
          setIsPowered(true);
          loadFirst();
          setLocalTransport('playing');
        } else if (localTransport === 'playing') {
          // Real play/pause toggle (not stop)
          setLocalTransport('paused');
        } else {
          // paused or stopped → play
          setLocalTransport('playing');
        }
      },
      stop: () => {
        if (isPowered) {
          setLocalTransport('stopped');
        }
      },
    });
    return () => deckControls.unregister();
  }, [isPowered, currentTrack, playTrack, localTransport]);

  const handleCueSwitchToggle = useCallback(() => {
    // OFF → ON: power on + start play.
    // If no track is active, fall back to the first playlist entry so the
    // animation always has something to play.
    if (!isPowered) {
      setIsPowered(true);
      if (currentTrack == null && playTrack) {
        // No track loaded: load the first canonical featured track so the
        // animation + audio stay in sync (master-source-of-truth).
        // Use the real track id so the playlist row highlights.
        const first = featuredArtists[0];
        playTrack({
          id: first.id,
          name: first.name,
          gearTag: first.gearTag,
          audioUrl: first.audioUrl,
          thumbnail: first.thumbnail,
        } as any);
      }
      setLocalTransport('playing');
      return;
    }
    // ON and NOT stopped → power off (with rest animation if playing/paused)
    if (localTransport !== 'stopped') {
      const audio = audioRef?.current;
      if (prevLocalTransportRef.current === 'playing' || prevLocalTransportRef.current === 'paused') {
        runRestAnimation(audio);
        setLocalTransport('stopped');
        prevLocalTransportRef.current = 'stopped';
        if (onStop) onStop();
        setTimeout(() => setIsPowered(false), 3000);
      } else {
        setLocalTransport('stopped');
        prevLocalTransportRef.current = 'stopped';
        if (onStop) onStop();
        setIsPowered(false);
      }
    } else {
      // ON and stopped → power off (already at rest, no animation needed)
      setLocalTransport('stopped');
      prevLocalTransportRef.current = 'stopped';
      if (onStop) onStop();
      setIsLeverEngaged(false);
      setIsPowered(false);
    }
  }, [isPowered, setIsPowered, localTransport, runRestAnimation, audioRef, onStop]);

  const [rpm, setRpm] = useState<33 | 45>(33);
  const [rpmFlash, setRpmFlash] = useState(false);
  const [speed, setSpeed] = useState<33 | 45>(33);
  const [pitch, setPitch] = useState(0);
  // Guards click-to-jump when user is dragging the pitch handle.
  const draggingPitchRef = useRef(false);
  const liveBpmDisplay = useMemo(() => {
    if (bpm === 'CAL' || !isPowered) return bpm === 'CAL' ? 'CAL' : '--';
    const base = Number(bpm) || 0;
    if (base <= 0) return '--';
    const rpmRate = rpm === 45 ? 1.35 : 1.0;
    const pitchRate = 1 + pitch / 100;
    return (base * rpmRate * pitchRate).toFixed(2);
  }, [bpm, pitch, isPowered, rpm]);
  // Auto-reset pitch on every power transition (on or off) — first mount skipped.
  const initialMountRef = useRef(true);
  useEffect(() => {
    if (initialMountRef.current) { initialMountRef.current = false; return; }
    setPitch(0);
    if (setPlaybackRate) setPlaybackRate(1); // neutral playback rate
  }, [isPowered, setPlaybackRate]);
  // Pitch fader change -> propagate to AudioContext playbackRate in real time
  const handlePitchChange = useCallback((delta: number) => {
    setPitch((prev) => {
      const next = Math.max(-8, Math.min(8, prev + delta));
      const rate = (rpm === 45 ? 1.35 : 1.0) * (1 + next / 100);
      if (setPlaybackRate) setPlaybackRate(rate);
      return next;
    });
  }, [setPlaybackRate, rpm]);

  // ─── Shared tick subscription (ADR-0001) ───────────────────────────────────
  // The rAF lives in AudioTickController singleton. This component only
  // subscribes via useAudioTick, applies physics to refs, and mutates the
  // vinyl group via vinylRef.current.style.transform — zero React renders.

  // Persistent physics state + mirrors (survive re-renders, never trigger them)
  const rotationRef = useRef(0);    // current angle in degrees
  const velocityRef = useRef(0);    // current degrees-per-frame
  const vinylRef = useRef<SVGGElement | null>(null); // rotation mutation target

  const isPoweredRef = useRef(isPowered);
  const isPlayingRef = useRef(isPlaying);
  const rpmRef = useRef<33 | 45>(33);

  // Direct assignment on every render — keeps refs in sync, zero render cost
  isPoweredRef.current = isPowered;
  isPlayingRef.current = isPlaying;
  rpmRef.current = rpm;

  // Rotation anchor — hoisted from render body so the tick callback can reference it
  const PCX = 215;
  const PCY = 215;

  // Shared tick (ADR-0001): physics loop via controller, rotation via DOM mutation
  useAudioTick((frame) => {
    const powered = isPoweredRef.current;
    const rpmRate = rpmRef.current === 45 ? 5.625 : 4.1667;
    let targetVelocity = powered ? rpmRate : 0;
    const lerpFactor = 0.08;
    velocityRef.current += (targetVelocity - velocityRef.current) * lerpFactor;
    if (!powered) {
      velocityRef.current *= 0.96;
      if (Math.abs(velocityRef.current) < 0.015) velocityRef.current = 0;
    }
    rotationRef.current = (rotationRef.current + velocityRef.current + 360) % 360;
    if (vinylRef.current) {
      vinylRef.current.style.transform = `rotate(${rotationRef.current}deg)`;
      vinylRef.current.style.transformOrigin = `${PCX}px ${PCY}px`;
    }
  });

  // Called by the new STOP hardware button inside the turntable chassis.
  // Uses `stop()` from AudioContext so all subscribers (transportState, visualizer,
  // tonearm) react uniformly, then snaps the vinyl rotation back to 0deg.
  const { stop } = useAudio();
  const [stopSignal, setStopSignal] = useState(0);
  const [spinLocked, setSpinLocked] = useState(false);

  // ── Stop button (Master Rule §4) ──────────────────────────────────────────
  // OFF → no-op. ON → arm to rest; cut audio via onStop + vinyl snap.
  const handleDeckStop = useCallback(() => {
    if (!isPowered) return;
    if (onStop) onStop();
    setLocalTransport('stopped');
    setStopSignal((n) => n + 1);   // snap vinyl back to 0deg (lines 315-322)
  }, [isPowered, onStop]);

  // ── Tonearm click: Play from stop / Stop from play or pause ───────────────
  // Drives the choreography by flipping `localTransport` directly — the
  // choreo useEffect keys off that state and runs the lift / rotate / drop
  // animation, then calls the parent props (onPlay / onStop) via the
  // cuePhase / onDisk bridge. Never call the parent props synchronously.
  const handleArmClick = useCallback(() => {
    if (!isPowered) {
      // OFF • arm click → power on + play from stop
      setIsPowered(true);
      setLocalTransport('playing');
    } else if (localTransport === 'stopped') {
      // STOPPED • arm click → play (full lift/rotate/drop)
      setLocalTransport('playing');
    } else {
      // PLAYING or PAUSED • arm click → stop (full lift / rotate back to rest)
      setLocalTransport('stopped');
    }
  }, [isPowered, setIsPowered, localTransport]);

  // ── Play/Pause button (sole toggle — ALWAYS flips localTransport) ─────────
  // The button is the single user-facing command. It ONLY sets localTransport
  // and cuePhase. It NEVER calls onPlay / onTogglePlay synchronously — those
  // happen later, gated by the headshell-on-disk choreography, so:
  //   - First click always works (icon flips immediately)
  //   - Audio starts exactly when the headshell lands on the vinyl
  //   - Subsequent clicks always flip the command (no apparent inversion)
  //
  // Timing rules:
  //   Stop  → Play : 1000ms (full arm sequence: lift → rotate → drop)
  //   Pause → Play : 400ms  (fast drop from lifted pause)
  //   Play  → Pause: 0ms    (instant: lift arm immediately, audio.pause())
  const handleDeckPlayPause = useCallback(() => {
    if (!isPowered) return; // OFF → no-op
    // Clear any pending drop timer so a rapid double-click doesn't fire a
    // stale onPlay after the user has already flipped back to pause.
    if (playTimerRef.current) {
      clearTimeout(playTimerRef.current);
      playTimerRef.current = null;
    }

    if (localTransport === 'playing') {
      // ── PLAY → PAUSE (0ms: instant) ─────────────────────────────────
      // Optimistic: flip icon immediately, then the choreo effect lifts
      // the arm and calls onPause so audio actually stops.
      setLocalTransport('paused');
      return;
    }

    // STOP or PAUSED → PLAY. The choreo effect (below) runs the lift/rotate
    // sequence and only calls onPlay after the headshell physically lands.
    if (localTransport === 'paused') {
      setLocalTransport('playing');
    } else {
      // 'stopped' → full lift/rotate/drop sequence
      setLocalTransport('playing');
    }
  }, [isPowered, localTransport]);

  // ── Headshell click: same play/pause toggle logic ──────────────────────────
  const handleHeadshellClick = useCallback(() => {
    if (!isPowered) return;
    if (localTransport === 'playing') {
      // PLAYING → PAUSE
      setLocalTransport('paused');
    } else {
      // PAUSED / STOPPED → PLAY
      setLocalTransport('playing');
    }
  }, [isPowered, localTransport]);

  useEffect(() => {
    isQuickLiftRef.current = isQuickLift;
  }, [isQuickLift]);

  // Snap vinyl to 0deg whenever a stop signal fires.
  // Tracks the previous value so the effect only fires on actual increments,
  // not on the initial mount (when prevRef === current === 0).
  const prevStopSignalRef = useRef(0);
  useEffect(() => {
    if (prevStopSignalRef.current === stopSignal) return;
    prevStopSignalRef.current = stopSignal;
    if (stopSignal === 0) return;
    setSpinLocked(true);
    const t = setTimeout(() => setSpinLocked(false), 50);
    return () => clearTimeout(t);
  }, [stopSignal]);

  const [antiSkateAngle, setAntiSkateAngle] = useState(0);

  // When playlist selects a track, trigger choreography through turntable (master)
  const prevCurrentTrackRef = useRef(currentTrack);
  useEffect(() => {
    const prev = prevCurrentTrackRef.current;
    const curr = currentTrack;
    prevCurrentTrackRef.current = curr;
    if (curr && prev !== curr && isPowered && localTransport === 'stopped') {
      setLocalTransport('playing');
    }
  }, [currentTrack, isPowered, localTransport]);

  // ── HIJACK: Intercept HTMLAudioElement.play() to block parent audio leaks ──
  // CRITICAL: Music must NEVER play unless the headshell is connected to the
  // vinyl. The Turntable sets _headshellOnDisk=true on the audio element when
  // the headshell physically lands, and false when it lifts. This single
  // boolean is the authoritative gate. Any audio.play() call from the parent
  // (playTrack, togglePlay, etc.) is silently blocked until the gate opens.
  useEffect(() => {
    const audio = audioRef?.current || document.querySelector('audio');
    if (audio && !(audio as any)._originalPlay) {
      (audio as any)._originalPlay = audio.play.bind(audio);
      (audio as any)._headshellOnDisk = false; // off until headshell lands
      audio.play = function(): Promise<void> {
        if (!(audio as any)._headshellOnDisk) {
          console.log("[HeadshellGate] Play blocked: headshell not on vinyl");
          return Promise.resolve();
        }
        return (audio as any)._originalPlay.apply(this, arguments);
      };
    }
  }, [audioRef]);

  // ── Headshell-on-vinyl gate: SINGLE AUTHORITY for audio playback ──────────
  // Driven ONLY by `cuePhase`. The choreography useEffect sets cuePhase to
  // 'onDisk' precisely when the headshell lands, and to 'killing' / 'rest'
  // when it lifts. This is the single source of truth — no other code path
  // may set _headshellOnDisk.
  useEffect(() => {
    const audio = audioRef?.current;
    if (!audio) return;

    const headshellOnDisk = cuePhase === 'onDisk';
    (audio as any)._headshellOnDisk = headshellOnDisk;

    if (!headshellOnDisk) {
      // Don't force an abrupt pause here — that breaks the continuous loop.
      // The choreography useEffect manages audio timing; interrupting it
      // causes the blip/crush. Only update the gate, don't call pause().
      // try { audio.pause(); } catch { /* ignore */ }  // REMOVED — prevents glitch
    }
  }, [cuePhase, audioRef]);

  // ── MASTER RULE: Music only when needle drops onto black vinyl ────────────
  // When isLifted goes true → false, the needle has physically dropped from
  // the lifted position onto the vinyl surface. That's the only valid trigger.
  // No pre-check, no delayed timer — the drop itself is the gate.
  const prevIsLiftedRef = useRef(isLifted);
  useEffect(() => {
    const wasUp = prevIsLiftedRef.current;
    const nowDown = isLifted;
    prevIsLiftedRef.current = nowDown;
    if (wasUp && !nowDown && cuePhase === 'onDisk') {
      // Needle dropped into the black vinyl. Music starts now — not before, not after.
      if (onPlay) onPlay();
      else if (onTogglePlay) onTogglePlay();
    }
  }, [isLifted, cuePhase, onPlay, onTogglePlay]);

  // ── Headshell-onDisk event bridge → parent transport ──────────────────────
  // Not used for start — start is driven only by the isLifted drop rule above.
  // Kept for state tracking and debug logging only.
  const dropTimerRef = useRef<ReturnType<typeof setTimeout> | null>(null);
  const unGagTimerRef = useRef<ReturnType<typeof setTimeout> | null>(null);
  const prevCuePhaseRef = useRef<CuePhase>(cuePhase);
  useEffect(() => {
    const prev = prevCuePhaseRef.current;
    const curr = cuePhase;
    if (prev === curr) return;
    prevCuePhaseRef.current = curr;

    // Clear any pending drop timer (defensive — rapid clicks)
    if (dropTimerRef.current) {
      clearTimeout(dropTimerRef.current);
      dropTimerRef.current = null;
    }

    // Music starts ONLY on isLifted true→false + cuePhase onDisk (new rule).
    // This block handles only pause/stop/lifting, never play start.
    if (curr === 'killing' && prev === 'onDisk') {
      // Headshell lifted from disk → pause audio immediately (don't wait)
      if (onPause) onPause();
    } else if (curr === 'rest' && (prev === 'onDisk' || prev === 'killing')) {
      // Arm returned to rest → ensure parent is stopped
      if (dropTimerRef.current) {
        clearTimeout(dropTimerRef.current);
        dropTimerRef.current = null;
      }
      if (onStop) onStop();
    }
  }, [cuePhase, onPlay, onPause, onStop, onTogglePlay]);

  // ── Tonearm Gate Timer Cleanup ─────────────────────────────────────────────
  // Only handles cleanup when power/state changes. The Cue Switch (handleCueSwitchToggle)
  // is the SOLE AUTHORITY for audio timing during arm swing. No competing gates allowed.
  const gateTimerRef = useRef<ReturnType<typeof setTimeout> | null>(null);

  useEffect(() => {
    return () => {
      if (gateTimerRef.current) clearTimeout(gateTimerRef.current);
      if (dropTimerRef.current) clearTimeout(dropTimerRef.current);
      isArmMovingRef.current = false; // Unmount: release any block
    };
  }, []);

  useEffect(() => {
    if (!isPowered && gateTimerRef.current) {
      clearTimeout(gateTimerRef.current);
      gateTimerRef.current = null;
      isArmMovingRef.current = false; // Power off: release any block
    }
    if (localTransport === 'stopped' && gateTimerRef.current) {
      clearTimeout(gateTimerRef.current);
      gateTimerRef.current = null;
      isArmMovingRef.current = false;
    }
  }, [isPowered, localTransport]);

  const handleAntiSkateMouseDown = useCallback((e: React.MouseEvent<SVGGElement>) => {
    e.preventDefault();
    e.stopPropagation();
    const target = e.currentTarget;
    const svgEl = target.closest('svg');
    if (!svgEl) return;
    const cx = TPX + 45;
    const cy = TPY + 50;
    const handleMove = (ev: MouseEvent) => {
      const pt = (svgEl as SVGSVGElement).createSVGPoint();
      pt.x = ev.clientX;
      pt.y = ev.clientY;
      const ctm = (svgEl as SVGSVGElement).getScreenCTM();
      if (!ctm) return;
      const svgPt = pt.matrixTransform(ctm.inverse());
      const dx = svgPt.x - cx;
      const dy = svgPt.y - cy;
      const deg = Math.atan2(dy, dx) * 180 / Math.PI + 90;
      const norm = ((deg % 360) + 360) % 360;
      const val = Math.max(0, Math.min(300, Math.round(norm)));
      setAntiSkateAngle(val);
    };
    const handleUp = () => {
      window.removeEventListener('mousemove', handleMove);
      window.removeEventListener('mouseup', handleUp);
    };
    window.addEventListener('mousemove', handleMove);
    window.addEventListener('mouseup', handleUp);
  }, []);

  // ═══════════════════════════════════════════════════════════════════════════
  // CUE SWITCH CHOREOGRAPHY — drives arm animation from localTransport state.
  // This is the SOLE AUTHORITY for isLifted, armAngle, cuePhase, and
  // _headshellOnDisk. It runs when localTransport changes and determines the
  // correct animation sequence.
  //
  // Key rules:
  //   'stopped' → 'playing' : lift → rotate → drop (1000ms total)
  //   'paused'  → 'playing' : lift → drop  (400ms — arm already at disk)
  //   'playing' → 'paused'  : lift immediately (0ms)
  //   'playing' → 'stopped' : lift → rotate back to rest
  //
  // Audio playback (onPlay) is called ONLY when cuePhase transitions to 'onDisk'.
  // The _headshellOnDisk flag is set HERE and only HERE — no other writes.
  // Kill-phase timer logic removed — rest animation is now centralized in
  // runRestAnimation() called directly by handlePowerButton and handleCueSwitchToggle.

  // ═══════════════════════════════════════════════════════════════════════════
  // CUE SWITCH CHOREOGRAPHY — drives arm animation from localTransport state.
  // This is the SOLE AUTHORITY for isLifted, armAngle, cuePhase, and
  // _headshellOnDisk. It runs when localTransport changes and determines the
  // correct animation sequence.
  //
  // Key rules:
  //   'stopped' → 'playing' : lift → rotate → drop (1000ms total)
  //   'paused'  → 'playing' : lift → drop  (400ms — arm already at disk)
  //   'playing' → 'paused'  : lift immediately (0ms)
  //   'playing' → 'stopped' : lift → rotate back to rest
  //   'paused'  → 'stopped' : lift → rotate back to rest
  //
  // Audio playback (onPlay) is called ONLY when cuePhase transitions to 'onDisk'.
  // The _headshellOnDisk flag is set HERE and only HERE — no other writes.
  // ═══════════════════════════════════════════════════════════════════════════
  useEffect(() => {
    let dropTimer: ReturnType<typeof setTimeout> | undefined;
    let rotateTimer: ReturnType<typeof setTimeout> | undefined;

    const prev = prevLocalTransportRef.current;
    const curr = localTransport;

    // Only react to actual localTransport changes — skip initial mount
    if (prev === curr) {
      return;
    }

    const audio = audioRef?.current;

    // ── PLAY → PAUSE (localTransport: 'playing' → 'paused') ────────────────
    // Quick lift: fast 0.22s transition (pause animation only)
    if (prev === 'playing' && curr === 'paused') {
      setIsQuickLift(true);
      setIsLifted(true);
      setCuePhase('killing');
      prevLocalTransportRef.current = curr;
      return;
    }

    // ── STOP → PLAY (localTransport: 'stopped' → 'playing') ─────────────────
    // Full sequence: lift → rotate → drop (1000ms). The headshell effect
    // fires onPlay when cuePhase becomes 'onDisk'.
    if (prev === 'stopped' && curr === 'playing') {
      if (audio) {
        (audio as any)._gagged = true;
        audio.muted = true;
        audio.playbackRate = 0;
      }
      setIsLifted(true);              // 1. Lift FIRST (prevent scratch)
      setIsLeverEngaged(true);
      setCuePhase('cueing');
      rotateTimer = setTimeout(() => {
        setArmAngle(38);             // Rotate to disk (while lifted) — CSS rotation = 1.5s
        dropTimer = setTimeout(() => {
          // The CSS drop animation (1.5s) runs after isLifted goes false.
          setIsLifted(false);
        }, 1500);
        // Match the CSS drop duration (1.5s) — un-gag only when needle
        // physically contacts the vinyl. Keeping audio gagged prevents any
        // stray play() call from leaking through before onTransitionEnd fires.
        unGagTimerRef.current = setTimeout(() => {
          if (audio) {
            (audio as any)._gagged = false;
            audio.muted = false;
            audio.playbackRate = 1;
          }
        }, 1500 + 1500);
      }, 600);
      prevLocalTransportRef.current = curr;
      return;
    }

    // ── PAUSE → PLAY (localTransport: 'paused' → 'playing') ─────────────────
    // From paused: arm is at disk angle (lifted). Must lift slightly, drop.
    // Music must stay PAUSED during lift — only resume when headshell lands.
    if (prev === 'paused' && curr === 'playing') {
      // Quick resume: fast 0.22s transition (drop back to disk)
      setIsQuickLift(true);
      if (audio) {
        (audio as any)._armMoving = true; // arm is moving → block stray play()
        // Don't call audio.pause() here — it interrupts the continuous
        // loop flow and causes the blip/crush when resuming.
        // try { audio.pause(); } catch { /* ignore */ }  // REMOVED — keeps loop smooth
      }
      isArmMovingRef.current = true;
      setIsLifted(true);              // lift (prepare for drop)
      setIsLeverEngaged(true);
      setCuePhase('cueing');
      // Start the drop. onTransitionEnd fires when the CSS drop completes,
      // then sets cuePhase='onDisk' and calls onPlay.
      dropTimer = setTimeout(() => {
        setIsLifted(false); // quick drop starts
      }, 220);
      prevLocalTransportRef.current = curr;
      return;
    }

    // ── PAUSED → STOP (localTransport: 'paused' → 'stopped') ────────────────
    // From paused the arm is at the disk (lifted at 38°). Lift, swing back
    // to rest, then drop at rest.
    if (prev === 'paused' && curr === 'stopped') {
      if (!isResting) runStopRestAnimation(audio);
      prevLocalTransportRef.current = curr;
      return;
    }

    // ── PLAY → STOP (localTransport: 'playing' → 'stopped') ─────────────────
    // Lift arm and rotate back to rest cradle.
    if (prev === 'playing' && curr === 'stopped') {
      if (!isResting) runStopRestAnimation(audio);
      prevLocalTransportRef.current = curr;
      return;
    }

    prevLocalTransportRef.current = curr;
    return () => {
      clearTimeout(dropTimer);
      clearTimeout(rotateTimer);
      if (unGagTimerRef.current) {
        clearTimeout(unGagTimerRef.current);
        unGagTimerRef.current = null;
      }
    };
  }, [localTransport, audioRef]);

  const PLATTER_R = 175; const VINYL_R = 145; const LABEL_R = 48; const SPINDLE_R = 8;
  const TPX = 490; const TPY = 75; const WAND_LEN = 220; const CW_LEN = 50; const WAND_W = 7;
  // Top-down center of the counterweight puck. Offset slightly downward
  // from the original back-of-arm anchor so the scale tick numbers fit
  // cleanly above the dial ring inside the SVG viewBox.
  const CW_CX = TPX; const CW_CY = TPY - CW_LEN + 8;
  const REST_X = TPX; const REST_Y = TPY + 220; const PARK_ANGLE = 0;
  const PLAY_ANGLE = 55; const INNER_ANGLE = 75;

  const currentProgress = progress ?? 0;
  const frozenAngleRef = useRef<number>(PLAY_ANGLE);
  useEffect(() => {
    if (transportState === 'paused') {
      frozenAngleRef.current = PLAY_ANGLE + (currentProgress * (INNER_ANGLE - PLAY_ANGLE));
    }
  }, [transportState, currentProgress]);

  let displayAngle: number;
  if (transportState === 'stopped' || (!isPowered && !isResting)) displayAngle = PARK_ANGLE;
  else if (transportState === 'playing') displayAngle = PLAY_ANGLE + (currentProgress * (INNER_ANGLE - PLAY_ANGLE));
  else displayAngle = frozenAngleRef.current;

  const PITCH_X = 660; const PITCH_Y = 90; const PITCH_LEN = 230;
  const sliderY = PITCH_Y + PITCH_LEN / 2 - pitch * (PITCH_LEN / 16);

  return (
    <div className={`relative flex-shrink-0 ${className}`} style={{ filter: 'drop-shadow(2px 4px 4px rgba(0,0,0,0.8))', width: '100%', maxWidth: 'min(520px, 92vw)', minWidth: '280px', aspectRatio: '720 / 480', minHeight: 'min(180px, 52vw)' }}>
      <div className="relative w-full h-full rounded-[36px] p-3 border border-white/[0.07]" style={{ background: "linear-gradient(180deg, #1a1d28 0%, #0c0e14 60%, #04050a 100%)", boxShadow: "inset 0 1px 0 rgba(255,255,255,0.08), inset 0 -2px 8px rgba(0,0,0,0.5), 0 30px 80px rgba(0,0,0,0.6)" }}>
        <div className="relative w-full h-full rounded-[28px] overflow-hidden border border-white/[0.04]" style={{ background: "linear-gradient(135deg, #1a1c24 0%, #0a0b10 70%, #06070b 100%)", boxShadow: "inset 0 0 50px rgba(0,0,0,0.7), inset 0 0 1px rgba(255,255,255,0.05)" }}>
          <div className="relative w-full h-full overflow-hidden" style={{ aspectRatio: "720 / 480" }}>
          <svg viewBox="0 0 720 480" className="absolute inset-0 w-full h-full" style={{ display: "block", maxHeight: '100%' }} preserveAspectRatio="xMidYMid meet" aria-label="Turntable deck">
            <defs>
              <linearGradient id="anodized-dark" x1="0%" y1="0%" x2="0%" y2="100%"><stop offset="0%" stopColor="#2a2e38"/><stop offset="40%" stopColor="#1c1f28"/><stop offset="100%" stopColor="#0e1015"/></linearGradient>
              <linearGradient id="brushed-al" x1="0%" y1="0%" x2="0%" y2="100%"><stop offset="0%" stopColor="#5a6070"/><stop offset="8%" stopColor="#7a8298"/><stop offset="16%" stopColor="#5a6070"/><stop offset="24%" stopColor="#7a8298"/><stop offset="32%" stopColor="#5a6070"/><stop offset="40%" stopColor="#7a8298"/><stop offset="48%" stopColor="#5a6070"/><stop offset="56%" stopColor="#7a8298"/><stop offset="64%" stopColor="#5a6070"/><stop offset="72%" stopColor="#7a8298"/><stop offset="80%" stopColor="#5a6070"/><stop offset="88%" stopColor="#7a8298"/><stop offset="96%" stopColor="#5a6070"/><stop offset="100%" stopColor="#4a5068"/></linearGradient>
              <linearGradient id="precision-chrome" x1="0%" y1="0%" x2="100%" y2="100%"><stop offset="0%" stopColor="#f8f8fc"/><stop offset="15%" stopColor="#d0d4e0"/><stop offset="40%" stopColor="#8090a8"/><stop offset="65%" stopColor="#c0c8d8"/><stop offset="85%" stopColor="#8898b0"/><stop offset="100%" stopColor="#4a5268"/></linearGradient>
              <linearGradient id="polished-al" x1="0%" y1="0%" x2="0%" y2="100%"><stop offset="0%" stopColor="#c8ccd8"/><stop offset="30%" stopColor="#8898a8"/><stop offset="70%" stopColor="#5a6478"/><stop offset="100%" stopColor="#2a303c"/></linearGradient>
              <linearGradient id="dark-alloy" x1="0%" y1="0%" x2="100%" y2="100%"><stop offset="0%" stopColor="#3a3e4c"/><stop offset="35%" stopColor="#1e2128"/><stop offset="70%" stopColor="#0e1015"/><stop offset="100%" stopColor="#060810"/></linearGradient>
              <radialGradient id="cw-mass" cx="35%" cy="30%" r="70%"><stop offset="0%" stopColor="#a8acb8"/><stop offset="40%" stopColor="#6a6e7c"/><stop offset="75%" stopColor="#3a3e4c"/><stop offset="100%" stopColor="#1a1e28"/></radialGradient>
              <linearGradient id="brass" x1="0%" y1="0%" x2="100%" y2="100%"><stop offset="0%" stopColor="#e8c060"/><stop offset="30%" stopColor="#c89030"/><stop offset="65%" stopColor="#a87020"/><stop offset="100%" stopColor="#604010"/></linearGradient>
              <linearGradient id="gold" x1="0%" y1="0%" x2="100%" y2="100%"><stop offset="0%" stopColor="#d4a830"/><stop offset="35%" stopColor="#f0c040"/><stop offset="65%" stopColor="#c89828"/><stop offset="100%" stopColor="#806010"/></linearGradient>
              <radialGradient id="chrome-spindle" cx="35%" cy="30%" r="75%"><stop offset="0%" stopColor="#ffffff"/><stop offset="20%" stopColor="#d8e0ec"/><stop offset="50%" stopColor="#9aaab8"/><stop offset="80%" stopColor="#5a6a78"/><stop offset="100%" stopColor="#2c3340"/></radialGradient>
              <linearGradient id="vinyl-deep" x1="0%" y1="0%" x2="100%" y2="0%"><stop offset="0%" stopColor="#0e0f14"/><stop offset="40%" stopColor="#12141a"/><stop offset="70%" stopColor="#080810"/><stop offset="100%" stopColor="#06070e"/></linearGradient>
              <linearGradient id="vinyl-mid" x1="0%" y1="0%" x2="100%" y2="0%"><stop offset="0%" stopColor="#141620"/><stop offset="50%" stopColor="#161828"/><stop offset="100%" stopColor="#101218"/></linearGradient>
              <linearGradient id="cart-blue" x1="0%" y1="0%" x2="100%" y2="100%"><stop offset="0%" stopColor="#2a4880"/><stop offset="40%" stopColor="#1c3060"/><stop offset="100%" stopColor="#0c1830"/></linearGradient>
              <linearGradient id="cantilever-grad" x1="0%" y1="0%" x2="100%" y2="0%"><stop offset="0%" stopColor="#e8c840"/><stop offset="50%" stopColor="#d4af37"/><stop offset="100%" stopColor="#b89020"/></linearGradient>
              <linearGradient id="cue-al" x1="0%" y1="0%" x2="100%" y2="0%"><stop offset="0%" stopColor="#7a8098"/><stop offset="40%" stopColor="#a0a8b8"/><stop offset="100%" stopColor="#4a5068"/></linearGradient>

              {/* Arm tube: premium satin-black composite with cylindrical volumetric shading */}
              <linearGradient id="arm-tube-dark-metal" x1="0%" y1="0%" x2="100%" y2="0%">
                <stop offset="0%"   stopColor="#141620"/>
                <stop offset="15%"  stopColor="#2a3045"/>
                <stop offset="35%"  stopColor="#3e4660"/>
                <stop offset="50%"  stopColor="#505a78"/>
                <stop offset="65%"  stopColor="#3a4055"/>
                <stop offset="85%"  stopColor="#181c2e"/>
                <stop offset="100%" stopColor="#0d0f16"/>
              </linearGradient>
              <linearGradient id="arm-tube-specular-band" x1="0%" y1="0%" x2="100%" y2="0%">
                <stop offset="0%"   stopColor="rgba(255,255,255,0.05)"/>
                <stop offset="30%"  stopColor="rgba(255,255,255,0.22)"/>
                <stop offset="50%"  stopColor="rgba(255,255,255,0.10)"/>
                <stop offset="70%"  stopColor="rgba(255,255,255,0.28)"/>
                <stop offset="100%" stopColor="rgba(255,255,255,0.06)"/>
              </linearGradient>
              <linearGradient id="arm-tube-specular" x1="0%" y1="0%" x2="0%" y2="100%">
                <stop offset="0%"   stopColor="rgba(255,255,255,0.22)"/>
                <stop offset="100%" stopColor="rgba(0,0,0,0.0)"/>
              </linearGradient>
              <linearGradient id="arm-tube-shadow" x1="0%" y1="0%" x2="0%" y2="100%">
                <stop offset="0%"   stopColor="rgba(0,0,0,0.0)"/>
                <stop offset="100%" stopColor="rgba(0,0,0,0.4)"/>
              </linearGradient>

              <filter id="shadow-sm" x="-25%" y="-25%" width="150%" height="160%"><feDropShadow dx="1" dy="2" stdDeviation="2" floodColor="#000" floodOpacity="0.65"/></filter>
              <filter id="shadow-md" x="-35%" y="-25%" width="170%" height="170%"><feDropShadow dx="2" dy="4" stdDeviation="4" floodColor="#000" floodOpacity="0.72"/></filter>
              <filter id="shadow-lg" x="-50%" y="-50%" width="200%" height="200%"><feDropShadow dx="4" dy="8" stdDeviation="6" floodColor="#000" floodOpacity="0.6"/></filter>
            </defs>

            {/* PLATTER */}
            <circle cx={PCX} cy={PCY} r={PLATTER_R + 5} fill="#0c0d12" />
            <g filter="url(#shadow-md)">
              <circle cx={PCX} cy={PCY} r={PLATTER_R} fill="none" stroke="url(#brushed-al)" strokeWidth="22" />
              <circle cx={PCX} cy={PCY} r={PLATTER_R - 11} fill="none" stroke="url(#brushed-al)" strokeWidth="8" />
              <circle cx={PCX} cy={PCY} r={PLATTER_R - 22} fill="none" stroke="#0a0c12" strokeWidth="6" />
            </g>
            <g
              ref={vinylRef}
              className="vinyl-spin"
              style={{
                transformOrigin: `${PCX}px ${PCY}px`,
                animation: "none",
                willChange: 'transform',
              }}
            >
              <circle cx={PCX} cy={PCY} r={VINYL_R} fill="url(#vinyl-deep)" />
              {Array.from({ length: 24 }, (_, j) => {
                const bandR = VINYL_R - j * 5.8;
                if (bandR < LABEL_R + 4) return null;
                const fill = j % 2 === 0 ? "url(#vinyl-deep)" : "url(#vinyl-mid)";
                return <circle key={j} cx={PCX} cy={PCY} r={bandR} fill={fill} stroke={j % 3 === 0 ? "rgba(40,45,55,0.32)" : "none"} strokeWidth={0.5} />;
              })}
              <g opacity="0.07">{Array.from({ length: 120 }, (_, g) => (
                <line key={g} x1={PCX} y1={PCY - VINYL_R} x2={PCX} y2={PCY + VINYL_R} stroke="#d8dce4" strokeWidth="0.4" transform={`rotate(${g * 3}, ${PCX}, ${PCY})`} />
              ))}</g>
              <circle cx={PCX} cy={PCY} r={LABEL_R} fill="#0a0c14" />
              {/* Label artwork — image inside the spinning vinyl group, clipped to circle */}
              {labelFailed || !labelThumbnail ? (
                <>
                  <circle cx={PCX} cy={PCY} r={LABEL_R - 2} fill="none" stroke="url(#gold)" strokeWidth="5" />
                  <circle cx={PCX} cy={PCY} r={LABEL_R - 14} fill="none" stroke="url(#gold)" strokeWidth="2" opacity="0.6" />
                  {/* Fallback: show icon centered on label */}
                  <foreignObject x={PCX - (LABEL_R - 4)} y={PCY - (LABEL_R - 4)} width={LABEL_R * 2 - 8} height={LABEL_R * 2 - 8} style={{ overflow: "visible" }}>
                    <div style={{ width: "100%", height: "100%", display: "flex", alignItems: "center", justifyContent: "center" }}>
                      <Disc3 size={LABEL_R - 4} className="text-amber-500/50" strokeWidth={1} />
                    </div>
                  </foreignObject>
                </>
              ) : (
                <>
                  <clipPath id="label-clip">
                    <circle cx={PCX} cy={PCY} r={LABEL_R - 3} />
                  </clipPath>
                  <image
                    href={labelThumbnail ?? undefined}
                    x={PCX - (LABEL_R - 3)}
                    y={PCY - (LABEL_R - 3)}
                    width={(LABEL_R - 3) * 2}
                    height={(LABEL_R - 3) * 2}
                    clipPath="url(#label-clip)"
                    preserveAspectRatio="xMidYMid slice"
                  />
                  <circle cx={PCX} cy={PCY} r={LABEL_R - 2} fill="none" stroke="url(#gold)" strokeWidth="4" opacity="0.85" />
                  <circle cx={PCX} cy={PCY} r={LABEL_R - 14} fill="none" stroke="url(#gold)" strokeWidth="1.5" opacity="0.5" />
                </>
              )}

              {/* Spindle hole — dark ring around the chrome spindle, rotates with the vinyl */}
              <circle cx={PCX} cy={PCY} r="9" fill="#0a0a0a" />
            </g>
            <circle cx={PCX} cy={PCY} r={VINYL_R} fill="none" stroke="#8898aa" strokeWidth="1" opacity="0.3" />

            {/* SPINDLE */}
            <g id="tonearm-spindle">
              <ellipse cx={PCX} cy={PCY + 1.5} rx={SPINDLE_R + 1} ry={SPINDLE_R - 1} fill="rgba(0,0,0,0.55)" opacity="0.7" />
              <circle cx={PCX} cy={PCY} r={SPINDLE_R} fill="url(#chrome-spindle)" stroke="#5a6a78" strokeWidth="0.6" />
              <ellipse cx={PCX - 2} cy={PCY - 2} rx="3" ry="2" fill="rgba(255,255,255,0.9)" transform={`rotate(-35, ${PCX - 2}, ${PCY - 2})`} />
              <circle cx={PCX} cy={PCY} r="1.4" fill="#1a1d24" />
            </g>

            {/* ══════════════════════════════════════════════════════════════
                #tonearm-system — authoritative container for all arm geometry
                ══════════════════════════════════════════════════════════════ */}
            <g id="tonearm-system">

              {/* ─────────────────────────────────────────────────────────
                  #tonearm-static-base
                  Everything inside is DECK-MOUNTED and NEVER rotates.
                  Pivot housing, mounting screws, mounting plate, anti-skate.
                  ══════════════════════════════════════════════════════════ */}
              <g id="tonearm-static-base">

                {/* Cradle (rest position) */}
                <g id="tonearm-base-cradle" filter="url(#shadow-md)">
                  <circle cx="490" cy="300" r="14" fill="#2c3040" stroke="#1a1c23" strokeWidth="1" />
                  <circle cx="490" cy="300" r="9" fill="url(#brushed-al)" stroke="#1a1c23" strokeWidth="0.5" />
                  <circle cx="490" cy="300" r="4" fill="url(#precision-chrome)" />
                  <path d="M 487,297 C 484,297 484,303 487,303 L 493,303 C 496,303 496,297 493,297" fill="none" stroke="#111318" strokeWidth="2.5" strokeLinecap="round" />
                </g>

                {/* Arm base column (plinth mount) */}
                <g id="tonearm-arm-base-column" filter="url(#shadow-md)">
                  <rect x={TPX - 16} y={TPY + 18} width="32" height="12" rx="3" fill="url(#brushed-al)" stroke="#1e222a" strokeWidth="0.6" />
                  <rect x={TPX - 16} y={TPY - 10} width="32" height="30" rx="5" fill="url(#anodized-dark)" stroke="#252830" strokeWidth="0.6" />
                  <ellipse cx={TPX} cy={TPY - 8} rx="19" ry="6" fill="url(#precision-chrome)" stroke="#3a3e4c" strokeWidth="0.5" />
                  {/* Mounting screws — always stationary */}
                  <circle cx={TPX - 20} cy={TPY + 24} r="3.5" fill="url(#precision-chrome)" stroke="#4a5262" strokeWidth="0.4" />
                  <circle cx={TPX + 20} cy={TPY + 24} r="3.5" fill="url(#precision-chrome)" stroke="#4a5262" strokeWidth="0.4" />
                </g>

                {/* Housing plate — small horizontal backing tucked behind right edge of base ring (rotated 90° to fit under cue) */}
                <path d="M -12,0 L 0,0 L 0,22 L -12,22 Z" fill="url(#dark-alloy)" stroke="#1a1c23" strokeWidth="0.8" filter="url(#shadow-sm)" transform={`translate(${TPX + 32}, ${TPY + 12}) rotate(90)`} />

                {/* Pivot housing — the deck-mounted bearing socket. DOES NOT rotate. */}
                <g id="tonearm-pivot-housing" filter="url(#shadow-md)">
                  <circle cx={TPX} cy={TPY} r="34" fill="url(#dark-alloy)" stroke="#0e1015" strokeWidth="0.8" />
                  <circle cx={TPX} cy={TPY} r="30" fill="none" stroke="url(#precision-chrome)" strokeWidth="6" />
                  {Array.from({ length: 24 }, (_, i) => {
                    const a = (i * 360) / 24; const rad = (a * Math.PI) / 180;
                    const x1 = +(TPX + Math.cos(rad) * 27).toFixed(3); const y1 = +(TPY + Math.sin(rad) * 27).toFixed(3);
                    const x2 = +(TPX + Math.cos(rad) * 33).toFixed(3); const y2 = +(TPY + Math.sin(rad) * 33).toFixed(3);
                    return <line key={i} x1={x1} y1={y1} x2={x2} y2={y2} stroke="#0e1015" strokeWidth="0.5" opacity="0.7" />;
                  })}
                </g>

                {/* Anti-skate control — deck-mounted, never rotates */}
                <g id="anti-skate-system">
                  <g id="anti-skate-control" filter="url(#shadow-sm)">
                    <g id="a-skate-dial" style={{ cursor: 'grab', touchAction: 'none' }}
                    onMouseDown={handleAntiSkateMouseDown}>
                    <circle cx={TPX + 45} cy={TPY + 50} r="9" fill="url(#anodized-dark)" stroke="#252830" strokeWidth="0.5" />
                    <circle cx={TPX + 45} cy={TPY + 50} r="6.5" fill="url(#brass)" stroke="#4a3a18" strokeWidth="0.4" />
                    <g transform={`rotate(${antiSkateAngle} ${TPX + 45} ${TPY + 50})`}>
                      <line x1={TPX + 45} y1={TPY + 46} x2={TPX + 45} y2={TPY + 53} stroke="#1e1410" strokeWidth="1" />
                    </g>
                    <circle cx={TPX + 45} cy={TPY + 50} r="1.2" fill="#1a1410" />
                    <text x={TPX + 45} y={TPY + 65} textAnchor="middle" fontSize="4" fill="#5a6478" fontFamily="monospace" letterSpacing="0.4">A-SKATE</text>
                  </g>
                </g>

                {/* Static cue arc (lift path indicator) */}
                <g id="cueing-arc">
                  <path d={`M ${TPX - 12},${TPY + 8} Q ${TPX},${TPY + 14} ${TPX + 12},${TPY + 8}`} fill="none" stroke="url(#precision-chrome)" strokeWidth="1.2" strokeLinecap="round" />
                </g>

              </g>
              {/* End #tonearm-static-base */}

              {/* ─────────────────────────────────────────────────────────
                  #cueing-lever — independent cueing lever.
                  Sits ABOVE static base but BELOW rotating arm.
                  It pivots at its own hinge, independent of arm angle.
                  Painter's order: cue base (static) → cue lever → rotating arm
                  ══════════════════════════════════════════════════════════ */}
              {/* ─────────────────────────────────────────────────────────
                  Cue mechanism — split into two physically separate parts:
                    1. #cue-lift-platform — translates straight up/down only
                       (chrome hydraulic piston + matte rubber crescent).
                    2. #cue-lever-handle — rotates only at its base pivot.
                  Sits ABOVE static base but BELOW rotating arm.
                  ══════════════════════════════════════════════════════════ */}
              <text x="522" y="115" textAnchor="middle" fontSize="5" fill="#5a6478" fontFamily="sans-serif" letterSpacing="0.6">CUE</text>



              {/* ─────────────────────────────────────────────────────────
                  #tonearm-assembly — THE ONLY GROUP THAT ROTATES.
                  ONE authoritative transform: rotate(displayAngle, TPX, TPY).
                  Every child inherits this movement. No child has its own
                  animated transform.
                  ══════════════════════════════════════════════════════════ */}
              <g id="tonearm-static-base" filter="url(#shadow-sm)">
                <circle cx={TPX} cy={TPY} r="24" fill="url(#dark-alloy)" stroke="#252830" strokeWidth="0.6" />
                <circle cx={TPX} cy={TPY} r="20" fill="none" stroke="url(#precision-chrome)" strokeWidth="2.4" />
                {[
                  [TPX - 28, TPY, 0], [TPX, TPY + 28, 90], [TPX, TPY - 28, 270],
                ].map(([sx, sy], i) => (
                  <circle key={i} cx={sx as number} cy={sy as number} r="2.4" fill="url(#precision-chrome)" stroke="#4a5262" strokeWidth="0.4" />
                ))}
              </g>

              {/* WRAPPER: Handles strictly the vertical lift illusion (shadow + translation) */}
              <g id="tonearm-lift-wrapper"
                onTransitionEnd={(e) => {
                  if (e.propertyName === 'transform' && isLifted === false && cuePhase === 'cueing') {
                    // Needle finished the full drop: lifted → dropped onto vinyl.
                    // Only now is the headshell physically touching the disk.
                    setCuePhase('onDisk');
                    if (audioRef.current) {
                      // Open the headshell-on-vinyl gate SYNCHRONOUSLY here.
                      // The cuePhase-driven useEffect runs after the next
                      // render, but onPlay() is called right now and the
                      // gate check inside playTrack() needs the open state
                      // visible immediately or it blocks the play() call.
                      (audioRef.current as any)._headshellOnDisk = true;
                      (audioRef.current as any)._gagged = false;
                      audioRef.current.muted = false;
                      audioRef.current.playbackRate = 1;
                    }
                    if (onPlay) onPlay();
                    else if (onTogglePlay) onTogglePlay();
                  }
                }}
                style={{ transformOrigin: '490px 75px', transform: isLifted ? 'scale(1.03)' : 'scale(1)', filter: isLifted ? 'drop-shadow(15px 25px 12px rgba(0,0,0,0.35))' : 'drop-shadow(4px 6px 4px rgba(0,0,0,0.6))', transition: (isPowered || isResting) ? ('transform ' + (isQuickLift ? '0.22s' : '1.5s') + ' cubic-bezier(0.25, 0.1, 0.25, 1), filter ' + (isQuickLift ? '0.22s' : '1.5s') + ' cubic-bezier(0.25, 0.1, 0.25, 1)') : 'none' }}>
                {/* INNER GROUP: Handles strictly the rotation, locked to 490,75 */}
                <g id="tonearm-assembly" style={{ transform: `rotate(${(isPowered || isResting) ? armAngle : 0}deg)`, transformOrigin: '490px 75px', transition: (isPowered || isResting) ? ('transform ' + (isQuickLift ? '0.22s' : '1.5s') + ' cubic-bezier(0.25, 0.1, 0.25, 1)') : 'none' }}>
                {/* Bearing carrier (rotates with arm — visually inside the
                    static pivot housing ring). */}
                <g id="tonearm-bearing-carrier" filter="url(#shadow-sm)">
                  <circle cx={TPX} cy={TPY} r="16" fill="url(#polished-al)" stroke="#3a3e4c" strokeWidth="0.5" />
                  <circle cx={TPX} cy={TPY} r="9" fill="#060810" stroke="#0e1015" strokeWidth="0.4" />
                  <ellipse cx={TPX - 3} cy={TPY - 3} rx="5" ry="3" fill="rgba(220,228,248,0.5)" />
                </g>

                {/* Counterweight assembly — main tubular sleeve viewed from overhead */}
                <g id="counterweight-assembly" filter="url(#shadow-md)">
                  {/* Main cylindrical weight barrel viewed from top */}
                  <rect x={TPX - 9} y={TPY - CW_LEN} width={18} height={CW_LEN} rx="3" fill="url(#precision-chrome)" stroke="#1a1c23" strokeWidth="0.8" />

                  {/* Knurled adjustment grip section in the middle */}
                  <rect x={TPX - 8} y={TPY - CW_LEN + 22} width={16} height="20" fill="#2c3040" />
                  {/* Fine knurling lines */}
                  <line x1={TPX - 7.5} y1={TPY - CW_LEN + 22} x2={TPX - 7.5} y2={TPY - CW_LEN + 32} stroke="#111318" strokeWidth="0.5" />
                  <line x1={TPX - 5.5} y1={TPY - CW_LEN + 22} x2={TPX - 5.5} y2={TPY - CW_LEN + 32} stroke="#111318" strokeWidth="0.5" />
                  <line x1={TPX - 3.5} y1={TPY - CW_LEN + 22} x2={TPX - 3.5} y2={TPY - CW_LEN + 32} stroke="#111318" strokeWidth="0.5" />
                  <line x1={TPX - 1.5} y1={TPY - CW_LEN + 22} x2={TPX - 1.5} y2={TPY - CW_LEN + 32} stroke="#111318" strokeWidth="0.5" />
                  <line x1={TPX + 0.5} y1={TPY - CW_LEN + 22} x2={TPX + 0.5} y2={TPY - CW_LEN + 32} stroke="#111318" strokeWidth="0.5" />
                  <line x1={TPX + 2.5} y1={TPY - CW_LEN + 22} x2={TPX + 2.5} y2={TPY - CW_LEN + 32} stroke="#111318" strokeWidth="0.5" />
                  <line x1={TPX + 4.5} y1={TPY - CW_LEN + 22} x2={TPX + 4.5} y2={TPY - CW_LEN + 32} stroke="#111318" strokeWidth="0.5" />
                  <line x1={TPX + 6.5} y1={TPY - CW_LEN + 22} x2={TPX + 6.5} y2={TPY - CW_LEN + 32} stroke="#111318" strokeWidth="0.5" />

                  {/* Number markings and scale ring */}
                  <g id="counterweight-scale" opacity="0.85">
                    <line x1={TPX - 9} y1={TPY - CW_LEN + 12} x2={TPX - 7} y2={TPY - CW_LEN + 12} stroke="#ffffff" strokeWidth="0.5" />
                    <line x1={TPX - 9} y1={TPY - CW_LEN + 14} x2={TPX - 7.5} y2={TPY - CW_LEN + 14} stroke="#ffffff" strokeWidth="0.4" />
                    <line x1={TPX - 9} y1={TPY - CW_LEN + 16} x2={TPX - 7} y2={TPY - CW_LEN + 16} stroke="#ffffff" strokeWidth="0.5" />
                  </g>

                  {/* Rear end cap */}
                  <g id="counterweight-end-cap">
                    <rect x={TPX - 8.5} y={TPY - CW_LEN + 2} width="17" height="4" rx="2" fill="#111318" stroke="#333" strokeWidth="0.5" />
                  </g>
                </g>

                {/* ════════════════════════════════════════════════════════
                    #tonearm-arm-tube — Premium precision-machined arm
                    Redesigned as a filled tapered tube polygon with proper
                    3D volumetric shading. Not a stroked path.
                    Architecture:
                      - Filled polygon body (tapered left/right offset curves)
                      - Left edge: upper/light-facing surface
                      - Right edge: lower/shadow-facing surface
                      - Highlight band: specular region along center-top
                      - Pivot collar: machined connector to bearing
                      - Headshell stub: precision transition to headshell
                    All coordinates: pivot=(TPX,TPY), arm_len=WAND_LEN,
                    centerline curves right then converges to headshell.
                    ════════════════════════════════════════════════════════ */}
                <g id="tonearm-arm-tube"
                   onClick={handleArmClick}
                   style={{ cursor: isPowered ? 'pointer' : 'default' }}
                >
                  {/* 1. Ambient Drop Shadow */}
                  <path d="M 490,75 L 490,295" fill="none" stroke="rgba(0,0,0,0.6)" strokeWidth="10" strokeLinecap="round" transform="translate(6, 6)" filter="blur(3px)" />
                  {/* 2. Base Pipe (Dark outer edge for volumetric depth) */}
                  <path d="M 490,75 L 490,295" fill="none" stroke="#111318" strokeWidth="9" strokeLinecap="round" />
                  {/* 3. Midtone Machined Metal */}
                  <path d="M 490,75 L 490,295" fill="none" stroke="#2d323d" strokeWidth="7" strokeLinecap="round" />
                  {/* 4. Bright Core Metallic Reflection */}
                  <path d="M 490,75 L 490,295" fill="none" stroke="#6a7387" strokeWidth="4" strokeLinecap="round" />
                  {/* 5. God-Tier Specular Highlight (Offset slightly left to simulate directional lighting) */}
                  <path d="M 490,75 L 490,295" fill="none" stroke="#ffffff" strokeWidth="1.2" strokeLinecap="round" transform="translate(-1.5, -0.5)" filter="drop-shadow(0px 0px 2px rgba(255,255,255,0.6))" />
                </g>

                {/* Headshell — rigid child of arm. NO independent rotation.
                    Local origin: arm tip (TPX, TPY + WAND_LEN).
                    Cartridge faces forward with natural alignment to record groove. */}
                <g id="headshell-assembly" transform="translate(490, 282)"
                   onClick={handleHeadshellClick}
                   style={{ cursor: isPowered ? 'pointer' : 'default' }}
                >
                  <g transform="scale(1.4)">
                    <g id="bayonet-collar">
                      {/* Plug inserted inside the tube */}
                      <rect x="-3.5" y="-4" width="7" height="8" fill="#111318" />
                      {/* Well-rounded locking collar matching the arm tube diameter */}
                      <rect x="-4.5" y="3" width="9" height="7" rx="1.5" fill="url(#precision-chrome)" stroke="#1a1c23" strokeWidth="0.5" />
                      {/* Tighter, more realistic knurled grip lines */}
                      <line x1="-3.2" y1="3" x2="-3.2" y2="10" stroke="#111318" strokeWidth="0.4" />
                      <line x1="-2.4" y1="3" x2="-2.4" y2="10" stroke="#111318" strokeWidth="0.4" />
                      <line x1="-1.6" y1="3" x2="-1.6" y2="10" stroke="#111318" strokeWidth="0.4" />
                      <line x1="-0.8" y1="3" x2="-0.8" y2="10" stroke="#111318" strokeWidth="0.4" />
                      <line x1="0" y1="3" x2="0" y2="10" stroke="#111318" strokeWidth="0.4" />
                      <line x1="0.8" y1="3" x2="0.8" y2="10" stroke="#111318" strokeWidth="0.4" />
                      <line x1="1.6" y1="3" x2="1.6" y2="10" stroke="#111318" strokeWidth="0.4" />
                      <line x1="2.4" y1="3" x2="2.4" y2="10" stroke="#111318" strokeWidth="0.4" />
                      <line x1="3.2" y1="3" x2="3.2" y2="10" stroke="#111318" strokeWidth="0.4" />
                      {/* Base flange connecting to the headshell body */}
                      <path d="M -4.5,10 L 4.5,10 L 5,14 L -5,14 Z" fill="#2c3040" />
                    </g>
                    <g transform="rotate(23 0 8.5)">
                      {/* CARTRIDGE & STYLUS — top-down orthographic */}
                      <g id="cartridge-assembly">
                        {/* Gold cartridge body */}
                        <rect x="-4.5" y="12" width="9" height="20" fill="#b89947" rx="1" />
                        {/* Dark inner recess */}
                        <rect x="-3" y="15" width="6" height="15" fill="#111318" />
                        {/* Diamond stylus tip — flat top-down */}
                        <path d="M 0,34.5 L 1.2,36.5 L 0,38.5 L -1.2,36.5 Z" fill="#e5e7eb" />
                        {/* Diamond center dot */}
                        <circle cx="0" cy="36.5" r="0.4" fill="#d4d4d8" />
                      </g>
                      {/* HEADSHELL BODY */}
                      <g id="headshell-body">
                        <path d="M -5,8.5 L 5,8.5 L 7.5,14 L 7.5,33 C 7.5,34 6.5,35 0,35 C -6.5,35 -7.5,34 -7.5,33 L -7.5,14 Z" fill="#2c3040" stroke="#1a1c23" strokeWidth="0.5" />
                        <rect x="-4.5" y="15" width="2" height="12" rx="1" fill="#1a1c23" />
                        <rect x="2.5" y="15" width="2" height="12" rx="1" fill="#1a1c23" />
                        <circle cx="-3.5" cy="22" r="1.8" fill="url(#precision-chrome)" />
                        <line x1="-4.5" y1="22" x2="-2.5" y2="22" stroke="#222" strokeWidth="0.5" transform="rotate(45 -3.5 22)" />
                        <circle cx="3.5" cy="22" r="1.8" fill="url(#precision-chrome)" />
                        <line x1="2.5" y1="22" x2="4.5" y2="22" stroke="#222" strokeWidth="0.5" transform="rotate(-15 3.5 22)" />
                        <circle cx="0" cy="28" r="1.5" fill="#1a1c23" opacity="0.5" />
                      </g>
                      {/* MACHINED FINGER LIFT — flat top-down pill strip */}
                      <g id="headshell-finger-lift">
                        {/* Dark matte pill strip — flat top-down silhouette */}
                        <rect x="7" y="11" width="8" height="7" rx="1.2" fill="#0e1015" stroke="#252830" strokeWidth="0.4" />
                        {/* Thin center recess line (grip groove from above) */}
                        <line x1="9" y1="11.5" x2="9" y2="17.5" stroke="#04060c" strokeWidth="0.8" strokeLinecap="round" />
                        <line x1="13" y1="11.5" x2="13" y2="17.5" stroke="#04060c" strokeWidth="0.8" strokeLinecap="round" />
                        {/* Subtle center highlight */}
                        <line x1="11" y1="11.5" x2="11" y2="17.5" stroke="rgba(100,108,128,0.25)" strokeWidth="0.4" strokeLinecap="round" />
                      </g>
                    </g>
                    </g>
                </g>
                </g>
              </g>
              {/* End #tonearm-lift-wrapper */}
            </g>
            {/* End #tonearm-system */}
          </g>

            {/* PITCH FADER */}
            <g id="pitch-fader" onDoubleClick={() => { setPitch(0); if (setPlaybackRate) setPlaybackRate(1); }} style={{ cursor: 'pointer' }}>
              <rect
                x={PITCH_X - 4} y={PITCH_Y} width="8" height={PITCH_LEN} rx="3"
                fill="#06070b" stroke="#252830" strokeWidth="0.5"
                onClick={(e) => {
                  e.stopPropagation();
                  if (draggingPitchRef.current) return;
                  const svgEl = (e.currentTarget as SVGRectElement).closest("svg") as SVGSVGElement | null;
                  if (!svgEl) return;
                  const pt = svgEl.createSVGPoint();
                  pt.x = e.clientX; pt.y = e.clientY;
                  const ctm = svgEl.getScreenCTM();
                  if (!ctm) return;
                  const spt = pt.matrixTransform(ctm.inverse());
                  const dy = spt.y - (PITCH_Y + PITCH_LEN / 2);
                  const pct = Math.round(-(dy / (PITCH_LEN / 2)) * 8);
                  const next = Math.max(-8, Math.min(8, pct));
                  setPitch(next);
                  const rate = (rpm === 45 ? 1.35 : 1.0) * (1 + next / 100);
                  if (setPlaybackRate) setPlaybackRate(rate);
                }}
              />
              <rect x={PITCH_X - 2} y={PITCH_Y + 2} width="4" height={PITCH_LEN - 4} rx="2" fill="url(#anodized-dark)" />
              {Array.from({ length: 9 }, (_, i) => {
                const t = i / 8; const y = PITCH_Y + t * PITCH_LEN; const isMajor = i === 0 || i === 4 || i === 8;
                return <line key={i} x1={PITCH_X + 5} y1={y} x2={PITCH_X + (isMajor ? 14 : 9)} y2={y} stroke={isMajor ? "#7a8598" : "#3c4352"} strokeWidth={isMajor ? 0.8 : 0.5} />;
              })}
              <text x={PITCH_X + 17} y={PITCH_Y + 3} fontSize="6" fill="#7a8598" fontFamily="monospace">+8%</text>
              <text x={PITCH_X + 17} y={PITCH_Y + PITCH_LEN / 2 + 2} fontSize="6" fill="#7a8598" fontFamily="monospace">0</text>
              <text x={PITCH_X + 17} y={PITCH_Y + PITCH_LEN + 4} fontSize="6" fill="#7a8598" fontFamily="monospace">-8%</text>
              {/* Clickable drag handle on pitch slider */}
              <g
                style={{ transform: `translateX(${PITCH_X}px) translateY(${sliderY}px)`, transition: "transform 0.15s ease-out", cursor: "pointer" }}
                onMouseDown={(e) => {
                  e.preventDefault();
                  e.stopPropagation();
                  const svgEl = (e.currentTarget as SVGGElement).closest("svg") as SVGSVGElement | null;
                  if (!svgEl) return;
                  const onMove = (ev: MouseEvent) => {
                    const pt = (svgEl as SVGSVGElement).createSVGPoint();
                    pt.x = ev.clientX; pt.y = ev.clientY;
                    const ctm = (svgEl as SVGSVGElement).getScreenCTM();
                    if (!ctm) return;
                    const spt = pt.matrixTransform(ctm.inverse());
                    const dy = spt.y - (PITCH_Y + PITCH_LEN / 2);
                    const pct = Math.round(-(dy / (PITCH_LEN / 2)) * 8);
                    const next = Math.max(-8, Math.min(8, pct));
                    setPitch(next);
                    const rate = (rpm === 45 ? 1.35 : 1.0) * (1 + next / 100);
                    if (setPlaybackRate) setPlaybackRate(rate);
                  };
                  draggingPitchRef.current = true;
                  const onUp = () => {
                    draggingPitchRef.current = false;
                    window.removeEventListener("mousemove", onMove);
                    window.removeEventListener("mouseup", onUp);
                  };
                  window.addEventListener("mousemove", onMove);
                  window.addEventListener("mouseup", onUp);
                }}
              >
                <rect x={-9} y={-7} width="18" height="14" rx="2.5" fill="rgba(0,0,0,0.6)" opacity="0.5" filter="url(#shadow-sm)" />
                <rect x={-9} y={-7} width="18" height="14" rx="2.5" fill="url(#precision-chrome)" stroke="#3a3e4c" strokeWidth="0.5" />
                <line x1={-6} y1={0} x2={6} y2={0} stroke="#1a1d24" strokeWidth="1.2" />
                <line x1={-7} y1={-3.5} x2={-7} y2={3.5} stroke="#252830" strokeWidth="0.5" />
                <line x1={7} y1={-3.5} x2={7} y2={3.5} stroke="#252830" strokeWidth="0.5" />
                <rect x={-8} y={-6} width="16" height="3" rx="1.5" fill="rgba(255,255,255,0.35)" />
              </g>
              <text x={PITCH_X} y={PITCH_Y - 6} textAnchor="middle" fontSize="6" fill="#5a6478" fontFamily="sans-serif" letterSpacing="0.8">PITCH</text>
            </g>
          </svg>
          </div>

          {/* Bottom-left: Power + Play transport — scaled down for narrow mobile */}
          <div className="absolute left-1 bottom-1 z-30 flex items-end gap-3 origin-bottom-left transition-transform duration-300 sm:left-2 sm:bottom-2 md:scale-100" style={{ transform: 'scale(0.65)' }}>
            <div className="flex flex-col items-center gap-1">
              <div className="relative">
                <button onClick={handlePowerButton} aria-label={isPowered ? "Power off" : "Power on"} aria-pressed={isPowered} className="w-10 h-10 sm:w-12 sm:h-12 rounded-md flex items-center justify-center transition-all active:scale-[0.92] cursor-pointer overflow-hidden shadow-[0_2px_8px_rgba(0,0,0,0.6)]" style={{
                  background: isPowered ? 'linear-gradient(135deg, #3a3e4a 0%, #2a3040 50%, #0a0b12 100%)' : 'linear-gradient(135deg, #2a2e38 0%, #1a1d28 50%, #0c0e14 100%)',
                  border: '1px solid rgba(255,255,255,0.06)',
                }}>
                  <span className="w-6 h-6 sm:w-9 sm:h-9 rounded-sm flex items-center justify-center shadow-[inset_0_1px_4px_rgba(255,255,255,0.08)]" style={{
                    background: isPowered ? 'linear-gradient(180deg, #8a949c 0%, #5a6068 100%)' : 'linear-gradient(180deg, #4a5268 0%, #2c3038 100%)',
                    boxShadow: isPowered ? '0 0 6px 1px rgba(255,255,255,0.15), inset 0 -1px 2px rgba(0,0,0,0.5)' : 'inset 0 1px 3px rgba(0,0,0,0.6)',
                  }}>
                    <span className="w-2 h-2 sm:w-2.5 sm:h-2.5 rounded-full" style={{
                      background: isPowered ? '#ff3a3a' : '#1f2428',
                      boxShadow: isPowered ? '0 0 5px 2px rgba(255,58,58,0.7)' : 'none',
                    }} />
                  </span>
                </button>
              </div>
              <span className="text-[7px] font-mono text-neutral-500 tracking-[0.15em] uppercase">Power</span>
            </div>
            <div className={`flex flex-col items-center gap-1 ${isPowered ? '' : 'opacity-40 saturate-0 pointer-events-none'}`}>
              <button onClick={handleDeckPlayPause} aria-label={localTransport === 'playing' ? "Pause" : "Play"} className="w-12 h-12 sm:w-14 sm:h-14 rounded-md border border-white/[0.08] flex items-center justify-center transition-all hover:scale-105 active:scale-95" style={{ background: "linear-gradient(180deg, #2c3542 0%, #161822 50%, #0e1015 100%)", boxShadow: localTransport === 'playing' ? "inset 0 0 12px rgba(0,216,246,0.25), 0 0 10px rgba(0,216,246,0.2), 0 3px 8px rgba(0,0,0,0.5)" : "inset 0 0 6px rgba(0,0,0,0.7), 0 3px 8px rgba(0,0,0,0.5)" }}>
                {localTransport === 'playing' ? (
                  <div className="flex gap-1"><div className="w-1 h-4 rounded-sm bg-cyan-400" /><div className="w-1 h-4 rounded-sm bg-cyan-400" /></div>
                ) : (
                  <div className="w-0 h-0 ml-0.5" style={{ borderLeft: "8px solid #00d8f6", borderTop: "6px solid transparent", borderBottom: "6px solid transparent", filter: "drop-shadow(0 0 4px rgba(0,216,246,0.6))" }} />
                )}
              </button>
              <span className="text-[7px] font-mono tracking-[0.15em] uppercase">{localTransport === 'playing' ? "Pause" : "Play"}</span>
            </div>
            {/* STOP — right next to play, same gap as power→play (gap-3 = 12px) */}
            <div className={`flex flex-col items-center gap-1 pointer-events-auto ${isPowered ? '' : 'opacity-40 saturate-0 pointer-events-none'}`}>
              <button
                onClick={isPowered ? handleDeckStop : undefined}
                aria-label="Stop"
                className="w-10 h-10 sm:w-12 sm:h-12 rounded-full border border-zinc-950/60 flex items-center justify-center transition-all hover:scale-105 active:scale-95 outline-none focus:outline-none focus:ring-0"
                style={{
                  background: "linear-gradient(180deg, #2c3542 0%, #161822 50%, #0e1015 100%)",
                  boxShadow: !isPlaying
                    ? "inset 0 0 8px rgba(239,68,68,0.3), 0 0 6px rgba(239,68,68,0.25), 0 1px 2px rgba(0,0,0,0.5)"
                    : "inset 0 0 4px rgba(0,0,0,0.7), 0 1px 2px rgba(0,0,0,0.5)",
                }}
              >
                <div className={`w-4 h-4 sm:w-5 sm:h-5 rounded-sm transition-all duration-200 ${
                  !isPowered
                    ? "bg-zinc-800 shadow-[inset_0_1px_2px_rgba(0,0,0,0.8)]"
                    : (isPlaying || currentTime > 0)
                      ? "bg-red-900 shadow-[inset_0_1px_2px_rgba(0,0,0,0.5)]"
                      : "bg-red-500 shadow-[0_0_15px_3px_rgba(239,68,68,0.8)]"
                }`} />
              </button>
              <span className="text-[7px] font-mono text-neutral-500 tracking-[0.15em] uppercase">STOP</span>
            </div>
          </div>

          {/* Bottom-right: BPM/Tempo — scaled down for narrow mobile */}
          <div className={`absolute right-1 bottom-1 z-30 flex flex-col items-center gap-0.5 pointer-events-auto origin-bottom-right transition-transform duration-300 sm:right-2 sm:bottom-2 md:scale-100 ${isPowered ? '' : 'opacity-40 saturate-0 pointer-events-none'}`} style={{ transform: 'scale(0.65)', transformOrigin: '100% 100%' }}>
            <div className="relative w-12 h-7 sm:w-16 sm:h-10 rounded-md border border-white/[0.08] flex flex-col items-center justify-center px-0.5 whitespace-nowrap overflow-hidden" style={{ background: isPowered ? "linear-gradient(180deg, #02060a 0%, #000000 100%)" : "linear-gradient(180deg, #181818 0%, #0a0a0a 100%)", boxShadow: isPowered ? "inset 0 0 8px rgba(0,0,0,0.9), 0 0 4px rgba(0,216,246,0.18)" : "inset 0 0 4px rgba(0,0,0,0.5)" }}>
              {/* Status LED — flashes when RPM changes to show hardware linkage */}
              <span aria-hidden="true" className={`absolute top-1 right-1 w-1 h-1 rounded-full ${rpmFlash ? "bg-cyan-300 shadow-[0_0_6px_2px_rgba(0,216,246,0.9)]" : "bg-zinc-700"}`} />
              <span className={`text-[6px] sm:text-[7px] font-mono tracking-[0.2em] uppercase leading-none ${isPowered ? 'text-neutral-500' : 'text-neutral-600'}`}>BPM</span>
              <span className={`text-[9px] sm:text-[11px] font-mono leading-none tabular-nums tracking-tight transition-all duration-300 ${isPowered ? (bpm === 'CAL' ? 'text-[#00ffaa] animate-pulse' : (Number(bpm) > 0 && isPlaying ? 'text-[#00ffaa]' : 'text-green-900')) : 'text-neutral-600'}`} style={{ textShadow: isPowered && (Number(bpm) > 0 || bpm === 'CAL') && isPlaying ? '0 0 10px rgba(0, 255, 170, 0.6)' : 'none' }}>
                {liveBpmDisplay}
              </span>
              <span className={`text-[7px] sm:text-[9px] font-mono leading-none tabular-nums transition-opacity duration-300 ${pitch === 0 ? 'opacity-0' : (isPowered ? (pitch > 0 ? 'text-cyan-300' : 'text-amber-300') : 'text-neutral-700/30')}`} style={{ textShadow: isPowered && pitch !== 0 ? `0 0 6px ${pitch > 0 ? 'rgba(0,216,246,0.85)' : 'rgba(251,191,36,0.85)'}` : isPowered ? '0 0 3px rgba(0,216,246,0.4)' : 'none' }}>
                {pitch === 0 ? '±0.0%' : `${pitch > 0 ? '+' : ''}${pitch.toFixed(1)}%`}
              </span>
            </div>
            <span className={`text-[7px] font-mono tracking-[0.15em] uppercase ${isPowered ? 'text-neutral-500' : 'text-neutral-600'}`}>Tempo</span>
          </div>

          {/* RPM — left of BPM screen. Scaled for narrow mobile */}
          <div className={`absolute bottom-2 right-16 z-30 flex gap-1 pointer-events-auto origin-bottom-right transition-transform duration-300 sm:bottom-5 sm:right-28 md:scale-100 ${isPowered ? '' : 'opacity-40 saturate-0 pointer-events-none'}`} style={{ transform: 'scale(0.65)', transformOrigin: '100% 100%' }}>
            {[33, 45].map((r) => {
              // Locked out unless the deck is in a full stop state.
              const isFullStop = !isPlaying && currentTime === 0;
              const isLocked = !isFullStop;
              return (
                <button
                  key={r}
                  onClick={() => {
                    if (!isPowered) return;
                    // Speed-change restriction: 33 / 45 RPM can only change
                    // the motor's target speed when the turntable is in a
                    // full stop state. Ignored during play / pause.
                    if (!isFullStop) return;
                    setRpm(r as 33 | 45);
                    setSpeed(r as 33 | 45);
                    setRpmFlash(true);
                    setTimeout(() => setRpmFlash(false), 200);
                  }}
                  aria-label={`${r} RPM`}
                  aria-pressed={speed === r}
                  aria-disabled={isLocked}
                  title={isLocked ? "Stop the deck before changing speed" : `${r} RPM`}
                  className={`w-7 h-4 sm:w-9 sm:h-5 rounded text-[9px] sm:text-[10px] font-mono font-bold transition-all ${speed === r ? "text-cyan-300" : "text-neutral-500"} hover:text-neutral-300 ${isLocked ? "cursor-not-allowed opacity-50" : ""}`}
                  style={{
                    background: speed === r ? "linear-gradient(180deg, #0a3540 0%, #082832 100%)" : "linear-gradient(180deg, #1a1c24 0%, #0c0d12 100%)",
                    boxShadow: speed === r ? "inset 0 3px 6px rgba(0,0,0,0.8), 0 0 4px rgba(0,216,246,0.2)" : "inset 0 0 4px rgba(0,0,0,0.6)",
                    border: speed === r ? "1px solid rgba(0,216,246,0.4)" : "1px solid rgba(255,255,255,0.05)",
                    pointerEvents: isLocked ? "none" : "auto",
                  }}
                >
                  {r}
                </button>
              );
            })}
          </div>

        </div>
      </div>
      <div className={`absolute left-3 bottom-3 right-3 top-3 w-2 h-2 rounded-full border border-white/[0.05] shadow-[0_2px_4px_rgba(0,0,0,0.6)]`} style={{ background: "radial-gradient(circle, #2a3038 0%, #0a0c10 100%)" }} />
    </div>
  );
}
