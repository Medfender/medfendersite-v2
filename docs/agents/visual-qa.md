# Visual QA Rule

## Rule

**CRITICAL:** After making any CSS, Tailwind, or UI layout changes, you MUST automatically use the Chrome DevTools or Playwright MCP to navigate to the local dev server (e.g., `http://localhost:3000/audio`). You must take a screenshot, visually verify that the implemented design matches the requested aesthetic constraints, and check the console for errors before concluding the task.

## Enforcement

- This applies to every task involving visual or layout changes — no exceptions.
- If the dev server is not running, ask the user to start it before proceeding.
- If a screenshot cannot be captured (environment limitation), document the limitation and describe the expected visual outcome instead.
- Verify: color palette, typography, spacing, component placement, and interaction states (:hover, :focus, :active).

## Console Check

- Open browser DevTools console or Playwright console output.
- Flag any `Error`-level console messages as blocking.
- `Warning`-level messages are informational but should be noted.

## File Changes

- Any screenshots captured should be placed in `temp_screenshots/` and cleaned up after approval.
