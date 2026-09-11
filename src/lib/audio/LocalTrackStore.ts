"use client";

// Browser-local IndexedDB persistence for local tracks.
// Stores File/Blob + metadata; NEVER uploads to server.
// No auth required — entirely device-local.

const DB_NAME = "MedfenderLocalLibrary";
const DB_VER = 1;
const STORE = "tracks";

export interface PersistedTrack {
  id: string;
  file: File; // stored as Blob via structured clone / File interface
  name: string;
  artist?: string;
  thumbnailUrl?: string | null; // Apple/user selected cover URL (persisted)
  embeddedArtworkUrl?: string | null; // extracted embedded art data URL (persisted)
  duration?: number;
  importedAt: number;
}

function openDB(): Promise<IDBDatabase> {
  return new Promise((resolve, reject) => {
    if (typeof window === "undefined" || !window.indexedDB) return reject(new Error("IndexedDB unavailable"));
    const req = window.indexedDB.open(DB_NAME, DB_VER);
    req.onerror = () => reject(req.error || new Error("IDB open failed"));
    req.onsuccess = () => resolve(req.result);
    req.onupgradeneeded = (e) => {
      const db = (e.target as IDBOpenDBRequest).result;
      if (!db.objectStoreNames.contains(STORE)) {
        db.createObjectStore(STORE, { keyPath: "id" });
      }
    };
  });
}

export async function saveTrack(track: PersistedTrack): Promise<void> {
  try {
    const db = await openDB();
    const tx = db.transaction(STORE, "readwrite");
    const store = tx.objectStore(STORE);
    store.put(track);
    return new Promise((res, rej) => {
      tx.oncomplete = () => res();
      tx.onerror = () => rej(tx.error);
    });
  } catch {
    // Graceful fallback — session-only if IDB unavailable
  }
}

export async function loadTracks(): Promise<PersistedTrack[]> {
  try {
    const db = await openDB();
    const tx = db.transaction(STORE, "readonly");
    const store = tx.objectStore(STORE);
    const req = store.getAll();
    return new Promise((res, rej) => {
      req.onsuccess = () => res(req.result || []);
      req.onerror = () => rej(req.error);
    });
  } catch {
    return [];
  }
}

export async function removeTrack(id: string): Promise<void> {
  try {
    const db = await openDB();
    const tx = db.transaction(STORE, "readwrite");
    const store = tx.objectStore(STORE);
    store.delete(id);
    return new Promise((res, rej) => {
      tx.oncomplete = () => res();
      tx.onerror = () => rej(tx.error);
    });
  } catch {}
}

export async function clearAllTracks(): Promise<void> {
  try {
    const db = await openDB();
    const tx = db.transaction(STORE, "readwrite");
    const store = tx.objectStore(STORE);
    store.clear();
    return new Promise((res, rej) => {
      tx.oncomplete = () => res();
      tx.onerror = () => rej(tx.error);
    });
  } catch {}
}
