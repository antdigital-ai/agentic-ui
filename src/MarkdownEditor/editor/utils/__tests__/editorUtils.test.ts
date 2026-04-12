import { describe, expect, it } from 'vitest';
import {
  calcPath,
  createDomRangeFromNodes,
  createSelectionFromNodes,
  escapeRegExp,
  getRelativePath,
  isPath,
  normalizeMarkdownSearchText,
} from '../editorUtils';

describe('getRelativePath', () => {
  it('returns relative path when same length', () => {
    const result = getRelativePath([1, 2, 3], [1, 0, 1]);
    expect(result).toEqual([0, 2, 2]);
  });

  it('handles path longer than anther', () => {
    const result = getRelativePath([1, 2, 3], [1, 2]);
    expect(result).toBeDefined();
  });

  it('handles path shorter than anther', () => {
    const result = getRelativePath([1, 2], [1, 2, 3]);
    expect(result).toEqual([0, 0, 0]);
  });
});

describe('calcPath', () => {
  it('sums paths of equal length', () => {
    const result = calcPath([1, 2], [3, 4]);
    expect(result).toEqual([4, 6]);
  });

  it('handles path longer than anther', () => {
    const result = calcPath([1, 2, 3], [1, 2]);
    expect(result).toBeDefined();
  });

  it('handles path shorter than anther', () => {
    const result = calcPath([1, 2], [1, 2, 3]);
    expect(result).toBeDefined();
  });
});

describe('isPath', () => {
  it('returns true for valid path', () => {
    expect(isPath([0, 1, 2])).toBe(true);
  });

  it('returns false for negative numbers', () => {
    expect(isPath([0, -1, 2])).toBe(false);
  });

  it('returns false for non-finite', () => {
    expect(isPath([0, Infinity])).toBe(false);
  });

  it('returns true for empty path', () => {
    expect(isPath([])).toBe(true);
  });
});

describe('escapeRegExp', () => {
  it('escapes special characters', () => {
    const result = escapeRegExp('[test].*+?^${}()|\\');
    expect(result).toBe('\\[test\\]\\.\\*\\+\\?\\^\\$\\{\\}\\(\\)\\|\\\\');
  });

  it('returns plain string unchanged', () => {
    expect(escapeRegExp('hello world')).toBe('hello world');
  });
});

describe('normalizeMarkdownSearchText', () => {
  it('returns empty for blank input', () => {
    expect(normalizeMarkdownSearchText('')).toEqual([]);
    expect(normalizeMarkdownSearchText('   ')).toEqual([]);
  });

  it('returns original text', () => {
    const result = normalizeMarkdownSearchText('hello');
    expect(result).toContain('hello');
  });

  it('strips markdown bold syntax', () => {
    const result = normalizeMarkdownSearchText('**bold text**');
    expect(result).toContain('bold text');
  });

  it('strips markdown italic syntax', () => {
    const result = normalizeMarkdownSearchText('*italic*');
    expect(result).toContain('italic');
  });

  it('strips markdown link syntax', () => {
    const result = normalizeMarkdownSearchText('[link text](https://url.com)');
    expect(result).toContain('link text');
  });

  it('strips markdown image syntax', () => {
    const result = normalizeMarkdownSearchText('![alt](https://img.com/a.png)');
    expect(result).toContain('alt');
  });

  it('strips inline code syntax', () => {
    const result = normalizeMarkdownSearchText('`code`');
    expect(result).toContain('code');
  });

  it('strips strikethrough syntax', () => {
    const result = normalizeMarkdownSearchText('~~deleted~~');
    expect(result).toContain('deleted');
  });

  it('strips heading syntax', () => {
    const result = normalizeMarkdownSearchText('## Heading');
    expect(result).toContain('Heading');
  });

  it('strips blockquote syntax', () => {
    const result = normalizeMarkdownSearchText('> quote');
    expect(result).toContain('quote');
  });

  it('strips unordered list marker', () => {
    const result = normalizeMarkdownSearchText('- item');
    expect(result).toContain('item');
  });

  it('strips ordered list marker', () => {
    const result = normalizeMarkdownSearchText('1. item');
    expect(result).toContain('item');
  });

  it('splits multi-word cleaned text', () => {
    const result = normalizeMarkdownSearchText('**hello world**');
    expect(result.length).toBeGreaterThanOrEqual(2);
  });
});

describe('createSelectionFromNodes', () => {
  it('returns null for null anchor', () => {
    expect(createSelectionFromNodes(null, 0, document.body, 0)).toBeNull();
  });

  it('returns null for null focus', () => {
    expect(createSelectionFromNodes(document.body, 0, null, 0)).toBeNull();
  });

  it('creates selection from valid DOM nodes', () => {
    const textNode = document.createTextNode('hello');
    document.body.appendChild(textNode);
    const result = createSelectionFromNodes(textNode, 0, textNode, 5);
    expect(result).not.toBeNull();
    document.body.removeChild(textNode);
  });
});

describe('createDomRangeFromNodes', () => {
  it('returns null for null anchor', () => {
    expect(createDomRangeFromNodes(null, 0, document.body, 0)).toBeNull();
  });

  it('returns null for null focus', () => {
    expect(createDomRangeFromNodes(document.body, 0, null, 0)).toBeNull();
  });

  it('creates range from valid DOM nodes', () => {
    const textNode = document.createTextNode('hello');
    document.body.appendChild(textNode);
    const result = createDomRangeFromNodes(textNode, 0, textNode, 5);
    expect(result).not.toBeNull();
    document.body.removeChild(textNode);
  });
});
