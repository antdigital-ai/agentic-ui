import { cleanup, fireEvent, render, screen } from '@testing-library/react';
import React from 'react';
import { afterEach, describe, expect, it, vi } from 'vitest';
import type { CustomLeaf } from '../../../../el';

const { modalMount } = vi.hoisted(() => ({ modalMount: vi.fn() }));

vi.mock('../../../../../MarkdownInputField/AttachmentButton/utils', () => ({
  isMobileDevice: () => true,
}));

vi.mock('../FncLeafMobileModal', () => ({
  FncLeafMobileModal: ({
    open,
    onClose,
  }: {
    open: boolean;
    onClose: () => void;
  }) => {
    React.useEffect(() => modalMount(), []);
    return (
      <div data-testid="footnote-modal" data-open={String(open)}>
        <button onClick={onClose}>Close</button>
      </div>
    );
  },
}));

import { FncLeaf } from '../index';

afterEach(() => {
  cleanup();
  vi.clearAllMocks();
});

describe('mobile footnote popup performance', () => {
  it('mounts only the first opened footnote modal and retains its close lifecycle', () => {
    const onOriginUrlClick = vi.fn();
    const { container } = render(
      <div>
        {Array.from({ length: 100 }, (_, index) => {
          const leaf: CustomLeaf = {
            text: `[^${index}]`,
            fnc: true,
            identifier: String(index),
          };
          return (
            <FncLeaf
              key={index}
              leaf={leaf}
              text={leaf}
              attributes={{ 'data-slate-leaf': true }}
              fncProps={{ onOriginUrlClick }}
            >
              {leaf.text}
            </FncLeaf>
          );
        })}
      </div>,
    );
    expect(modalMount).not.toHaveBeenCalled();
    const firstReference =
      container.querySelector<HTMLElement>('[data-fnc="fnc"]')!;
    fireEvent.click(firstReference);
    expect(modalMount).toHaveBeenCalledTimes(1);
    expect(screen.getByTestId('footnote-modal')).toHaveAttribute(
      'data-open',
      'true',
    );
    expect(onOriginUrlClick).toHaveBeenCalledWith('0');

    fireEvent.click(screen.getByRole('button', { name: 'Close' }));
    expect(screen.getByTestId('footnote-modal')).toHaveAttribute(
      'data-open',
      'false',
    );
    fireEvent.click(firstReference);
    expect(modalMount).toHaveBeenCalledTimes(1);
    expect(screen.getAllByTestId('footnote-modal')).toHaveLength(1);
  });
});
