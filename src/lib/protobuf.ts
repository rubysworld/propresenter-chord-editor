/**
 * ProPresenter Protobuf Parser for Browser
 * Uses real ProPresenter proto definitions
 */

import protobuf from 'protobufjs';
import type { Chord, ProDocument, Slide } from './parser';
import { PP_KEY_MAP, type MusicKey } from './transpose';

// Cached proto root
let protoRoot: protobuf.Root | null = null;

/**
 * Load protobuf definitions from embedded proto files
 * Works in both browser (fetch) and Node.js (fs) environments
 */
async function loadProtoDefinitions(): Promise<protobuf.Root> {
  if (protoRoot) return protoRoot;

  // Detect environment
  const isNode = typeof process !== 'undefined' && process.versions?.node;
  
  if (isNode) {
    // Node.js environment (testing)
    const { loadProtoDefinitionsNode } = await import('./protobuf.node.js');
    protoRoot = await loadProtoDefinitionsNode();
  } else {
    // Browser environment
    protoRoot = new protobuf.Root();
    
    // Implement custom fetch for protobufjs to load imports
    // @ts-ignore - fetch is a valid property on Root
    protoRoot.fetch = async (filename: string, callback: any) => {
      try {
        const response = await fetch(`/proto/Proto 19beta/${filename}`);
        if (!response.ok) {
          return callback(new Error(`Failed to fetch ${filename}: ${response.statusText}`));
        }
        const content = await response.text();
        callback(null, content);
      } catch (e) {
        callback(e);
      }
    };

    // Load presentation.proto - it will automatically fetch all imports
    try {
      await protoRoot.load('presentation.proto', { keepCase: true });
    } catch (e) {
      console.error('Failed to load proto definitions in browser:', e);
      throw e;
    }
  }

  return protoRoot;
}

/**
 * Get a protobuf message type by name
 */
async function getMessageType(typeName: string): Promise<protobuf.Type> {
  const root = await loadProtoDefinitions();
  return root.lookupType(typeName);
}

/**
 * Extract plain text from RTF data
 */
function rtfToText(rtfData: Uint8Array | string): string {
  let rtf: string;
  if (typeof rtfData === 'string') {
    rtf = rtfData;
  } else {
    rtf = new TextDecoder('utf-8').decode(rtfData);
  }

  // Simple RTF to text conversion
  let text = rtf
    // Remove RTF header
    .replace(/^\{\\rtf1[^}]*\}?/, '')
    // Handle line breaks
    .replace(/\\par\b/g, '\n')
    .replace(/\\line\b/g, '\n')
    // Remove font tables
    .replace(/\{\\fonttbl[^}]*\}/g, '')
    // Remove color tables
    .replace(/\{\\colortbl[^}]*\}/g, '')
    // Remove stylesheet
    .replace(/\{\\stylesheet[^}]*\}/g, '')
    // Remove other control words
    .replace(/\\[a-z]+[-]?\d*\s?/gi, '')
    // Remove groups
    .replace(/[{}]/g, '')
    // Clean up whitespace
    .replace(/\s+/g, ' ')
    .trim();

  // Decode hex characters
  text = text.replace(/\\'([0-9a-f]{2})/gi, (_, hex) => {
    return String.fromCharCode(parseInt(hex, 16));
  });

  // Clean up ProPresenter specific formatting artifacts
  text = text.replace(/^\\?\*;*\s*/g, '');        // Remove leading \*;;; or *;;;
  text = text.replace(/\\\s*$/g, '');             // Remove trailing backslashes
  text = text.replace(/\\ /g, '\n');              // Convert backslash-space to newline
  text = text.trim();

  return text;
}

/**
 * Parse chord data from protobuf custom attributes
 */
function parseChordData(customAttributes: any[]): Chord[] {
  const chords: Chord[] = [];
  
  for (const attr of customAttributes) {
    if (attr.chord && attr.range) {
      const chord = attr.chord;
      const range = attr.range;
      
      // Build display string
      let display = chord.root || '';
      
      // Add quality (major, minor, etc)
      const qualityMap: Record<number, string> = {
        0: '',      // Major
        1: 'm',     // Minor
        2: 'dim',   // Diminished
        3: 'aug',   // Augmented
        4: 'sus2',  // Suspended 2nd
        5: 'sus4',  // Suspended 4th
      };
      
      if (chord.quality !== undefined && chord.quality !== 0) {
        display += qualityMap[chord.quality] || '';
      }
      
      // Add extension/number
      if (chord.number) {
        display += String(chord.number);
      }
      
      chords.push({
        root: chord.root || '',
        quality: chord.quality || 0,
        extension: chord.number,
        position: range.location || 0,
        display,
      });
    }
  }
  
  return chords;
}

/**
 * Extract slides from presentation data
 */
function extractSlides(presentation: any): Slide[] {
  const slides: Slide[] = [];
  
  const cues = presentation.cues || [];
  
  for (let i = 0; i < cues.length; i++) {
    const cue = cues[i];
    
    // Get slide from cue's actions
    // ProPresenter structure: cue.actions[].slide.presentation (PresentationSlide)
    let slideData: any = null;
    for (const action of cue.actions || []) {
      if (action.slide?.presentation) {
        slideData = action.slide.presentation;
        break;
      }
    }
    
    if (!slideData) continue;
    
    // KEY FIX: PresentationSlide.baseSlide contains the actual Slide with elements
    // The old code checked slideData.elements first, which doesn't exist
    const baseSlide = slideData.baseSlide;
    if (!baseSlide) continue;
    
    const elements = baseSlide.elements || [];
    
    // Extract text and chords from slide elements
    let text = '';
    const chords: Chord[] = [];
    
    for (const element of elements) {
      // Each element is a Slide.Element wrapping a Graphics.Element
      const graphicsElement = element.element;
      if (!graphicsElement) continue;
      
      const textElement = graphicsElement.text;
      if (!textElement?.rtfData) continue;
      
      // Extract text from RTF
      const elementText = rtfToText(textElement.rtfData);
      if (elementText) {
        text = elementText;
      }
      
      // Extract chords from custom attributes
      if (textElement.attributes?.customAttributes) {
        const elementChords = parseChordData(textElement.attributes.customAttributes);
        chords.push(...elementChords);
      }
    }
    
    slides.push({
      id: cue.uuid?.string || `slide-${i}`,
      label: cue.name || `Slide ${i + 1}`,
      text,
      chords,
    });
  }
  
  return slides;
}

/**
 * Parse a ProPresenter .pro file from ArrayBuffer
 */
export async function parseProPresenterFile(buffer: ArrayBuffer): Promise<ProDocument> {
  try {
    const PresentationType = await getMessageType('rv.data.Presentation');
    
    const uint8Array = new Uint8Array(buffer);
    const message = PresentationType.decode(uint8Array);
    const presentation = PresentationType.toObject(message, {
      longs: String,
      bytes: Array,
      defaults: true,
    });
    
    // Extract slides with chords
    const slides = extractSlides(presentation);
    
    // Extract music key info
    let originalKey: MusicKey | undefined;
    let currentKey: MusicKey | undefined;
    
    if (presentation.music?.originalMusicKey) {
      const key = presentation.music.originalMusicKey as string;
      if (key in PP_KEY_MAP) {
        originalKey = key as MusicKey;
      }
    }
    
    if (presentation.music?.userMusicKey) {
      const key = presentation.music.userMusicKey as string;
      if (key in PP_KEY_MAP) {
        currentKey = key as MusicKey;
      }
    }
    
    return {
      name: presentation.name || 'Untitled',
      slides,
      originalKey,
      currentKey: currentKey || originalKey,
      rawData: buffer,
      modified: false,
    };
  } catch (error) {
    console.error('Failed to parse .pro file:', error);
    throw error;
  }
}

/**
 * Export a ProDocument back to .pro format
 * TODO: Implement when write support is needed
 */
export async function exportProPresenterFile(doc: ProDocument): Promise<ArrayBuffer> {
  throw new Error('Export not yet implemented - requires full protobuf encoding');
}
