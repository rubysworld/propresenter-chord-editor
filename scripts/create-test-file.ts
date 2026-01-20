/**
 * Create a test .pro file with known chords for testing
 */

import * as fs from 'fs/promises';
import * as path from 'path';
import { fileURLToPath } from 'url';

const __filename = fileURLToPath(import.meta.url);
const __dirname = path.dirname(__filename);

// Import from the working protobuf library
import {
  loadProtoDefinitions,
  writePresentation,
  textToRtf,
  generateUuid,
  type Presentation,
  type Cue,
  type CueGroup
} from '../../propresenter-protobuf/src/lib/index.js';

async function createTestPresentation(): Promise<Presentation> {
  // Create a simple presentation with chords
  const slides = [
    { text: 'Amazing Grace', chords: [{ chord: 'G', position: 0 }] },
    { text: 'How sweet the sound', chords: [{ chord: 'C', position: 0 }, { chord: 'G', position: 10 }] },
    { text: 'That saved a wretch like me', chords: [{ chord: 'D', position: 0 }, { chord: 'G', position: 15 }] },
  ];

  const cues: Cue[] = [];
  
  for (let i = 0; i < slides.length; i++) {
    const slide = slides[i];
    const cueUuid = generateUuid();
    
    // Create text element with RTF data
    const rtfData = Buffer.from(textToRtf(slide.text));
    
    // Create custom attributes for chords
    const customAttributes = slide.chords.map(c => ({
      chord: {
        root: c.chord,
        quality: 0, // Major
        number: 0
      },
      range: {
        location: c.position,
        length: slide.text.length - c.position
      }
    }));
    
    // Create slide with text element
    const slideData = {
      uuid: generateUuid(),
      elements: [{
        element: {
          uuid: generateUuid(),
          name: slide.text,
          bounds: {
            origin: { x: 0, y: 0 },
            size: { width: 1920, height: 1080 }
          },
          text: {
            rtfData,
            attributes: customAttributes.length > 0 ? { customAttributes } : undefined,
            verticalAlignment: 0
          }
        }
      }],
      size: { width: 1920, height: 1080 },
      backgroundColor: { red: 0, green: 0, blue: 0, alpha: 1 }
    };
    
    // Create cue with slide action
    cues.push({
      uuid: cueUuid,
      name: `Slide ${i + 1}`,
      isEnabled: true,
      actions: [{
        uuid: generateUuid(),
        type: 0, // Slide action
        slide: {
          presentation: slideData
        }
      }]
    });
  }

  // Create cue group
  const groupUuid = generateUuid();
  const cueGroups: CueGroup[] = [{
    group: {
      uuid: groupUuid,
      name: 'Verse 1',
      color: { red: 0, green: 0.5, blue: 1, alpha: 1 }
    },
    cueIdentifiers: cues.map(c => c.uuid!)
  }];

  const presentation: Presentation = {
    uuid: generateUuid(),
    name: 'Test Song with Chords',
    category: 'Test',
    cues,
    cueGroups,
    ccli: {
      songTitle: 'Test Song',
      author: 'Test Author',
      songNumber: 12345,
      display: true
    },
    music: {
      originalMusicKey: 'G',
      userMusicKey: 'G'
    }
  };

  return presentation;
}

async function main() {
  console.log('Creating test .pro file...');
  
  // Ensure test directory exists
  const testDir = path.join(__dirname, '..', 'src', 'lib', '__tests__');
  await fs.mkdir(testDir, { recursive: true });
  
  // Create presentation
  const presentation = await createTestPresentation();
  
  // Write to file
  const filePath = path.join(testDir, 'test-song.pro');
  await writePresentation(filePath, presentation);
  
  console.log(`✅ Created test file: ${filePath}`);
  console.log(`   Name: ${presentation.name}`);
  console.log(`   Slides: ${presentation.cues?.length || 0}`);
  console.log(`   Groups: ${presentation.cueGroups?.length || 0}`);
}

main().catch(console.error);
