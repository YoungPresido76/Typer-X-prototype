# Typer X

Gamified typing keyboard prototype (Vite + React + TypeScript + Tailwind CSS). Four connected screens:

- **Keyboard** – chat with a working on-screen keyboard (also accepts your physical keyboard), live XP bar, combo flame, keypress effects and sounds.
- **Command Center** – level badge, XP, daily goal ring, words, streak, milestones, recent unlock.
- **Progression** – skill tree (spend skill points), ranks, milestones.
- **Customization Lab** – themes, key shapes, effects, sound packs, font, live keyboard preview, Apply Theme.

## Run

```bash
npm install
npm run dev      # local dev server
npm run build    # typecheck + production build (Vercel-ready)
```

No environment variables or backend are required. Progress is stored in `localStorage` (`typer-x:v1`).
Use **More → Prototype tools** to grant XP (to see level-ups) or reset progress.

## Notes

- Locked options (themes, shapes, effects, sound packs) unlock through the skill tree.
- Chat header call/video buttons, GIF, mic, translate and attachment are visual only in this prototype and say so when tapped.
