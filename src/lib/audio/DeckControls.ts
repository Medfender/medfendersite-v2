"use client";

/**
 * DeckControls — a lightweight shared singleton that lets the Turntable
 * register its choreography handlers, and any page button (StickyTransport,
 * PlaylistPanel, etc.) dispatch into them. This way the tonearm animation
 * runs from a single physical source of truth even when the user clicks
 * "play" outside the turntable itself.
 *
 * Handlers:
 *   - play():     trigger the lift → rotate → drop sequence (stop→play)
 *   - pause():    trigger the lift + hold near disk (play→paused)
 *   - toggle():   play/pause toggle depending on current state
 *   - stop():     trigger the full rest animation (any→stopped)
 *
 * The Turntable registers once on mount. Page buttons read from the
 * singleton; if no turntable is mounted, the no-op fallback runs.
 */

type DeckHandlers = {
  play: () => void;
  pause: () => void;
  toggle: () => void;
  stop: () => void;
};

const noop = () => {};

const singleton: { handlers: DeckHandlers | null } = { handlers: null };

export const deckControls = {
  register(handlers: DeckHandlers) {
    singleton.handlers = handlers;
  },
  unregister() {
    singleton.handlers = null;
  },
  play() {
    singleton.handlers?.play() ?? noop();
  },
  pause() {
    singleton.handlers?.pause() ?? noop();
  },
  toggle() {
    singleton.handlers?.toggle() ?? noop();
  },
  stop() {
    singleton.handlers?.stop() ?? noop();
  },
};
