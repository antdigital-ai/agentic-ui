import { render, screen } from '@testing-library/react';
import React from 'react';
import { describe, expect, it, vi } from 'vitest';
import { AgenticUiFileMapBlock } from '../AgenticUiFileMapBlock';

vi.mock('../../../../../MarkdownInputField/FileMapView', () => ({
  FileMapView: ({ fileMap, className }: any) => <div data-testid="map" data-size={fileMap.size} className={className} />,
}));

describe('AgenticUiFileMapBlock residual branches', () => {
  it('renders an empty normalized map and preserves hidden slate children', () => {
    render(
      <AgenticUiFileMapBlock attributes={{}} element={{ type: 'agentic-ui-filemap', value: '' } as any}>
        hidden
      </AgenticUiFileMapBlock>,
    );
    expect(screen.getByTestId('map')).toHaveAttribute('data-size', '0');
    expect(screen.getByTestId('agentic-ui-filemap-hidden-children')).toHaveTextContent('hidden');
  });

  it('fileList 用 uuid 或 name 建 Map；无 uuid 回退 name', () => {
    render(
      <AgenticUiFileMapBlock
        attributes={{}}
        element={
          {
            type: 'agentic-ui-filemap',
            value: {
              fileList: [
                { uuid: 'u1', name: 'a.txt' },
                { name: 'b.txt' },
              ],
            },
          } as any
        }
      >
        x
      </AgenticUiFileMapBlock>,
    );
    expect(screen.getByTestId('map')).toHaveAttribute('data-size', '2');
  });
});
