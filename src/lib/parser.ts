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
  // For now, return mock data for development
  // TODO: Implement actual protobuf parsing using the proto definitions
  // from ~/ruby/skills/propresenter-proto/
  
  console.log('Parsing .pro file, size:', buffer.byteLength);
  
  // Mock data for UI development
  return {
    name: 'Sample Song.pro',
    originalKey: 'G',
    slides: [
      {
        id: '1',
        label: 'Verse 1',
        text: 'Amazing grace how sweet the sound\nThat saved a wretch like me',
        chords: [
          { root: 'G', quality: 0, position: 0, display: 'G' },
          { root: 'C', quality: 0, position: 14, display: 'C' },
          { root: 'G', quality: 0, position: 25, display: 'G' },
          { root: 'D', quality: 0, position: 36, display: 'D' },
          { root: 'G', quality: 0, position: 51, display: 'G' },
        ]
      },
      {
        id: '2',
        label: 'Verse 2',
        text: "I once was lost but now I'm found\nWas blind but now I see",
        chords: [
          { root: 'G', quality: 0, position: 0, display: 'G' },
          { root: 'C', quality: 0, position: 14, display: 'C' },
          { root: 'G', quality: 0, position: 28, display: 'G' },
          { root: 'D', quality: 0, position: 43, display: 'D' },
          { root: 'G', quality: 0, position: 56, display: 'G' },
        ]
      },
      {
        id: '3',
        label: 'Chorus',
        text: 'How sweet the sound\nThat saved a wretch like me',
        chords: [
          { root: 'E', quality: 1, position: 0, display: 'Em' },
          { root: 'C', quality: 0, position: 10, display: 'C' },
          { root: 'G', quality: 0, position: 26, display: 'G' },
          { root: 'D', quality: 0, position: 38, display: 'D' },
        ]
      }
    ]
  };
}

// Export a ProDocument back to .pro format
export async function exportProFile(doc: ProDocument): Promise<ArrayBuffer> {
  // TODO: Implement actual protobuf encoding
  console.log('Exporting document:', doc.name);
  
  // For now, return empty buffer
  return new ArrayBuffer(0);
}

// Parse chord from ProPresenter's protobuf format
export function parseProChord(data: {
  root?: string;
  quality?: number;
  number?: number;
  range?: { location: number; length: number };
}): Chord | null {
  if (!data.root) return null;
  
  return {
    root: data.root,
    quality: data.quality ?? 0,
    extension: data.number,
    position: data.range?.location ?? 0,
    display: chordToString(data)
  };
}
