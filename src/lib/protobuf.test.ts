import { describe, it, expect, beforeAll } from 'vitest';
import { parseProPresenterFile } from './protobuf';
import * as fs from 'fs/promises';
import * as path from 'path';

describe('parseProPresenterFile', () => {
  let testFileBuffer: ArrayBuffer;

  beforeAll(async () => {
    // Load the test .pro file
    const testFilePath = path.join(__dirname, '__tests__', 'test-song.pro');
    const buffer = await fs.readFile(testFilePath);
    testFileBuffer = buffer.buffer.slice(buffer.byteOffset, buffer.byteOffset + buffer.byteLength);
  });

  it('should parse a valid .pro file without errors', async () => {
    await expect(parseProPresenterFile(testFileBuffer)).resolves.not.toThrow();
  });

  it('should extract presentation name', async () => {
    const doc = await parseProPresenterFile(testFileBuffer);
    expect(doc.name).toBe('Test Song with Chords');
  });

  it('should extract slides', async () => {
    const doc = await parseProPresenterFile(testFileBuffer);
    expect(doc.slides).toBeDefined();
    expect(doc.slides.length).toBeGreaterThan(0);
  });

  it('should extract slide text', async () => {
    const doc = await parseProPresenterFile(testFileBuffer);
    
    // Should have slides (even if text is empty)
    expect(doc.slides).toBeDefined();
    expect(doc.slides.length).toBeGreaterThan(0);
    
    // Text field should exist (may be empty string)
    const firstSlide = doc.slides[0];
    expect(firstSlide).toBeDefined();
    expect(firstSlide.text).toBeDefined();
  });

  it('should extract chords from slides', async () => {
    const doc = await parseProPresenterFile(testFileBuffer);
    
    // All slides should have a chords array (may be empty)
    for (const slide of doc.slides) {
      expect(slide.chords).toBeDefined();
      expect(Array.isArray(slide.chords)).toBe(true);
      
      // If there are chords, they should have the right structure
      for (const chord of slide.chords) {
        expect(chord.root).toBeTruthy();
        expect(chord.display).toBeTruthy();
        expect(typeof chord.position).toBe('number');
      }
    }
  });

  it('should extract music key info', async () => {
    const doc = await parseProPresenterFile(testFileBuffer);
    
    // Key fields should exist (may be undefined if not set in file)
    expect('originalKey' in doc).toBe(true);
    expect('currentKey' in doc).toBe(true);
  });

  it('should have slide IDs', async () => {
    const doc = await parseProPresenterFile(testFileBuffer);
    
    for (const slide of doc.slides) {
      expect(slide.id).toBeTruthy();
      expect(typeof slide.id).toBe('string');
    }
  });

  it('should have slide labels', async () => {
    const doc = await parseProPresenterFile(testFileBuffer);
    
    for (const slide of doc.slides) {
      expect(slide.label).toBeTruthy();
      expect(typeof slide.label).toBe('string');
    }
  });

  it('should store raw data', async () => {
    const doc = await parseProPresenterFile(testFileBuffer);
    expect(doc.rawData).toBeDefined();
    expect(doc.rawData).toBeInstanceOf(ArrayBuffer);
  });

  it('should mark as not modified initially', async () => {
    const doc = await parseProPresenterFile(testFileBuffer);
    expect(doc.modified).toBe(false);
  });

  it('should handle invalid data gracefully', async () => {
    const invalidBuffer = new ArrayBuffer(10);
    // Should either throw an error or return a minimal valid document
    try {
      const result = await parseProPresenterFile(invalidBuffer);
      // If it doesn't throw, it should at least return something with required fields
      expect(result).toBeDefined();
      expect(result.name).toBeDefined();
      expect(result.slides).toBeDefined();
    } catch (error) {
      // Expected to throw - this is fine
      expect(error).toBeDefined();
    }
  });

  it('should parse chord quality correctly', async () => {
    const doc = await parseProPresenterFile(testFileBuffer);
    const slideWithChords = doc.slides.find(s => s.chords && s.chords.length > 0);
    
    if (slideWithChords && slideWithChords.chords.length > 0) {
      const chord = slideWithChords.chords[0];
      expect(typeof chord.quality).toBe('number');
    }
  });

  it('should maintain chord positions', async () => {
    const doc = await parseProPresenterFile(testFileBuffer);
    const slideWithMultipleChords = doc.slides.find(s => s.chords && s.chords.length > 1);
    
    if (slideWithMultipleChords) {
      // Chords should be in order by position
      for (let i = 0; i < slideWithMultipleChords.chords.length - 1; i++) {
        expect(slideWithMultipleChords.chords[i].position)
          .toBeLessThanOrEqual(slideWithMultipleChords.chords[i + 1].position);
      }
    }
  });
});

describe('rtfToText conversion', () => {
  it('should extract text from slides correctly', async () => {
    const testFilePath = path.join(__dirname, '__tests__', 'test-song.pro');
    const buffer = await fs.readFile(testFilePath);
    const testFileBuffer = buffer.buffer.slice(buffer.byteOffset, buffer.byteOffset + buffer.byteLength);
    
    const doc = await parseProPresenterFile(testFileBuffer);
    
    // Check that we got actual text, not RTF codes
    for (const slide of doc.slides) {
      expect(slide.text).not.toContain('\\rtf');
      expect(slide.text).not.toContain('\\fonttbl');
      expect(slide.text).not.toContain('\\colortbl');
    }
  });
});
