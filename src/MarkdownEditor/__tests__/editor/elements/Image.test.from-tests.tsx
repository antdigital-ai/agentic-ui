import { fireEvent, render, screen, waitFor } from '@testing-library/react';
import React from 'react';
import { describe, expect, it, vi } from 'vitest';
import { ReadonlyImage } from '../../../src/MarkdownEditor/editor/elements/Image';

// Mock the editor store
vi.mock('../../../src/MarkdownEditor/editor/store', () => ({
  useEditorStore: () => ({
    markdownEditorRef: { current: null },
    readonly: false,
    editorProps: {},
  }),
}));

// Mock the i18n context
vi.mock('../../../src/I18n', () => ({
  I18nContext: {
    Consumer: ({ children }: { children: any }) =>
      children({
        locale: {
          delete: '删除',
          deleteMedia: '删除媒体',
          confirmDelete: '确定删除该媒体吗？',
          blockImage: '块级图片',
          inlineImage: '行内图片',
        },
      }),
  },
}));

describe('Image Components', () => {
  describe('ReadonlyImage', () => {
    it('应该显示图片链接当图片加载失败时', async () => {
      const mockElement = {
        url: 'https://invalid-image-url.com/image.jpg',
        alt: '测试图片',
        width: 400,
        height: 300,
      };

      render(
        <ReadonlyImage
          src={mockElement.url}
          alt={mockElement.alt}
          width={mockElement.width}
          height={mockElement.height}
        />,
      );

      // 找到图片元素并触发错误事件
      const imgElement = screen.getByAltText(mockElement.alt);
      fireEvent.error(imgElement);

      // 等待图片加载失败后显示链接
      await waitFor(() => {
        const linkElement = screen.getByText(mockElement.alt);
        expect(linkElement).toBeInTheDocument();
        expect(linkElement.tagName).toBe('SPAN');
      });
    });

    it('应该显示URL作为链接文本当没有alt属性时', async () => {
      const mockUrl = 'https://example.com/image.jpg';

      render(<ReadonlyImage src={mockUrl} width={400} height={300} />);

      // 找到图片元素并触发错误事件
      const imgElement = screen
        .getByTestId('image-container')
        .querySelector('img');
      fireEvent.error(imgElement!);

      await waitFor(() => {
        const linkElement = screen.getByText(mockUrl);
        expect(linkElement).toBeInTheDocument();
        expect(linkElement.tagName).toBe('SPAN');
      });
    });

    it('应该显示默认文本当没有alt和src时', async () => {
      render(<ReadonlyImage width={400} height={300} />);

      // 找到图片元素并触发错误事件
      const imgElement = screen
        .getByTestId('image-container')
        .querySelector('img');
      fireEvent.error(imgElement!);

      await waitFor(() => {
        const linkElement = screen.getByText('图片链接');
        expect(linkElement).toBeInTheDocument();
        expect(linkElement.tagName).toBe('SPAN');
      });
    });
  });
});
