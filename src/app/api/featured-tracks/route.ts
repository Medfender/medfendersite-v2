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

function findCover(dir: string, baseName: string): string | null {
  for (const ext of ["jpg", "jpeg", "png", "webp"]) {
    const candidate = path.join(dir, `${baseName}.${ext}`);
    if (fs.existsSync(candidate)) return encodeURI(`/audio/featured/${baseName}.${ext}`);
  }
  return null;
}

export async function GET() {
  const dir = path.join(process.cwd(), "public", "audio", "featured");
  let files: string[] = [];
  try {
    files = fs.readdirSync(dir);
  } catch {
    return NextResponse.json({ tracks: [] });
  }

  const audioExts = new Set(["mp3", "flac", "wav", "m4a", "aac", "ogg"]);

  const tracks = files
    .filter((f) => audioExts.has(f.split(".").pop()?.toLowerCase() ?? ""))
    .map((f, i) => {
      const ext = "." + f.split(".").pop()!.toLowerCase();
      const raw = f.slice(0, -ext.length);
      const { name, gearTag } = parseName(raw);
      const audioUrl = encodeURI(`/audio/featured/${f}`);
      const coverUrl = findCover(dir, raw) ?? `/audio/featured/vinyl-default.jpg`;
      return {
        id: `track-${i + 1}`,
        name: name || `Track ${i + 1}`,
        gearTag: gearTag || "Medfender",
        audioUrl,
        duration: "0:00",
        coverUrl,
      };
    });

  return NextResponse.json({ tracks });
}
