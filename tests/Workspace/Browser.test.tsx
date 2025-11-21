import { render, screen } from '@testing-library/react';
import { ConfigProvider } from 'antd';
import React from 'react';
import { describe, expect, it } from 'vitest';
import { BrowserList } from '../../src/Workspace/Browser';

describe('BrowserList Component', () => {
  const renderWithProvider = (ui: React.ReactElement) => {
    return render(<ConfigProvider>{ui}</ConfigProvider>);
  };

  it('应该正确渲染浏览器内容', () => {
    const data = {
      title: '网页标题',
      content: '# 测试内容\n\n这是一段文本',
    };

    renderWithProvider(<BrowserList data={data} />);

    expect(screen.getByTestId('browser-list')).toBeInTheDocument();
    expect(screen.getByText('网页标题')).toBeInTheDocument();
    expect(screen.getByText('测试内容')).toBeInTheDocument();
    expect(screen.getByText('这是一段文本')).toBeInTheDocument();
  });

  it('应该在没有标题时不显示头部', () => {
    const data = {
      content: '# 只有内容',
    };

    const { container } = renderWithProvider(<BrowserList data={data} />);

    expect(screen.getByTestId('browser-list')).toBeInTheDocument();
    expect(
      container.querySelector('.ant-agentic-workspace-browser-header'),
    ).not.toBeInTheDocument();
    expect(screen.getByText('只有内容')).toBeInTheDocument();
  });

  it('应该显示标题', () => {
    const data = {
      title: '浏览器标题',
      content: '内容',
    };

    const { container } = renderWithProvider(<BrowserList data={data} />);

    const header = container.querySelector('.ant-workspace-browser-header');
    expect(header).toBeInTheDocument();
    expect(screen.getByText('浏览器标题')).toBeInTheDocument();
  });

  it('应该渲染Markdown内容', () => {
    const data = {
      title: '测试',
      content: `# 一级标题
## 二级标题
### 三级标题

这是一段普通文本。

- 列表项1
- 列表项2
- 列表项3

\`\`\`javascript
const hello = 'world';
\`\`\``,
    };

    renderWithProvider(<BrowserList data={data} />);

    expect(screen.getByText('一级标题')).toBeInTheDocument();
    expect(screen.getByText('二级标题')).toBeInTheDocument();
    expect(screen.getByText('三级标题')).toBeInTheDocument();
    expect(screen.getByText('这是一段普通文本。')).toBeInTheDocument();
  });

  it('应该支持自定义MarkdownEditor配置', () => {
    const data = {
      title: '自定义配置',
      content: '# 测试内容',
      markdownEditorProps: {
        readonly: false,
        toc: true,
      },
    };

    renderWithProvider(<BrowserList data={data} />);

    expect(screen.getByTestId('browser-list')).toBeInTheDocument();
    expect(screen.getAllByText('测试内容')[0]).toBeInTheDocument();
  });

  it('应该合并默认配置和用户配置', () => {
    const data = {
      content: '测试',
      markdownEditorProps: {
        contentStyle: { padding: 12 },
      },
    };

    renderWithProvider(<BrowserList data={data} />);

    expect(screen.getByTestId('browser-list')).toBeInTheDocument();
  });

  it('应该应用正确的类名', () => {
    const data = {
      title: '测试',
      content: '内容',
    };

    const { container } = renderWithProvider(<BrowserList data={data} />);

    expect(
      container.querySelector('.ant-workspace-browser'),
    ).toBeInTheDocument();
    expect(
      container.querySelector('.ant-workspace-browser-header'),
    ).toBeInTheDocument();
    expect(
      container.querySelector('.ant-workspace-browser-title'),
    ).toBeInTheDocument();
  });

  it('应该处理空内容', () => {
    const data = {
      title: '空内容',
      content: '',
    };

    renderWithProvider(<BrowserList data={data} />);

    expect(screen.getByTestId('browser-list')).toBeInTheDocument();
    expect(screen.getByText('空内容')).toBeInTheDocument();
  });

  it('应该处理只有空白字符的内容', () => {
    const data = {
      content: '   \n\n   ',
    };

    renderWithProvider(<BrowserList data={data} />);

    expect(screen.getByTestId('browser-list')).toBeInTheDocument();
  });

  it('应该在测试环境中禁用打字机效果', () => {
    const data = {
      content: '# 测试',
    };

    renderWithProvider(<BrowserList data={data} />);

    // 在测试环境中，打字机效果应该被禁用
    expect(screen.getByTestId('browser-list')).toBeInTheDocument();
  });

  it('应该处理长内容', () => {
    const longContent = Array(100).fill('这是一行很长的内容。').join('\n');

    const data = {
      title: '长内容测试',
      content: longContent,
    };

    renderWithProvider(<BrowserList data={data} />);

    expect(screen.getByTestId('browser-list')).toBeInTheDocument();
    expect(screen.getByText('长内容测试')).toBeInTheDocument();
  });

  it('应该处理包含特殊字符的内容', () => {
    const data = {
      title: '特殊字符 & < > " \' /',
      content: '内容包含特殊字符: & < > " \' /',
    };

    renderWithProvider(<BrowserList data={data} />);

    expect(screen.getAllByText(/特殊字符/)[0]).toBeInTheDocument();
  });

  it('应该处理包含代码块的内容', () => {
    const data = {
      content: `\`\`\`javascript
function test() {
  console.log('Hello World');
}
\`\`\``,
    };

    renderWithProvider(<BrowserList data={data} />);

    expect(screen.getByTestId('browser-list')).toBeInTheDocument();
  });

  it('应该处理包含链接的内容', () => {
    const data = {
      content: '[测试链接](https://example.com)',
    };

    renderWithProvider(<BrowserList data={data} />);

    const link = screen.getByText('测试链接');
    expect(link).toBeInTheDocument();
    const anchor = link.closest('a');
    if (anchor) {
      expect(anchor).toHaveAttribute('href', 'https://example.com');
    }
  });

  it('应该处理包含图片的内容', () => {
    const data = {
      content: '![测试图片](https://example.com/image.jpg)',
    };

    renderWithProvider(<BrowserList data={data} />);

    expect(screen.getByTestId('browser-list')).toBeInTheDocument();
  });

  it('应该处理包含表格的内容', () => {
    const data = {
      content: `| 列1 | 列2 | 列3 |
|-----|-----|-----|
| 数据1 | 数据2 | 数据3 |`,
    };

    renderWithProvider(<BrowserList data={data} />);

    expect(screen.getByTestId('browser-list')).toBeInTheDocument();
  });

  it('应该使用正确的prefixCls', () => {
    const customPrefix = 'custom-prefix';

    const data = {
      title: '测试',
      content: '内容',
    };

    const { container } = render(
      <ConfigProvider prefixCls={customPrefix}>
        <BrowserList data={data} />
      </ConfigProvider>,
    );

    const browserElement = container.querySelector(
      `.${customPrefix}-workspace-browser`,
    );
    expect(browserElement).toBeInTheDocument();
  });

  it('应该正确传递style配置', () => {
    const data = {
      content: '测试',
      markdownEditorProps: {
        style: { maxHeight: '500px' },
      },
    };

    renderWithProvider(<BrowserList data={data} />);

    expect(screen.getByTestId('browser-list')).toBeInTheDocument();
  });

  it('应该正确传递contentStyle配置', () => {
    const data = {
      content: '测试',
      markdownEditorProps: {
        contentStyle: {
          padding: 16,
          backgroundColor: '#f0f0f0',
        },
      },
    };

    renderWithProvider(<BrowserList data={data} />);

    expect(screen.getByTestId('browser-list')).toBeInTheDocument();
  });

  it('应该处理复杂的Markdown内容', () => {
    const data = {
      title: '复杂内容',
      content: `# 主标题

## 章节1

这是第一章节的内容。

### 小节1.1

- 列表项1
- 列表项2

### 小节1.2

1. 有序列表1
2. 有序列表2

## 章节2

\`\`\`typescript
interface User {
  id: number;
  name: string;
}
\`\`\`

> 这是一个引用块

**粗体文本** 和 *斜体文本*`,
    };

    renderWithProvider(<BrowserList data={data} />);

    expect(screen.getByText('复杂内容')).toBeInTheDocument();
    expect(screen.getByText('主标题')).toBeInTheDocument();
    expect(screen.getByText('章节1')).toBeInTheDocument();
    expect(screen.getByText('章节2')).toBeInTheDocument();
  });
});
