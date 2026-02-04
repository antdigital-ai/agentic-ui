import { render, screen } from '@testing-library/react';
import React from 'react';
import { describe, expect, it, vi } from 'vitest';
import { MarkdownInputField } from '../MarkdownInputField';

// Mock SendButton 组件
vi.mock('../SendButton', async () => {
  const actual = await vi.importActual('../SendButton');
  return {
    ...actual,
    SendButton: vi.fn((props) => (
      <div data-testid="mock-send-button" data-props={JSON.stringify(props)}>
        Send
      </div>
    )),
  };
});

describe('MarkdownInputField - sendButtonProps', () => {
  it('should pass compact prop to SendButton', () => {
    render(<MarkdownInputField sendButtonProps={{ compact: true }} />);

    const sendButton = screen.getByTestId('mock-send-button');
    const props = JSON.parse(sendButton.getAttribute('data-props') || '{}');

    expect(props.compact).toBe(true);
  });

  it('should pass custom colors to SendButton', () => {
    const customColors = {
      icon: '#123456',
      iconHover: '#654321',
      background: '#abcdef',
      backgroundHover: '#fedcba',
    };

    render(
      <MarkdownInputField
        sendButtonProps={{
          colors: customColors,
        }}
      />,
    );

    const sendButton = screen.getByTestId('mock-send-button');
    const props = JSON.parse(sendButton.getAttribute('data-props') || '{}');

    expect(props.colors).toEqual(customColors);
  });
});
