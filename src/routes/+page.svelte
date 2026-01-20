<script lang="ts">
  import { parseProFile, exportProFile, type ProDocument, type Slide, type Chord } from '$lib/parser';
  import { transposeChord, keyToSemitone, type MusicKey } from '$lib/transpose';
  import { HistoryManager } from '$lib/history';
  import ChordEditor from '$lib/components/ChordEditor.svelte';
  import KeySelector from '$lib/components/KeySelector.svelte';
  import Sidebar from '$lib/components/Sidebar.svelte';

  let document = $state<ProDocument | null>(null);
  let selectedSlideIndex = $state(0);
  let currentKey = $state<MusicKey>('C');
  let targetKey = $state<MusicKey>('C');
  let isDragging = $state(false);
  let history = new HistoryManager();
  let canUndo = $state(false);
  let canRedo = $state(false);
  let isLoading = $state(false);
  let errorMessage = $state<string | null>(null);

  async function handleFileDrop(e: DragEvent) {
    e.preventDefault();
    isDragging = false;
    
    const file = e.dataTransfer?.files[0];
    if (!file) return;
    
    if (!file.name.endsWith('.pro')) {
      errorMessage = 'Please drop a .pro file (ProPresenter presentation)';
      setTimeout(() => errorMessage = null, 3000);
      return;
    }

    await loadFile(file);
  }

  async function handleFileSelect(e: Event) {
    const input = e.target as HTMLInputElement;
    const file = input.files?.[0];
    if (!file) return;

    await loadFile(file);
    input.value = ''; // Reset input
  }

  async function loadFile(file: File) {
    isLoading = true;
    errorMessage = null;
    
    try {
      const buffer = await file.arrayBuffer();
      document = await parseProFile(buffer);
      
      if (document?.originalKey) {
        currentKey = document.originalKey;
        targetKey = document.originalKey;
        document.currentKey = document.originalKey;
      }
      
      // Initialize history with the loaded document
      history.clear();
      history.push(document);
      updateHistoryState();
    } catch (error) {
      errorMessage = error instanceof Error ? error.message : 'Failed to load file';
      document = null;
      console.error('Error loading file:', error);
    } finally {
      isLoading = false;
    }
  }

  function handleKeyChange(newKey: MusicKey) {
    targetKey = newKey;
    if (document) {
      document.currentKey = newKey;
      document.modified = true;
    }
  }

  function markModified() {
    if (document) {
      document.modified = true;
      history.push(document);
      updateHistoryState();
    }
  }

  function updateHistoryState() {
    canUndo = history.canUndo();
    canRedo = history.canRedo();
  }

  function handleUndo() {
    if (!document) return;
    const restored = history.undo(document);
    if (restored) {
      document = restored;
      currentKey = document.originalKey || 'C';
      targetKey = document.currentKey || currentKey;
      updateHistoryState();
    }
  }

  function handleRedo() {
    if (!document) return;
    const restored = history.redo(document);
    if (restored) {
      document = restored;
      currentKey = document.originalKey || 'C';
      targetKey = document.currentKey || currentKey;
      updateHistoryState();
    }
  }

  function handleKeyboard(e: KeyboardEvent) {
    // Undo: Ctrl+Z (Win/Linux) or Cmd+Z (Mac)
    if ((e.ctrlKey || e.metaKey) && e.key === 'z' && !e.shiftKey) {
      e.preventDefault();
      handleUndo();
    }
    // Redo: Ctrl+Y (Win/Linux) or Cmd+Shift+Z (Mac)
    if (((e.ctrlKey || e.metaKey) && e.key === 'y') || 
        ((e.ctrlKey || e.metaKey) && e.shiftKey && e.key === 'z')) {
      e.preventDefault();
      handleRedo();
    }
  }

  async function handleExport() {
    if (!document) return;
    
    isLoading = true;
    errorMessage = null;
    
    try {
      const buffer = await exportProFile(document);
      const blob = new Blob([buffer], { type: 'application/octet-stream' });
      const url = URL.createObjectURL(blob);
      const a = window.document.createElement('a');
      a.href = url;
      a.download = document.name || 'export.pro';
      a.click();
      URL.revokeObjectURL(url);
      
      // Mark as no longer modified after successful export
      if (document) {
        document.modified = false;
      }
    } catch (error) {
      errorMessage = error instanceof Error ? error.message : 'Failed to export file';
      console.error('Export failed:', error);
    } finally {
      isLoading = false;
    }
  }

  $effect(() => {
    // When target key changes, transpose all chords
    if (document && targetKey !== currentKey) {
      // Transposition will be handled in the editor display
    }
  });

  let selectedSlide = $derived(document?.slides[selectedSlideIndex] ?? null);
  let semitoneShift = $derived(keyToSemitone(targetKey) - keyToSemitone(currentKey));
</script>

<svelte:window onkeydown={handleKeyboard} />

<div 
  role="application"
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
        <div class="flex gap-2">
          <button 
            class="px-3 py-2 bg-[var(--bg-tertiary)] hover:bg-[var(--bg-hover)] rounded-lg text-sm font-medium transition-colors disabled:opacity-50 disabled:cursor-not-allowed"
            onclick={handleUndo}
            disabled={!canUndo}
            title="Undo (Ctrl+Z)"
          >
            ↶ Undo
          </button>
          <button 
            class="px-3 py-2 bg-[var(--bg-tertiary)] hover:bg-[var(--bg-hover)] rounded-lg text-sm font-medium transition-colors disabled:opacity-50 disabled:cursor-not-allowed"
            onclick={handleRedo}
            disabled={!canRedo}
            title="Redo (Ctrl+Y)"
          >
            ↷ Redo
          </button>
        </div>
        <KeySelector 
          {currentKey} 
          {targetKey} 
          onChange={handleKeyChange}
        />
        <button 
          class="px-4 py-2 bg-[var(--accent)] hover:bg-[var(--accent-hover)] rounded-lg text-sm font-medium transition-colors"
          onclick={handleExport}
        >
          Export .pro {document.modified ? '(modified)' : ''}
        </button>
      {/if}
    </div>
  </header>

  <!-- Error Toast -->
  {#if errorMessage}
    <div class="fixed top-4 right-4 bg-red-500 text-white px-6 py-4 rounded-lg shadow-lg z-50 max-w-md">
      <div class="flex items-center gap-3">
        <span class="text-2xl">⚠️</span>
        <div>
          <p class="font-semibold">Error</p>
          <p class="text-sm">{errorMessage}</p>
        </div>
      </div>
    </div>
  {/if}

  <!-- Loading Overlay -->
  {#if isLoading}
    <div class="fixed inset-0 bg-black/50 flex items-center justify-center z-40">
      <div class="bg-[var(--bg-primary)] rounded-lg p-8 flex flex-col items-center gap-4">
        <div class="animate-spin rounded-full h-12 w-12 border-4 border-[var(--accent)] border-t-transparent"></div>
        <p class="text-[var(--text-primary)]">Loading...</p>
      </div>
    </div>
  {/if}

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
            onModified={markModified}
          />
        {/if}
      </main>
    {:else}
      <!-- Empty State / Drop Zone -->
      <div class="flex-1 flex items-center justify-center p-8">
        <div 
          class="text-center p-12 border-2 border-dashed rounded-2xl transition-colors max-w-lg {isDragging ? 'border-[var(--accent)] bg-[var(--accent)]/10' : 'border-[var(--border)]'}"
        >
          <div class="text-5xl mb-4">🎵</div>
          <h2 class="text-xl font-semibold mb-2">ProPresenter Chord Editor</h2>
          <p class="text-[var(--text-secondary)] mb-6">
            Drop a .pro file here to edit chords, transpose keys, and more.
          </p>
          <label class="inline-block px-4 py-2 bg-[var(--accent)] hover:bg-[var(--accent-hover)] rounded-lg text-sm font-medium cursor-pointer transition-colors">
            Choose File
            <input 
              type="file" 
              accept=".pro"
              class="hidden"
              onchange={handleFileSelect}
            />
          </label>
          <div class="mt-8 text-left text-sm text-[var(--text-secondary)] space-y-2">
            <p class="font-semibold text-[var(--text-primary)]">Features:</p>
            <ul class="list-disc list-inside space-y-1">
              <li>Edit chord positions by clicking on any character</li>
              <li>Drag chords to reposition them</li>
              <li>Transpose all chords to a different key</li>
              <li>Undo/Redo with Ctrl+Z / Ctrl+Y</li>
              <li>Export modified .pro files</li>
            </ul>
          </div>
        </div>
      </div>
    {/if}
  </div>
</div>
