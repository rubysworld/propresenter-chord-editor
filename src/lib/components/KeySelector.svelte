<script lang="ts">
  import { KEYS, type MusicKey } from '$lib/transpose';

  interface Props {
    currentKey: MusicKey;
    targetKey: MusicKey;
    onChange: (key: MusicKey) => void;
  }

  let { currentKey, targetKey, onChange }: Props = $props();

  // Calculate semitone difference for display
  let semitones = $derived(() => {
    const from = KEYS.indexOf(currentKey as typeof KEYS[number]);
    const to = KEYS.indexOf(targetKey as typeof KEYS[number]);
    let diff = to - from;
    if (diff > 6) diff -= 12;
    if (diff < -6) diff += 12;
    return diff;
  });
</script>

<div class="key-selector flex items-center gap-3">
  <span class="text-sm text-[var(--text-secondary)]">Key:</span>
  
  <div class="flex items-center gap-2 bg-[var(--bg-tertiary)] rounded-lg px-3 py-1.5">
    <span class="text-sm font-medium">{currentKey}</span>
    
    {#if targetKey !== currentKey}
      <span class="text-[var(--text-secondary)]">→</span>
      <span class="text-sm font-medium text-[var(--accent)]">{targetKey}</span>
      <span class="text-xs text-[var(--text-secondary)]">
        ({semitones() > 0 ? '+' : ''}{semitones()})
      </span>
    {/if}
  </div>

  <select 
    class="bg-[var(--bg-tertiary)] border border-[var(--border)] rounded-lg px-3 py-1.5 text-sm cursor-pointer focus:outline-none focus:border-[var(--accent)]"
    value={targetKey}
    onchange={(e) => onChange(e.currentTarget.value as MusicKey)}
  >
    {#each KEYS as key}
      <option value={key}>{key}</option>
    {/each}
  </select>

  {#if targetKey !== currentKey}
    <button 
      class="text-sm text-[var(--text-secondary)] hover:text-[var(--text-primary)] transition-colors"
      onclick={() => onChange(currentKey)}
    >
      Reset
    </button>
  {/if}
</div>
