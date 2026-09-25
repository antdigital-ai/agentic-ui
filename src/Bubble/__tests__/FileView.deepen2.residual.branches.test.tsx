/**
 * FileView deepen2：renderMoreAction cfg=false 早退。
 */
import '@testing-library/jest-dom';
import { cleanup, render, screen } from '@testing-library/react';
import React from 'react';
import { afterEach, beforeEach, describe, expect, it, vi } from 'vitest';
import { BubbleFileView } from '../FileView';

vi.mock('../../MarkdownInputField/FileMapView', () => ({
  FileMapView: (props: any) => (
    <div data-testid="fv-map">
      <div data-testid="fv-more">
        {props.renderMoreAction?.({ name: 'f' }) ?? 'none'}
      </div>
    </div>
  ),
}));

describe('FileView deepen2 residual branches', () => {
  beforeEach(() => {
    vi.useFakeTimers({ shouldAdvanceTime: true });
  });

  afterEach(() => {
    cleanup();
    vi.clearAllTimers();
    vi.useFakeTimers({ shouldAdvanceTime: true });
  });

  it('renderFileMoreAction false 走 undefined', () => {
    render(
      <BubbleFileView
        bubble={
          {
            originData: {
              fileMap: new Map([['1', { name: 'a.txt' }]]),
            },
            fileViewConfig: { renderFileMoreAction: false },
          } as any
        }
        placement="left"
        bubbleListRef={null}
      />,
    );
    expect(screen.getByTestId('fv-more').textContent).toBe('none');
  });
});
