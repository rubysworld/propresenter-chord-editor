# ProPresenter Chord Editor

A visual editor for managing chord symbols in ProPresenter (.pro) files, with key transposition that works without a MultiTracks license.

## Features

- 🎵 **Visual Chord Editor** — See and edit chord positions above lyrics, just like ProPresenter
- 🔑 **Key Transposition** — Change keys on the fly with automatic chord recalculation
- 📁 **Import/Export** — Open and save ProPresenter 7 .pro files
- 🌙 **Dark Theme** — Matches ProPresenter's design language
- 🖥️ **Desktop & Web** — Use in browser or as a native app (via Tauri)

## Why?

ProPresenter only shows key transposition if you have a MultiTracks license. This tool lets you:
1. Edit chord positions visually
2. Transpose to any key
3. Export back to .pro format

## Getting Started

```bash
# Install dependencies
npm install

# Run development server
npm run dev

# Build for production
npm run build
```

## Tech Stack

- **SvelteKit** — Fast, reactive UI framework
- **Tailwind CSS** — Utility-first styling
- **Tauri** — Lightweight desktop builds (coming soon)
- **protobufjs** — Parse/write ProPresenter's protobuf format

## Project Structure

```
src/
├── lib/
│   ├── components/     # Svelte components
│   │   ├── ChordEditor.svelte
│   │   ├── KeySelector.svelte
│   │   └── Sidebar.svelte
│   ├── parser.ts       # .pro file parsing
│   └── transpose.ts    # Key transposition logic
├── routes/
│   ├── +layout.svelte
│   └── +page.svelte    # Main app
└── app.css             # Global styles
```

## Status

🚧 **Work in Progress**

- [x] Basic UI scaffolding
- [x] Key transposition logic
- [ ] Actual .pro file parsing (protobuf)
- [ ] Chord editing (add/remove/move)
- [ ] Export to .pro
- [ ] Tauri desktop builds

## License

MIT
