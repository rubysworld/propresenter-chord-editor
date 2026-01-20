<script lang="ts">
  import type { Slide } from '$lib/parser';

  interface Props {
    slides: Slide[];
    selectedSlideIndex: number;
    onSelect: (index: number) => void;
  }

  let { slides, selectedSlideIndex, onSelect }: Props = $props();
</script>

<aside class="w-64 bg-[var(--bg-secondary)] border-r border-[var(--border)] overflow-y-auto">
  <div class="p-4">
    <h2 class="text-xs font-semibold text-[var(--text-secondary)] uppercase tracking-wider mb-3">
      Slides ({slides.length})
    </h2>
    
    <div class="space-y-2">
      {#each slides as slide, i}
        <button
          class="w-full text-left p-3 rounded-lg transition-colors {selectedSlideIndex === i ? 'bg-[var(--accent)] text-white' : 'hover:bg-[var(--bg-tertiary)]'}"
          onclick={() => onSelect(i)}
        >
          <div class="font-medium text-sm mb-1">{slide.label || `Slide ${i + 1}`}</div>
          <div class="text-xs truncate {selectedSlideIndex === i ? 'text-white/70' : 'text-[var(--text-secondary)]'}">
            {slide.text.split('\n')[0]}
          </div>
          {#if slide.chords.length > 0}
            <div class="text-xs mt-1 {selectedSlideIndex === i ? 'text-white/50' : 'text-[var(--accent)]/70'}">
              {slide.chords.length} chord{slide.chords.length !== 1 ? 's' : ''}
            </div>
          {/if}
        </button>
      {/each}
    </div>
  </div>
</aside>
