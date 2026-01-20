import { describe, it, expect } from 'vitest';
import {
  keyToSemitone,
  transposeNote,
  transposeChord,
  parseChord,
  keyUsesFlats,
  type MusicKey
} from './transpose';

describe('keyToSemitone', () => {
  it('should convert sharp keys correctly', () => {
    expect(keyToSemitone('C')).toBe(0);
    expect(keyToSemitone('C#')).toBe(1);
    expect(keyToSemitone('D')).toBe(2);
    expect(keyToSemitone('D#')).toBe(3);
    expect(keyToSemitone('E')).toBe(4);
    expect(keyToSemitone('F')).toBe(5);
    expect(keyToSemitone('F#')).toBe(6);
    expect(keyToSemitone('G')).toBe(7);
    expect(keyToSemitone('G#')).toBe(8);
    expect(keyToSemitone('A')).toBe(9);
    expect(keyToSemitone('A#')).toBe(10);
    expect(keyToSemitone('B')).toBe(11);
  });

  it('should convert flat keys correctly', () => {
    expect(keyToSemitone('Db')).toBe(1);
    expect(keyToSemitone('Eb')).toBe(3);
    expect(keyToSemitone('Gb')).toBe(6);
    expect(keyToSemitone('Ab')).toBe(8);
    expect(keyToSemitone('Bb')).toBe(10);
  });

  it('should handle enharmonic equivalents', () => {
    expect(keyToSemitone('C#')).toBe(keyToSemitone('Db'));
    expect(keyToSemitone('D#')).toBe(keyToSemitone('Eb'));
    expect(keyToSemitone('F#')).toBe(keyToSemitone('Gb'));
    expect(keyToSemitone('G#')).toBe(keyToSemitone('Ab'));
    expect(keyToSemitone('A#')).toBe(keyToSemitone('Bb'));
  });
});

describe('parseChord', () => {
  it('should parse basic major chords', () => {
    const result = parseChord('C');
    expect(result.root).toBe('C');
    expect(result.quality).toBe('');
    expect(result.extension).toBe('');
    expect(result.alterations).toBe('');
    expect(result.bass).toBeNull();
  });

  it('should parse minor chords', () => {
    const result = parseChord('Am');
    expect(result.root).toBe('A');
    expect(result.quality).toBe('m');
    expect(result.extension).toBe('');
  });

  it('should parse seventh chords', () => {
    const result = parseChord('G7');
    expect(result.root).toBe('G');
    expect(result.quality).toBe('');
    expect(result.extension).toBe('7');
  });

  it('should parse major seventh chords', () => {
    const result = parseChord('Cmaj7');
    expect(result.root).toBe('C');
    expect(result.quality).toBe('');
    expect(result.extension).toBe('maj7');
  });

  it('should parse minor seventh chords', () => {
    const result = parseChord('Am7');
    expect(result.root).toBe('A');
    expect(result.quality).toBe('m');
    expect(result.extension).toBe('7');
  });

  it('should parse diminished chords', () => {
    const result = parseChord('Bdim');
    expect(result.root).toBe('B');
    expect(result.quality).toBe('dim');
  });

  it('should parse augmented chords', () => {
    const result = parseChord('Caug');
    expect(result.root).toBe('C');
    expect(result.quality).toBe('aug');
  });

  it('should parse suspended chords', () => {
    const result = parseChord('Dsus4');
    expect(result.root).toBe('D');
    expect(result.alterations).toContain('sus4');
  });

  it('should parse slash chords', () => {
    const result = parseChord('C/G');
    expect(result.root).toBe('C');
    expect(result.bass).toBe('G');
  });

  it('should parse complex chords', () => {
    const result = parseChord('Dm7');
    expect(result.root).toBe('D');
    expect(result.quality).toBe('m');
    expect(result.extension).toBe('7');
  });

  it('should handle sharp roots', () => {
    const result = parseChord('F#m');
    expect(result.root).toBe('F#');
    expect(result.quality).toBe('m');
  });

  it('should handle flat roots', () => {
    const result = parseChord('Bb7');
    expect(result.root).toBe('Bb');
    expect(result.extension).toBe('7');
  });
});

describe('transposeNote', () => {
  it('should transpose up by semitones', () => {
    expect(transposeNote('C', 1)).toBe('C#');
    expect(transposeNote('C', 2)).toBe('D');
    expect(transposeNote('C', 3)).toBe('D#');
    expect(transposeNote('C', 12)).toBe('C'); // Octave
  });

  it('should transpose down by semitones', () => {
    expect(transposeNote('C', -1)).toBe('B');
    expect(transposeNote('C', -2)).toBe('A#');
    expect(transposeNote('D', -2)).toBe('C');
  });

  it('should prefer flats when requested', () => {
    expect(transposeNote('C', 1, true)).toBe('Db');
    expect(transposeNote('C', 3, true)).toBe('Eb');
    expect(transposeNote('F', 1, true)).toBe('Gb');
  });

  it('should wrap around octave correctly', () => {
    expect(transposeNote('B', 1)).toBe('C');
    expect(transposeNote('C', -1)).toBe('B');
    expect(transposeNote('A', 15)).toBe('C'); // +15 = +3 + octave
  });
});

describe('transposeChord', () => {
  it('should transpose major chords', () => {
    expect(transposeChord('C', 2)).toBe('D');
    expect(transposeChord('D', 3)).toBe('F');
    expect(transposeChord('G', 5)).toBe('C');
  });

  it('should transpose minor chords', () => {
    expect(transposeChord('Am', 2)).toBe('Bm');
    expect(transposeChord('Dm', 3)).toBe('Fm');
  });

  it('should transpose seventh chords', () => {
    expect(transposeChord('G7', 2)).toBe('A7');
    expect(transposeChord('Cmaj7', 5)).toBe('Fmaj7');
  });

  it('should transpose complex chords', () => {
    expect(transposeChord('Am7', 2)).toBe('Bm7');
    expect(transposeChord('Dsus4', 3)).toBe('Fsus4');
  });

  it('should transpose slash chords', () => {
    expect(transposeChord('C/G', 2)).toBe('D/A');
    expect(transposeChord('F/C', -1)).toBe('E/B');
  });

  it('should handle sharp chords', () => {
    expect(transposeChord('F#m', 2)).toBe('G#m');
    expect(transposeChord('C#7', 1)).toBe('D7');
  });

  it('should prefer flats when requested', () => {
    expect(transposeChord('C', 1, true)).toBe('Db');
    expect(transposeChord('Am', 3, true)).toBe('Cm');
    expect(transposeChord('F/C', 1, true)).toBe('Gb/Db');
  });

  it('should return same chord when transposing by 0', () => {
    expect(transposeChord('Cmaj7', 0)).toBe('Cmaj7');
    expect(transposeChord('F#m7', 0)).toBe('F#m7');
  });

  it('should handle full circle transposition', () => {
    expect(transposeChord('C', 12)).toBe('C');
    expect(transposeChord('Am7', -12)).toBe('Am7');
  });

  it('should handle negative transposition', () => {
    expect(transposeChord('D', -2)).toBe('C');
    expect(transposeChord('G7', -5)).toBe('D7');
  });
});

describe('keyUsesFlats', () => {
  it('should identify flat keys', () => {
    expect(keyUsesFlats('F')).toBe(true);
    expect(keyUsesFlats('Bb')).toBe(true);
    expect(keyUsesFlats('Eb')).toBe(true);
    expect(keyUsesFlats('Ab')).toBe(true);
    expect(keyUsesFlats('Db')).toBe(true);
    expect(keyUsesFlats('Gb')).toBe(true);
  });

  it('should identify sharp/natural keys', () => {
    expect(keyUsesFlats('C')).toBe(false);
    expect(keyUsesFlats('G')).toBe(false);
    expect(keyUsesFlats('D')).toBe(false);
    expect(keyUsesFlats('A')).toBe(false);
    expect(keyUsesFlats('E')).toBe(false);
    expect(keyUsesFlats('B')).toBe(false);
  });
});

describe('Real-world transposition scenarios', () => {
  it('should transpose from C to D', () => {
    const chords = ['C', 'F', 'G', 'Am'];
    const transposed = chords.map(c => transposeChord(c, 2));
    expect(transposed).toEqual(['D', 'G', 'A', 'Bm']);
  });

  it('should transpose from G to A', () => {
    const chords = ['G', 'C', 'D', 'Em'];
    const transposed = chords.map(c => transposeChord(c, 2));
    expect(transposed).toEqual(['A', 'D', 'E', 'F#m']);
  });

  it('should transpose from D to Eb using flats', () => {
    const chords = ['D', 'G', 'A', 'Bm'];
    const transposed = chords.map(c => transposeChord(c, 1, true));
    expect(transposed).toEqual(['Eb', 'Ab', 'Bb', 'Cm']);
  });

  it('should handle worship song progression', () => {
    // Common I-V-vi-IV progression in C
    const chords = ['C', 'G', 'Am', 'F'];
    
    // Transpose to G
    const inG = chords.map(c => transposeChord(c, 7));
    expect(inG).toEqual(['G', 'D', 'Em', 'C']);
    
    // Transpose to D
    const inD = chords.map(c => transposeChord(c, 2));
    expect(inD).toEqual(['D', 'A', 'Bm', 'G']);
  });
});
