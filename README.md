# Quran Audio Player — React

Simple, lightweight Quran audio player built with React.  
Loads Surah text (Arabic + translation) and plays ayah-by-ayah audio from **alquran.cloud**. Easy to run locally and customize (reciters, translations, etc.).

Made by **N1CHO** for CMC Laayoune REACT.JS project.

---

# Features
- Fetches Surah list and audio editions (reciters) from `api.alquran.cloud`.
- Shows Arabic text and an English translation side-by-side.
- Builds a per-ayah audio playlist for the selected reciter.
- Preloads ayah durations in batches to compute total duration and show load progress.
- Play / pause / previous / next / stop controls, volume and mute, progress bar.
- Clickable ayah list to jump to any verse.

---

# Quick Start

```bash
# clone the repo
git clone https://github.com/notN1CHO/Quran-ReactJS.git
cd Quran-ReactJS

# install dependencies
npm install

# start dev server
npm run dev
```

Open `http://localhost:5000` in your browser.

---

# Usage
- Choose a reciter from the dropdown.
- Select a Surah and click **Start Surah** (or let the app auto-load the first Surah).
- Click any ayah to play it, or use the play / pause / next / prev buttons.
- Watch the loading indicator while ayah durations are preloaded (progress percent shown).

---

# Project structure (overview)
```
src/
├─ App.jsx           # main orchestrator (fetches data, prepares playlist, state)
├─ other/
│  ├─ Player.jsx     # audio player (progress, volume, controls)
│  ├─ List.jsx       # ayah list (Arabic + translation)
│  └─ Control.jsx    # reciter & surah selectors, start button
└─ main.jsx
```

---

# Notes & Tips
- The app preloads ayah metadata using `new Audio(url)`; some servers require CORS headers (`Access-Control-Allow-Origin`) to allow metadata to load.
- Browser autoplay policies may block `audio.play()` until a user gesture; if playback fails, interact with the UI (click play).
- If you want faster initial load, reduce `batchSize` where durations are fetched; to reduce network spikes, increase it.
- Consider caching `ayahDurations` in `localStorage` keyed by `reciter:surah` to speed repeated loads.

---

# Troubleshooting
- **No sound / play blocked**: Click the play button to give a user gesture. Check console for `play()` errors.
- **Durations remain 0**: CORS issue on audio host — ensure audio URL servers allow cross-origin metadata access.
- **Slow loading**: Network issues or many parallel audio metadata requests — adjust batch size or enable caching.

---

# Contributing
Small changes welcome:
1. Fork the repo
2. Create a branch: `git checkout -b feat/your-feature`
3. Commit: `git commit -m "feat: ..."`
4. Push and open a PR

Please keep PRs focused and include a short description of changes.

---

# License
MIT — include a `LICENSE` file if you publish the project.

