import { describe, it, expect } from 'vitest';
import { cleanName, capitalize } from './utils';

describe('Utility Functions', () => {
  it('cleanName formats names correctly', () => {
    expect(cleanName('original-pikachu')).toBe('pikachu');
    expect(cleanName('tapu-koko')).toBe('tapu koko');
  });

  it('capitalize works correctly', () => {
    expect(capitalize('mew')).toBe('Mew');
  });
});