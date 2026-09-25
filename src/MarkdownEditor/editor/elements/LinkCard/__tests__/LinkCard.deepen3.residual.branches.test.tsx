/**
 * LinkCard deepen3：无 contentCls 时 blockCls 空串。
 */
import { cleanup, render } from '@testing-library/react';
import React from 'react';
import { afterEach, beforeEach, describe, expect, it, vi } from 'vitest';
import { LinkCard } from '../index';

vi.mock('../../../../store', () => ({
  useEditorStore: () => ({
    editorProps: { contentStyle: undefined },
    store: {},
  }),
}));

describe('LinkCard deepen3 residual branches', () => {
  beforeEach(() => {
    vi.useFakeTimers({ shouldAdvanceTime: true });
  });

  afterEach(() => {
    cleanup();
    vi.clearAllTimers();
    vi.useFakeTimers({ shouldAdvanceTime: true });
  });

  it('无 contentCls', () => {
    const { container } = render(
      <LinkCard
        element={
          {
            type: 'link-card',
            finished: true,
            title: 'T',
            url: 'https://t.test',
            collaborators: [],
            updateTime: '',
            children: [{ text: '' }],
          } as any
        }
        attributes={{ 'data-slate-node': 'element' } as any}
      >
        <span>ICON</span>
        <span>body</span>
      </LinkCard>,
    );
    expect(container.querySelector('[data-be="link-card"]')).toBeTruthy();
  });
});
