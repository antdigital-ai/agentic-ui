/**
 * ReadonlyFootnoteDefinition：空内容 className empty。
 */
import '@testing-library/jest-dom';
import { render } from '@testing-library/react';
import React from 'react';
import { describe, expect, it, vi } from 'vitest';
import { ReadonlyFootnoteDefinition } from '../ReadonlyFootnoteDefinition';

vi.mock('../../../store', () => ({
  useEditorStore: vi.fn(() => ({
    store: {
      footnoteDefinitionMap: { set: vi.fn().mockReturnThis() },
    },
  })),
}));

describe('ReadonlyFootnoteDefinition branches', () => {
  it('Node.string 为空时应用 empty className', () => {
    const { container } = render(
      <ReadonlyFootnoteDefinition
        attributes={{ 'data-slate-node': 'element' } as any}
        element={
          {
            type: 'footnoteDefinition',
            identifier: '1',
            children: [{ text: '' }],
          } as any
        }
      >
        <span />
      </ReadonlyFootnoteDefinition>,
    );
    expect(container.querySelector('.empty')).toBeTruthy();
  });
});
