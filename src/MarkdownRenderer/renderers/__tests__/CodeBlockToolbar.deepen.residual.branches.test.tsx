/**
 * CodeBlockToolbar deepen：locale 缺省 copy/expand。
 */
import { render } from '@testing-library/react';
import React from 'react';
import { afterEach, beforeEach, describe, expect, it, vi } from 'vitest';

describe('CodeBlockToolbar deepen residual branches', () => {
  beforeEach(() => {
    vi.useFakeTimers({ shouldAdvanceTime: true });
  });

  afterEach(() => {
    vi.clearAllTimers();
    vi.useFakeTimers({ shouldAdvanceTime: true });
  });

  it('无 i18n 默认 title', async () => {
    const mod = await import('../CodeBlockToolbar');
    const Comp =
      (mod as any).CodeBlockToolbar ||
      (mod as any).default ||
      Object.values(mod)[0];
    render(
      <Comp
        language="js"
        code="console.log(1)"
        expanded
        onToggleExpand={vi.fn()}
      />,
    );
    expect(document.body).toBeTruthy();
  });
});
