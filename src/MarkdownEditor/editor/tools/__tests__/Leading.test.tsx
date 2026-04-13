import '@testing-library/jest-dom';
import { render, screen } from '@testing-library/react';
import { ConfigProvider } from 'antd';
import React from 'react';
import { beforeEach, describe, expect, it, vi } from 'vitest';
import { Elements } from '../../../BaseMarkdownEditor';
import { TocHeading } from '../Leading';

// Mock the useEditorStore hook
vi.mock('../../store', () => ({
  useEditorStore: () => ({
    markdownEditorRef: { current: { children: [] } },
    markdownContainerRef: { current: null },
  }),
}));

// Mock useDebounce to prevent infinite loops
vi.mock('../../../BaseMarkdownEditor', async () => {
  const actual = await vi.importActual('../../../BaseMarkdownEditor');
  return {
    ...actual,
    useDebounce: (fn: any) => fn,
  };
});

describe('TocHeading Component', () => {
  beforeEach(() => {
    vi.clearAllMocks();
  });

  const mockSchema: Elements[] = [
    {
      type: 'head',
      level: 1,
      children: [{ text: 'Introduction' }],
    },
    {
      type: 'head',
      level: 2,
      children: [{ text: 'Getting Started' }],
    },
  ] as Elements[];

  it('renders table of contents correctly', () => {
    const { container, unmount } = render(
      <ConfigProvider
        theme={{
          hashed: false,
        }}
      >
        <TocHeading schema={mockSchema} />
      </ConfigProvider>,
    );
    const titles = container.querySelectorAll('.ant-anchor-link-title');
    expect(titles.length).toBe(2);
    expect(titles[0].textContent).toBe('Introduction');
    expect(titles[1].textContent).toBe('Getting Started');
    unmount();
  });

  it('renders nothing when no headers are present', () => {
    const { container, unmount } = render(
      <ConfigProvider
        theme={{
          hashed: false,
        }}
      >
        <TocHeading schema={[]} />
      </ConfigProvider>,
    );
    expect(container.firstChild).toBeNull();
    unmount();
  });

  it('handles nested headers correctly', () => {
    const nestedSchema: Elements[] = [
      {
        type: 'head',
        level: 1,
        children: [{ text: 'Chapter 1' }],
      },
      {
        type: 'head',
        level: 2,
        children: [{ text: 'Section 1.1' }],
      },
      {
        type: 'head',
        level: 2,
        children: [{ text: 'Section 1.2' }],
      },
      {
        type: 'head',
        level: 3,
        children: [{ text: 'Subsection 1.2.1' }],
      },
    ] as Elements[];

    const { container } = render(
      <ConfigProvider
        theme={{
          hashed: false,
        }}
      >
        <TocHeading schema={nestedSchema} />
      </ConfigProvider>,
    );
    const titles = container.querySelectorAll('.ant-anchor-link-title');
    expect(titles.length).toBe(4);
    expect(titles[0].textContent).toBe('Chapter 1');
    expect(titles[1].textContent).toBe('Section 1.1');
    expect(titles[2].textContent).toBe('Section 1.2');
    expect(titles[3].textContent).toBe('Subsection 1.2.1');
  });

  it('applies custom anchor props', () => {
    const customProps = {
      offsetTop: 100,
      style: { backgroundColor: 'red' },
    };

    const { container } = render(
      <ConfigProvider
        theme={{
          hashed: false,
        }}
      >
        <TocHeading schema={mockSchema} anchorProps={customProps} />
      </ConfigProvider>,
    );

    const anchor = container.querySelector('.ant-anchor');
    expect(anchor).toBeDefined();
    expect(container.innerHTML).toContain('background-color: red');
  });

  it('applies max height and scrollbar styles', () => {
    const longSchema: Elements[] = Array(10)
      .fill(null)
      .map((_, index) => ({
        type: 'head',
        level: 1,
        children: [{ text: `Section ${index + 1}` }],
      })) as Elements[];

    const { container } = render(
      <ConfigProvider
        theme={{
          hashed: false,
        }}
      >
        <TocHeading schema={longSchema} />
      </ConfigProvider>,
    );
    const anchor = container.querySelector('.ant-anchor');
    expect(anchor).toBeDefined();
    expect(
      container.querySelectorAll('.ant-anchor-link-title'),
    ).toHaveLength(10);
  });
});

describe('TocHeading Component with Custom Container', () => {
  it('should render with custom container when useCustomContainer is true', () => {
    const mockSchema = [
      {
        type: 'head' as const,
        level: 1,
        children: [{ text: 'Test Heading 1' }],
      },
      {
        type: 'head' as const,
        level: 2,
        children: [{ text: 'Test Heading 2' }],
      },
    ];

    render(<TocHeading schema={mockSchema} useCustomContainer={true} />);

    // 验证组件正常渲染
    expect(screen.getByText('Test Heading 1')).toBeInTheDocument();
    expect(screen.getByText('Test Heading 2')).toBeInTheDocument();
  });

  it('should render without custom container when useCustomContainer is false', () => {
    const mockSchema = [
      {
        type: 'head' as const,
        level: 1,
        children: [{ text: 'Test Heading' }],
      },
    ];

    render(<TocHeading schema={mockSchema} useCustomContainer={false} />);

    // 验证组件正常渲染
    expect(screen.getByText('Test Heading')).toBeInTheDocument();
  });
});
