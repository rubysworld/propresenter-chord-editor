# ProPresenter Proto Definitions

This project uses the official **greyshirtguy/ProPresenter7-Proto** repository as a git submodule for protocol buffer definitions.

## Submodule Location

```
static/proto/ → https://github.com/greyshirtguy/ProPresenter7-Proto.git
```

## Currently Using

**Proto 19beta** - ProPresenter 19 beta protocol definitions

## Cloning This Repo

When cloning this repository for the first time, initialize the submodule:

```bash
git clone https://github.com/rubysworld/propresenter-chord-editor.git
cd propresenter-chord-editor
git submodule update --init --recursive
```

Or clone with submodules in one command:

```bash
git clone --recurse-submodules https://github.com/rubysworld/propresenter-chord-editor.git
```

## Updating Proto Definitions

To update to the latest proto definitions from greyshirtguy:

```bash
cd static/proto
git pull origin main
cd ../..
git add static/proto
git commit -m "Update proto definitions to latest"
git push
```

## How Proto Files Are Used

- **Browser (production)**: Fetches proto files from `/proto/Proto 19beta/` (served from `static/proto/`)
- **Node.js (testing)**: Loads from `static/proto/Proto 19beta/` filesystem path
- **Import resolution**: Custom `fetch` implementation in `src/lib/protobuf.ts` resolves all `import` statements in proto files

## Credit

ProPresenter protocol buffer definitions reverse-engineered and maintained by [greyshirtguy](https://github.com/greyshirtguy) (Dan Owen).
