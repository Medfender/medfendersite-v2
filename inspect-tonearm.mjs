/**
 * Forensic inspection of tonearm kinematics via Playwright.
 * Measures actual rendered positions of stylus, arm tip, and counterweight
 * in PARK, PLAY, and INNER states using getBoundingClientRect() and
 * SVG transformation matrix inspection.
 *
 * Usage: node inspect-tonearm.mjs
 */

import { chromium } from 'playwright';

const BASE = 'http://localhost:3000';
const SVG_VIEWBOX_W = 720;
const SVG_VIEWBOX_H = 520;

async function main() {
  const browser = await chromium.launch({ headless: true });
  const page = await browser.newPage();
  await page.setViewportSize({ width: 1280, height: 900 });

  await page.goto(BASE, { waitUntil: 'networkidle' });

  // ── Inspect the raw transform attributes on #tonearm-assembly ──────────────
  const tonearmAttrs = await page.evaluate(() => {
    const el = document.getElementById('tonearm-assembly');
    if (!el) return { error: 'tonearm-assembly not found' };
    return {
      transform: el.getAttribute('transform'),
      style: el.getAttribute('style'),
      transformOrigin: getComputedStyle(el).transformOrigin,
      computedTransform: getComputedStyle(el).transform,
    };
  });
  console.log('=== #tonearm-assembly attributes ===');
  console.log(JSON.stringify(tonearmAttrs, null, 2));

  // ── Inspect inner kinematic group ─────────────────────────────────────────
  const innerAttrs = await page.evaluate(() => {
    // The inner kinematic group is the direct child of #tonearm-assembly
    const parent = document.getElementById('tonearm-assembly');
    const children = Array.from(parent.children);
    const inner = children[0];
    if (!inner) return { error: 'inner group not found' };
    return {
      tagName: inner.tagName,
      id: inner.id,
      transform: inner.getAttribute('transform'),
      style: inner.getAttribute('style'),
      transformOrigin: getComputedStyle(inner).transformOrigin,
      computedTransform: getComputedStyle(inner).transform,
    };
  });
  console.log('\n=== Inner kinematic group ===');
  console.log(JSON.stringify(innerAttrs, null, 2));

  // ── Get SVG element dimensions to compute scaling ──────────────────────────
  const svgDims = await page.evaluate(() => {
    const svg = document.querySelector('svg[aria-label="Turntable deck"]');
    const rect = svg.getBoundingClientRect();
    return { width: rect.width, height: rect.height, viewBox: svg.viewBox.baseVal };
  });
  console.log('\n=== SVG dimensions ===');
  console.log(JSON.stringify(svgDims, null, 2));

  // Compute the scale factor between viewBox and screen pixels
  const scaleX = svgDims.width / SVG_VIEWBOX_W;
  const scaleY = svgDims.height / SVG_VIEWBOX_H;
  console.log(`Scale: ${scaleX.toFixed(4)} x ${scaleY.toFixed(4)}`);

  // ── Measure stylus position in current state ──────────────────────────────
  async function measureStylus(label) {
    return page.evaluate(() => {
      const stylus = document.getElementById('stylus');
      if (!stylus) return { error: 'stylus not found' };
      const rect = stylus.getBoundingClientRect();
      const svg = document.querySelector('svg[aria-label="Turntable deck"]');
      const svgRect = svg.getBoundingClientRect();

      // Get the combined transformation matrix of the stylus
      const ctm = stylus.getScreenCTM();
      // Get the stylus's own transform attribute
      const localTransform = stylus.getAttribute('transform') || '';

      // Compute stylus tip in local coordinates (bottom-right of the stylus group)
      // Stylus group is inside cartridge, which is inside headshell, which is inside inner group
      const innerGroup = stylus.closest('#tonearm-assembly').children[0];
      const innerCTM = innerGroup.getScreenCTM();

      // The stylus tip is at local (18+10=28, 2) relative to its own group
      // Apply the stylus's local transform (translate(18, 0)) then the parent chain
      const stylusLocalX = 28;
      const stylusLocalY = 2;

      // Get headshell and cartridge transforms to compute fully-local stylus position
      const headshell = document.getElementById('headshell');
      const cartridge = document.getElementById('cartridge');
      const hsTransform = headshell.getAttribute('transform') || '';
      const cartTransform = cartridge.getAttribute('transform') || '';
      const styTransform = stylus.getAttribute('transform') || '';

      // Use the inner group's CTM to get world position
      const tipInSVG = innerCTM.transformPoint(new DOMPoint(stylusLocalX, stylusLocalY));

      return {
        label,
        // Screen rect (visual bounding box of stylus element)
        screenRect: { x: rect.x, y: rect.y, w: rect.width, h: rect.height },
        // SVG viewBox position of stylus group center
        svgGroupCenter: { x: rect.x - svgRect.left, y: rect.y - svgRect.top },
        // Stylus tip in screen coordinates (via inner group CTM)
        tipScreen: { x: tipInSVG.x, y: tipInSVG.y },
        // CTM matrix values
        innerCTM: {
          a: innerCTM.a, b: innerCTM.b,
          c: innerCTM.c, d: innerCTM.d,
          e: innerCTM.e, f: innerCTM.f,
        },
        // Parsed transforms
        transforms: { headshell: hsTransform, cartridge: cartTransform, stylus: styTransform },
      };
    });
  }

  // ── Inspect current state ────────────────────────────────────────────────
  console.log('\n=== CURRENT STATE (initial load) ===');
  const current = await page.evaluate(() => {
    const playBtn = Array.from(document.querySelectorAll('button')).find(b =>
      b.getAttribute('aria-label')?.toLowerCase().includes('play') ||
      b.getAttribute('aria-label')?.toLowerCase().includes('pause')
    );
    const powerBtn = Array.from(document.querySelectorAll('button')).find(b =>
      b.getAttribute('aria-label')?.toLowerCase().includes('power')
    );
    return {
      playBtn: playBtn?.getAttribute('aria-label'),
      powerBtn: powerBtn?.getAttribute('aria-label'),
    };
  });
  console.log(JSON.stringify(current, null, 2));

  // Measure initial (PARK) position
  const park = await measureStylus('PARK');
  console.log('\n=== PARK position ===');
  console.log(JSON.stringify(park, null, 2));

  // ── Trigger PLAY state ───────────────────────────────────────────────────
  await page.evaluate(() => {
    const playBtn = Array.from(document.querySelectorAll('button')).find(b =>
      b.getAttribute('aria-label')?.toLowerCase().includes('play')
    );
    if (playBtn) playBtn.click();
  });
  await page.waitForTimeout(800); // Wait for animation

  const play = await measureStylus('PLAY');
  console.log('\n=== PLAY position ===');
  console.log(JSON.stringify(play, null, 2));

  // ── Trigger INNER state (fast-forward progress) ───────────────────────────
  // We can't directly set transport state via UI; inspect what we can
  // For now, just show PLAY → INNER comparison
  console.log('\n=== Direction check ===');
  if (park.tipScreen && play.tipScreen) {
    const dx = play.tipScreen.x - park.tipScreen.x;
    const dy = play.tipScreen.y - park.tipScreen.y;
    console.log(`PARK → PLAY: dx=${dx.toFixed(1)}, dy=${dy.toFixed(1)}`);
    console.log(`Direction: ${dx < 0 ? 'LEFT ✓' : dx > 0 ? 'RIGHT ✗' : 'NO CHANGE'}`);
  }

  // ── Measure all key components in PLAY state ──────────────────────────────
  const allComponents = await page.evaluate(() => {
    const components = ['#tonearm-assembly', '#inner-bearing', '#arm-tube', '#counterweight', '#headshell', '#cartridge', '#stylus'];
    const svg = document.querySelector('svg[aria-label="Turntable deck"]');
    const svgRect = svg.getBoundingClientRect();
    const innerGroup = document.getElementById('tonearm-assembly')?.children[0];
    const innerCTM = innerGroup?.getScreenCTM();
    const result = {};

    for (const sel of components) {
      const el = document.querySelector(sel);
      if (!el) { result[sel] = { error: 'not found' }; continue; }
      const rect = el.getBoundingClientRect();
      const ctm = el.getScreenCTM ? el.getScreenCTM() : null;
      result[sel] = {
        screenRect: { x: rect.x.toFixed(1), y: rect.y.toFixed(1), w: rect.width.toFixed(1), h: rect.height.toFixed(1) },
        svgPos: { x: (rect.x - svgRect.left).toFixed(1), y: (rect.y - svgRect.top).toFixed(1) },
        ctm: ctm ? { a: ctm.a.toFixed(4), b: ctm.b.toFixed(4), c: ctm.c.toFixed(4), d: ctm.d.toFixed(4), e: ctm.e.toFixed(1), f: ctm.f.toFixed(1) } : null,
        transform: el.getAttribute('transform') || 'none',
        style: el.getAttribute('style') || 'none',
      };
    }
    return result;
  });
  console.log('\n=== All components in PLAY state ===');
  console.log(JSON.stringify(allComponents, null, 2));

  await browser.close();
  console.log('\n=== INSPECTION COMPLETE ===');
}

main().catch(e => { console.error(e); process.exit(1); });
