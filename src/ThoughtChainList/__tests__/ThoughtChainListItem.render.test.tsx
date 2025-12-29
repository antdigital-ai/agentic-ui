import { render, screen, waitFor } from '@testing-library/react';
import React from 'react';
import { beforeEach, describe, expect, it, vi } from 'vitest';
import {
  ThoughtChainList,
  WhiteBoxProcessInterface,
} from '..';

describe('ThoughtChainList Custom Render Functions', () => {
  const mockThoughtChainList: WhiteBoxProcessInterface[] = [
    {
      category: 'TableSql',
      info: 'Test TableSql Info',
      runId: 'test-run-1',
      output: { type: 'END', data: 'Test SQL output' },
      costMillis: 1500,
    },
    {
      category: 'ToolCall',
      info: 'Test ToolCall Info',
      runId: 'test-run-2',
      output: { type: 'END', data: 'Test tool output' },
      costMillis: 2000,
    },
    {
      category: 'DeepThink',
      info: 'Test DeepThink Info',
      runId: 'test-run-3',
      output: { type: 'END', data: 'Test deep think output' },
      costMillis: 3000,
    },
  ];
  beforeEach(() => {
    vi.clearAllMocks();
  });

  describe('titleRender Custom Function', () => {
    it('should call titleRender for overall component title', async () => {
      const mockTitleRender = vi.fn((props, defaultDom) => (
        <div data-testid="custom-title">
          <span data-testid="custom-title-prefix">Custom: </span>
          {defaultDom}
        </div>
      ));

      render(
        <ThoughtChainList
          thoughtChainList={mockThoughtChainList}
          titleRender={mockTitleRender}
          bubble={{ isFinished: true }}
          finishAutoCollapse={false}
        />,
      );

      await waitFor(() => {
        expect(mockTitleRender).toHaveBeenCalled();
        expect(screen.getByTestId('custom-title')).toBeInTheDocument();
        expect(screen.getByTestId('custom-title-prefix')).toHaveTextContent(
          'Custom',
        );
      });

      // Verify it receives correct props
      const callArgs = mockTitleRender.mock.calls[0];
      expect(callArgs[0]).toHaveProperty(
        'thoughtChainList',
        mockThoughtChainList,
      );
      expect(callArgs[1]).toBeDefined(); // defaultDom should be passed
    });

    it('should render default title when titleRender is not provided', async () => {
      render(
        <ThoughtChainList
          thoughtChainList={mockThoughtChainList}
          bubble={{ isFinished: true }}
          finishAutoCollapse={false}
        />,
      );

      await waitFor(() => {
        expect(screen.getByTestId('magic-icon')).toBeInTheDocument();
      });
    });

    it('should handle titleRender returning null', async () => {
      const mockTitleRender = vi.fn(() => null);

      render(
        <ThoughtChainList
          thoughtChainList={mockThoughtChainList}
          titleRender={mockTitleRender}
          bubble={{ isFinished: true }}
          finishAutoCollapse={false}
        />,
      );

      await waitFor(() => {
        expect(mockTitleRender).toHaveBeenCalled();
        // The component should still render, but custom title should be null
        expect(screen.queryByTestId('magic-icon')).not.toBeInTheDocument();
      });
    });
  });

  describe('titleExtraRender Custom Function', () => {
    it('should call titleExtraRender for extra content in title', async () => {
      const mockTitleExtraRender = vi.fn((props, defaultDom) => (
        <div data-testid="custom-title-extra">
          {defaultDom}
          <span data-testid="extra-content">Extra Content</span>
        </div>
      ));

      render(
        <ThoughtChainList
          thoughtChainList={mockThoughtChainList}
          titleExtraRender={mockTitleExtraRender}
          bubble={{ isFinished: true }}
          finishAutoCollapse={false}
        />,
      );

      await waitFor(() => {
        expect(mockTitleExtraRender).toHaveBeenCalled();
        expect(screen.getByTestId('custom-title-extra')).toBeInTheDocument();
        expect(screen.getByTestId('extra-content')).toHaveTextContent(
          'Extra Content',
        );
      });

      // Verify it receives correct props
      const callArgs = mockTitleExtraRender.mock.calls[0];
      expect(callArgs[0]).toHaveProperty(
        'thoughtChainList',
        mockThoughtChainList,
      );
      expect(callArgs[1]).toBeDefined(); // defaultDom (collapse button) should be passed
    });
  });

  describe('thoughtChainItemRender.titleRender Custom Function', () => {
    it('should call item-level titleRender for each thought chain item', async () => {
      const mockItemTitleRender = vi.fn((item, defaultDom) => (
        <div data-testid={`custom-item-title-${item.runId}`}>
          <span data-testid="custom-item-prefix">Item: </span>
          {defaultDom}
        </div>
      ));

      render(
        <ThoughtChainList
          thoughtChainList={mockThoughtChainList}
          thoughtChainItemRender={{
            titleRender: mockItemTitleRender,
          }}
          bubble={{ isFinished: true }}
          finishAutoCollapse={false}
        />,
      );

      await waitFor(() => {
        expect(mockItemTitleRender).toHaveBeenCalledTimes(3); // Once for each item

        // Check each item has custom title
        expect(
          screen.getByTestId('custom-item-title-test-run-1'),
        ).toBeInTheDocument();
        expect(
          screen.getByTestId('custom-item-title-test-run-2'),
        ).toBeInTheDocument();
        expect(
          screen.getByTestId('custom-item-title-test-run-3'),
        ).toBeInTheDocument();
      });

      // Verify each call receives correct item
      const calls = mockItemTitleRender.mock.calls;
      expect(calls[0][0]).toHaveProperty('runId', 'test-run-1');
      expect(calls[1][0]).toHaveProperty('runId', 'test-run-2');
      expect(calls[2][0]).toHaveProperty('runId', 'test-run-3');
    });

    it('should render default item titles when item titleRender is not provided', async () => {
      render(
        <ThoughtChainList
          thoughtChainList={mockThoughtChainList}
          bubble={{ isFinished: true }}
          finishAutoCollapse={false}
        />,
      );

      await waitFor(() => {
        // Should find default title info components
        expect(screen.getAllByTestId('title-info')).toHaveLength(3);
        expect(screen.getAllByTestId('title-text')).toHaveLength(3);
      });

      // Should not find custom item titles
      expect(
        screen.queryByTestId('custom-item-title-test-run-1'),
      ).not.toBeInTheDocument();
    });
  });

  describe('thoughtChainItemRender.titleExtraRender Custom Function', () => {
    it('should call item-level titleExtraRender for each thought chain item', async () => {
      const mockItemTitleExtraRender = vi.fn((item, defaultDom) => (
        <div data-testid={`custom-item-extra-${item.runId}`}>
          {defaultDom}
          <span data-testid="item-extra-badge">{item.category}</span>
        </div>
      ));

      render(
        <ThoughtChainList
          thoughtChainList={mockThoughtChainList}
          thoughtChainItemRender={{
            titleExtraRender: mockItemTitleExtraRender,
          }}
          finishAutoCollapse={false}
          bubble={{ isFinished: true }}
        />,
      );

      await waitFor(() => {
        expect(mockItemTitleExtraRender).toHaveBeenCalledTimes(3);

        // Check each item has custom extra content
        expect(
          screen.getByTestId('custom-item-extra-test-run-1'),
        ).toBeInTheDocument();
        expect(
          screen.getByTestId('custom-item-extra-test-run-2'),
        ).toBeInTheDocument();
        expect(
          screen.getByTestId('custom-item-extra-test-run-3'),
        ).toBeInTheDocument();

        // Check extra content shows category
        const badges = screen.getAllByTestId('item-extra-badge');
        expect(badges[0]).toHaveTextContent('TableSql');
        expect(badges[1]).toHaveTextContent('ToolCall');
        expect(badges[2]).toHaveTextContent('DeepThink');
      });
    });
  });

  describe('thoughtChainItemRender.contentRender Custom Function', () => {
    it('should call item-level contentRender for each thought chain item', async () => {
      const mockItemContentRender = vi.fn((item, defaultDom) => (
        <div data-testid={`custom-item-content-${item.runId}`}>
          <div data-testid="custom-content-header">
            Custom Content for {item.category}
          </div>
          {defaultDom}
          <div data-testid="custom-content-footer">
            Runtime: {item.costMillis}ms
          </div>
        </div>
      ));

      render(
        <ThoughtChainList
          thoughtChainList={mockThoughtChainList}
          thoughtChainItemRender={{
            contentRender: mockItemContentRender,
          }}
          finishAutoCollapse={false}
          bubble={{ isFinished: true }}
        />,
      );

      await waitFor(() => {
        expect(mockItemContentRender).toHaveBeenCalledTimes(3);

        // Check each item has custom content
        expect(
          screen.getByTestId('custom-item-content-test-run-1'),
        ).toBeInTheDocument();
        expect(
          screen.getByTestId('custom-item-content-test-run-2'),
        ).toBeInTheDocument();
        expect(
          screen.getByTestId('custom-item-content-test-run-3'),
        ).toBeInTheDocument();

        // Check custom content headers
        const headers = screen.getAllByTestId('custom-content-header');
        expect(headers[0]).toHaveTextContent('Custom Content for TableSql');
        expect(headers[1]).toHaveTextContent('Custom Content for ToolCall');
        expect(headers[2]).toHaveTextContent('Custom Content for DeepThink');

        // Check custom content footers
        const footers = screen.getAllByTestId('custom-content-footer');
        expect(footers[0]).toHaveTextContent('Runtime: 1500ms');
        expect(footers[1]).toHaveTextContent('Runtime: 2000ms');
        expect(footers[2]).toHaveTextContent('Runtime: 3000ms');
      });
    });

    it('should render default content when contentRender is not provided', async () => {
      render(
        <ThoughtChainList
          thoughtChainList={mockThoughtChainList}
          bubble={{ isFinished: true }}
          finishAutoCollapse={false}
        />,
      );

      await waitFor(() => {
        // Should find default category components
        expect(screen.getByTestId('table-sql')).toBeInTheDocument();
        expect(screen.getByTestId('tool-call')).toBeInTheDocument();
        expect(screen.getByTestId('deep-think')).toBeInTheDocument();
      });

      // Should not find custom content
      expect(
        screen.queryByTestId('custom-item-content-test-run-1'),
      ).not.toBeInTheDocument();
    });
  });

  describe('Combined Custom Render Functions', () => {
    it('should work correctly when all custom render functions are provided', async () => {
      const mockTitleRender = vi.fn((props, defaultDom) => (
        <div data-testid="custom-main-title">{defaultDom}</div>
      ));

      const mockTitleExtraRender = vi.fn((props, defaultDom) => (
        <div data-testid="custom-main-extra">{defaultDom}</div>
      ));

      const mockItemTitleRender = vi.fn((item, defaultDom) => (
        <div data-testid={`custom-item-title-${item.runId}`}>{defaultDom}</div>
      ));

      const mockItemTitleExtraRender = vi.fn((item, defaultDom) => (
        <div data-testid={`custom-item-extra-${item.runId}`}>{defaultDom}</div>
      ));

      const mockItemContentRender = vi.fn((item, defaultDom) => (
        <div data-testid={`custom-item-content-${item.runId}`}>
          {defaultDom}
        </div>
      ));

      render(
        <ThoughtChainList
          thoughtChainList={mockThoughtChainList}
          titleRender={mockTitleRender}
          titleExtraRender={mockTitleExtraRender}
          thoughtChainItemRender={{
            titleRender: mockItemTitleRender,
            titleExtraRender: mockItemTitleExtraRender,
            contentRender: mockItemContentRender,
          }}
          finishAutoCollapse={false}
          bubble={{ isFinished: true }}
        />,
      );

      await waitFor(() => {
        // All render functions should be called
        expect(mockTitleRender).toHaveBeenCalled();
        expect(mockTitleExtraRender).toHaveBeenCalled();
        expect(mockItemTitleRender).toHaveBeenCalledTimes(3);
        expect(mockItemTitleExtraRender).toHaveBeenCalledTimes(3);
        expect(mockItemContentRender).toHaveBeenCalledTimes(3);

        // All custom elements should be present
        expect(screen.getByTestId('custom-main-title')).toBeInTheDocument();
        expect(screen.getByTestId('custom-main-extra')).toBeInTheDocument();
        expect(
          screen.getByTestId('custom-item-title-test-run-1'),
        ).toBeInTheDocument();
        expect(
          screen.getByTestId('custom-item-extra-test-run-1'),
        ).toBeInTheDocument();
        expect(
          screen.getByTestId('custom-item-content-test-run-1'),
        ).toBeInTheDocument();
      });
    });

    it('should handle partial custom render function configurations', async () => {
      const mockItemContentRender = vi.fn((item, defaultDom) => (
        <div data-testid={`custom-content-only-${item.runId}`}>
          {defaultDom}
        </div>
      ));

      render(
        <ThoughtChainList
          thoughtChainList={mockThoughtChainList}
          thoughtChainItemRender={{
            contentRender: mockItemContentRender,
            // Only contentRender provided, others should use defaults
          }}
          finishAutoCollapse={false}
          bubble={{ isFinished: true }}
        />,
      );

      await waitFor(() => {
        // Only contentRender should be called
        expect(mockItemContentRender).toHaveBeenCalledTimes(3);

        // Custom content should be present
        expect(
          screen.getByTestId('custom-content-only-test-run-1'),
        ).toBeInTheDocument();

        // Default title should be present (not custom)
        expect(screen.getAllByTestId('title-info')).toHaveLength(3);
        expect(
          screen.queryByTestId('custom-item-title-test-run-1'),
        ).not.toBeInTheDocument();
      });
    });
  });

  describe('Render Function Error Handling', () => {
    it('should handle render function throwing errors gracefully', async () => {
      const mockItemContentRender = vi.fn(() => {
        throw new Error('Render function error');
      });

      // Suppress console error for this test
      const consoleSpy = vi
        .spyOn(console, 'error')
        .mockImplementation(() => {});

      render(
        <ThoughtChainList
          thoughtChainList={mockThoughtChainList}
          thoughtChainItemRender={{
            contentRender: mockItemContentRender,
          }}
          bubble={{ isFinished: true }}
          finishAutoCollapse={false}
        />,
      );

      await waitFor(() => {
        // Verify the render function was called despite throwing an error
        expect(mockItemContentRender).toHaveBeenCalled();
        // Component should still render the list container
        expect(screen.getByRole('list')).toBeInTheDocument();
      });

      consoleSpy.mockRestore();
    });

    it('should pass correct item data to render functions', async () => {
      const mockItemContentRender = vi.fn((item, defaultDom) => defaultDom);

      render(
        <ThoughtChainList
          thoughtChainList={mockThoughtChainList}
          thoughtChainItemRender={{
            contentRender: mockItemContentRender,
          }}
          finishAutoCollapse={false}
          bubble={{ isFinished: true }}
        />,
      );

      await waitFor(() => {
        const calls = mockItemContentRender.mock.calls;

        // Verify each call gets the correct item
        expect(calls[0][0]).toMatchObject({
          category: 'TableSql',
          info: 'Test TableSql Info',
        });

        expect(calls[1][0]).toMatchObject({
          category: 'ToolCall',
          info: 'Test ToolCall Info',
        });

        expect(calls[2][0]).toMatchObject({
          category: 'DeepThink',
          info: 'Test DeepThink Info',
        });
      });
    });
  });

  describe('Render Function Performance', () => {
    it('should not cause unnecessary re-renders when render functions are stable', async () => {
      const stableTitleRender = vi.fn((props, defaultDom) => defaultDom);
      const stableContentRender = vi.fn((item, defaultDom) => defaultDom);

      const { rerender } = render(
        <ThoughtChainList
          thoughtChainList={mockThoughtChainList}
          titleRender={stableTitleRender}
          thoughtChainItemRender={{
            contentRender: stableContentRender,
          }}
          finishAutoCollapse={false}
          bubble={{ isFinished: true }}
        />,
      );

      await waitFor(() => {
        expect(stableTitleRender).toHaveBeenCalledTimes(1); // Allow for initial + hydration render
        expect(stableContentRender).toHaveBeenCalledTimes(3); // 3 items * 1 render
      });

      // Clear call counts
      stableTitleRender.mockClear();
      stableContentRender.mockClear();

      // Re-render with same props
      rerender(
        <ThoughtChainList
          thoughtChainList={mockThoughtChainList}
          titleRender={stableTitleRender}
          thoughtChainItemRender={{
            contentRender: stableContentRender,
          }}
          finishAutoCollapse={false}
          bubble={{ isFinished: true }}
        />,
      );

      await waitFor(() => {
        // Functions should be called again due to re-render, but memo should minimize impact
        expect(stableTitleRender).toHaveBeenCalled();
        expect(stableContentRender).toHaveBeenCalled();
      });
    });
  });
});
