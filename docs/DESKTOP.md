# Desktop Build (Tauri)

## Development

```bash
npm run tauri:dev
```

This will start both the Vite dev server and the Tauri window.

## Building

```bash
npm run tauri:build
```

The built app will be in `src-tauri/target/release/bundle/`.

## Icons

TODO: Generate proper icons. For now, you need to create icons in `src-tauri/icons/`:
- `32x32.png`
- `128x128.png`
- `128x128@2x.png`
- `icon.icns` (macOS)
- `icon.ico` (Windows)

You can use `@tauri-apps/cli` to generate icons from a source image:

```bash
npx @tauri-apps/cli icon path/to/source.png
```

## Distribution

After building, the installer/package will be in:
- **macOS**: `src-tauri/target/release/bundle/dmg/`
- **Windows**: `src-tauri/target/release/bundle/msi/`
- **Linux**: `src-tauri/target/release/bundle/deb/` or `appimage/`
