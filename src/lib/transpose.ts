// Music key definitions
export const KEYS = ['C', 'C#', 'D', 'D#', 'E', 'F', 'F#', 'G', 'G#', 'A', 'A#', 'B'] as const;
export const FLAT_KEYS = ['C', 'Db', 'D', 'Eb', 'E', 'F', 'Gb', 'G', 'Ab', 'A', 'Bb', 'B'] as const;

export type MusicKey = typeof KEYS[number] | typeof FLAT_KEYS[number];

// ProPresenter's MusicKey enum values
export const PP_KEY_MAP: Record<number, MusicKey> = {
  1: 'Ab', 2: 'A', 3: 'A#', 4: 'Bb', 5: 'B',
  7: 'C', 8: 'C#', 9: 'Db', 10: 'D', 11: 'D#',
  12: 'Eb', 13: 'E', 16: 'F', 17: 'F#', 18: 'Gb',
  19: 'G', 20: 'G#'
};

// Normalize key to semitone index (0-11)
export function keyToSemitone(key: MusicKey): number {
  // First check if it's already in KEYS
  const sharpIndex = KEYS.indexOf(key as typeof KEYS[number]);
  if (sharpIndex >= 0) return sharpIndex;
  
  // Handle flats
  const flatMap: Record<string, number> = {
    'Db': 1, 'Eb': 3, 'Gb': 6, 'Ab': 8, 'Bb': 10
  };
  
  if (key in flatMap) return flatMap[key];
  
  // Try converting flats to sharps
  const normalized = key.replace('b', '#');
  const normalizedIndex = KEYS.indexOf(normalized as typeof KEYS[number]);
  if (normalizedIndex >= 0) return normalizedIndex;
  
  return 0;
}

// Parse chord string into components
export interface ParsedChord {
  root: string;
  quality: string; // '', 'm', 'dim', 'aug', etc.
  extension: string; // '7', 'maj7', '9', etc.
  alterations: string; // 'sus4', 'add9', etc.
  bass: string | null; // For slash chords like F/G
}

export function parseChord(chord: string): ParsedChord {
  const slashIndex = chord.indexOf('/');
  let bass: string | null = null;
  let mainChord = chord;
  
  if (slashIndex > 0) {
    bass = chord.slice(slashIndex + 1);
    mainChord = chord.slice(0, slashIndex);
  }
  
  // Extract root (A-G with optional # or b)
  const rootMatch = mainChord.match(/^([A-G][#b]?)/);
  const root = rootMatch ? rootMatch[1] : 'C';
  const rest = mainChord.slice(root.length);
  
  // Determine quality
  let quality = '';
  let extension = '';
  let alterations = '';
  
  if (rest.startsWith('m') && !rest.startsWith('maj')) {
    quality = 'm';
  } else if (rest.startsWith('dim')) {
    quality = 'dim';
  } else if (rest.startsWith('aug') || rest.startsWith('+')) {
    quality = 'aug';
  }
  
  // Extract extension (7, maj7, 9, 11, 13)
  const extMatch = rest.match(/(maj)?(7|9|11|13)/);
  if (extMatch) {
    extension = extMatch[0];
  }
  
  // Rest is alterations (sus4, add9, etc.)
  const remaining = rest
    .replace(/^m(?!aj)/, '')
    .replace(/^(dim|aug|\+)/, '')
    .replace(/(maj)?(7|9|11|13)/, '');
  if (remaining) {
    alterations = remaining;
  }
  
  return { root, quality, extension, alterations, bass };
}

// Transpose a single note by semitones
export function transposeNote(note: string, semitones: number, preferFlats = false): string {
  const semitone = keyToSemitone(note as MusicKey);
  const newSemitone = (semitone + semitones + 12) % 12;
  
  const keys = preferFlats ? FLAT_KEYS : KEYS;
  return keys[newSemitone];
}

// Transpose a full chord string
export function transposeChord(chord: string, semitones: number, preferFlats = false): string {
  if (semitones === 0) return chord;
  
  const parsed = parseChord(chord);
  const newRoot = transposeNote(parsed.root, semitones, preferFlats);
  const newBass = parsed.bass ? transposeNote(parsed.bass, semitones, preferFlats) : null;
  
  let result = newRoot + parsed.quality + parsed.extension + parsed.alterations;
  if (newBass) {
    result += '/' + newBass;
  }
  
  return result;
}

// Check if a key typically uses flats
export function keyUsesFlats(key: MusicKey): boolean {
  return ['F', 'Bb', 'Eb', 'Ab', 'Db', 'Gb'].includes(key);
}
