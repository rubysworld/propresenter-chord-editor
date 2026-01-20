# Testing Guide

## Running Tests

```bash
# Run all tests
npm test

# Run tests in watch mode
npm run test:watch

# Run tests with UI
npm run test:ui
```

## Test Coverage

### Transpose Logic (`src/lib/transpose.test.ts`)
- ✅ Key to semitone conversion
- ✅ Chord parsing (major, minor, 7th, maj7, diminished, augmented, sus, slash chords)
- ✅ Note transposition
- ✅ Chord transposition
- ✅ Flat/sharp key preferences
- ✅ Real-world worship song progressions

### Parser (`src/lib/parser.test.ts`)
- ✅ ProPresenter chord data parsing
- ✅ Chord quality mapping
- ✅ Position tracking

### Protobuf (`src/lib/protobuf.test.ts`)
- ✅ `.pro` file parsing
- ✅ Presentation name extraction
- ✅ Slide extraction
- ✅ Chord extraction from slides
- ✅ Music key extraction
- ✅ RTF to text conversion
- ✅ Invalid data handling

## Test Files

- **Test .pro file**: `src/lib/__tests__/test-song.pro`
  - Created using the working propresenter-protobuf library
  - Contains 3 slides with text and chord data

## CI/CD

Tests run automatically on:
- Every push to `main`
- Every pull request
- Pre-push git hook (via lefthook)

## Writing Tests

Use Vitest for all tests:

```typescript
import { describe, it, expect } from 'vitest';

describe('my feature', () => {
  it('should do something', () => {
    expect(myFunction()).toBe(expected);
  });
});
```

## Proto Definitions

The app uses REAL ProPresenter proto definitions from `proto/Proto 19beta/`:
- These are the actual extracted proto files from ProPresenter
- Located in both:
  - `proto/` — for Node.js test environment
  - `static/proto/` — for browser runtime

**DO NOT** make up proto definitions. Always use the real ones.
