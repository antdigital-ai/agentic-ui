import { describe, expect, it } from 'vitest';
import { formatTime } from '../../../src/History/utils';

describe('History utils', () => {
  describe('formatTime', () => {
    it('应在无 time 时返回空字符串', () => {
      expect(formatTime()).toBe('');
      expect(formatTime(undefined)).toBe('');
      expect(formatTime(null as any)).toBe('');
      expect(formatTime(0)).toBe('');
    });
  });
});
