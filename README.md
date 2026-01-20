# ProPresenter Chord Editor

A powerful editor for chord positions and key transposition in ProPresenter 7 `.pro` files.

Available as both a **web app** and a **desktop app** (macOS/Windows/Linux).

## ✨ Features

### Core Functionality
- 🎵 **Open ProPresenter files** — Parse and display `.pro` files with full chord data
- ✏️ **Edit chords** — Click any character to add or edit a chord
- 🖱️ **Drag to reposition** — Drag chords to different positions in the lyrics
- 🔄 **Transpose keys** — Change the key and all chords update automatically
- 💾 **Export modifications** — Save your changes back to a working `.pro` file

### Power Features
- ↩️ **Undo/Redo** — Full history with Ctrl+Z / Ctrl+Y
- 📝 **Live preview** — See transposed chords in real-time
- 🎹 **Chord quality support** — Major, minor, diminished, augmented, sus, add, etc.
- 🎯 **Character-level precision** — Position chords exactly where you want them

### UI/UX
- 🎨 **Clean, modern interface** — Dark mode with smooth animations
- ⚡ **Fast and responsive** — No lag, even with large presentations
- 🚨 **Error handling** — Clear error messages and loading states
- 📱 **Responsive design** — Works on desktop and large tablets

## 🚀 Quick Start

### Web App (Recommended for Quick Use)

1. Clone and run locally:
```bash
git clone https://github.com/rubysworld/propresenter-chord-editor.git
cd propresenter-chord-editor
npm install  # Automatically sets up git hooks via lefthook
npm run dev
```

2. Open http://localhost:5173
3. Drop a `.pro` file or click to browse
4. Edit chords, transpose, export!

### Desktop App (Best for Regular Use)

#### Development
```bash
npm install
npm run tauri:dev
```

#### Build
```bash
npm run tauri:build
```

See [docs/DESKTOP.md](docs/DESKTOP.md) for detailed desktop build instructions.

## 🎯 Use Cases

- **Worship leaders** — Quickly transpose songs to match vocalists
- **Music directors** — Edit chord charts without opening ProPresenter
- **Media teams** — Batch update song keys before service
- **Chord chart creation** — Add chords to lyrics efficiently

## 🛠️ Tech Stack

- **Frontend**: SvelteKit 5, TypeScript, TailwindCSS 4
- **Desktop**: Tauri 2 (Rust + Web)
- **Parsing**: Protobuf.js (Protocol Buffers)
- **Build**: Vite 6

## 📖 How It Works

ProPresenter files use **Protocol Buffers** for binary encoding. This app:

1. **Decodes** the protobuf structure from the `.pro` file
2. **Extracts** slide text, chords, and music key metadata
3. **Provides** an interactive visual editor
4. **Modifies** the chord data in memory
5. **Re-encodes** the protobuf with your changes
6. **Exports** a valid `.pro` file that opens in ProPresenter

All chord modifications and key transpositions are applied **directly to the protobuf data**, ensuring compatibility.

## 🔒 Privacy

- **100% local** — All file processing happens in your browser/app
- **No uploads** — Your files never leave your device
- **No tracking** — No analytics or data collection
- **Open source** — Audit the code yourself

## 📁 Project Structure

```
src/
├── lib/
│   ├── components/          # UI components
│   │   ├── ChordEditor.svelte
│   │   ├── ChordModal.svelte
│   │   ├── KeySelector.svelte
│   │   └── Sidebar.svelte
│   ├── history.ts           # Undo/redo manager
│   ├── parser.ts            # .pro file parsing interface
│   ├── protobuf.ts          # Protobuf encode/decode
│   └── transpose.ts         # Key transposition logic
├── routes/
│   ├── +layout.svelte
│   └── +page.svelte         # Main app
src-tauri/                   # Desktop app (Tauri)
├── src/
│   └── main.rs              # Rust backend
└── tauri.conf.json          # Desktop config
```

## ✅ Status

**All core features complete!**

- [x] Visual chord editor
- [x] Add/edit/delete chords
- [x] Drag to reposition chords
- [x] Key transposition (live preview)
- [x] Full protobuf write support
- [x] Export modified .pro files
- [x] Undo/Redo with keyboard shortcuts
- [x] Error handling and loading states
- [x] Tauri desktop build setup
- [ ] Desktop app icons (TODO)
- [ ] CI/CD for releases
- [ ] Test with real .pro files

## 🐛 Known Issues

- Icons not yet generated for desktop builds (see [docs/DESKTOP.md](docs/DESKTOP.md))
- Need testing with ProPresenter 6 files (may require proto updates)
- Chord extensions beyond 13 may not parse correctly
- RTF formatting beyond basics not preserved

## 🤝 Contributing

PRs welcome! This project is under active development.

**Git Hooks:** This project uses [lefthook](https://github.com/evilmartians/lefthook) to ensure code quality:
- **Pre-commit**: Runs `npm run check` (type checking)
- **Pre-push**: Runs `npm run build` (ensures buildable code)

Hooks are automatically installed when you run `npm install`.

## 📄 License

MIT — See [LICENSE](LICENSE) for details

---

**Made with 💜 by [Ruby](https://github.com/rubysworld)**
