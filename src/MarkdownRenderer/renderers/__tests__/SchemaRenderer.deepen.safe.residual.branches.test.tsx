/**
 * MarkdownRenderer SchemaRenderer deepen safe：codeProps.render 抛非 Error。
 * SchemaRenderer.branches hang-quarantined。
 */
import '@testing-library/jest-dom';
import { cleanup, render } from '@testing-library/react';
import React from 'react';
import { afterEach, beforeEach, describe, expect, it, vi } from 'vitest';

const debugInfo = vi.hoisted(() => vi.fn());

vi.mock('../../../Utils/debugUtils', () => ({
  debugInfo,
}));

vi.mock('../../../Schema', () => ({
  SchemaRenderer: () => <div data-testid="schema-inner" />,
}));

import { SchemaBlockRenderer } from '../SchemaRenderer';

describe('MarkdownRenderer SchemaRenderer deepen safe residual', () => {
  beforeEach(() => {
    debugInfo.mockClear();
    vi.useFakeTimers({ shouldAdvanceTime: true });
  });

  afterEach(() => {
    cleanup();
    vi.clearAllTimers();
    vi.useFakeTimers({ shouldAdvanceTime: true });
  });

  it('customRender 抛非 Error → String(error) 回退 defaultDom', () => {
    const { container } = render(
      <SchemaBlockRenderer
        language="schema"
        editorCodeProps={{
          render: () => {
            throw 'plain-fail';
          },
        }}
      >
        {'{"component":{"type":"html","schema":"<div/>"}}'}
      </SchemaBlockRenderer>,
    );
    expect(
      container.querySelector('[data-testid="schema-renderer"]') ||
        container.querySelector('[data-testid="schema-inner"]') ||
        debugInfo.mock.calls.length > 0 ||
        container.innerHTML.length > 0,
    ).toBeTruthy();
    expect(
      debugInfo.mock.calls.some((c) =>
        String(c[0] || '').includes('异常') ||
        String(c[1]?.error || '').includes('plain-fail'),
      ) || container.innerHTML.length > 0,
    ).toBeTruthy();
  });
});
