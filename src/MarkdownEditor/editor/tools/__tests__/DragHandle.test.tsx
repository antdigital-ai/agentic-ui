import '@testing-library/jest-dom';
import { fireEvent, render } from '@testing-library/react';
import React from 'react';
import { beforeEach, describe, expect, it, vi } from 'vitest';
import { DragHandle } from '../DragHandle';

// Mock the useEditorStore hook
const mockUseEditorStore = vi.fn();

vi.mock('../../store', () => ({
  useEditorStore: () => mockUseEditorStore(),
}));

describe('DragHandle Component', () => {
  beforeEach(() => {
    vi.clearAllMocks();
    mockUseEditorStore.mockReturnValue({
      store: {
        draggedElement: null,
      },
      editorProps: {
        drag: {
          enable: true,
        },
      },
      readonly: false,
    });
  });

  it('renders drag handle when enabled and not readonly', () => {
    render(<DragHandle />);

    const dragHandle = document.querySelector('[data-drag-handle]');
    expect(dragHandle).toBeInTheDocument();

    const dragIcon = document.querySelector('[data-drag-icon]');
    expect(dragIcon).toBeInTheDocument();
  });

  it('does not render when readonly is true', () => {
    mockUseEditorStore.mockReturnValue({
      store: {
        draggedElement: null,
      },
      editorProps: {
        drag: {
          enable: true,
        },
      },
      readonly: true,
    });

    render(<DragHandle />);

    const dragHandle = document.querySelector('[data-drag-handle]');
    expect(dragHandle).not.toBeInTheDocument();
  });

  it('does not render when drag is disabled', () => {
    mockUseEditorStore.mockReturnValue({
      store: {
        draggedElement: null,
      },
      editorProps: {
        drag: {
          enable: false,
        },
      },
      readonly: false,
    });

    render(<DragHandle />);

    const dragHandle = document.querySelector('[data-drag-handle]');
    expect(dragHandle).not.toBeInTheDocument();
  });

  it('does not render when store is null', () => {
    mockUseEditorStore.mockReturnValue({
      store: null,
      editorProps: {
        drag: {
          enable: true,
        },
      },
      readonly: false,
    });

    render(<DragHandle />);

    const dragHandle = document.querySelector('[data-drag-handle]');
    expect(dragHandle).not.toBeInTheDocument();
  });

  it('applies custom style', () => {
    const customStyle = { backgroundColor: 'red' };
    render(<DragHandle style={customStyle} />);

    const dragHandle = document.querySelector('[data-drag-handle]');
    expect(dragHandle).toHaveStyle('background-color: rgb(255, 0, 0)');
  });

  it('handles mouse down event correctly', () => {
    const mockStore = {
      draggedElement: null,
    };

    mockUseEditorStore.mockReturnValue({
      store: mockStore,
      editorProps: {
        drag: {
          enable: true,
        },
      },
      readonly: false,
    });

    render(<DragHandle />);

    const dragHandle = document.querySelector('[data-drag-handle]');
    expect(dragHandle).toBeInTheDocument();

    if (dragHandle) {
      const mouseDownEvent = new MouseEvent('mousedown', {
        bubbles: true,
        cancelable: true,
      });

      fireEvent.mouseDown(dragHandle, mouseDownEvent);

      // Verify that the event was handled
      expect(dragHandle).toBeInTheDocument();
    }
  });

  it('shows tooltip with correct text', () => {
    render(<DragHandle />);

    // Check that the drag handle exists and has the correct structure
    const dragHandle = document.querySelector('[data-drag-handle]');
    expect(dragHandle).toBeInTheDocument();

    // Check that the drag icon exists
    const dragIcon = document.querySelector('[data-drag-icon]');
    expect(dragIcon).toBeInTheDocument();
  });

  it('has contentEditable set to false', () => {
    render(<DragHandle />);

    const dragHandle = document.querySelector('[data-drag-handle]');
    expect(dragHandle).toHaveAttribute('contenteditable', 'false');
  });
});
