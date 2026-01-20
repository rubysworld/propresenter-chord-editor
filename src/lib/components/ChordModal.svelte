<script lang="ts">
  import type { Chord } from '$lib/parser';

  interface Props {
    show: boolean;
    position: number;
    existingChord?: Chord;
    onSave: (chord: Chord) => void;
    onDelete?: () => void;
    onClose: () => void;
  }

  let { show, position, existingChord, onSave, onDelete, onClose }: Props = $props();

  let root = $state('C');
  let quality = $state(0);
  let extension = $state<number | undefined>(undefined);

  // Update form values when existingChord changes
  $effect(() => {
    root = existingChord?.root || 'C';
    quality = existingChord?.quality || 0;
    extension = existingChord?.extension;
  });

  const ROOTS = ['C', 'C#', 'D', 'D#', 'E', 'F', 'F#', 'G', 'G#', 'A', 'A#', 'B'];
  const QUALITIES = [
    { value: 0, label: 'Major' },
    { value: 1, label: 'Minor (m)' },
    { value: 2, label: 'Diminished (dim)' },
    { value: 3, label: 'Augmented (aug)' },
    { value: 4, label: 'Suspended 2 (sus2)' },
    { value: 5, label: 'Suspended 4 (sus4)' }
  ];
  const EXTENSIONS = [
    { value: undefined, label: 'None' },
    { value: 7, label: '7' },
    { value: 9, label: '9' },
    { value: 11, label: '11' },
    { value: 13, label: '13' }
  ];

  function handleSave() {
    const qualityMap: Record<number, string> = {
      0: '', 1: 'm', 2: 'dim', 3: 'aug', 4: 'sus2', 5: 'sus4'
    };
    const qualityStr = qualityMap[quality] ?? '';
    const extensionStr = extension ? String(extension) : '';
    const display = `${root}${qualityStr}${extensionStr}`;

    onSave({
      root,
      quality,
      extension,
      position,
      display
    });
  }

  function handleKeydown(e: KeyboardEvent) {
    if (e.key === 'Escape') onClose();
    if (e.key === 'Enter') handleSave();
  }
</script>

{#if show}
  <div 
    class="modal-backdrop fixed inset-0 bg-black/50 flex items-center justify-center z-50"
    onclick={onClose}
    onkeydown={handleKeydown}
    role="dialog"
    aria-modal="true"
    tabindex="-1"
  >
    <!-- svelte-ignore a11y_no_static_element_interactions -->
    <div 
      class="modal-content bg-[var(--bg-secondary)] rounded-xl p-6 min-w-96 shadow-2xl"
      onclick={(e) => e.stopPropagation()}
      onkeydown={(e) => e.stopPropagation()}
    >
      <h2 class="text-xl font-semibold mb-4">
        {existingChord ? 'Edit Chord' : 'Add Chord'}
      </h2>

      <div class="space-y-4">
        <!-- Root Note -->
        <div>
          <label for="chord-root" class="block text-sm font-medium mb-2">Root Note</label>
          <select 
            id="chord-root"
            bind:value={root}
            class="w-full px-3 py-2 bg-[var(--bg)] border border-[var(--border)] rounded-lg"
          >
            {#each ROOTS as noteRoot}
              <option value={noteRoot}>{noteRoot}</option>
            {/each}
          </select>
        </div>

        <!-- Quality -->
        <div>
          <label for="chord-quality" class="block text-sm font-medium mb-2">Quality</label>
          <select 
            id="chord-quality"
            bind:value={quality}
            class="w-full px-3 py-2 bg-[var(--bg)] border border-[var(--border)] rounded-lg"
          >
            {#each QUALITIES as q}
              <option value={q.value}>{q.label}</option>
            {/each}
          </select>
        </div>

        <!-- Extension -->
        <div>
          <label for="chord-extension" class="block text-sm font-medium mb-2">Extension</label>
          <select 
            id="chord-extension"
            bind:value={extension}
            class="w-full px-3 py-2 bg-[var(--bg)] border border-[var(--border)] rounded-lg"
          >
            {#each EXTENSIONS as ext}
              <option value={ext.value}>{ext.label}</option>
            {/each}
          </select>
        </div>

        <!-- Preview -->
        <div class="p-3 bg-[var(--bg)] rounded-lg">
          <div class="text-sm text-[var(--text-secondary)] mb-1">Preview:</div>
          <div class="text-2xl font-bold text-[var(--accent)]">
            {root}{quality === 1 ? 'm' : quality === 2 ? 'dim' : quality === 3 ? 'aug' : quality === 4 ? 'sus2' : quality === 5 ? 'sus4' : ''}{extension || ''}
          </div>
        </div>
      </div>

      <!-- Actions -->
      <div class="flex gap-2 mt-6">
        {#if existingChord && onDelete}
          <button 
            onclick={onDelete}
            class="px-4 py-2 bg-red-500 hover:bg-red-600 rounded-lg text-sm font-medium transition-colors"
          >
            Delete
          </button>
        {/if}
        <div class="flex-1"></div>
        <button 
          onclick={onClose}
          class="px-4 py-2 bg-[var(--bg)] hover:bg-[var(--border)] rounded-lg text-sm font-medium transition-colors"
        >
          Cancel
        </button>
        <button 
          onclick={handleSave}
          class="px-4 py-2 bg-[var(--accent)] hover:bg-[var(--accent-hover)] rounded-lg text-sm font-medium transition-colors"
        >
          Save
        </button>
      </div>
    </div>
  </div>
{/if}

<style>
  .modal-backdrop {
    animation: fadeIn 0.2s ease-out;
  }

  .modal-content {
    animation: slideUp 0.2s ease-out;
  }

  @keyframes fadeIn {
    from { opacity: 0; }
    to { opacity: 1; }
  }

  @keyframes slideUp {
    from {
      opacity: 0;
      transform: translateY(20px);
    }
    to {
      opacity: 1;
      transform: translateY(0);
    }
  }
</style>
