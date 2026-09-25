/**
 * MermaidBlockRenderer：空 code / 非 browser 早退。
 */
import { render } from '@testing-library/react';
import React from 'react';
import { afterEach, describe, expect, it, vi } from 'vitest';
import { MermaidBlockRenderer } from '../renderers/MermaidRenderer';

vi.mock('../../Plugins/mermaid/env', () => ({
  isBrowser: vi.fn(() => true),
}));

vi.mock('../../Plugins/mermaid/utils', () => ({
  loadMermaid: vi.fn(async () => ({})),
}));

vi.mock('../../Plugins/mermaid/MermaidRendererImpl', () => ({
  MermaidRendererImpl: () => <div data-testid="mermaid-impl" />,
}));

vi.mock('../../Plugins/mermaid/MermaidFallback', () => ({
  MermaidCodePreview: ({ code }: { code: string }) => (
    <pre data-testid="mermaid-fallback">{code}</pre>
  ),
}));

import { isBrowser } from '../../Plugins/mermaid/env';
describe('MermaidBlockRenderer branches', () => {
  afterEach(() => {
    vi.mocked(isBrowser).mockReturnValue(true);
  });

  it('空 children 返回 null', () => {
    const { container } = render(
      <MermaidBlockRenderer>{''}</MermaidBlockRenderer>,
    );
    expect(container.firstChild).toBeNull();
  });

  it('空白 code 返回 null', () => {
    const { container } = render(
      <MermaidBlockRenderer>{'   '}</MermaidBlockRenderer>,
    );
    expect(container.firstChild).toBeNull();
  });

  it('非 browser 返回 null', () => {
    vi.mocked(isBrowser).mockReturnValue(false);
    const { container } = render(
      <MermaidBlockRenderer>{'graph TD; A-->B'}</MermaidBlockRenderer>,
    );
    expect(container.firstChild).toBeNull();
  });

  it('有 code 且 browser 时渲染容器', () => {
    const { container } = render(
      <MermaidBlockRenderer>{'graph TD; A-->B'}</MermaidBlockRenderer>,
    );
    expect(container.querySelector('[data-be="mermaid"]')).toBeTruthy();
  });
});
