import { describe, it, expect } from 'vitest';
import { parseProChord } from './parser';

describe('parseProChord', () => {
  it('should parse a major chord', () => {
    const result = parseProChord({
      root: 'C',
      quality: 0, // Major
      range: { location: 0, length: 10 }
    });
    
    expect(result).not.toBeNull();
    expect(result?.root).toBe('C');
    expect(result?.quality).toBe(0);
    expect(result?.display).toBe('C');
  });

  it('should parse a minor chord', () => {
    const result = parseProChord({
      root: 'A',
      quality: 1, // Minor
      range: { location: 0, length: 10 }
    });
    
    expect(result).not.toBeNull();
    expect(result?.root).toBe('A');
    expect(result?.quality).toBe(1);
    expect(result?.display).toBe('Am');
  });

  it('should parse a seventh chord', () => {
    const result = parseProChord({
      root: 'G',
      quality: 0,
      number: 7,
      range: { location: 0, length: 10 }
    });
    
    expect(result).not.toBeNull();
    expect(result?.root).toBe('G');
    expect(result?.extension).toBe(7);
    expect(result?.display).toBe('G7');
  });

  it('should parse a diminished chord', () => {
    const result = parseProChord({
      root: 'B',
      quality: 2, // Diminished
      range: { location: 0, length: 10 }
    });
    
    expect(result).not.toBeNull();
    expect(result?.quality).toBe(2);
    expect(result?.display).toBe('Bdim');
  });

  it('should return null for missing root', () => {
    const result = parseProChord({
      quality: 0,
      range: { location: 0, length: 10 }
    });
    
    expect(result).toBeNull();
  });

  it('should handle position from range', () => {
    const result = parseProChord({
      root: 'D',
      quality: 1,
      range: { location: 42, length: 10 }
    });
    
    expect(result).not.toBeNull();
    expect(result?.position).toBe(42);
  });

  it('should handle missing range with default position', () => {
    const result = parseProChord({
      root: 'F',
      quality: 0
    });
    
    expect(result).not.toBeNull();
    expect(result?.position).toBe(0);
  });
});
