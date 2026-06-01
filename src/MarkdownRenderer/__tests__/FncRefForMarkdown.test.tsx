import React from 'react';
import { describe, expect, it } from 'vitest';
import { extractFootnoteRefFromSupChildren } from '../FncRefForMarkdown';

describe('extractFootnoteRefFromSupChildren', () => {
  it('returns undefined for empty children', () => {
    expect(extractFootnoteRefFromSupChildren(null)).toBeUndefined();
  });

  it('returns undefined for multiple children', () => {
    const children = [
      React.createElement('a', { href: '#fn1' }, '1'),
      React.createElement('a', { href: '#fn2' }, '2'),
    ];
    expect(extractFootnoteRefFromSupChildren(children)).toBeUndefined();
  });

  it('returns undefined for non-element child', () => {
    expect(extractFootnoteRefFromSupChildren('text')).toBeUndefined();
  });

  it('returns undefined for non-anchor element', () => {
    const child = React.createElement('span', null, 'text');
    expect(extractFootnoteRefFromSupChildren(child)).toBeUndefined();
  });

  it('extracts identifier from user-content-fn href', () => {
    const child = React.createElement(
      'a',
      { href: '#user-content-fn-myref' },
      '1',
    );
    const result = extractFootnoteRefFromSupChildren(child);
    expect(result).toEqual({ identifier: 'myref', url: undefined });
  });

  it('extracts identifier with http url', () => {
    const child = React.createElement(
      'a',
      { href: 'https://example.com#user-content-fn-myref' },
      '1',
    );
    const result = extractFootnoteRefFromSupChildren(child);
    expect(result).toEqual({
      identifier: 'myref',
      url: 'https://example.com#user-content-fn-myref',
    });
  });

  it('falls back to label text when no matching href', () => {
    const child = React.createElement('a', { href: '#other' }, 'label');
    const result = extractFootnoteRefFromSupChildren(child);
    expect(result).toEqual({ identifier: 'label' });
  });

  it('returns undefined for anchor without label and non-matching href', () => {
    const child = React.createElement('a', { href: '#other' }, '');
    expect(extractFootnoteRefFromSupChildren(child)).toBeUndefined();
  });
});
