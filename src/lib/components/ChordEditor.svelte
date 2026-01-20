<script lang="ts">
  import type { Slide, Chord } from '$lib/parser';
  import { transposeChord, keyUsesFlats } from '$lib/transpose';
  import ChordModal from './ChordModal.svelte';

  interface Props {
    slide: Slide;
    semitoneShift?: number;
  }

  let { slide, semitoneShift = 0 }: Props = $props();

  // Modal state
  let showModal = $state(false);
  let editPosition = $state(0);
  let editingChord = $state<Chord | undefined>(undefined);

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
    editPosition = position;
    editingChord = getChordAt(position);
    showModal = true;
  }

  // Save chord (add or update)
  function handleSaveChord(chord: Chord) {
    const existingIndex = slide.chords.findIndex(c => c.position === chord.position);
    if (existingIndex >= 0) {
      slide.chords[existingIndex] = chord;
    } else {
      slide.chords.push(chord);
      slide.chords.sort((a, b) => a.position - b.position);
    }
    showModal = false;
  }

  // Delete chord
  function handleDeleteChord() {
    slide.chords = slide.chords.filter(c => c.position !== editPosition);
    showModal = false;
  }

  // Close modal
  function handleCloseModal() {
    showModal = false;
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

<ChordModal
  show={showModal}
  position={editPosition}
  existingChord={editingChord}
  onSave={handleSaveChord}
  onDelete={editingChord ? handleDeleteChord : undefined}
  onClose={handleCloseModal}
/>

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
