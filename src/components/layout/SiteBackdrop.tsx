/**
 * The page sits on paper. This backdrop is pure CSS: a warm light, a faint
 * ledger ruling and a vignette — nothing animated, nothing to hydrate.
 * Dark photographic sections paint over it; paper sections let it through.
 */
export default function SiteBackdrop() {
  return (
    <div aria-hidden className="fixed inset-0 -z-10 overflow-hidden bg-paper">
      <div
        className="absolute inset-0"
        style={{
          background:
            "radial-gradient(ellipse 70% 48% at 50% -6%, rgba(223,161,74,0.16) 0%, transparent 62%), radial-gradient(ellipse 55% 45% at 92% 96%, rgba(188,90,51,0.08) 0%, transparent 60%), linear-gradient(180deg, #f1ebde 0%, #efe8da 55%, #e9dfcd 100%)",
        }}
      />
      <div
        className="absolute inset-0 opacity-60"
        style={{
          backgroundImage:
            "repeating-linear-gradient(180deg, rgba(16,14,11,0.035) 0px, rgba(16,14,11,0.035) 1px, transparent 1px, transparent 68px)",
          maskImage:
            "radial-gradient(ellipse 90% 80% at 50% 30%, black 0%, transparent 88%)",
          WebkitMaskImage:
            "radial-gradient(ellipse 90% 80% at 50% 30%, black 0%, transparent 88%)",
        }}
      />
    </div>
  );
}
