# Git Hooks (Lefthook)

This project uses [lefthook](https://github.com/evilmartians/lefthook) to ensure code quality before commits and pushes.

## What Gets Checked?

### Pre-commit Hook ✅
**Runs before every commit:**
- `npm run check` — TypeScript and Svelte type checking

**Why?**  
Prevents committing code with type errors or Svelte compilation issues.

**If it fails:**  
The commit is blocked. Fix the type errors and try again.

---

### Pre-push Hook 🚀
**Runs before every push:**
- `npm run build` — Full production build

**Why?**  
Ensures the code actually builds before pushing to GitHub. Catches build errors early.

**If it fails:**  
The push is blocked. Fix the build errors and try again.

---

## Setup

Hooks are **automatically installed** when you run:
```bash
npm install
```

This happens via the `prepare` script in `package.json`.

**Manual installation:**
```bash
npx lefthook install
```

---

## Testing Hooks

You can manually run the hooks without committing/pushing:

```bash
# Test pre-commit hook
npx lefthook run pre-commit

# Test pre-push hook
npx lefthook run pre-push
```

---

## Skipping Hooks (Not Recommended)

If you **really** need to skip the hooks (e.g., WIP commit):

```bash
# Skip pre-commit
git commit --no-verify

# Skip pre-push
git push --no-verify
```

⚠️ **Warning:** Use sparingly. Skipping hooks can lead to broken code on GitHub.

---

## Configuration

Hook configuration is in `lefthook.yml` at the project root.

**Current config:**
```yaml
pre-commit:
  commands:
    type-check:
      run: npm run check
      fail_text: "Type checking failed. Fix errors before committing."

pre-push:
  commands:
    build:
      run: npm run build
      fail_text: "Build failed. Fix build errors before pushing."
```

---

## Troubleshooting

### Hooks not running?
```bash
# Reinstall hooks
npx lefthook install

# Check hook status
npx lefthook run --help
```

### Hooks run too slowly?
The hooks only run on **changed files**. If no relevant files changed, they skip automatically.

For a full check:
```bash
npm run check  # Type check
npm run build  # Build check
```

---

## Benefits

✅ **Catch errors early** — Before they reach GitHub  
✅ **Consistent quality** — Everyone on the team gets the same checks  
✅ **Faster CI** — GitHub Actions run faster when code is pre-validated  
✅ **Better commits** — No more "fix types" commits  

---

**Learn more:** https://github.com/evilmartians/lefthook
