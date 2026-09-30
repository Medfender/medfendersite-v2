# SPEC: Musical Intelligence Rebuild — Families, Survival, Live Mode

## Status
APPROVED — proceed to implementation straight from this spec (no second approval gate).

## Classification
Architectural — rebuilds Musical Families + Gig Survival subsystems across 171-song dataset with data-integrity guardrails.

## Data Integrity Constraints (non-negotiable)
- 171 songs preserved; songs.json never truncated.
- No fabricated keys / BPM / chords / riffs / forms / guitar roles / endings.
- Existing VERIFY / INFERRED / UNKNOWN labels preserved; nothing promoted silently.
- Duplicate bob-marley IDs fixed with unique stable IDs + localStorage verification + React-key audit.
- No synthesis of musical facts where dataset is silent.

## Family Taxonomy Design (emerges from dataset, not preset)
Built from transferable SURVIVAL PATTERNS — not arbitrary genre tags. Each family carries: CORE GROOVE, RHYTHMIC FEEL, HARMONIC SHAPE, GUITAR ROLE, SOUND, LIVE PRIORITY, COMMON TRAP, RECOVERY MOVE, REFERENCE SONGS (from this library), TRANSFERABLE SKILL.

Songs receive PRIMARY family + optional SECONDARY tag(s) where musically justified. Multiple-family membership is allowed.

## Family Map (post-implementation; shown after build)
To be produced by analyzing the 171-song dataset. Target families (subject to dataset verification):
- 16th Funk Pocket / Disco-Funk
- Soul/R&B Pocket / Motown Groove
- Reggae / One-Drop / Reggae-Pop
- Afro / Gnawa / North African Groove
- Chaabi / Moroccan Groove
- Latin / Bossa / Latin Pop
- Dance-Pop / Four-on-Floor
- Pop-Rock
- Classic Rock
- Blues / Blues-Rock
- Soul Ballad / Pop Ballad
- Acoustic Singer-Songwriter
- Jazz Standards / Jazz-Adjacent
- Rock Anthem / Wedding / Event Standards
- Instrumental / Guitar-Feature
- Arabic / Oriental Pop / French Chanson

## Survival System Architecture (Live Mode)
Per-song compact brief — only verified / inferred fields. Most critical fields visually dominant: SONG · ARTIST · KEY (VERIFY if not confirmed) · GROOVE · LIVE MINIMUM · ANCHOR · FORM · SIGNATURE · SAFE MODE · RECOVERY · ENDING · RISK · CONFIDENCE.

Live Mode = backstage rapid-orient: show only what is needed to perform in 5–10 seconds; expand for deeper info.

## Transfer / Practice Engine
Family-based, not sequential-order-based. Practice a song → strengthen its family → unlock other songs in that family + related families. Shows CURRENT FAMILY · OTHER RELATED FAMILIES · WHAT THIS TEACHES · WHAT IT UNLOCKS · NEXT BEST TRANSFER.

## 3-Day Mission (optimized for coverage + risk + performance)
- Day 1 — Coverage: maximize family coverage + push as many songs to FUNCTIONAL.
- Day 2 — Depth: high-risk songs, weak forms, difficult transitions.
- Day 3 — Performance: random-call simulation, recovery drills, endings, transitions.

## Visual Design
Existing dark (#0b0f19) / amber / ivory system preserved. Family Map + Survival screens redesigned as professional stage/performance software: dense info, hairline structure, large active-target typography, clear state indicators, minimal decorative UI.

## Verification Plan (execute without further approval)
1. npm run build
2. Start Vite
3. Browser QA on Dashboard, Musical Families, Song Detail, Survival/Live, Practice Mode, Random Call, Progress, song status, localStorage, duplicate-ID fix, Day-1 queue
4. Check console errors
5. Final report (family taxonomy, family count, assignment logic, survival architecture, transfer logic, ID fix, build, QA, limitations)

## Note on External Vision / Browser Agents
If an external browser-agent/model fails due to OmniRoute provider configuration (as encountered), treat it as tool failure — not application failure. Use locally available browser verification (Chrome DevTools / Vite preview / screenshot where possible) and clearly distinguish.
