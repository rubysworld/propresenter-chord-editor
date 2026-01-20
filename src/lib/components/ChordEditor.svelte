<script lang="ts">
  import type { Slide, Chord } from '$lib/parser';
  import { transposeChord, keyUsesFlats } from '$lib/transpose';

  interface Props {
    slide: Slide;
    semitoneShift?: number;
  }

  let { slide, semitoneShift = 0 }: Props = $props();

  // Split text into characters for positioning
  let characters = $derived(slide.text.split(''));
  
  // Get chord at a specific position
  function getChordAt(position: number): Chord | undefined {
    return slide.chords.find(c => c.position === position);
  }

  // Transpose a chord's display string
  function getTransposedChord(chord: Chord): string {
    if (semitoneShift === 0) return chord.display;
    return transposeChord(chord.display, semitoneShift);
  }

  // Handle click to add/edit chord
  function handleCharClick(position: number) {
    const existingChord = getChordAt(position);
    if (existingChord) {
      // TODO: Edit chord modal
      console.log('Edit chord at', position, existingChord);
    } else {
      // TODO: Add chord modal
      console.log('Add chord at', position);
    }
  }
</script>

<div class="chord-editor">
  <div class="slide-label text-sm text-[var(--text-secondary)] mb-4 uppercase tracking-wider">
    {slide.label}
  </div>
  
  <div class="lyrics-container font-mono text-2xl leading-loose select-none">
    {#each characters as char, i}
      {#if char === '\n'}
        <br />
      {:else}
        <span 
          role="button"
          tabindex="0"
          class="char-wrapper relative inline-block cursor-pointer hover:bg-[var(--accent)]/20 rounded"
          onclick={() => handleCharClick(i)}
          onkeydown={(e) => { if (e.key === 'Enter' || e.key === ' ') handleCharClick(i); }}
        >
          <!-- Chord above character -->
          {#if getChordAt(i)}
            <span class="chord-marker absolute -top-8 left-0 text-[var(--accent)] text-base font-bold whitespace-nowrap">
              {getTransposedChord(getChordAt(i)!)}
            </span>
          {/if}
          <!-- The character itself -->
          <span class="char {char === ' ' ? 'text-transparent' : ''}">{char === ' ' ? '·' : char}</span>
        </span>
      {/if}
    {/each}
  </div>
</div>

<style>
  .chord-editor {
    background: var(--bg-secondary);
    border-radius: 12px;
    padding: 2rem;
  }

  .lyrics-container {
    padding-top: 2rem; /* Space for chords above */
  }

  .char-wrapper {
    min-width: 0.6em;
    text-align: center;
    padding: 0 1px;
  }

  .chord-marker {
    pointer-events: none;
    transform: translateX(-25%);
  }
</style>
