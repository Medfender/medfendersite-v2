import { NextResponse } from "next/server";
import fs from "fs";
import path from "path";

function parseName(raw: string): { name: string; gearTag: string } {
  const stripped = raw.replace(/^\d+[\.\s\-_]+/, "").trim();
  if (stripped.includes(" - ")) {
    const [name, ...rest] = stripped.split(" - ");
    return { name: name.trim() || "Untitled", gearTag: rest.join(" - ").trim() || "Medfender" };
  }
  return { name: stripped || "Untitled", gearTag: "Medfender" };
}

function findThumbnail(dir: string, baseName: string): string | null {
  for (const ext of ["jpg", "jpeg", "png", "webp"]) {
    const candidate = path.join(/* turbopackIgnore: true */ dir, `${baseName}.${ext}`);
    if (fs.existsSync(/* turbopackIgnore: true */ candidate)) return encodeURI(`/images/Thumbnails/${baseName}.${ext}`);
  }
  return null;
}

function findCover(dir: string, baseName: string): string | null {
  for (const ext of ["jpg", "jpeg", "png", "webp"]) {
    const candidate = path.join(/* turbopackIgnore: true */ dir, `${baseName}.${ext}`);
    if (fs.existsSync(/* turbopackIgnore: true */ candidate)) return encodeURI(`/audio/featured/${baseName}.${ext}`);
  }
  return null;
}

export async function GET() {
  const thumbDir = path.join(process.cwd(), "public", "images", "Thumbnails");
  const audioDir = path.join(process.cwd(), "public", "audio", "featured");

  // Build thumbnail mapping from /images/Thumbnails/
  let thumbFiles: string[] = [];
  try { thumbFiles = fs.readdirSync(/* turbopackIgnore: true */ thumbDir); } catch { /* ignore */ }

  const thumbMap = new Map<string, string>();
  for (const f of thumbFiles) {
    const base = f.replace(/\.[^.]+$/, "");
    thumbMap.set(base.toLowerCase(), encodeURI(`/images/Thumbnails/${f}`));
  }

  let files: string[] = [];
  try { files = fs.readdirSync(audioDir); } catch { return NextResponse.json({ tracks: [] }); }

  const audioExts = new Set(["mp3", "flac", "wav", "m4a", "aac", "ogg"]);

  const tracks = files
    .filter((f) => audioExts.has(f.split(".").pop()?.toLowerCase() ?? ""))
    .map((f, i) => {
      const ext = "." + f.split(".").pop()!.toLowerCase();
      const raw = f.slice(0, -ext.length);
      const { name, gearTag } = parseName(raw);
      const audioUrl = encodeURI(`/audio/featured/${f}`);
      const coverUrl = findCover(audioDir, raw) ?? null;

      // Dynamic thumbnail mapping from /images/Thumbnails/
      const thumbKey = raw.toLowerCase();
      let thumbnailUrl = thumbMap.get(thumbKey);
      if (!thumbnailUrl) {
        // Fallback: try partial keyword match against thumbnail filenames
        for (const [k, url] of thumbMap) {
          if (thumbKey.includes(k) || k.includes(thumbKey.replace(/\s+/g, "").slice(0, 6))) {
            thumbnailUrl = url; break;
          }
        }
      }

      return {
        id: `track-${i + 1}`,
        name: name || `Track ${i + 1}`,
        gearTag: gearTag || "Medfender",
        audioUrl,
        duration: "0:00",
        coverUrl,
        thumbnailUrl: thumbnailUrl ?? null,
      };
    });

  return NextResponse.json({ tracks });
}
