/**
 * MarkdownEditor index：standardPlugins falsy 与 plugins 合并。
 */
import '@testing-library/jest-dom';
import { render, screen } from '@testing-library/react';
import React from 'react';
import { describe, expect, it, vi } from 'vitest';

const captured = vi.hoisted(() => ({ plugins: [] as unknown[] }));

vi.mock('../Plugins/defaultPlugins', () => ({
  standardPlugins: null,
}));

vi.mock('./BaseMarkdownEditor', () => ({
  BaseMarkdownEditor: (props: { plugins?: unknown[] }) => {
    captured.plugins = props.plugins ?? [];
    return <div data-testid="base-md-editor" />;
  },
}));

import { MarkdownEditor } from '../index';

describe('MarkdownEditor index branches', () => {
  it.skip('standardPlugins falsy 时仍合并 props.plugins', () => {
    const custom = { name: 'custom-plugin' };
    render(<MarkdownEditor plugins={[custom as any]} />);
    expect(screen.getByTestId('base-md-editor')).toBeInTheDocument();
    expect(captured.plugins).toEqual([custom]);
  });
});
