import { describe, expect, it } from 'vitest';

// 简单的工具函数测试
describe('Utility Functions', () => {
  it('should handle basic string operations', () => {
    const testString = 'hello world';
    expect(testString.toUpperCase()).toBe('HELLO WORLD');
    expect(testString.length).toBe(11);
  });

  it('should handle array operations', () => {
    const testArray = [1, 2, 3, 4, 5];
    expect(testArray.length).toBe(5);
    expect(testArray.map(x => x * 2)).toEqual([2, 4, 6, 8, 10]);
  });

  it('should handle object operations', () => {
    const testObj = { name: 'test', value: 42 };
    expect(testObj.name).toBe('test');
    expect(testObj.value).toBe(42);
  });

  it('should handle boolean operations', () => {
    expect(true && true).toBe(true);
    expect(false || true).toBe(true);
    expect(!false).toBe(true);
  });

  it('should handle number operations', () => {
    expect(1 + 1).toBe(2);
    expect(5 * 3).toBe(15);
    expect(10 / 2).toBe(5);
  });
}); 