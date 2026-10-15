# Duck Dash

A tiny 2D platformer PWA: you're a duck. Flat, bright, deep-space vector look (Kurzgesagt-inspired).
Plain HTML, CSS, JS and JSON. No dependencies. Works offline once loaded.

## Run it
Service workers need `http://localhost` or HTTPS (opening index.html via file:// still plays, but won't install/cache).

    cd duck-dash-pwa
    python3 -m http.server 8080      # or: npx serve .

Open http://localhost:8080, then use your browser's "Install" option (or the in-game Install button).
To deploy: upload the folder to any static host (GitHub Pages, Netlify, Cloudflare Pages...).

## Controls
- Move: Arrow keys or A/D
- Jump: Space / Up / W. Press again in the air to flap, hold to glide
- Quack (stuns nearby germs, 2.2s cooldown): X, K or Z
- Drop through thin platforms: Down + Jump
- Pause: P or Esc. Mute: M
- Device: after pressing Play you choose **Computer** (keyboard) or **Mobile** (touch buttons, fullscreen, landscape).
  You can switch any time from the pause menu.
- Touch buttons: left/right on the left, Quack and Jump on the right

## Files
- index.html: app shell + UI screens, registers the service worker
- style.css: UI styling
- game.js: engine, 3 levels, art (all drawn in code), audio (WebAudio synth)
- sw.js: offline cache. Bump CACHE_VERSION when you change files
- manifest.json + icons/: PWA metadata and icons

Levels are defined as data at the top of game.js (tile coordinates), so adding one is easy.
