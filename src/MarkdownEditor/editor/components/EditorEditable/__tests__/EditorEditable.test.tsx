import { render, screen, waitFor } from '@testing-library/react';
import { ConfigProvider } from 'antd';
import React, { createRef } from 'react';
import { createEditor } from 'slate';
import { withHistory } from 'slate-history';
import { Slate, withReact } from 'slate-react';
import { beforeEach, describe, expect, it } from 'vitest';
import { I18nContext } from '../../../../../I18n';
import { EditorStoreContext } from '../../../store';
import { DEFAULT_EDITOR_PLACEHOLDER } from '../../../utils/resolveEditorPlaceholder';
import { EditorEditable } from '../index';

function renderEditorEditable(options: {
  editorChildren: ReturnType<typeof createEditor>['children'];
  editorProps?: Record<string, unknown>;
  readonly?: boolean;
  localeInputPlaceholder?: string;
  suppressPlaceholder?: boolean;
}) {
  const containerRef = createRef<HTMLDivElement>();
  containerRef.current = document.createElement('div');
  document.body.appendChild(containerRef.current);

  const editor = withHistory(withReact(createEditor()));
  editor.children = options.editorChildren;

  const locale = options.localeInputPlaceholder
    ? { inputPlaceholder: options.localeInputPlaceholder }
    : undefined;

  return render(
    <ConfigProvider>
      <EditorStoreContext.Provider
        value={{
          editorProps: options.editorProps ?? {},
          readonly: options.readonly ?? false,
          markdownContainerRef: containerRef,
        } as any}
      >
        <Slate editor={editor} initialValue={editor.children}>
          <I18nContext.Provider value={{ locale, language: 'zh-CN' }}>
            <EditorEditable
              readOnly={options.readonly ?? false}
              suppressPlaceholder={options.suppressPlaceholder}
            />
          </I18nContext.Provider>
        </Slate>
      </EditorStoreContext.Provider>
    </ConfigProvider>,
  );
}

describe('EditorEditable placeholder', () => {
  beforeEach(() => {
    document.body.innerHTML = '';
  });

  it('空段落时应渲染 Slate 原生 placeholder', async () => {
    renderEditorEditable({
      editorChildren: [{ type: 'paragraph', children: [{ text: '' }] }],
      editorProps: { placeholder: 'Type here' },
    });

    await waitFor(() => {
      expect(
        document.querySelector('[data-slate-placeholder="true"]'),
      ).toHaveTextContent('Type here');
    });
    expect(screen.getByRole('textbox')).toBeInTheDocument();
  });

  it('空标题时应渲染 Slate 原生 placeholder', async () => {
    renderEditorEditable({
      editorChildren: [{ type: 'head', level: 1, children: [{ text: '' }] }],
      editorProps: { placeholder: 'Enter title' },
    });

    await waitFor(() => {
      expect(
        document.querySelector('[data-slate-placeholder="true"]'),
      ).toHaveTextContent('Enter title');
    });
  });

  it('readonly 时不渲染 placeholder', async () => {
    renderEditorEditable({
      editorChildren: [{ type: 'paragraph', children: [{ text: '' }] }],
      editorProps: { placeholder: 'Hidden' },
      readonly: true,
    });

    await waitFor(() => {
      expect(
        document.querySelector('[data-slate-placeholder="true"]'),
      ).toBeNull();
    });
  });

  it('textAreaProps.placeholder 作为回退', async () => {
    renderEditorEditable({
      editorChildren: [{ type: 'paragraph', children: [{ text: '' }] }],
      editorProps: { textAreaProps: { placeholder: 'From textAreaProps' } },
    });

    await waitFor(() => {
      expect(
        document.querySelector('[data-slate-placeholder="true"]'),
      ).toHaveTextContent('From textAreaProps');
    });
  });

  it('titlePlaceholderContent 作为向下兼容回退', async () => {
    renderEditorEditable({
      editorChildren: [{ type: 'paragraph', children: [{ text: '' }] }],
      editorProps: { titlePlaceholderContent: 'Legacy placeholder' },
    });

    await waitFor(() => {
      expect(
        document.querySelector('[data-slate-placeholder="true"]'),
      ).toHaveTextContent('Legacy placeholder');
    });
  });

  it('locale.inputPlaceholder 作为回退', async () => {
    renderEditorEditable({
      editorChildren: [{ type: 'paragraph', children: [{ text: '' }] }],
      editorProps: {},
      localeInputPlaceholder: 'Locale placeholder',
    });

    await waitFor(() => {
      expect(
        document.querySelector('[data-slate-placeholder="true"]'),
      ).toHaveTextContent('Locale placeholder');
    });
  });

  it('无任何配置时使用默认 placeholder', async () => {
    renderEditorEditable({
      editorChildren: [{ type: 'paragraph', children: [{ text: '' }] }],
      editorProps: {},
    });

    await waitFor(() => {
      expect(
        document.querySelector('[data-slate-placeholder="true"]'),
      ).toHaveTextContent(DEFAULT_EDITOR_PLACEHOLDER);
    });
  });

  it('suppressPlaceholder 为 true 时不渲染 placeholder（IME 组合态）', async () => {
    renderEditorEditable({
      editorChildren: [{ type: 'paragraph', children: [{ text: '' }] }],
      editorProps: { placeholder: '请输入' },
      suppressPlaceholder: true,
    });

    await waitFor(() => {
      expect(
        document.querySelector('[data-slate-placeholder="true"]'),
      ).toBeNull();
    });
  });

  it('含 tag 子节点时不渲染 placeholder', async () => {
    renderEditorEditable({
      editorChildren: [
        {
          type: 'paragraph',
          children: [{ text: '', tag: true } as { text: string; tag: boolean }],
        },
      ],
      editorProps: { placeholder: 'Should not show' },
    });

    await waitFor(() => {
      expect(
        document.querySelector('[data-slate-placeholder="true"]'),
      ).toBeNull();
    });
  });

  it('含 code 行内节点时不渲染 placeholder', async () => {
    renderEditorEditable({
      editorChildren: [
        {
          type: 'paragraph',
          children: [
            { text: '', code: true } as { text: string; code: boolean },
          ],
        },
      ],
      editorProps: { placeholder: 'Should not show' },
    });

    await waitFor(() => {
      expect(
        document.querySelector('[data-slate-placeholder="true"]'),
      ).toBeNull();
    });
  });
});
