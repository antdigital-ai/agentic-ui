/**
 * ThoughtChainList ErrorBoundary fallback 测试
 */
import { render, screen } from '@testing-library/react';
import React from 'react';
import { describe, expect, it, vi } from 'vitest';
import type { WhiteBoxProcessInterface } from '../../src/ThoughtChainList';
import { ThoughtChainList } from '../../src/ThoughtChainList';

vi.mock('../../src/ThoughtChainList/ThoughtChainListItem', () => ({
  ThoughtChainListItem: () => {
    throw new Error('trigger fallback');
  },
}));

const mockItem: WhiteBoxProcessInterface = {
  category: 'TableSql',
  info: 'test',
  runId: 'r1',
  input: { sql: 'SELECT 1' },
  output: { type: 'TABLE', tableData: {}, columns: [] },
};

describe('ThoughtChainList ErrorBoundary fallback', () => {
  it('应在子组件抛出时显示 fallback 并渲染 thoughtChainList.at(index)', () => {
    render(
      <ThoughtChainList thoughtChainList={[mockItem]} />,
    );

    expect(screen.getByText(/"runId":\s*"r1"/)).toBeInTheDocument();
  });
});
