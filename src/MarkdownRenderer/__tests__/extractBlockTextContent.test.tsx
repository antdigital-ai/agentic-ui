import React from 'react';
import { describe, expect, it } from 'vitest';
import { extractBlockTextContent } from '../extractBlockTextContent';

describe('extractBlockTextContent', () => {
  it('extracts text from nested arrays and React elements', () => {
    const children = [
      'prefix-',
      React.createElement('span', { key: 'element' }, [
        React.createElement('strong', { key: 'nested' }, 'nested'),
        '-suffix',
      ]),
    ];

    expect(extractBlockTextContent(children)).toBe('prefix-nested-suffix');
  });

  it('preserves zero from nested React children', () => {
    const children = React.createElement('code', null, 0);

    expect(extractBlockTextContent(children)).toBe('0');
  });
});
