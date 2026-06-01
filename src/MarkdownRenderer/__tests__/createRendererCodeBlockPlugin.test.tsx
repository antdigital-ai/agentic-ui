import { createRendererCodeBlockPlugin } from '../createRendererCodeBlockPlugin';
import { DefaultCodeRouter } from '../DefaultCodeRouter';
import { render, screen } from '@testing-library/react';
import React from 'react';
import { describe, expect, it, vi } from 'vitest';
import type { RendererBlockProps } from '../types';

describe('DefaultCodeRouter custom language plugins', () => {
  it('routes unknown fence languages to pluginComponents[language]', () => {
    const InsightCard = vi.fn((props: RendererBlockProps) => (
      <div data-testid="insight-card">{props.language}</div>
    ));

    render(
      <DefaultCodeRouter
        language="insight-card"
        pluginComponents={{ 'insight-card': InsightCard }}
      >
        {'{"topic":"test"}'}
      </DefaultCodeRouter>,
    );

    expect(screen.getByTestId('insight-card')).toHaveTextContent('insight-card');
    expect(InsightCard).toHaveBeenCalled();
  });
});

describe('createRendererCodeBlockPlugin', () => {
  it('wraps render fn and exposes rendererComponents', () => {
    const renderFn = vi.fn(({ code }: { code: string }) => (
      <div data-testid="custom">{code}</div>
    ));
    const plugin = createRendererCodeBlockPlugin({
      'info-card': renderFn,
    });

    const InfoCard = plugin.renderer?.rendererComponents?.['info-card'];
    expect(InfoCard).toBeTruthy();
    if (!InfoCard) {
      throw new Error('info-card renderer missing');
    }

    render(<InfoCard>{'{"name":"acme"}'}</InfoCard>);

    expect(screen.getByTestId('custom')).toHaveTextContent('{"name":"acme"}');
    expect(renderFn).toHaveBeenCalledWith(
      expect.objectContaining({
        language: 'info-card',
        code: '{"name":"acme"}',
      }),
    );
  });
});
