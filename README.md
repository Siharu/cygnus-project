# Drifter's Tale

An atmospheric HD-2D field build set at **WNCORE Station 01**, part of the Cygnus Signal Series universe (novel, games, ARG). Walk the station, read what is left behind, and tune the radio. The signal reaches those who are still listening.

**Live:** https://drifter-tale.vercel.app

## Controls

| Key | Action |
| --- | --- |
| WASD | Walk |
| Shift | Run |
| Space | Swing |
| R | Rest |
| E | Examine / interact (eat and drink supplies) |
| Tab | Logbook |
| Esc | Close panel |
| M | Mute |

On portrait phones the camera zooms in so the character stays readable.

## What's in the build

- **Station overworld:** isometric, sprite-based, built with Three.js r128.
- **Relay tower interior:** three rooms (control, equipment, briefing) built from billboard sprites on the same iso camera. Layout, collision, glows and interaction points live in `interior_layout.js`.
- **Silvan:** a lazy-loaded forest section behind a loading screen. It has a shader-ribbon river, three bridges, a trail, eight examinable landmarks, lanterns, sun shafts and river audio. Enter from the trailhead south of the station road; the cairn returns you to the station.
- **Supplies and vitals:** ten one-use props placed in the tower rooms. FOOD and WATER meters drain slowly and warn when low (no penalty yet).

## Project layout

```
index.html            root entry, redirects to src/station/
vercel.json           static deploy config
src/station/
  index.html          game page
  main.js             core game loop, player, overworld, HUD
  forest.js           Silvan forest section
  interior.js         tower interior renderer
  interior_layout.js  interior placement, collision, interaction points
  props.js            supply props and food/water values
  assets.js           asset loading
  meta.js             logbook and world text
  style.css           HUD and overlay styling
src/WNCORE_Station_01.html   original single-file build (legacy reference)
assets/               sprite libraries and player animations
scripts/modularize.py helper used to split the monolith into modules
CHANGELOG.md          change notes
```

## Running locally

There is no build step. Serve the repo root with any static server and open `/src/station/`:

```
npx serve .
```

Opening `index.html` straight from disk will not work because the game uses ES modules.

## Deploy

Hosted on Vercel as a static site. `vercel.json` redirects `/` to `/src/station/` and caches `/assets/` for a day. `.vercelignore` skips legacy files.

## Roadmap

- Consequences for low food/water
- Unused props: medical items, battery, flashlight, handheld radio, extinguisher
- Supplies in the forest

## License

MIT. See [LICENSE](LICENSE).
