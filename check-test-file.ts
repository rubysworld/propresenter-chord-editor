import { readPresentation, getPresentationSummary, getCueText, getSlideChords } from '../propresenter-protobuf/src/lib/index.js';

async function check() {
  const pres = await readPresentation('./src/lib/__tests__/test-song.pro');
  console.log('Name:', pres.name);
  console.log('Cues:', pres.cues?.length);
  console.log('Groups:', pres.cueGroups?.length);
  console.log('Music:', pres.music);
  
  console.log('\nSummary:');
  console.log(getPresentationSummary(pres));
  
  if (pres.cues && pres.cues.length > 0) {
    console.log('\nFirst slide text:', getCueText(pres.cues[0]));
    
    // Check for slides with chords
    for (const cue of pres.cues) {
      const slide = cue.actions?.[0]?.slide?.presentation;
      if (slide) {
        const chords = getSlideChords(slide);
        if (chords.length > 0) {
          console.log(`\nSlide "${cue.name}" has ${chords.length} chords:`, chords);
        }
      }
    }
  }
}

check().catch(console.error);
