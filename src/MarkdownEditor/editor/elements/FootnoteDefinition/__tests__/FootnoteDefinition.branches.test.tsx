/**
 * FootnoteDefinition：empty class、readonly Export 图标。
 */
import { render } from '@testing-library/react';
import React from 'react';
import { describe, expect, it, vi } from 'vitest';

const store = {
  footnoteDefinitionMap: new Map(),
  dragStart: vi.fn(),
};

vi.mock('../../../store', () => ({
  useEditorStore: () => ({
    store,
    readonly: true,
    markdownContainerRef: { current: document.createElement('div') },
  }),
}));

import { FootnoteDefinition } from '../index';

describe('FootnoteDefinition branches', () => {
  it('空字符串时带 empty class；readonly 显示导出图标', () => {
    const { container } = render(
      <FootnoteDefinition
        attributes={{ 'data-slate-node': 'element', ref: null } as any}
        element={
          {
            type: 'footnoteDefinition',
            identifier: '1',
            children: [{ text: '' }],
          } as any
        }
      >
        <span />
      </FootnoteDefinition>,
    );
    expect(container.querySelector('[data-be="footnoteDefinition"]')).toBeTruthy();
    expect(container.querySelector('.empty')).toBeTruthy();
  });

  it('有正文时无 empty class', () => {
    store.footnoteDefinitionMap = new Map();
    const { container } = render(
      <FootnoteDefinition
        attributes={{ 'data-slate-node': 'element', ref: null } as any}
        element={
          {
            type: 'footnoteDefinition',
            identifier: '2',
            children: [{ text: 'note body' }],
          } as any
        }
      >
        <span>note body</span>
      </FootnoteDefinition>,
    );
    expect(container.querySelector('.empty')).toBeNull();
  });
});
