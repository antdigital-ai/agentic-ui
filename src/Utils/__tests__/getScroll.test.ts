import { describe, expect, it } from 'vitest';
import getScroll, { getScrollRailHeight, isWindow } from '../getScroll';
import { easeInOutCubic } from '../easings';

describe('isWindow', () => {
  it('returns true for window object', () => {
    expect(isWindow(window)).toBe(true);
  });

  it('returns false for null', () => {
    expect(isWindow(null)).toBe(false);
  });

  it('returns false for plain object', () => {
    expect(isWindow({})).toBe(false);
  });

  it('returns false for undefined', () => {
    expect(isWindow(undefined)).toBe(false);
  });
});

describe('getScroll', () => {
  it('returns 0 for null target', () => {
    expect(getScroll(null)).toBe(0);
  });

  it('returns scrollTop for Document', () => {
    expect(getScroll(document)).toBe(0);
  });

  it('returns scrollTop for HTMLElement', () => {
    const el = document.createElement('div');
    expect(getScroll(el)).toBe(0);
  });

  it('returns pageYOffset for window', () => {
    expect(getScroll(window)).toBe(0);
  });
});

describe('getScrollRailHeight', () => {
  it('returns 0 for null', () => {
    expect(getScrollRailHeight(null)).toBe(0);
  });

  it('returns rail height for window', () => {
    expect(typeof getScrollRailHeight(window)).toBe('number');
  });

  it('returns rail height for document', () => {
    expect(typeof getScrollRailHeight(document)).toBe('number');
  });

  it('returns rail height for element', () => {
    const el = document.createElement('div');
    expect(getScrollRailHeight(el)).toBe(0);
  });
});

describe('easeInOutCubic', () => {
  it('returns start value at t=0', () => {
    expect(easeInOutCubic(0, 0, 100, 100)).toBe(0);
  });

  it('returns end value at t=d', () => {
    expect(easeInOutCubic(100, 0, 100, 100)).toBe(100);
  });

  it('returns midpoint value at t=d/2', () => {
    const result = easeInOutCubic(50, 0, 100, 100);
    expect(result).toBe(50);
  });

  it('handles first half', () => {
    const result = easeInOutCubic(25, 0, 100, 100);
    expect(result).toBeGreaterThan(0);
    expect(result).toBeLessThan(50);
  });

  it('handles second half', () => {
    const result = easeInOutCubic(75, 0, 100, 100);
    expect(result).toBeGreaterThan(50);
    expect(result).toBeLessThan(100);
  });
});
