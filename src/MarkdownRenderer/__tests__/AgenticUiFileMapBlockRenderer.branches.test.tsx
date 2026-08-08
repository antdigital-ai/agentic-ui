/**
 * AgenticUiFileMapBlockRenderer：uuid||name 作为 Map key。
 */
import '@testing-library/jest-dom';
import { render, screen } from '@testing-library/react';
import React from 'react';
import { describe, expect, it, vi } from 'vitest';
import { AgenticUiFileMapBlockRenderer } from '../renderers/AgenticUiFileMapBlockRenderer';

vi.mock('../../MarkdownInputField/FileMapView', () => ({
  FileMapView: ({ fileMap }: { fileMap: Map<string, unknown> }) => (
    <div data-testid="file-map-view">{fileMap.size}</div>
  ),
}));

describe('AgenticUiFileMapBlockRenderer branches', () => {
  it('文件无 uuid 时使用 name 作为 map key', () => {
    render(
      <AgenticUiFileMapBlockRenderer>
        {JSON.stringify({ files: [{ name: 'only-name.txt' }] })}
      </AgenticUiFileMapBlockRenderer>,
    );
    expect(screen.getByTestId('file-map-view')).toHaveTextContent('1');
  });
});
