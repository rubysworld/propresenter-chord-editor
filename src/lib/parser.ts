import { PP_KEY_MAP, type MusicKey } from './transpose';

export interface Chord {
  root: string;
  quality: number; // 0=major, 1=minor, etc.
  extension?: number; // 7, 9, 11, 13
  position: number; // Character index in the text
  display: string; // Human-readable chord string
}

export interface Slide {
  id: string;
  label: string;
  text: string;
  chords: Chord[];
  rawHtml?: string;
}

export interface ProDocument {
  name: string;
  slides: Slide[];
  originalKey?: MusicKey;
  rawData?: ArrayBuffer;
}

// Quality enum to string
const QUALITY_MAP: Record<number, string> = {
  0: '', // Major
  1: 'm', // Minor
  2: 'dim',
  3: 'aug',
  4: 'sus2',
  5: 'sus4',
  6: 'add',
  // ... more can be added
};

// Convert chord data to display string
function chordToString(chord: { root: string; quality?: number; number?: number }): string {
  const quality = chord.quality !== undefined ? (QUALITY_MAP[chord.quality] ?? '') : '';
  const extension = chord.number ? String(chord.number) : '';
  return `${chord.root}${quality}${extension}`;
}

// Parse a .pro file (protobuf format)
export async function parseProFile(buffer: ArrayBuffer): Promise<ProDocument> {
  try {
    const { parseProPresenterFile } = await import('./protobuf');
    return await parseProPresenterFile(buffer);
  } catch (error) {
    console.error('Failed to parse .pro file:', error);
    throw new Error('Failed to parse ProPresenter file. Make sure this is a valid .pro file.');
  }
}

// Export a ProDocument back to .pro format
export async function exportProFile(doc: ProDocument): Promise<ArrayBuffer> {
  try {
    const { exportProPresenterFile } = await import('./protobuf');
    return await exportProPresenterFile(doc);
  } catch (error) {
    console.error('Failed to export .pro file:', error);
    throw new Error('Failed to export ProPresenter file.');
  }
}

// Parse chord from ProPresenter's protobuf format
export function parseProChord(data: {
  root?: string;
  quality?: number;
  number?: number;
  range?: { location: number; length: number };
}): Chord | null {
  if (!data.root) return null;
  
  const chordData = {
    root: data.root,
    quality: data.quality,
    number: data.number
  };
  
  return {
    root: data.root,
    quality: data.quality ?? 0,
    extension: data.number,
    position: data.range?.location ?? 0,
    display: chordToString(chordData)
  };
}
