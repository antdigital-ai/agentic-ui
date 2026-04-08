/**
 * TableContext / TablePropsProvider 测试：覆盖 setDeleteIconPosition 回调
 */
import '@testing-library/jest-dom';
import { render, screen } from '@testing-library/react';
import React, { useContext } from 'react';
import { describe, expect, it } from 'vitest';
import {
  TablePropsContext,
  TablePropsProvider,
} from '../../../../../src/MarkdownEditor/editor/elements/Table/TableContext';

const Consumer: React.FC = () => {
  const { setDeleteIconPosition } = useContext(TablePropsContext);
  return (
    <button
      data-testid="set-pos"
      onClick={() => setDeleteIconPosition?.({ rowIndex: 1, columnIndex: 0 })}
    >
      Set
    </button>
  );
};

describe('TableContext', () => {
  it('应在调用 setDeleteIconPosition 时更新上下文', () => {
    render(
      <TablePropsProvider>
        <Consumer />
      </TablePropsProvider>,
    );
    const btn = screen.getByTestId('set-pos');
    expect(btn).toBeInTheDocument();
    btn.click();
  });
});
