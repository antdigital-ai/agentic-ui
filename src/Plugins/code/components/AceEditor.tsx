/**
 * @fileoverview Ace编辑器核心组件
 *
 * 负责Ace编辑器的初始化、配置和事件处理，包括：
 * - 编辑器生命周期管理
 * - 语法高亮配置
 * - 主题动态切换
 * - 键盘事件处理
 * - 内容变化监听
 * - 与 Slate 编辑器的集成
 *
 * @see {@link https://ace.c9.io/} Ace Editor 官方文档
 */

import ace, { Ace } from 'ace-builds';
import 'ace-builds/src-noconflict/theme-chaos';
import 'ace-builds/src-noconflict/theme-github';
import isHotkey from 'is-hotkey';
import { useCallback, useEffect, useRef } from 'react';
import { Editor, Path, Transforms } from 'slate';
import { useRefFunction } from '../../../Hooks/useRefFunction';
import partialParse from '../../../MarkdownEditor/editor/parser/json-parse';
import { useEditorStore } from '../../../MarkdownEditor/editor/store';
import { aceLangs, modeMap } from '../../../MarkdownEditor/editor/utils/ace';
import { EditorUtils } from '../../../MarkdownEditor/editor/utils/editorUtils';
import { CodeNode } from '../../../MarkdownEditor/el';

/**
 * AceEditor 组件属性接口
 *
 * @interface AceEditorProps
 * @property {CodeNode} element - 代码块节点数据
 * @property {Function} onUpdate - 更新代码块内容的回调
 * @property {Function} onShowBorderChange - 边框显示状态变化回调
 * @property {Function} onHideChange - 隐藏状态变化回调
 * @property {Path} path - 代码块在文档中的路径
 * @property {boolean} [isSelected] - 是否被选中
 * @property {Function} [onSelectionChange] - 选中状态变化回调
 */
interface AceEditorProps {
  element: CodeNode;
  onUpdate: (data: Partial<CodeNode>) => void;
  onShowBorderChange: (show: boolean) => void;
  onHideChange: (hide: boolean) => void;
  path: Path;
  isSelected?: boolean;
  onSelectionChange?: (selected: boolean) => void;
  theme: string;
}

/**
 * AceEditor 组件
 *
 * 封装 Ace Editor 的核心功能，提供代码编辑、语法高亮、主题切换等能力。
 *
 * @component
 * @param {AceEditorProps} props - 组件属性
 * @returns {Object} 返回包含 DOM 引用、编辑器引用、语言设置等方法的对象
 *
 * @example
 * ```tsx
 * const { dom, setLanguage, focusEditor } = AceEditor({
 *   element: codeNode,
 *   onUpdate: (data) => console.log('更新:', data),
 *   onShowBorderChange: (show) => setBorder(show),
 *   onHideChange: (hide) => setHide(hide),
 *   path: [0, 1],
 * });
 * ```
 *
 * @remarks
 * - 支持 100+ 种编程语言
 * - 支持多种主题切换
 * - 自动处理键盘事件和快捷键
 * - 与 Slate 编辑器深度集成
 */
export function AceEditor({
  element,
  onUpdate,
  onShowBorderChange,
  onHideChange,
  path,
  isSelected = false,
  onSelectionChange,
  ...props
}: AceEditorProps) {
  const { store, editorProps, readonly } = useEditorStore();

  // 各种引用
  const codeRef = useRef(element.value || '');
  const pathRef = useRef<Path>(path);
  const posRef = useRef({ row: 0, column: 0 });
  const pasted = useRef(false);
  const debounceTimer = useRef(0);
  const editorRef = useRef<Ace.Editor>();
  const dom = useRef<HTMLDivElement>(null);

  // 更新路径引用
  useEffect(() => {
    pathRef.current = path;
  }, [path]);

  // 键盘事件处理
  const handleKeyDown = useRefFunction((e: KeyboardEvent) => {
    // 删除空代码块
    if (isHotkey('backspace', e)) {
      if (codeRef.current.trim() === '') {
        Editor.withoutNormalizing(store.editor, () => {
          Transforms.delete(store.editor, { at: pathRef.current });
          // 如果这是最后一个节点，使用替换而不是删除+插入，避免文档为空
          Transforms.insertNodes(
            store.editor,
            { type: 'paragraph', children: [{ text: '' }] },
            { at: pathRef.current, select: true },
          );
          Transforms.select(
            store.editor,
            Editor.start(store.editor, pathRef.current),
          );
        });
        return;
      }
    }

    // Cmd/Ctrl + Enter: 插入新段落
    if (isHotkey('mod+enter', e) && pathRef.current) {
      EditorUtils.focus(store.editor);
      Transforms.insertNodes(
        store.editor,
        { type: 'paragraph', children: [{ text: '' }] },
        { at: Path.next(pathRef.current), select: true },
      );
      e.stopPropagation();
      return;
    }

    // 转发键盘事件
    const newEvent = new KeyboardEvent(e.type, e);
    window.dispatchEvent(newEvent);
  });

  // 配置编辑器事件
  const setupEditorEvents = useCallback(
    (codeEditor: Ace.Editor) => {
      // 禁用默认查找快捷键
      codeEditor.commands.addCommand({
        name: 'disableFind',
        bindKey: { win: 'Ctrl-F', mac: 'Command-F' },
        exec: () => {},
      });

      const textarea = dom.current!.querySelector('textarea');

      // 聚焦事件
      codeEditor.on('focus', () => {
        onShowBorderChange(false);
        onHideChange(false);
      });

      // 失焦事件
      codeEditor.on('blur', () => {
        codeEditor.selection.clearSelection();
      });

      // 光标变化事件
      codeEditor.selection.on('changeCursor', () => {
        setTimeout(() => {
          const pos = codeEditor.getCursorPosition();
          posRef.current = { row: pos.row, column: pos.column };
        });
      });

      // 粘贴事件
      codeEditor.on('paste', (e) => {
        if (pasted.current) {
          e.text = '';
        } else {
          pasted.current = true;
          setTimeout(() => {
            pasted.current = false;
          }, 60);
        }
      });
      codeEditor.on('focus', () => {
        onSelectionChange?.(true);
      });
      codeEditor.on('blur', () => {
        setTimeout(() => {
          onSelectionChange?.(false);
        }, 160);
      });

      // 键盘事件
      textarea?.addEventListener('keydown', handleKeyDown);

      // 内容变化事件
      codeEditor.on('change', () => {
        if (readonly) return;
        clearTimeout(debounceTimer.current);
        debounceTimer.current = window.setTimeout(() => {
          onUpdate({ value: codeEditor.getValue() });
          codeRef.current = codeEditor.getValue();
        }, 100);
      });
    },
    [onUpdate, onShowBorderChange, onHideChange, readonly, handleKeyDown],
  );

  // 初始化 Ace 编辑器
  useEffect(() => {
    if (process.env.NODE_ENV === 'test') return;
    if (!dom.current) return;

    let value = element.value || '';
    if (element.language === 'json') {
      try {
        value = JSON.stringify(partialParse(value), null, 2);
      } catch (e) {}
    }

    const codeEditor = ace.edit(dom.current!, {
      useWorker: false,
      value,
      fontSize: 12,
      animatedScroll: true,
      maxLines: Infinity,
      wrap: true,
      tabSize: 4,
      readOnly: readonly,
      showPrintMargin: false,
      showLineNumbers: true,
      showGutter: true,
      ...(editorProps.codeProps || {}),
    } as Ace.EditorOptions);

    editorRef.current = codeEditor;

    // 设置主题
    const theme = editorProps.codeProps?.theme || props.theme || 'github';
    codeEditor.setTheme(`ace/theme/${theme}`);

    // 设置语法高亮
    setTimeout(() => {
      let lang = element.language as string;
      if (modeMap.has(lang)) {
        lang = modeMap.get(lang)!;
      }
      if (aceLangs.has(lang)) {
        codeEditor.session.setMode(`ace/mode/${lang}`);
      }
    }, 16);

    if (readonly) return;

    // 配置编辑器事件
    setupEditorEvents(codeEditor);

    return () => {
      codeEditor.destroy();
    };
  }, []);

  // 监听外部值变化
  useEffect(() => {
    let value = element.value || '';

    if (element.language === 'json') {
      try {
        value = JSON.stringify(partialParse(value), null, 2);
      } catch (e) {}
    }

    if (value !== codeRef.current) {
      if (element) editorRef.current?.setValue(value);
      editorRef.current?.clearSelection();
    }
  }, [element.value]);

  // 监听主题变化
  useEffect(() => {
    if (!editorRef.current) return;
    const theme = editorProps.codeProps?.theme || props.theme || 'github';
    editorRef.current.setTheme(`ace/theme/${theme}`);
  }, [editorProps.codeProps?.theme, props.theme]);

  // 暴露设置语言的方法
  const setLanguage = useCallback(
    (changeLang: string) => {
      let lang = changeLang.toLowerCase();
      if (element.language?.toLowerCase() === lang) return;

      onUpdate({ language: lang });

      if (modeMap.has(lang)) {
        lang = modeMap.get(lang)!;
      }

      if (aceLangs.has(lang)) {
        editorRef.current?.session.setMode(`ace/mode/${lang}`);
      } else {
        editorRef.current?.session.setMode(`ace/mode/text`);
      }
    },
    [element, onUpdate],
  );

  return {
    dom,
    editorRef,
    setLanguage,
    focusEditor: () => editorRef.current?.focus(),
    isSelected,
    onSelectionChange,
  };
}
