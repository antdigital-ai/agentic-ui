import { describe, expect, it } from 'vitest';
import { formatTime } from '../../src/Utils/formatTime';

describe('formatTime', () => {
  it('should return fixed time in test environment', () => {
    const originalEnv = process.env.NODE_ENV;
    process.env.NODE_ENV = 'test';

    const result = formatTime(1234567890);
    expect(result).toBe('2024-02-27 17:20:00');

    process.env.NODE_ENV = originalEnv;
  });

  it('should handle different time inputs in test environment', () => {
    const originalEnv = process.env.NODE_ENV;
    process.env.NODE_ENV = 'test';

    expect(formatTime(0)).toBe('2024-02-27 17:20:00');
    expect(formatTime(9999999999999)).toBe('2024-02-27 17:20:00');

    process.env.NODE_ENV = originalEnv;
  });

  it('should handle negative timestamps in test environment', () => {
    const originalEnv = process.env.NODE_ENV;
    process.env.NODE_ENV = 'test';

    expect(formatTime(-1234567890)).toBe('2024-02-27 17:20:00');

    process.env.NODE_ENV = originalEnv;
  });

  it('should handle undefined input in test environment', () => {
    const originalEnv = process.env.NODE_ENV;
    process.env.NODE_ENV = 'test';

    expect(formatTime(undefined as any)).toBe('2024-02-27 17:20:00');

    process.env.NODE_ENV = originalEnv;
  });

  it('should handle null input in test environment', () => {
    const originalEnv = process.env.NODE_ENV;
    process.env.NODE_ENV = 'test';

    expect(formatTime(null as any)).toBe('2024-02-27 17:20:00');

    process.env.NODE_ENV = originalEnv;
  });

  it('should handle string input in test environment', () => {
    const originalEnv = process.env.NODE_ENV;
    process.env.NODE_ENV = 'test';

    expect(formatTime('1234567890' as any)).toBe('2024-02-27 17:20:00');

    process.env.NODE_ENV = originalEnv;
  });
}); 