// @ts-nocheck
import '@testing-library/jest-dom';
import { fireEvent, render, screen } from '@testing-library/react';
import React from 'react';
import { beforeEach, describe, expect, it, vi } from 'vitest';
import { SkillModeBar } from '..';

// Mock framer-motion
vi.mock('framer-motion', () => ({
  motion: {
    div: ({ children, ...props }: any) => <div {...props}>{children}</div>,
  },
  AnimatePresence: ({ children }: any) => children,
}));

describe('SkillModeBar', () => {
  beforeEach(() => {
    vi.clearAllMocks();
  });

  describe('Basic Rendering', () => {
    it('should not render when enable is false', () => {
      const { container } = render(
        <SkillModeBar skillMode={{ enable: false, open: true }} />,
      );

      expect(container.firstChild).toBeNull();
    });

    it('should not render when open is false', () => {
      const { container } = render(
        <SkillModeBar skillMode={{ enable: true, open: false }} />,
      );

      expect(container.firstChild).toBeNull();
    });

    it('should render when enable and open are both true', () => {
      const { container } = render(
        <SkillModeBar
          skillMode={{ enable: true, open: true, title: 'Test Mode' }}
        />,
      );

      const bar = container.querySelector('.ant-agentic-skill-mode-container');
      expect(bar).toBeInTheDocument();
    });

    it('should display title', () => {
      render(
        <SkillModeBar
          skillMode={{ enable: true, open: true, title: 'AI Assistant Mode' }}
        />,
      );

      expect(screen.getByText('AI Assistant Mode')).toBeInTheDocument();
    });

    it('should render title as React node', () => {
      const titleNode = (
        <div data-testid="custom-title">
          <span>Custom</span> Mode
        </div>
      );

      render(
        <SkillModeBar
          skillMode={{ enable: true, open: true, title: titleNode }}
        />,
      );

      expect(screen.getByTestId('custom-title')).toBeInTheDocument();
    });
  });

  describe('Close Button', () => {
    it('should render close button by default', () => {
      render(
        <SkillModeBar
          skillMode={{ enable: true, open: true, title: 'Test' }}
        />,
      );

      const closeButton = screen.getByTestId('skill-mode-close');
      expect(closeButton).toBeInTheDocument();
    });

    it('should hide close button when closable is false', () => {
      render(
        <SkillModeBar
          skillMode={{
            enable: true,
            open: true,
            title: 'Test',
            closable: false,
          }}
        />,
      );

      const closeButton = screen.queryByTestId('skill-mode-close');
      expect(closeButton).not.toBeInTheDocument();
    });

    it('should call onSkillModeOpenChange with false when close button is clicked', () => {
      const onSkillModeOpenChange = vi.fn();
      render(
        <SkillModeBar
          skillMode={{ enable: true, open: true, title: 'Test' }}
          onSkillModeOpenChange={onSkillModeOpenChange}
        />,
      );

      const closeButton = screen.getByTestId('skill-mode-close');
      fireEvent.click(closeButton);

      expect(onSkillModeOpenChange).toHaveBeenCalledWith(false);
    });
  });

  describe('Right Content', () => {
    it('should render single right content element', () => {
      const rightContent = (
        <button type="button" data-testid="right-button">
          Action
        </button>
      );

      render(
        <SkillModeBar
          skillMode={{ enable: true, open: true, title: 'Test', rightContent }}
        />,
      );

      expect(screen.getByTestId('right-button')).toBeInTheDocument();
    });

    it('should render multiple right content elements', () => {
      const rightContent = [
        <button key="btn-1" type="button" data-testid="right-button-1">
          Action 1
        </button>,
        <button key="btn-2" type="button" data-testid="right-button-2">
          Action 2
        </button>,
      ];

      render(
        <SkillModeBar
          skillMode={{ enable: true, open: true, title: 'Test', rightContent }}
        />,
      );

      expect(screen.getByTestId('right-button-1')).toBeInTheDocument();
      expect(screen.getByTestId('right-button-2')).toBeInTheDocument();
    });

    it('should render right content before close button', () => {
      const rightContent = <span data-testid="right-content">Settings</span>;

      render(
        <SkillModeBar
          skillMode={{
            enable: true,
            open: true,
            title: 'Test',
            rightContent,
            closable: true,
          }}
        />,
      );

      const rightContentEl = screen.getByTestId('right-content');
      const closeButton = screen.getByTestId('skill-mode-close');

      // Right content should appear before close button
      expect(rightContentEl).toBeInTheDocument();
      expect(closeButton).toBeInTheDocument();
    });
  });

  describe('Custom Styles and ClassNames', () => {
    it('should apply custom style', () => {
      const customStyle = { backgroundColor: 'red', padding: '20px' };
      const { container } = render(
        <SkillModeBar
          skillMode={{
            enable: true,
            open: true,
            title: 'Test',
            style: customStyle,
          }}
        />,
      );

      const bar = container.querySelector('.ant-agentic-skill-mode') as HTMLElement;
      expect(bar.style.backgroundColor).toBe('red');
      expect(bar.style.padding).toBe('20px');
    });

    it('should apply custom className', () => {
      const { container } = render(
        <SkillModeBar
          skillMode={{
            enable: true,
            open: true,
            title: 'Test',
            className: 'custom-skill-mode',
          }}
        />,
      );

      const bar = container.querySelector('.ant-agentic-skill-mode');
      expect(bar).toHaveClass('custom-skill-mode');
    });
  });

  describe('State Updates', () => {
    it('should unmount when open changes to false', () => {
      const { container, rerender } = render(
        <SkillModeBar
          skillMode={{ enable: true, open: true, title: 'Test' }}
        />,
      );

      expect(
        container.querySelector('.ant-agentic-skill-mode-container'),
      ).toBeInTheDocument();

      rerender(
        <SkillModeBar
          skillMode={{ enable: true, open: false, title: 'Test' }}
        />,
      );

      expect(
        container.querySelector('.ant-agentic-skill-mode-container'),
      ).not.toBeInTheDocument();
    });

    it('should update title when changed', () => {
      const { rerender } = render(
        <SkillModeBar
          skillMode={{ enable: true, open: true, title: 'Old Title' }}
        />,
      );

      expect(screen.getByText('Old Title')).toBeInTheDocument();

      rerender(
        <SkillModeBar
          skillMode={{ enable: true, open: true, title: 'New Title' }}
        />,
      );

      expect(screen.queryByText('Old Title')).not.toBeInTheDocument();
      expect(screen.getByText('New Title')).toBeInTheDocument();
    });
  });

  describe('Edge Cases', () => {
    it('should handle empty title', () => {
      const { container } = render(
        <SkillModeBar skillMode={{ enable: true, open: true, title: '' }} />,
      );

      const bar = container.querySelector('.ant-agentic-skill-mode-container');
      expect(bar).toBeInTheDocument();
    });

    it('should handle undefined rightContent', () => {
      const { container } = render(
        <SkillModeBar
          skillMode={{
            enable: true,
            open: true,
            title: 'Test',
            rightContent: undefined,
          }}
        />,
      );

      const bar = container.querySelector('.ant-agentic-skill-mode-container');
      expect(bar).toBeInTheDocument();
    });

    it('should handle null rightContent', () => {
      const { container } = render(
        <SkillModeBar
          skillMode={{
            enable: true,
            open: true,
            title: 'Test',
            rightContent: null,
          }}
        />,
      );

      const bar = container.querySelector('.ant-agentic-skill-mode-container');
      expect(bar).toBeInTheDocument();
    });
  });

  describe('Default Props', () => {
    it('should have enable default to true', () => {
      const { container } = render(
        <SkillModeBar skillMode={{ open: true, title: 'Test' }} />,
      );

      const bar = container.querySelector('.ant-agentic-skill-mode-container');
      expect(bar).toBeInTheDocument();
    });

    it('should have closable default to true', () => {
      render(
        <SkillModeBar
          skillMode={{ enable: true, open: true, title: 'Test' }}
        />,
      );

      const closeButton = screen.getByTestId('skill-mode-close');
      expect(closeButton).toBeInTheDocument();
    });
  });

  describe('Accessibility', () => {
    it('should render with proper structure', () => {
      const { container } = render(
        <SkillModeBar
          skillMode={{ enable: true, open: true, title: 'AI Mode' }}
        />,
      );

      const bar = container.querySelector('.ant-agentic-skill-mode-container');
      expect(bar).toBeInTheDocument();
      expect(screen.getByText('AI Mode')).toBeInTheDocument();
    });
  });
});
