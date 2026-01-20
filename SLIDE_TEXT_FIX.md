# Slide Text Extraction Fix

## Problem
The app loaded .pro files and showed slide labels correctly (e.g., "Verse 1 - Slide 1") but the actual lyrics/text content was empty.

## Root Cause
**The code was using the wrong field name!**

The protobuf field is `base_slide` (snake_case), but the code was looking for `baseSlide` (camelCase).

### Incorrect Code
```javascript
const elements = slideData.elements || slideData.baseSlide?.elements || [];
```

The protobuf `toObject()` method preserves the original proto field names, which use snake_case convention.

## Solution

### Fixed Code
```javascript
// KEY FIX: Use snake_case base_slide, not camelCase baseSlide
const baseSlide = slideData.base_slide;  // ← Note the underscore!
const elements = baseSlide?.elements || [];
```

### Correct Protobuf Path
```
Cue.actions[].slide.presentation       → PresentationSlide
PresentationSlide.base_slide           → Slide (snake_case!)
Slide.elements[]                       → Slide.Element[]
Slide.Element.element                  → Graphics.Element
Graphics.Element.text.rtfData          → bytes (RTF content)
```

## Proto Definitions Used
- `presentationSlide.proto`: Defines PresentationSlide with `base_slide` field
- `slide.proto`: Defines Slide with `elements[]` field
- `graphicsData.proto`: Defines Graphics.Element with `text.rtfData`

## Testing
✅ **All tests passing** - 56/56 tests pass

To test manually:
1. Run `npm run dev`
2. Load a .pro file from ProPresenter 7
3. Check that slide text/lyrics now appear in the editor
4. Verify chords (if present) are positioned correctly over the text

## Status
✅ **Fixed and Verified** - Commit `bee45af`

The issue was a simple naming mismatch - the proto uses `base_slide` but the code was checking `baseSlide`.
