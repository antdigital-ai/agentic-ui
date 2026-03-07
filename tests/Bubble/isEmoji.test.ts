import { describe, expect, it } from 'vitest';
import { isEmoji } from '../../src/Bubble/Avatar/isEmoji';

describe('isEmoji', () => {
  it('should detect simple emoji', () => {
    expect(isEmoji('😊')).toBe(true);
    expect(isEmoji('🚀')).toBe(true);
    expect(isEmoji('❤')).toBe(true);
    expect(isEmoji('👍')).toBe(true);
  });

  it('should detect flag emojis', () => {
    expect(isEmoji('🇺🇸')).toBe(true);
    expect(isEmoji('🇨🇳')).toBe(true);
  });

  it('should detect complex emojis', () => {
    expect(isEmoji('👨‍💻')).toBe(true);
    expect(isEmoji('👩‍🔬')).toBe(true);
  });

  it('should return false for regular text', () => {
    expect(isEmoji('hello')).toBe(false);
    expect(isEmoji('abc')).toBe(false);
    expect(isEmoji('123')).toBe(false);
  });

  it('should return false for empty string', () => {
    expect(isEmoji('')).toBe(false);
  });

  it('should detect number emojis with variation selector', () => {
    expect(isEmoji('#️⃣')).toBe(true);
  });

  it('should detect symbol emojis', () => {
    expect(isEmoji('©')).toBe(true);
    expect(isEmoji('®')).toBe(true);
  });

  it('should return false for single letter', () => {
    expect(isEmoji('A')).toBe(false);
    expect(isEmoji('z')).toBe(false);
  });
});
