# Drifter's Tale — change notes

## 2026-11-24
- **Repo / hosting:** cloned Cygnus-series into this repo (main); legacy zips removed. Vercel static deploy via `vercel.json` (root redirects to `src/station/`), `.vercelignore` skips legacy files. Site title: "Drifter's Tale".
- **Silvan (forest section):** `src/station/forest.js`, lazy-loaded behind a loading screen. Baked ground, long three.js river (shader ribbon with flow/foam), 3 bridges, trail, 8 examinable landmarks, lanterns, sun shafts, river audio. Entry via trailhead south of the road; cairn returns to the station. River shape tunable at top of the file (`zc`, `hw`).
- **Interior:** user's sprite-kit rooms (`interior.js` + `interior_layout.js`) kept; my PSX placeholder was replaced.
- **Mobile:** portrait phones zoom in so the character isn't tiny (`rs()` in `main.js`).
- **Cyan haze fix:** player sprite no longer takes scene fog, uses white base colour and a warm-neutral emissive (`pmat` in `main.js`). Global night grade is still cyan by design.
- **Supplies + vitals:** 10 one-use props from `DRIFTER_Isometric_Interactables_v2` (copied to `assets/game/props/`) placed in the three tower rooms; definitions and food/water values in `src/station/props.js`. `[E]` to eat/drink. FOOD/WATER meters in the HUD drain slowly and warn when low (no penalty yet).
- **Not done / ideas:** medical items, battery, flashlight, handheld radio and extinguisher are unused; vitals have no consequences; forest has no supplies.
