import { describe, expect, it } from 'vitest';
import { isEmoji } from '../../src/Bubble/Avatar/isEmoji';

describe('isEmoji', () => {
  it.each(['😊', '🚀', '❤', '👍', '🇺🇸', '🇨🇳', '👨‍💻', '#️⃣', '©', '®'])(
    'should detect emoji: %s',
    (emoji) => {
      expect(isEmoji(emoji)).toBe(true);
    },
  );

  it.each(['hello', 'abc', '123', '', 'A', 'z'])(
    'should return false for non-emoji: "%s"',
    (text) => {
      expect(isEmoji(text)).toBe(false);
    },
  );
});
