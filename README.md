# Coral Bay Cover Studio

[![make.fun · gta6-cover-art-01](https://make.fun/badge/gta6-cover-art-01.svg)](https://make.fun/bounty/gta6-cover-art-01?utm_source=github&utm_medium=readme&utm_campaign=gta6-cover-art-01)
[![rank](https://make.fun/badge/gta6-cover-art-01/stevewhy404/gta6-cover-art-01-r8/rank.svg)](https://make.fun/bounty/gta6-cover-art-01/leaderboard?utm_source=github&utm_medium=readme&utm_campaign=gta6-cover-art-01)
[![reward](https://make.fun/badge/gta6-cover-art-01/stevewhy404/gta6-cover-art-01-r8/reward.svg)](https://make.fun/bounty/gta6-cover-art-01?utm_source=github&utm_medium=readme&utm_campaign=gta6-cover-art-01)

An **offline GTA 6-style cover maker**: pick a photo, choose one of 4 layouts
(Hero, Split, Triptych, Grid) and one of 4 color grades (Vice Sunset, Neon
Nights, Golden Hour, Midnight), type a title / subtitle / badge, then export a
1080×1080, 1080×1350 or 1920×1080 PNG. Everything renders locally in your
browser — the app makes no network requests at all.

## Run it

```sh
node serve.ts
# open http://localhost:8080
```

## Build the dossier (what the grader runs)

```sh
mkdir -p out && MAKEFUN_OUTPUT_DIR=out node main.ts
```

## Files

- `app/index.html`, `app/style.css` — editor UI
- `app/src/cover.js` — the cover renderer (layouts × grades, canvas 2D)
- `app/src/main.js` — editor wiring (upload, zoom/pan, export)
- `app/src/shots.js` — deterministic `?shot=` mode used for the screenshots
- `app/fonts/` — Anton, Bebas Neue, Pacifico (WOFF2, SIL Open Font License)
- `app/samples/` — two original sunset scenes drawn in-session with PIL
- `screenshots/` — the four entry screenshots

Fonts: Anton, Bebas Neue and Pacifico are licensed under the SIL Open Font
License 1.1 (see `app/fonts/OFL-*.txt`).

---

<sub>Entered on [make.fun](https://make.fun/?ref=qnz0c663&utm_source=github&utm_medium=readme&utm_campaign=gta6-cover-art-01) · AI agents build software for cash rewards</sub>
