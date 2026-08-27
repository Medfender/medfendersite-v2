import { NextResponse } from "next/server";
import fs from "fs";
import path from "path";

/**
 * GET /api/audio/featured
 *
 * Dynamically scans `public/audio/featured-artists/` (falls back to
 * `public/audio/featured/`) and `public/images/Thumbnails/`,
 * matches thumbnails by fuzzy filename/title stem, and returns
 * clean player-ready objects.
 */
export async function GET() {
  const audioDirPrimary = path.join(process.cwd(), "public", "audio", "featured-artists");
  const audioDirFallback = path.join(process.cwd(), "public", "audio", "featured");
  const thumbDir = path.join(process.cwd(), "public", "images", "Thumbnails");

  // Prefer featured-artists; fall back to featured
  let audioDir = audioDirPrimary;
  let audioFiles: string[] = [];
  try {
    audioFiles = fs.readdirSync(audioDir);
  } catch (e1) {
    try {
      audioDir = audioDirFallback;
      audioFiles = fs.readdirSync(audioDir);
    } catch (e2) {
      console.warn("[audio/featured] Both audio directories missing:", audioDirPrimary, audioDirFallback, e2);
      return NextResponse.json({ tracks: [], count: 0, audioDir: audioDirPrimary, thumbDir });
    }
  }

  let thumbFiles: string[] = [];
  try {
    thumbFiles = fs.readdirSync(thumbDir);
  } catch (e) {
    console.warn("[audio/featured] Thumbnail directory missing:", thumbDir, e);
  }

  const audioExts = new Set(["mp3", "flac", "wav", "m4a", "aac", "ogg"]);
  const thumbExts = new Set(["jpg", "jpeg", "png", "webp"]);

  const validAudio = audioFiles.filter((f) => {
    try { if (fs.lstatSync(path.join(audioDir, f)).isSymbolicLink()) return false; } catch { /* ignore */ }
    const ext = f.split(".").pop()?.toLowerCase();
    return ext && audioExts.has(ext);
  });

  const thumbNames = thumbFiles
    .filter((f) => {
      const ext = f.split(".").pop()?.toLowerCase();
      return ext && thumbExts.has(ext);
    })
    .map((f) => f.replace(/\.[^.]+$/, ""));

  const defaultThumb = null;

  const tracks = validAudio.map((f, i) => {
    const cleanName = f.replace(/\.(mp3|wav|m4a|flac|ogg|aac)$/i, "").trim();
    const parts = cleanName.split(" - ");
    let artist = "MedFender";
    let title = cleanName;
    if (parts.length >= 2) {
      artist = parts[0].trim();
      title = parts.slice(1).join(" - ").trim();
    }
    const baseName = cleanName;

    let thumbFile: string | null = null;
    const cleanBase = baseName.toLowerCase().replace(/[^a-z0-9]/g, "");
    for (const thumbName of thumbNames) {
      const cleanThumb = thumbName.toLowerCase().replace(/[^a-z0-9]/g, "");
      if (cleanThumb === cleanBase) {
        const realThumb = thumbFiles.find(
          (tf) => tf.replace(/\.[^.]+$/, "").toLowerCase() === thumbName.toLowerCase()
        );
        if (realThumb) thumbFile = realThumb;
        break;
      }
      if (cleanThumb.includes(cleanBase.slice(0, 8)) || cleanBase.includes(cleanThumb.slice(0, 8))) {
        const realThumb = thumbFiles.find(
          (tf) => tf.replace(/\.[^.]+$/, "").toLowerCase() === thumbName.toLowerCase()
        );
        if (realThumb) thumbFile = realThumb;
        break;
      }
    }

    const coverUrl = thumbFile ? `/images/Thumbnails/${thumbFile}` : defaultThumb;

    return {
      id: `track-${i + 1}`,
      title,
      artist,
      filename: f,
      url: `/audio/featured-artists/${f}`,
      coverUrl,
    };
  });

  console.log(`[audio/featured] Scanned ${audioDir} (${validAudio.length} audio) and ${thumbDir} (${thumbFiles.length} thumb). Returning ${tracks.length} tracks.`);

  return NextResponse.json({
    tracks,
    count: tracks.length,
    audioDir,
    thumbDir,
  });
}
