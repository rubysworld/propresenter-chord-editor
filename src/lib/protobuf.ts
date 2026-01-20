/**
 * ProPresenter Protobuf Parser for Browser
 * Adapted from propresenter-protobuf for client-side use
 */

import protobuf from 'protobufjs';
import type { Chord, ProDocument, Slide } from './parser';
import { PP_KEY_MAP, transposeChord, keyToSemitone, type MusicKey } from './transpose';

// Cached proto root
let protoRoot: protobuf.Root | null = null;

/**
 * Load protobuf definitions
 */
async function loadProtoDefinitions(): Promise<protobuf.Root> {
  if (protoRoot) return protoRoot;

  // For browser use, we need to fetch the proto files or embed them
  // For now, we'll use a simplified embedded definition
  protoRoot = protobuf.Root.fromJSON({
    nested: {
      rv: {
        nested: {
          data: {
            nested: {
              Presentation: {
                fields: {
                  applicationInfo: { type: 'ApplicationInfo', id: 1 },
                  uuid: { type: 'UUID', id: 2 },
                  name: { type: 'string', id: 3 },
                  category: { type: 'string', id: 4 },
                  ccli: { type: 'CCLI', id: 5 },
                  cueGroups: { rule: 'repeated', type: 'CueGroup', id: 6 },
                  cues: { rule: 'repeated', type: 'Cue', id: 7 },
                  music: { type: 'MusicKeyInfo', id: 10 }
                }
              },
              CueGroup: {
                fields: {
                  group: { type: 'Group', id: 1 },
                  cueIdentifiers: { rule: 'repeated', type: 'UUID', id: 2 }
                }
              },
              Group: {
                fields: {
                  uuid: { type: 'UUID', id: 1 },
                  name: { type: 'string', id: 2 }
                }
              },
              Cue: {
                fields: {
                  uuid: { type: 'UUID', id: 1 },
                  name: { type: 'string', id: 2 },
                  actions: { rule: 'repeated', type: 'Action', id: 3 }
                }
              },
              Action: {
                fields: {
                  uuid: { type: 'UUID', id: 1 },
                  slide: { type: 'SlideAction', id: 10 }
                }
              },
              SlideAction: {
                fields: {
                  presentation: { type: 'PresentationSlide', id: 1 }
                }
              },
              PresentationSlide: {
                fields: {
                  baseSlide: { type: 'BaseSlide', id: 1 }
                }
              },
              BaseSlide: {
                fields: {
                  uuid: { type: 'UUID', id: 1 },
                  elements: { rule: 'repeated', type: 'Element', id: 2 }
                }
              },
              Element: {
                fields: {
                  element: { type: 'GraphicsElement', id: 1 }
                }
              },
              GraphicsElement: {
                fields: {
                  uuid: { type: 'UUID', id: 1 },
                  name: { type: 'string', id: 2 },
                  text: { type: 'TextElement', id: 10 }
                }
              },
              TextElement: {
                fields: {
                  rtfData: { type: 'bytes', id: 1 },
                  attributes: { type: 'TextAttributes', id: 2 }
                }
              },
              TextAttributes: {
                fields: {
                  customAttributes: { rule: 'repeated', type: 'CustomAttribute', id: 10 }
                }
              },
              CustomAttribute: {
                fields: {
                  chord: { type: 'ChordInfo', id: 1 },
                  range: { type: 'IntRange', id: 2 }
                }
              },
              ChordInfo: {
                fields: {
                  root: { type: 'string', id: 1 },
                  quality: { type: 'int32', id: 2 },
                  number: { type: 'int32', id: 3 }
                }
              },
              IntRange: {
                fields: {
                  location: { type: 'int32', id: 1 },
                  length: { type: 'int32', id: 2 }
                }
              },
              MusicKeyInfo: {
                fields: {
                  original: { type: 'MusicKeyValue', id: 1 },
                  user: { type: 'MusicKeyValue', id: 2 }
                }
              },
              MusicKeyValue: {
                fields: {
                  musicKey: { type: 'int32', id: 1 },
                  musicScale: { type: 'int32', id: 2 }
                }
              },
              UUID: {
                fields: {
                  string: { type: 'string', id: 1 }
                }
              },
              CCLI: {
                fields: {
                  author: { type: 'string', id: 1 },
                  artistCredits: { type: 'string', id: 2 },
                  songTitle: { type: 'string', id: 3 },
                  publisher: { type: 'string', id: 4 },
                  copyrightYear: { type: 'int32', id: 5 },
                  songNumber: { type: 'int32', id: 6 }
                }
              },
              ApplicationInfo: {
                fields: {
                  platform: { type: 'int32', id: 1 },
                  version: { type: 'string', id: 2 }
                }
              }
            }
          }
        }
      }
    }
  });

  return protoRoot;
}

/**
 * RTF to plain text conversion
 */
function rtfToText(rtfData: Uint8Array): string {
  const rtf = new TextDecoder().decode(rtfData);
  
  let text = rtf
    .replace(/^\{\\rtf1[^}]*\}?/, '')
    .replace(/\\par\b/g, '\n')
    .replace(/\\line\b/g, '\n')
    .replace(/\{\\fonttbl[^}]*\}/g, '')
    .replace(/\{\\colortbl[^}]*\}/g, '')
    .replace(/\{\\stylesheet[^}]*\}/g, '')
    .replace(/\\[a-z]+[-]?\d*\s?/gi, '')
    .replace(/[{}]/g, '')
    .replace(/\s+/g, ' ')
    .trim();

  text = text.replace(/\\'([0-9a-f]{2})/gi, (_, hex) => {
    return String.fromCharCode(parseInt(hex, 16));
  });

  text = text.replace(/^\\?\*;*\s*/g, '');
  text = text.replace(/\\\s*$/g, '');
  text = text.replace(/\\ /g, '\n');
  
  return text.trim();
}

/**
 * Parse a .pro file buffer
 */
export async function parseProPresenterFile(buffer: ArrayBuffer): Promise<ProDocument> {
  const root = await loadProtoDefinitions();
  const PresentationType = root.lookupType('rv.data.Presentation');
  
  const message = PresentationType.decode(new Uint8Array(buffer));
  const presentation = PresentationType.toObject(message, {
    longs: String,
    bytes: Uint8Array,
    defaults: true,
  }) as any;

  // Extract original key
  let originalKey: MusicKey | undefined;
  if (presentation.music?.original?.musicKey) {
    originalKey = PP_KEY_MAP[presentation.music.original.musicKey];
  }

  // Build slides from cues
  const slides: Slide[] = [];
  const cueMap = new Map<string, any>();
  
  for (const cue of presentation.cues || []) {
    if (cue.uuid?.string) {
      cueMap.set(cue.uuid.string, cue);
    }
  }

  // Organize by groups
  for (const group of presentation.cueGroups || []) {
    const groupName = group.group?.name || 'Untitled';
    
    for (const id of group.cueIdentifiers || []) {
      const cue = cueMap.get(id.string);
      if (!cue) continue;

      // Extract slide from cue actions
      for (const action of cue.actions || []) {
        const baseSlide = action.slide?.presentation?.baseSlide;
        if (!baseSlide) continue;

        // Extract text and chords
        let text = '';
        const chords: Chord[] = [];

        for (const element of baseSlide.elements || []) {
          const textElement = element.element?.text;
          if (!textElement) continue;

          // Get text
          if (textElement.rtfData) {
            text = rtfToText(textElement.rtfData);
          }

          // Get chords
          for (const attr of textElement.attributes?.customAttributes || []) {
            if (attr.chord && attr.range) {
              const chordData = attr.chord;
              const root = chordData.root || 'C';
              const quality = chordData.quality ?? 0;
              const extension = chordData.number;
              
              // Build display string
              const qualityMap: Record<number, string> = {
                0: '', 1: 'm', 2: 'dim', 3: 'aug', 4: 'sus2', 5: 'sus4'
              };
              const qualityStr = qualityMap[quality] ?? '';
              const extensionStr = extension ? String(extension) : '';
              const display = `${root}${qualityStr}${extensionStr}`;

              chords.push({
                root,
                quality,
                extension,
                position: attr.range.location ?? 0,
                display
              });
            }
          }
        }

        slides.push({
          id: cue.uuid?.string || `slide-${slides.length}`,
          label: groupName,
          text,
          chords
        });
      }
    }
  }

  return {
    name: presentation.name || 'Untitled.pro',
    originalKey,
    slides,
    rawData: buffer
  };
}

/**
 * Export back to .pro format with modifications
 */
export async function exportProPresenterFile(doc: ProDocument): Promise<ArrayBuffer> {
  if (!doc.rawData) {
    throw new Error('No original file data to export');
  }

  const root = await loadProtoDefinitions();
  const PresentationType = root.lookupType('rv.data.Presentation');
  
  // Decode the original message
  const message = PresentationType.decode(new Uint8Array(doc.rawData));
  const presentation = PresentationType.toObject(message, {
    longs: String,
    bytes: Uint8Array,
    defaults: true,
  }) as any;

  // Update the name if changed
  if (doc.name) {
    presentation.name = doc.name;
  }

  // Update music key if changed
  if (doc.currentKey && doc.currentKey !== doc.originalKey) {
    const musicKeyValue = Object.entries(PP_KEY_MAP).find(([_, key]) => key === doc.currentKey)?.[0];
    if (musicKeyValue && presentation.music) {
      presentation.music.user = {
        musicKey: parseInt(musicKeyValue),
        musicScale: presentation.music.original?.musicScale || 0
      };
    }
  }

  // Build a map of slide ID to modified slide data
  const slideMap = new Map<string, Slide>();
  for (const slide of doc.slides) {
    slideMap.set(slide.id, slide);
  }

  // Update slides with chord modifications
  for (const cue of presentation.cues || []) {
    const cueId = cue.uuid?.string;
    if (!cueId) continue;

    const modifiedSlide = slideMap.get(cueId);
    if (!modifiedSlide) continue;

    // Update each action's slide data
    for (const action of cue.actions || []) {
      const baseSlide = action.slide?.presentation?.baseSlide;
      if (!baseSlide) continue;

      // Update text elements with new chord data
      for (const element of baseSlide.elements || []) {
        const textElement = element.element?.text;
        if (!textElement) continue;

        // Rebuild custom attributes with modified chords
        if (!textElement.attributes) {
          textElement.attributes = { customAttributes: [] };
        }

        // Clear existing chord attributes
        textElement.attributes.customAttributes = (textElement.attributes.customAttributes || [])
          .filter((attr: any) => !attr.chord);

        // Calculate semitone shift for transposition
        const semitoneShift = doc.currentKey && doc.originalKey
          ? keyToSemitone(doc.currentKey) - keyToSemitone(doc.originalKey)
          : 0;

        // Add modified chords (with transposition if needed)
        for (const chord of modifiedSlide.chords) {
          // Transpose if needed
          let chordRoot = chord.root;
          if (semitoneShift !== 0) {
            const transposedDisplay = transposeChord(chord.display, semitoneShift);
            // Extract just the root from transposed chord (first 1-2 chars)
            chordRoot = transposedDisplay.match(/^[A-G][b#]?/)?.[0] || chord.root;
          }

          textElement.attributes.customAttributes.push({
            chord: {
              root: chordRoot,
              quality: chord.quality,
              number: chord.extension || 0
            },
            range: {
              location: chord.position,
              length: chord.display.length
            }
          });
        }
      }
    }
  }

  // Re-encode the modified presentation
  const modifiedMessage = PresentationType.fromObject(presentation);
  const encoded = PresentationType.encode(modifiedMessage).finish();
  
  return encoded.buffer.slice(encoded.byteOffset, encoded.byteOffset + encoded.byteLength);
}
