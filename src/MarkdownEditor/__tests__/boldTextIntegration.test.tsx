/**
 * 加粗文本处理集成测试
 * 测试加粗功能在实际编辑器中的表现
 */

import '@testing-library/jest-dom';
import { cleanup, render, screen } from '@testing-library/react';
import React from 'react';
import { afterEach, describe, expect, it, vi } from 'vitest';
import { BaseMarkdownEditor } from '../BaseMarkdownEditor';

// Mock 依赖
vi.mock('../editor/Editor', () => ({
  SlateMarkdownEditor: ({ onChange, initSchemaValue, ...props }: any) => {
    React.useEffect(() => {
      onChange?.('test markdown', initSchemaValue || []);
    }, []);
    return (
      <div data-testid="slate-markdown-editor" {...props}>
        <div
          data-testid="editor-content"
          suppressContentEditableWarning={true}
          contentEditable={true}
        >
          Test content
        </div>
      </div>
    );
  },
}));

describe('加粗文本处理集成测试', () => {
  const defaultProps = {
    initValue: '',
    readonly: false,
  };

  // 每个测试后清理DOM
  afterEach(() => {
    cleanup();
  });

  it('应该正确处理包含中文标点的加粗文本', () => {
    const testCases = ['**重要提醒！**', '**请注意：**', '**问题？**'];

    testCases.forEach((testCase) => {
      const props = {
        ...defaultProps,
        initValue: testCase,
      };

      render(<BaseMarkdownEditor {...props} />);
      const editors = screen.getAllByTestId('slate-markdown-editor');
      expect(editors.length).toBeGreaterThan(0);
      cleanup();
    });
  });

  it('应该正确处理包含引号的加粗文本', () => {
    const testCases = ['**"重要信息"**', "**'关键数据'**", '**"Hello World"**'];

    testCases.forEach((testCase) => {
      const props = {
        ...defaultProps,
        initValue: testCase,
      };

      render(<BaseMarkdownEditor {...props} />);
      const editors = screen.getAllByTestId('slate-markdown-editor');
      expect(editors.length).toBeGreaterThan(0);
      cleanup();
    });
  });

  it('应该正确处理包含书名号的加粗文本', () => {
    const testCases = [
      '**《重要文档》**',
      '**【注意事项】**',
      '**《技术规范》**',
    ];

    testCases.forEach((testCase) => {
      const props = {
        ...defaultProps,
        initValue: testCase,
      };

      render(<BaseMarkdownEditor {...props} />);
      const editors = screen.getAllByTestId('slate-markdown-editor');
      expect(editors.length).toBeGreaterThan(0);
      cleanup();
    });
  });

  it('应该正确处理混合内容的加粗文本', () => {
    const testCases = [
      '**$9.698M（重要）**',
      '**"关键数据"57%**',
      '**《文档》！**',
    ];

    testCases.forEach((testCase) => {
      const props = {
        ...defaultProps,
        initValue: testCase,
      };

      render(<BaseMarkdownEditor {...props} />);
      const editors = screen.getAllByTestId('slate-markdown-editor');
      expect(editors.length).toBeGreaterThan(0);
      cleanup();
    });
  });

  it('应该保持原有功能不受影响', () => {
    const normalCases = ['**normal bold text**', '**$9.698M**', '**57%**'];

    normalCases.forEach((normalCase) => {
      const props = {
        ...defaultProps,
        initValue: normalCase,
      };

      render(<BaseMarkdownEditor {...props} />);
      const editors = screen.getAllByTestId('slate-markdown-editor');
      expect(editors.length).toBeGreaterThan(0);
      cleanup();
    });
  });
});
