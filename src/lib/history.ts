import type { ProDocument } from './parser';

export interface HistoryState {
  document: string; // JSON serialized document state
  timestamp: number;
}

export class HistoryManager {
  private history: HistoryState[] = [];
  private currentIndex = -1;
  private maxHistory = 50;

  canUndo(): boolean {
    return this.currentIndex > 0;
  }

  canRedo(): boolean {
    return this.currentIndex < this.history.length - 1;
  }

  push(doc: ProDocument) {
    // Remove any future history if we're not at the end
    if (this.currentIndex < this.history.length - 1) {
      this.history = this.history.slice(0, this.currentIndex + 1);
    }

    // Create a deep copy (exclude rawData)
    const state: HistoryState = {
      document: JSON.stringify({
        name: doc.name,
        slides: doc.slides,
        originalKey: doc.originalKey,
        currentKey: doc.currentKey,
        modified: doc.modified
      }),
      timestamp: Date.now()
    };

    this.history.push(state);
    this.currentIndex++;

    // Limit history size
    if (this.history.length > this.maxHistory) {
      this.history.shift();
      this.currentIndex--;
    }
  }

  undo(doc: ProDocument): ProDocument | null {
    if (!this.canUndo()) return null;

    this.currentIndex--;
    const state = this.history[this.currentIndex];
    const restored = JSON.parse(state.document);

    return {
      ...restored,
      rawData: doc.rawData // Preserve the original binary data
    };
  }

  redo(doc: ProDocument): ProDocument | null {
    if (!this.canRedo()) return null;

    this.currentIndex++;
    const state = this.history[this.currentIndex];
    const restored = JSON.parse(state.document);

    return {
      ...restored,
      rawData: doc.rawData // Preserve the original binary data
    };
  }

  clear() {
    this.history = [];
    this.currentIndex = -1;
  }
}
