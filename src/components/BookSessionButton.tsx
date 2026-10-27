import Link from "next/link";

/**
 * The one call to action that appears on every page. Kept as a component so
 * the label, the destination, and the focus behaviour cannot drift apart.
 */
export default function BookSessionButton({
  compact = false,
  tone = "ink",
}: {
  compact?: boolean;
  tone?: "ink" | "paper";
}) {
  return (
    <Link
      href="/contact#booking"
      className={`btn ${tone === "paper" ? "btn-brass" : "btn-ink"} ${
        compact ? "px-4" : ""
      }`}
      aria-label="Book a session with Medfender"
    >
      Book a session
      <span aria-hidden>→</span>
    </Link>
  );
}
