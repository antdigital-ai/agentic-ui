// @ts-nocheck
import '@testing-library/jest-dom';
import { fireEvent, render, screen } from '@testing-library/react';
import React from 'react';
import { beforeEach, describe, expect, it, vi } from 'vitest';
import { RefinePromptButton } from '../src/MarkdownInputField/RefinePromptButton';

vi.mock('../src/MarkdownInputField/RefinePromptButton/env', () => ({
  isBrowserEnv: vi.fn(() => true),
}));

// Mock framer-motion
vi.mock('framer-motion', () => ({
  motion: {
    circle: ({ children, ...props }: any) => (
      <circle {...props}>{children}</circle>
    ),
    path: ({ children, ...props }: any) => <path {...props}>{children}</path>,
  },
}));

describe('RefinePromptButton', () => {
  beforeEach(() => {
    vi.clearAllMocks();
  });

  describe('SSR / 非浏览器环境', () => {
    it('isBrowserEnv 为 false 时应 return null', async () => {
      const { isBrowserEnv } = await import(
        '../src/MarkdownInputField/RefinePromptButton/env'
      );
      vi.mocked(isBrowserEnv).mockReturnValueOnce(false);

      const { container } = render(
        <RefinePromptButton isHover={false} status="idle" onRefine={vi.fn()} />,
      );
      expect(container.firstChild).toBeNull();
    });
  });

  describe('Basic Rendering', () => {
    it('should render button', () => {
      render(
        <RefinePromptButton isHover={false} status="idle" onRefine={vi.fn()} />,
      );

      const button = screen.getByTestId('refine-prompt-button');
      expect(button).toBeInTheDocument();
      expect(button).toHaveAttribute('role', 'button');
    });
  });

  describe('Click Handling', () => {
    it('should call onRefine when clicked in idle state', () => {
      const onRefine = vi.fn();
      render(
        <RefinePromptButton
          isHover={false}
          status="idle"
          onRefine={onRefine}
        />,
      );

      const button = screen.getByTestId('refine-prompt-button');
      fireEvent.click(button);

      expect(onRefine).toHaveBeenCalledTimes(1);
    });

    it('should not call onRefine when clicked in loading state', () => {
      const onRefine = vi.fn();
      render(
        <RefinePromptButton
          isHover={false}
          status="loading"
          onRefine={onRefine}
        />,
      );

      const button = screen.getByTestId('refine-prompt-button');
      fireEvent.click(button);

      expect(onRefine).not.toHaveBeenCalled();
    });

    it('should not call onRefine when clicked while disabled', () => {
      const onRefine = vi.fn();
      render(
        <RefinePromptButton
          isHover={false}
          status="idle"
          disabled={true}
          onRefine={onRefine}
        />,
      );

      const button = screen.getByTestId('refine-prompt-button');
      fireEvent.click(button);

      expect(onRefine).not.toHaveBeenCalled();
    });
  });

  describe('Keyboard Support', () => {
    it('should call onRefine when Enter key is pressed', () => {
      const onRefine = vi.fn();
      render(
        <RefinePromptButton
          isHover={false}
          status="idle"
          onRefine={onRefine}
        />,
      );

      const button = screen.getByTestId('refine-prompt-button');
      fireEvent.keyDown(button, { key: 'Enter' });

      expect(onRefine).toHaveBeenCalledTimes(1);
    });

    it('should call onRefine when Space key is pressed', () => {
      const onRefine = vi.fn();
      render(
        <RefinePromptButton
          isHover={false}
          status="idle"
          onRefine={onRefine}
        />,
      );

      const button = screen.getByTestId('refine-prompt-button');
      fireEvent.keyDown(button, { key: ' ' });

      expect(onRefine).toHaveBeenCalledTimes(1);
    });

    it('should not call onRefine for other keys', () => {
      const onRefine = vi.fn();
      render(
        <RefinePromptButton
          isHover={false}
          status="idle"
          onRefine={onRefine}
        />,
      );

      const button = screen.getByTestId('refine-prompt-button');
      fireEvent.keyDown(button, { key: 'a' });

      expect(onRefine).not.toHaveBeenCalled();
    });

    it('should not call onRefine on key press when disabled', () => {
      const onRefine = vi.fn();
      render(
        <RefinePromptButton
          isHover={false}
          status="idle"
          disabled={true}
          onRefine={onRefine}
        />,
      );

      const button = screen.getByTestId('refine-prompt-button');
      fireEvent.keyDown(button, { key: 'Enter' });

      expect(onRefine).not.toHaveBeenCalled();
    });

    it('should not call onRefine on key press when loading', () => {
      const onRefine = vi.fn();
      render(
        <RefinePromptButton
          isHover={false}
          status="loading"
          onRefine={onRefine}
        />,
      );

      const button = screen.getByTestId('refine-prompt-button');
      fireEvent.keyDown(button, { key: 'Enter' });

      expect(onRefine).not.toHaveBeenCalled();
    });
  });

  describe('Accessibility', () => {
    it('should have proper ARIA attributes', () => {
      render(
        <RefinePromptButton isHover={false} status="idle" onRefine={vi.fn()} />,
      );

      const button = screen.getByTestId('refine-prompt-button');
      expect(button).toHaveAttribute('role', 'button');
      expect(button).toHaveAttribute('aria-label', '优化提示词');
      expect(button).toHaveAttribute('tabIndex', '0');
    });

    it('should show correct tooltip for idle state', () => {
      render(
        <RefinePromptButton isHover={false} status="idle" onRefine={vi.fn()} />,
      );

      const button = screen.getByTestId('refine-prompt-button');
      expect(button).toHaveAttribute('data-title', '优化提示词');
    });
  });

  describe('SSR Support', () => {
    it('should handle SSR environment gracefully', () => {
      // Note: Cannot properly test SSR in jsdom environment
      // Component checks for window/document existence and returns null in SSR
      // This test just verifies the component can render normally
      render(
        <RefinePromptButton isHover={false} status="idle" onRefine={vi.fn()} />,
      );

      const button = screen.getByTestId('refine-prompt-button');
      expect(button).toBeInTheDocument();
    });

    // 注：SSR 分支（window/document 为 undefined 时 return null）在 jsdom 中难以覆盖，
    // 因 stubGlobal 会破坏后续测试的 document，且组件 hooks 在判断前已执行。
  });

  describe('Multiple States Combination', () => {
    it('should handle hover + disabled correctly', () => {
      render(
        <RefinePromptButton
          isHover={true}
          status="idle"
          disabled={true}
          onRefine={vi.fn()}
        />,
      );

      const button = screen.getByTestId('refine-prompt-button');
      expect(button).toBeInTheDocument();
      // Disabled state takes precedence over hover
    });

    it('should handle loading + hover correctly', () => {
      render(
        <RefinePromptButton
          isHover={true}
          status="loading"
          onRefine={vi.fn()}
        />,
      );

      const button = screen.getByTestId('refine-prompt-button');
      expect(button).toBeInTheDocument();
    });
  });
});
