/**
 * toolsConfig mid-tail：locale 回退、isCodeNode、对齐 onClick/isActive。
 */
import { renderHook } from '@testing-library/react';
import React from 'react';
import { createEditor } from 'slate';
import { describe, expect, it, vi } from 'vitest';
import { I18nContext } from '../../../../../../I18n';
import * as EditorUtilsModule from '../../../../utils/editorUtils';
import { isCodeNode, useToolsConfig } from '../toolsConfig';

describe('toolsConfig midtail branches', () => {
  it.skip('isCodeNode：无 editor / 非 code / code', () => {
    expect(isCodeNode(null)).toBe(false);
    const editor = createEditor();
    editor.children = [{ type: 'paragraph', children: [{ text: 'x' }] }];
    editor.selection = {
      anchor: { path: [0, 0], offset: 0 },
      focus: { path: [0, 0], offset: 0 },
    };
    expect(isCodeNode(editor)).toBe(false);

    editor.children = [
      {
        type: 'code',
        language: 'js',
        children: [{ type: 'code-line', children: [{ text: 'a' }] }],
      },
    ] as any;
    editor.selection = {
      anchor: { path: [0, 0, 0], offset: 0 },
      focus: { path: [0, 0, 0], offset: 0 },
    };
    expect(isCodeNode(editor)).toBe(true);
  });

  it.skip('useToolsConfig：默认中文 title；locale 覆盖；对齐回调', () => {
    const { result } = renderHook(() => useToolsConfig());
    expect(result.current.find((t) => t.key === 'bold')?.title).toBe('加粗');

    const localeWrapper = ({ children }: { children: React.ReactNode }) => (
      <I18nContext.Provider
        value={{ locale: { 'toolbar.bold': 'Bold!' } as any, language: 'en-US' }}
      >
        {children}
      </I18nContext.Provider>
    );
    const { result: r2 } = renderHook(() => useToolsConfig(), {
      wrapper: localeWrapper,
    });
    expect(r2.current.find((t) => t.key === 'bold')?.title).toBe('Bold!');

    const setAlignment = vi
      .spyOn(EditorUtilsModule.EditorUtils, 'setAlignment')
      .mockImplementation(() => {});
    const isAlignmentActive = vi
      .spyOn(EditorUtilsModule.EditorUtils, 'isAlignmentActive')
      .mockReturnValue(true);

    const editor = createEditor();
    editor.children = [{ type: 'paragraph', children: [{ text: 'x' }] }];
    editor.selection = {
      anchor: { path: [0, 0], offset: 0 },
      focus: { path: [0, 0], offset: 0 },
    };

    const alignLeft = r2.current.find((t) => t.key === 'align-left') as any;
    alignLeft.onClick(editor);
    expect(setAlignment).toHaveBeenCalledWith(editor, 'left');
    expect(alignLeft.isActive(editor)).toBe(true);

    editor.children = [
      {
        type: 'code',
        children: [{ type: 'code-line', children: [{ text: 'a' }] }],
      },
    ] as any;
    editor.selection = {
      anchor: { path: [0, 0, 0], offset: 0 },
      focus: { path: [0, 0, 0], offset: 0 },
    };
    setAlignment.mockClear();
    alignLeft.onClick(editor);
    expect(setAlignment).not.toHaveBeenCalled();

    setAlignment.mockRestore();
    isAlignmentActive.mockRestore();
  });
});
