<script lang="ts">
  import { parseProFile, type ProDocument, type Slide, type Chord } from '$lib/parser';
  import { transposeChord, KEYS, type MusicKey } from '$lib/transpose';
  import ChordEditor from '$lib/components/ChordEditor.svelte';
  import KeySelector from '$lib/components/KeySelector.svelte';
  import Sidebar from '$lib/components/Sidebar.svelte';

  let document = $state<ProDocument | null>(null);
  let selectedSlideIndex = $state(0);
  let currentKey = $state<MusicKey>('C');
  let targetKey = $state<MusicKey>('C');
  let isDragging = $state(false);

  async function handleFileDrop(e: DragEvent) {
    e.preventDefault();
    isDragging = false;
    
    const file = e.dataTransfer?.files[0];
    if (file && file.name.endsWith('.pro')) {
      const buffer = await file.arrayBuffer();
      document = await parseProFile(buffer);
      if (document?.originalKey) {
        currentKey = document.originalKey;
        targetKey = document.originalKey;
      }
    }
  }

  async function handleFileSelect(e: Event) {
    const input = e.target as HTMLInputElement;
    const file = input.files?.[0];
    if (file) {
      const buffer = await file.arrayBuffer();
      document = await parseProFile(buffer);
      if (document?.originalKey) {
        currentKey = document.originalKey;
        targetKey = document.originalKey;
      }
    }
  }

  function handleKeyChange(newKey: MusicKey) {
    targetKey = newKey;
  }

  $effect(() => {
    // When target key changes, transpose all chords
    if (document && targetKey !== currentKey) {
      // Transposition will be handled in the editor display
    }
  });

  let selectedSlide = $derived(document?.slides[selectedSlideIndex] ?? null);
  let semitoneShift = $derived(KEYS.indexOf(targetKey) - KEYS.indexOf(currentKey));
</script>

<div 
  class="h-screen flex flex-col"
  ondragover={(e) => { e.preventDefault(); isDragging = true; }}
  ondragleave={() => isDragging = false}
  ondrop={handleFileDrop}
>
  <!-- Header -->
  <header class="flex items-center justify-between px-4 py-3 bg-[var(--bg-secondary)] border-b border-[var(--border)]">
    <div class="flex items-center gap-4">
      <h1 class="text-lg font-semibold">ProPresenter Chord Editor</h1>
      {#if document}
        <span class="text-[var(--text-secondary)] text-sm">{document.name}</span>
      {/if}
    </div>
    
    <div class="flex items-center gap-4">
      {#if document}
        <KeySelector 
          {currentKey} 
          {targetKey} 
          onChange={handleKeyChange}
        />
        <button 
          class="px-4 py-2 bg-[var(--accent)] hover:bg-[var(--accent-hover)] rounded-lg text-sm font-medium transition-colors"
          onclick={() => {/* TODO: Export */}}
        >
          Export .pro
        </button>
      {/if}
    </div>
  </header>

  <!-- Main Content -->
  <div class="flex flex-1 overflow-hidden">
    {#if document}
      <!-- Sidebar -->
      <Sidebar 
        slides={document.slides}
        {selectedSlideIndex}
        onSelect={(i) => selectedSlideIndex = i}
      />
      
      <!-- Editor -->
      <main class="flex-1 overflow-auto p-8">
        {#if selectedSlide}
          <ChordEditor 
            slide={selectedSlide}
            {semitoneShift}
          />
        {/if}
      </main>
    {:else}
      <!-- Empty State / Drop Zone -->
      <div class="flex-1 flex items-center justify-center">
        <div 
          class="text-center p-12 border-2 border-dashed rounded-2xl transition-colors {isDragging ? 'border-[var(--accent)] bg-[var(--accent)]/10' : 'border-[var(--border)]'}"
        >
          <div class="text-5xl mb-4">🎵</div>
          <h2 class="text-xl font-semibold mb-2">Drop a .pro file here</h2>
          <p class="text-[var(--text-secondary)] mb-4">or click to browse</p>
          <label class="px-4 py-2 bg-[var(--accent)] hover:bg-[var(--accent-hover)] rounded-lg text-sm font-medium cursor-pointer transition-colors">
            Choose File
            <input 
              type="file" 
              accept=".pro"
              class="hidden"
              onchange={handleFileSelect}
            />
          </label>
        </div>
      </div>
    {/if}
  </div>
</div>
