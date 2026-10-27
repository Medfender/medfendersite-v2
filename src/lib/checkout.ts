/**
 * A Lemon Squeezy checkout is only reachable when the URL names a real
 * variant. Every store link is written by hand in `storeData.ts`, and a
 * placeholder (`…/buy/mayer-variant-id`) returns 404 — so the UI checks the
 * shape of the id before it offers a checkout button.
 *
 * Drop a real variant UUID into `checkoutUrl` and the live path comes back
 * with no further changes.
 */
const LIVE_VARIANT =
  /\/checkout\/buy\/[0-9a-f]{8}-[0-9a-f]{4}-[0-9a-f]{4}-[0-9a-f]{4}-[0-9a-f]{12}/i;

export function isCheckoutLive(url?: string | null): boolean {
  return typeof url === "string" && LIVE_VARIANT.test(url);
}
