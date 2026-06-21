# Jeepney Jump 🐦🚌

A Flappy Bird–style game built with Next.js, featuring:

- **Character select screen** — choose from 4 original cartoon bird avatars
  (not photo likenesses) before playing
- **Classic Flappy Bird physics** — gravity, flap impulse, gap-based pipes,
  collision detection, scoring, and a persisted best score (localStorage)
- **Philippine street scene background** — parallax sari-sari store, jeepneys,
  tricycle, palm trees, power lines, and a road, all hand-drawn in SVG
- **Original 8-bit "jeepney jingle"** — composed and synthesized live in the
  browser with the Web Audio API (oscillators + noise), so there's no
  copyrighted audio file involved
- **Fully responsive** — works on mobile (tap to flap) and desktop
  (space/arrow-up to flap)

## Running locally

```bash
npm install
npm run dev
```

Then open http://localhost:3000.

## Project structure

- `app/page.tsx` — top-level flow: character select → game
- `app/components/CharacterSelect.tsx` — avatar picker screen
- `app/components/BirdAvatars.tsx` — the 4 SVG bird avatar designs
- `app/components/StreetBackground.tsx` — parallax Philippine street scene layers
- `app/components/FlappyGame.tsx` — the game engine (physics, pipes, collisions, HUD)
- `app/lib/ChiptuneEngine.ts` — Web Audio synth engine for music + SFX

## Notes

- The bird avatars are original cartoon designs inspired by hairstyle/accessory
  vibes (curly hair, long hair, earrings, sunglasses) — not likenesses of the
  uploaded reference photos.
- The background music is generated procedurally in-browser; there is no
  external audio file and no copyrighted song is used.
- Swap in your own music by replacing the `ChiptuneEngine` calls in
  `app/page.tsx` with an `<audio>` element if you'd rather use a licensed mp3.
