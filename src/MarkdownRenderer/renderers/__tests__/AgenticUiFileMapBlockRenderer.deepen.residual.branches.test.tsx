/**
 * AgenticUiFileMapBlockRenderer deepen：uuid 空串回退 name。
 */
import '@testing-library/jest-dom';
import { cleanup, render, screen } from '@testing-library/react';
import React from 'react';
import { afterEach, beforeEach, describe, expect, it, vi } from 'vitest';
import { AgenticUiFileMapBlockRenderer } from '../AgenticUiFileMapBlockRenderer';

vi.mock('../../../MarkdownInputField/FileMapView', () => ({
  FileMapView: ({ fileMap }: { fileMap: Map<string, unknown> }) => (
    <div data-testid="fmv2">{Array.from(fileMap.keys()).join(',')}</div>
  ),
}));

describe('AgenticUiFileMapBlockRenderer deepen residual branches', () => {
  beforeEach(() => {
    vi.useFakeTimers({ shouldAdvanceTime: true });
  });

  afterEach(() => {
    cleanup();
    vi.clearAllTimers();
    vi.useFakeTimers({ shouldAdvanceTime: true });
  });

  it('uuid 空串用 name', () => {
    render(
      <AgenticUiFileMapBlockRenderer>
        {JSON.stringify({ files: [{ name: 'n.txt', uuid: '' }] })}
      </AgenticUiFileMapBlockRenderer>,
    );
    expect(screen.getByTestId('fmv2').textContent).toContain('n.txt');
  });
});
