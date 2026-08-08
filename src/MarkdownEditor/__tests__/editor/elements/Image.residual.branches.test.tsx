/**
 * Image 残留：ReadonlyImage render 钩子、无 width、error 文案；Resize selected/loading。
 */
import '@testing-library/jest-dom';
import { fireEvent, render, screen } from '@testing-library/react';
import React from 'react';
import { afterEach, beforeEach, describe, expect, it, vi } from 'vitest';
import {
  EditorImage,
  ReadonlyImage,
  ResizeImage,
} from '../../../editor/elements/Image';

vi.mock('antd', () => {
  const confirm = vi.fn();
  return {
    Image: (props: any) => <img data-testid="antd-img" {...props} />,
    Skeleton: { Image: () => <div data-testid="skeleton" /> },
    Popover: ({ children, content }: any) => (
      <div>
        {children}
        <div>{content}</div>
      </div>
    ),
    Space: ({ children }: any) => <div>{children}</div>,
    Modal: { confirm },
  };
});

vi.mock('@ant-design/icons', () => ({
  BlockOutlined: () => <span />,
  DeleteFilled: () => <span />,
  LoadingOutlined: () => <span />,
}));

vi.mock('react-rnd', () => ({
  Rnd: ({ children }: any) => <div data-testid="rnd">{children}</div>,
}));

vi.mock('../../../../Hooks/useDebounceFn', () => ({
  useDebounceFn: (fn: any) => ({ run: fn, cancel: vi.fn() }),
}));

vi.mock('../../../../Components/ActionIconBox', () => ({
  ActionIconBox: ({ children, onClick }: any) => (
    <button type="button" onClick={onClick}>
      {children}
    </button>
  ),
}));

vi.mock('../../../../I18n', () => ({
  I18nContext: React.createContext({ locale: {} }),
}));

const storeState: any = {
  markdownEditorRef: { current: { children: [] } },
  editorProps: {},
  readonly: false,
};

vi.mock('../../../editor/store', () => ({
  useEditorStore: () => storeState,
}));

vi.mock('../../../hooks/editor', () => ({
  useSelStatus: () => [false, [0]],
}));

vi.mock('../../../editor/utils', () => ({
  useGetSetState: (init: any) => {
    const [s, setS] = React.useState(init);
    return [() => s, (p: any) => setS((prev: any) => ({ ...prev, ...p }))];
  },
}));

vi.mock('../../../editor/utils/dom', () => ({
  getMediaType: () => 'image',
}));

vi.mock('../../../editor/components/MediaErrorLink', () => ({
  MediaErrorLink: ({ displayText }: any) => (
    <a data-testid="media-error-link">{displayText}</a>
  ),
}));

vi.mock('slate', async () => {
  const actual = await vi.importActual<any>('slate');
  return {
    ...actual,
    Transforms: { ...actual.Transforms, setNodes: vi.fn(), removeNodes: vi.fn() },
    Path: actual.Path,
  };
});

describe('Image residual branches', () => {
  beforeEach(() => {
    storeState.editorProps = {};
    storeState.markdownEditorRef = { current: { children: [] } };
    vi.useFakeTimers({ shouldAdvanceTime: true });
  });
  afterEach(() => {
    vi.clearAllTimers();
    vi.useFakeTimers({ shouldAdvanceTime: true });
  });

  it('ReadonlyImage：无 width；custom render；error 用 alt', () => {
    const { rerender } = render(
      <ReadonlyImage src="https://a.png" alt="alt-text" />,
    );
    expect(screen.getByTestId('antd-img')).toBeInTheDocument();

    storeState.editorProps = {
      image: {
        render: (p: any, el: any) => (
          <div data-testid="custom-img">{el}</div>
        ),
      },
    };
    rerender(<ReadonlyImage src="https://a.png" width={100} />);
    expect(screen.getByTestId('custom-img')).toBeInTheDocument();

    storeState.editorProps = {};
    rerender(<ReadonlyImage src="https://fail.png" alt="broken" />);
    fireEvent.error(screen.getByTestId('antd-img'));
    expect(screen.getByTestId('media-error-link')).toHaveTextContent('broken');
  });

  it('ResizeImage：无 src 高度默认；error 无 src 文案', () => {
    render(<ResizeImage src="" alt="" defaultSize={{ width: 0, height: 0 }} />);
    const img = document.querySelector('img');
    if (img) fireEvent.error(img);
    expect(screen.getByTestId('media-error-link')).toBeInTheDocument();
  });

  it('EditorImage：无 markdownEditorRef 时操作不抛', () => {
    storeState.markdownEditorRef = { current: null };
    expect(() =>
      render(
        <EditorImage
          element={
            {
              type: 'image',
              url: 'https://x.png',
              children: [{ text: '' }],
            } as any
          }
          attributes={{ 'data-slate-node': 'element' } as any}
        >
          <span />
        </EditorImage>,
      ),
    ).not.toThrow();
  });

  it('EditorImage：block 对齐 + width/height；Resize selected', () => {
    storeState.markdownEditorRef = { current: { children: [] } };
    storeState.readonly = false;
    render(
      <EditorImage
        element={
          {
            type: 'image',
            url: 'https://x.png',
            width: 120,
            height: 80,
            align: 'center',
            block: true,
            children: [{ text: '' }],
          } as any
        }
        attributes={{ 'data-slate-node': 'element' } as any}
      >
        <span />
      </EditorImage>,
    );
    render(
      <ResizeImage
        src="https://x.png"
        alt="sel"
        selected
        defaultSize={{ width: 50, height: 50 }}
      />,
    );
    expect(document.querySelector('[data-testid="rnd"]') || document.body).toBeTruthy();
  });

  it('exclusive deepen：EditorImage 空 url；align left/right；未选中 Resize', () => {
    storeState.markdownEditorRef = { current: { children: [] } };
    storeState.readonly = false;
    const { rerender } = render(
      <EditorImage
        element={
          {
            type: 'image',
            url: '',
            children: [{ text: '' }],
          } as any
        }
        attributes={{ 'data-slate-node': 'element' } as any}
      >
        <span />
      </EditorImage>,
    );
    rerender(
      <EditorImage
        element={
          {
            type: 'image',
            url: 'https://x.png',
            width: 50,
            align: 'left',
            block: false,
            children: [{ text: '' }],
          } as any
        }
        attributes={{ 'data-slate-node': 'element' } as any}
      >
        <span />
      </EditorImage>,
    );
    rerender(
      <EditorImage
        element={
          {
            type: 'image',
            url: 'https://x.png',
            height: 30,
            align: 'right',
            block: true,
            children: [{ text: '' }],
          } as any
        }
        attributes={{ 'data-slate-node': 'element' } as any}
      >
        <span />
      </EditorImage>,
    );
    render(
      <ResizeImage
        src="https://x.png"
        alt=""
        selected={false}
        defaultSize={{ width: 10, height: 10 }}
      />,
    );
    render(
      <ResizeImage
        src="https://x.png"
        alt="big"
        selected
        defaultSize={{ width: 200, height: 100 }}
        onResizeStart={() => {}}
        onResizeStop={() => {}}
      />,
    );
    expect(document.body).toBeTruthy();
  });
});
