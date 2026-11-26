# DRIFTER'S TALE — CHANGELOG

Notable changes to the **Drifter's Tale** field build, newest first.

---

## [2026-11-26] — World, grass, checkpoint & deployment

### Added
- **City asset pipeline groundwork**
  - Added `city_sizes.json` with real-world dimension references for buildings, vehicles, and props.
  - Added `process_city_assets.py` to key flat magenta backgrounds, trim transparent margins, normalize sprites against the isometric camera scale, and write an asset manifest with pivot and source-size information.
  - Added warnings for missing building / vehicle facings, unrecognized names, upscaled source art, and proportion mismatches.
  - The processor is groundwork for the city pipeline; its output is not yet wired into the live game renderer.
- **Wind-animated grassland**
  - Added four grass species as instanced meshes, forming a meadow south of the station road with scattered tufts elsewhere.
  - Added player-proximity flattening so grass does not obscure the character.
  - Added per-instance animation phase, speed, and horizontal flipping.

### Changed
- **Grass motion:** slowed the four-frame animation to a more relaxed pace and added layered gust-driven sway across the field.
- **Checkpoint scale and placement:** reduced the checkpoint art scale, adjusted its colliders and lighting, and repositioned it so the apron meets the main road.
- **Checkpoint rendering:** separated the barrier-arm masks from the raised / lowered gate renders to prevent stray arm pixels from appearing in the ground layer.
- **Site entry point:** moved the playable page to the repository root at `/`; the former `/src/station` paths now redirect to the root.

## [2026-11-25] — Checkpoint and building interiors

### Added
- **Interactive checkpoint scene**
  - Added a dedicated checkpoint module built from the raised and lowered gate artwork.
  - Split the scene into ground apron, upright booth / posts / sign, and barrier-arm layers.
  - Added gate state handling and checkpoint interaction points.
- **Additional walk-in interiors**
  - Added interior layouts for the utility shed, maintenance depot, water tower, watchtower, checkpoint booth, and collapsed building.
  - Added individual room sprites, props, lighting, interaction points, and collision data.
  - Added lazy room construction and texture preloading for the additional interiors.
- **HUB asset collections**
  - Added the remaining Drifter building and interior asset files under `assets/HUB`, including individual transparent sprites, reference atlases, and manifests.

### Fixed
- **Interior alignment:** corrected wall orientation and pitch, adjusted prop sizing, and refined object placement within the additional building interiors.
- **Repository documentation:** replaced the placeholder README with project information and removed the unused tower-interior drop-in archive.

## [2026-11-24] — Field build foundation

### Added
- **Silvan forest region**
  - Added a separate, lazily loaded forest section behind a loading screen.
  - Built a long river with animated shader flow and foam, three wooden bridges, a connecting trail, and eight examinable landmarks.
  - Added lanterns, sunlight shafts, and river ambience.
  - Added a forest trailhead south of the station road and a return point at the cairn.
- **Relay tower interiors**
  - Added three cutaway rooms — Control, Equipment, and Briefing — using the isometric sprite kit.
  - Moved room placements, collision, glows, and interaction points into dedicated layout data.
- **Supplies and vitals**
  - Added ten one-use food and drink supplies to the relay tower rooms.
  - Added FOOD and WATER meters that drain over time and warn when low.
- **Mobile camera support**
  - Added portrait-screen camera zoom so the player remains readable.

### Changed
- **Visual grading:** adjusted the player sprite so it no longer receives the scene fog tint, using a neutral base colour and warm-neutral emissive lighting while retaining the intended night atmosphere.
- **Repository / hosting:** established the Vercel static-site deployment and added deployment ignore rules for ZIP archives, Git metadata, and legacy deployment material.

### Known limitations
- Low FOOD / WATER levels currently display warnings but do not yet cause gameplay penalties.
- Medical items, battery, flashlight, handheld radio, and extinguisher are not yet implemented as usable supplies.
- The Silvan section does not yet contain its own supply pickups.

---

## Version notes

This repository is an actively developed field build. Features and locations may change as the Cygnus Signal Series expands.
