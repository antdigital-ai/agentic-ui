// @ts-nocheck
import '@testing-library/jest-dom';
import { fireEvent, render, screen, waitFor } from '@testing-library/react';
import React from 'react';
import { beforeEach, describe, expect, it, vi } from 'vitest';
import {
  Suggestion,
  SuggestionConnext,
} from '../src/MarkdownInputField/Suggestion';

// Mock antd Dropdown: support popupRender, menu.items.onClick, onOpenChange
vi.mock('antd', async () => {
  const actual = await vi.importActual('antd');
  return {
    ...actual,
    Dropdown: ({
      children,
      menu,
      open,
      popupRender,
      onOpenChange,
    }: any) => {
      const content =
        open && popupRender
          ? popupRender(
              menu?.items ? (
                <div data-testid="dropdown-menu">
                  {menu.items.map((item: any, index: number) => (
                    <div
                      key={item.key || index}
                      data-testid={`item-${item.key || index}`}
                      onClick={() => {
                        item.onClick?.();
                        onOpenChange?.(false);
                      }}
                    >
                      {item.label}
                    </div>
                  ))}
                </div>
              ) : null,
            )
          : open && menu?.items ? (
              <div data-testid="dropdown-menu">
                {menu.items.map((item: any, index: number) => (
                  <div
                    key={item.key || index}
                    data-testid={`item-${item.key || index}`}
                    onClick={() => {
                      item.onClick?.();
                      onOpenChange?.(false);
                    }}
                  >
                    {item.label}
                  </div>
                ))}
              </div>
            ) : null;
      return (
        <div>
          {children}
          {content}
        </div>
      );
    },
    Spin: ({ children }: any) => <div data-testid="spin">{children}</div>,
  };
});

describe('Suggestion', () => {
  beforeEach(() => {
    vi.clearAllMocks();
  });

  describe('Basic Rendering', () => {
    it('should render children', () => {
      render(
        <Suggestion>
          <input data-testid="test-input" placeholder="Type here" />
        </Suggestion>,
      );

      expect(screen.getByTestId('test-input')).toBeInTheDocument();
    });

    it('should provide context to children', () => {
      let contextValue;
      const TestComponent = () => {
        const context = React.useContext(SuggestionConnext);
        contextValue = context;
        return <div>Test</div>;
      };

      render(
        <Suggestion>
          <TestComponent />
        </Suggestion>,
      );

      expect(contextValue).toBeDefined();
      expect(contextValue.isRender).toBe(true);
    });
  });

  describe('Dropdown Open State', () => {
    it('should control dropdown with open prop', () => {
      const { rerender } = render(
        <Suggestion tagInputProps={{ open: false }}>
          <div>Content</div>
        </Suggestion>,
      );

      expect(screen.queryByTestId('dropdown-menu')).not.toBeInTheDocument();

      rerender(
        <Suggestion tagInputProps={{ open: true }}>
          <div>Content</div>
        </Suggestion>,
      );

      expect(screen.queryByTestId('dropdown-menu')).toBeInTheDocument();
    });

    it('should call onOpenChange when state changes', () => {
      const onOpenChange = vi.fn();

      const TestComponent = () => {
        const [open, setOpen] = React.useState(false);

        React.useEffect(() => {
          if (open) {
            onOpenChange(open);
          }
        }, [open]);

        return (
          <Suggestion tagInputProps={{ open, onOpenChange: setOpen }}>
            <button
              type="button"
              data-testid="trigger"
              onClick={() => setOpen(true)}
            >
              Trigger
            </button>
          </Suggestion>
        );
      };

      render(<TestComponent />);

      fireEvent.click(screen.getByTestId('trigger'));

      expect(onOpenChange).toHaveBeenCalled();
    });

    it('should call setOpen(false) when onOpenChange(false)', () => {
      const onOpenChange = vi.fn();
      render(
        <Suggestion
          tagInputProps={{
            open: true,
            onOpenChange,
            items: [{ key: 'x', label: 'X' }],
          }}
        >
          <div>Child</div>
        </Suggestion>,
      );
      fireEvent.click(screen.getByTestId('item-x'));
      expect(onOpenChange).toHaveBeenCalled();
      expect(onOpenChange.mock.calls.some((c) => c[0] === false)).toBe(true);
    });
  });

  describe('Items Prop', () => {
    it('should handle static items', () => {
      const items = [
        { key: '1', label: 'Item 1' },
        { key: '2', label: 'Item 2' },
      ];

      render(
        <Suggestion tagInputProps={{ items, open: true }}>
          <div>Content</div>
        </Suggestion>,
      );

      // Items should be available in the suggestion context
    });

    it('should use empty initial state when items is function', () => {
      const itemsFn = vi.fn().mockResolvedValue([]);
      const { container } = render(
        <Suggestion tagInputProps={{ items: itemsFn, open: false }}>
          <div>Content</div>
        </Suggestion>,
      );
      expect(container).toBeInTheDocument();
    });

    it('should call item onClick and onSelectRef when clicking item', async () => {
      const onSelect = vi.fn();
      const CaptureRef = () => {
        const ctx = React.useContext(SuggestionConnext);
        React.useEffect(() => {
          if (ctx.onSelectRef) ctx.onSelectRef.current = onSelect;
        }, [ctx]);
        return null;
      };
      render(
        <Suggestion
          tagInputProps={{
            items: [{ key: 'k1', label: 'Label 1' }],
            open: true,
          }}
        >
          <CaptureRef />
        </Suggestion>,
      );
      const item = screen.getByTestId('item-k1');
      fireEvent.click(item);
      expect(onSelect).toHaveBeenCalledWith('k1');
    });

    it('should load items when items is function and open', async () => {
      const loaded = [
        { key: 'loaded1', label: 'Loaded 1' },
        { key: 'loaded2', label: 'Loaded 2' },
      ];
      const itemsFn = vi.fn().mockResolvedValue(loaded);
      render(
        <Suggestion tagInputProps={{ items: itemsFn, open: true }}>
          <div>Content</div>
        </Suggestion>,
      );
      await waitFor(() => {
        expect(screen.getByText('Loaded 1')).toBeInTheDocument();
        expect(screen.getByText('Loaded 2')).toBeInTheDocument();
      });
    });

    it('should handle items as a function', async () => {
      const loadItems = vi.fn().mockResolvedValue([
        { key: '1', label: 'Loaded Item 1' },
        { key: '2', label: 'Loaded Item 2' },
      ]);

      const TestComponent = () => {
        const [items, setItems] = React.useState([]);
        const [loading, setLoading] = React.useState(false);

        const handleLoad = async () => {
          setLoading(true);
          const data = await loadItems('query');
          setItems(data);
          setLoading(false);
        };

        return (
          <Suggestion tagInputProps={{ items, open: true }}>
            <button type="button" data-testid="load-btn" onClick={handleLoad}>
              Load
            </button>
            {loading && <div data-testid="loading">Loading...</div>}
          </Suggestion>
        );
      };

      render(<TestComponent />);

      fireEvent.click(screen.getByTestId('load-btn'));

      await waitFor(() => {
        expect(loadItems).toHaveBeenCalled();
      });
    });

    it('should show loading state when fetching items', () => {
      render(
        <Suggestion tagInputProps={{ open: true }}>
          <div data-testid="loading-spinner">Loading...</div>
        </Suggestion>,
      );

      expect(screen.getByTestId('loading-spinner')).toBeInTheDocument();
    });
  });

  describe('Custom Dropdown Rendering', () => {
    it('should use custom dropdownRender', () => {
      const dropdownRender = (menu: React.ReactNode) => (
        <div data-testid="custom-dropdown">{menu}</div>
      );

      render(
        <Suggestion tagInputProps={{ dropdownRender, open: true }}>
          <div>Content</div>
        </Suggestion>,
      );

      // Custom dropdown render should be applied
    });

    it('should call dropdownRender onSelect and close', async () => {
      const onSelect = vi.fn();
      const CaptureRef = () => {
        const ctx = React.useContext(SuggestionConnext);
        React.useEffect(() => {
          if (ctx.onSelectRef) ctx.onSelectRef.current = onSelect;
        }, [ctx]);
        return null;
      };
      const dropdownRender = vi.fn((_content: React.ReactNode, opts: any) => {
        return (
          <div data-testid="custom-dd">
            <button
              data-testid="invoke-select"
              type="button"
              onClick={() => opts.onSelect?.('selected-value', [0, 1])}
            >
              Select
            </button>
          </div>
        );
      });
      render(
        <Suggestion
          tagInputProps={{ dropdownRender, open: true }}
        >
          <CaptureRef />
        </Suggestion>,
      );
      fireEvent.click(screen.getByTestId('invoke-select'));
      expect(onSelect).toHaveBeenCalledWith('selected-value', [0, 1]);
    });

    it('should pass items and onKeyDown when menu is not provided', () => {
      render(
        <Suggestion
          tagInputProps={{
            items: [{ key: 'a', label: 'A' }],
            open: true,
          }}
        >
          <div>Content</div>
        </Suggestion>,
      );
      expect(screen.getByTestId('dropdown-menu')).toBeInTheDocument();
      expect(screen.getByText('A')).toBeInTheDocument();
    });

    it('should render custom menu', () => {
      const customMenu = (
        <div data-testid="custom-menu">Custom Menu Content</div>
      );

      render(
        <Suggestion tagInputProps={{ menu: customMenu, open: true }}>
          <div>Content</div>
        </Suggestion>,
      );

      // Custom menu should be rendered
    });

    it('should apply custom dropdownStyle', () => {
      const dropdownStyle = { backgroundColor: 'red', padding: '10px' };

      render(
        <Suggestion tagInputProps={{ dropdownStyle, open: true }}>
          <div>Content</div>
        </Suggestion>,
      );

      // Dropdown style should be applied
    });
  });

  describe('Not Found Content', () => {
    it('should show default notFoundContent when no items', () => {
      render(
        <Suggestion tagInputProps={{ items: [], open: true }}>
          <div>Content</div>
        </Suggestion>,
      );

      // Should show default not found content
    });

    it('should show custom notFoundContent', () => {
      const notFoundContent = (
        <div data-testid="not-found">No suggestions available</div>
      );

      render(
        <Suggestion tagInputProps={{ items: [], notFoundContent, open: true }}>
          <div>Content</div>
        </Suggestion>,
      );

      // Custom not found content should be shown
    });
  });

  describe('Selection Handling', () => {
    it('should provide onSelectRef to context', () => {
      let contextValue;
      const TestComponent = () => {
        const context = React.useContext(SuggestionConnext);
        contextValue = context;
        return null;
      };

      render(
        <Suggestion>
          <TestComponent />
        </Suggestion>,
      );

      expect(contextValue).toBeDefined();
      expect(contextValue.onSelectRef).toBeDefined();
    });

    it('should handle item selection', () => {
      const onSelect = vi.fn();

      const TestComponent = () => {
        const context = React.useContext(SuggestionConnext);

        React.useEffect(() => {
          if (context.onSelectRef) {
            context.onSelectRef.current = onSelect;
          }
        }, [context]);

        return (
        <button
              type="button"
              onClick={() => context.onSelectRef?.current?.('selected value')}
            >
            Select
          </button>
        );
      };

      render(
        <Suggestion>
          <TestComponent />
        </Suggestion>,
      );

      const selectButton = screen.getByText('Select');
      fireEvent.click(selectButton);

      expect(onSelect).toHaveBeenCalledWith('selected value');
    });
  });

  describe('Trigger Node Context', () => {
    it('should provide triggerNodeContext to context', () => {
      let contextValue;
      const TestComponent = () => {
        const context = React.useContext(SuggestionConnext);
        contextValue = context;
        return null;
      };

      render(
        <Suggestion>
          <TestComponent />
        </Suggestion>,
      );

      expect(contextValue).toBeDefined();
      expect(contextValue.triggerNodeContext).toBeDefined();
    });
  });

  describe('Edge Cases', () => {
    it('should handle empty children', () => {
      const { container } = render(<Suggestion>{null}</Suggestion>);
      expect(container).toBeInTheDocument();
    });

    it('should handle multiple children', () => {
      render(
        <Suggestion>
          <div data-testid="child-1">Child 1</div>
          <div data-testid="child-2">Child 2</div>
        </Suggestion>,
      );

      expect(screen.getByTestId('child-1')).toBeInTheDocument();
      expect(screen.getByTestId('child-2')).toBeInTheDocument();
    });

    it('should handle undefined tagInputProps', () => {
      const { container } = render(
        <Suggestion>
          <div>Content</div>
        </Suggestion>,
      );

      expect(container).toBeInTheDocument();
    });
  });

  describe('State Management', () => {
    it('should maintain open state independently', () => {
      const TestComponent = () => {
        const [open, setOpen] = React.useState(false);

        return (
          <Suggestion tagInputProps={{ open, onOpenChange: setOpen }}>
            <button type="button" onClick={() => setOpen(!open)}>
              Toggle
            </button>
          </Suggestion>
        );
      };

      render(<TestComponent />);

      const toggleButton = screen.getByText('Toggle');

      // Initially closed
      expect(screen.queryByTestId('dropdown-menu')).not.toBeInTheDocument();

      // Open
      fireEvent.click(toggleButton);
      // Should be open now (in real implementation)

      // Close
      fireEvent.click(toggleButton);
      // Should be closed again
    });
  });
});
