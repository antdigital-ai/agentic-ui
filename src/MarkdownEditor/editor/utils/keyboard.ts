import { message } from 'antd';
import copy from 'copy-to-clipboard';
import isHotkey from 'is-hotkey';
import { useEffect, useMemo } from 'react';
import { Subject } from 'rxjs';
import { Editor, Element, Node, Path, Range, Transforms } from 'slate';
import { ReactEditor } from 'slate-react';
import { useRefFunction } from '../../../Hooks/useRefFunction';
import { MarkdownEditorProps } from '../../BaseMarkdownEditor';
import { AttachNode, MediaNode } from '../../el';
import { useSubject } from '../../hooks/subscribe';
import { EditorStore } from '../store';
import {
  convertToParagraph,
  createList,
  decreaseHeadingLevel,
  increaseHeadingLevel,
  insertCodeBlock,
  insertHorizontalLine,
  insertTable as insertTableCommand,
  setHeading,
  toggleQuote,
} from './editorCommands';
import { EditorUtils } from './editorUtils';

export type Methods<T> = {
  // eslint-disable-next-line @typescript-eslint/ban-types
  [P in keyof T]: T[P] extends Function ? P : never;
}[keyof T];

export class KeyboardTask {
  store: EditorStore;
  editor: EditorStore['editor'];
  props: MarkdownEditorProps;

  constructor(store: EditorStore, props: MarkdownEditorProps) {
    this.store = store;
    this.editor = store?.editor;
    this.props = props;
  }

  /**
   * 获取当前编辑器中的最低层级元素节点
   *
   * @returns 编辑器中所有匹配的元素节点及其路径
   */
  get curNodes() {
    return Editor.nodes<any>(this.editor, {
      mode: 'lowest',
      match: (m) => {
        return Element.isElement(m);
      },
    });
  }

  /**
   * 全选编辑器内容
   *
   * 如果当前位于表格单元格内，则选中整个表格；
   * 否则选中编辑器中的所有内容
   */
  selectAll() {
    Transforms.select(this.editor, {
      anchor: Editor.start(this.editor, []),
      focus: Editor.end(this.editor, []),
    });
  }

  /**
   * 选择当前行的文本。
   *
   * 如果编辑器中有选区，则选择当前行的文本，并打开浮动工具栏。
   *
   * @remarks
   * 该方法首先检查编辑器中是否有选区。如果有选区，则选择当前行的文本路径。
   * 然后获取当前行的文本内容，如果文本内容存在，则打开浮动工具栏。
   */
  selectLine() {
    if (this.editor.selection) {
      Transforms.select(
        this.editor,
        Path.parent(this.editor.selection.anchor.path),
      );
    }
  }

  /**
   * 将选中文本转换为行内代码
   *
   * 如果编辑器存在选区，将选中的文本转换为行内代码格式
   */
  selectFormatToCode() {
    if (this.editor.selection) {
      EditorUtils.toggleFormat(this.editor, 'code');
    }
  }

  /**
   * 选择当前光标所在的单词或汉字。
   *
   * 如果当前选区是折叠的（即光标没有选中任何文本），则会尝试选择光标所在位置的整个单词或汉字。
   *
   * 具体步骤如下：
   * 1. 获取当前选区，如果选区是折叠的，则继续。
   * 2. 获取光标所在位置的文本内容。
   * 3. 根据光标位置，向前和向后查找单词或汉字的边界。
   * 4. 更新选区，使其包含整个单词或汉字。
   * 5. 如果选区不再是折叠的，则打开浮动工具栏。
   *
   * @remarks
   * 该方法支持英文单词和中文汉字的选择。
   */
  selectWord() {
    const sel = this.editor.selection;
    if (sel && Range.isCollapsed(sel)) {
      const text = Node.leaf(this.editor, sel.anchor.path).text || '';
      let start = sel.anchor.offset;
      let end = start;
      const next = text.slice(start);
      const pre = text.slice(0, start);
      let m1 = next.match(/^(\w+)/);
      if (m1) {
        end += m1[1].length;
        let m2 = pre.match(/(\w+)$/);
        if (m2) start = start - m2[1].length;
      } else {
        m1 = next.match(/^([\u4e00-\u9fa5]+)/);
        if (m1) {
          end += m1[1].length;
          let m2 = pre.match(/([\u4e00-\u9fa5]+)$/);
          if (m2) start = start - m2[1].length;
        } else {
          let m2 = pre.match(/(\w+)$/);
          if (!m2) m2 = pre.match(/([\u4e00-\u9fa5]+)$/);
          if (m2) start -= m2[1].length;
        }
      }
      if (start === sel.anchor.offset && end === sel.anchor.offset && next) {
        end = start + 1;
      }
      Transforms.select(this.editor, {
        anchor: { path: sel.anchor.path, offset: start },
        focus: { path: sel.anchor.path, offset: end },
      });
    }
  }

  /**
   * 从剪贴板粘贴纯文本内容到编辑器中。
   *
   * 该方法首先从剪贴板读取文本内容，然后根据当前节点的类型决定如何插入文本。
   * 如果当前节点是表格单元格类型，则将换行符替换为空格后插入文本；
   * 否则，直接插入文本。
   *
   * @returns {Promise<void>} 一个表示异步操作的 Promise 对象。
   */
  async pastePlainText() {
    const text = await navigator.clipboard.readText();
    if (text) {
      const [node] = this.curNodes;
      if (node?.[0]?.type === 'table-cell') {
        Editor.insertText(this.editor, text.replace(/\n/g, ' '));
      } else {
        Editor.insertText(this.editor, text);
      }
    }
  }

  /**
   * 上传图片
   *
   * 创建文件上传输入框，允许用户选择图片文件上传，
   * 然后根据当前节点位置将图片插入到编辑器中适当的位置。
   * 支持列单元格、普通节点和空编辑器的不同插入逻辑。
   */
  uploadImage() {
    const input = document.createElement('input');
    const [node] = this.curNodes;
    input.id = 'uploadImage' + '_' + Math.random();
    input.type = 'file';
    input.accept = 'image/*';
    const insertMedia = async (url: string) => {
      if (node && ['column-cell'].includes(node[0].type)) {
        Transforms.insertNodes(
          this.editor,
          [EditorUtils.createMediaNode(url, 'image', {})],
          {
            at: [...node[1], 0],
          },
        );
        return;
      }
      if (node) {
        Transforms.insertNodes(
          this.editor,
          [EditorUtils.createMediaNode(url, 'image', {})],
          {
            at: Path.next(node[1]),
          },
        );
      } else {
        Transforms.insertNodes(
          this.editor,
          [EditorUtils.createMediaNode(url, 'image', {})],
          {
            select: true,
          },
        );
      }
    };
    input.onchange = async (e: any) => {
      if (input.dataset.readonly) {
        return;
      }
      input.dataset.readonly = 'true';
      const hideLoading = message.loading('上传中...');
      try {
        if (!this.props?.image?.upload) {
          message.error('图片上传功能未配置');
          return;
        }
        const url =
          (await this.props.image.upload(
            (Array.from(e.target.files) as File[]) || [],
          )) || [];
        [url].flat().forEach((u: string) => {
          if (u) {
            insertMedia(u);
          }
        });
        message.success('上传成功');
      } catch (error) {
        console.error('图片上传失败:', error);
        message.error('图片上传失败');
      } finally {
        hideLoading();
        input.value = '';
      }
    };
    if (input.dataset.readonly) {
      return;
    }
    input.click();
    input.remove();
  }

  /**
   * 设置标题级别
   *
   * 将当前段落或标题节点转换为指定级别的标题。
   * 如果级别为4，则转换为普通段落。
   *
   * @param level 标题级别（1-3）或4（表示普通段落）
   */
  head(level: number) {
    if (level === 4) {
      this.paragraph();
      return;
    }
    setHeading(this.editor, level);
  }

  /**
   * 将标题转换为普通段落
   *
   * 如果当前节点是标题类型，将其转换为普通段落
   */
  paragraph() {
    convertToParagraph(this.editor);
  }

  /**
   * 增加标题级别（使标题变小）
   *
   * 将段落转换为4级标题，
   * 或将标题级别从1级改为普通段落，
   * 或将其他级别标题升级一级（数字变小）
   */
  increaseHead() {
    increaseHeadingLevel(this.editor);
  }

  /**
   * 降低标题级别（使标题变大）
   *
   * 将段落转换为1级标题，
   * 或将4级标题改为普通段落，
   * 或将其他级别标题降级一级（数字变大）
   */
  decreaseHead() {
    decreaseHeadingLevel(this.editor);
  }

  /**
   * 插入或移除引用块
   *
   * 如果当前节点已在引用块中，则移除引用块；
   * 否则，将当前节点转换为引用块。
   * 如果当前节点是标题，先将其转换为普通段落。
   */
  insertQuote() {
    const [node] = this.curNodes;
    toggleQuote(this.editor, node);
  }

  /**
   * 插入表格
   *
   * 在当前位置插入一个3x3的表格（包含表头行）。
   * 根据当前节点类型（段落、标题或列单元格）
   * 决定在何处插入表格及如何处理现有内容。
   */
  insertTable() {
    const [node] = this.curNodes;
    insertTableCommand(this.editor, node);
  }

  /**
   * 插入分栏组
   *
   * 在当前位置插入一个两列的分栏布局。
   * 如果当前节点是空段落，会被删除。
   */

  /**
   * 插入代码块
   *
   * 在当前位置插入代码块，并根据传入的类型设置语言和渲染模式。
   * 支持在列单元格内或普通段落/标题后插入代码块。
   *
   * @param type 可选的代码块类型，'mermaid'表示流程图，'html'表示HTML渲染
   */
  insertCode(type?: 'mermaid' | 'html') {
    const [node] = this.curNodes;
    insertCodeBlock(this.editor, type, node);
  }

  /**
   * 插入水平分割线
   *
   * 在当前位置插入水平分割线，并将光标定位到分割线后的位置。
   * 如果分割线后没有内容，则自动插入一个空段落并将光标定位到该段落。
   */
  horizontalLine() {
    const [node] = this.curNodes;
    insertHorizontalLine(this.editor, node);
  }

  /**
   * 创建或转换列表
   *
   * 将当前段落或标题转换为指定类型的列表。
   * 如果已经是列表项，则更改列表类型。
   *
   * @param mode 列表类型 'ordered'(有序列表), 'unordered'(无序列表), 'task'(任务列表)
   */
  list(mode: 'ordered' | 'unordered' | 'task') {
    createList(this.editor, mode);
  }

  /**
   * 切换文本格式
   *
   * 在当前选区上应用或取消指定的文本格式（如加粗、斜体等）
   *
   * @param type 要应用的格式类型（'bold'、'italic'、'strikethrough'等）
   */
  format(type: string) {
    EditorUtils.toggleFormat(this!.editor, type);
  }

  /**
   * 清除文本格式
   *
   * 移除当前选区中的所有格式标记。
   * 如果选区是折叠的（只有光标），则清除光标所在位置的所有标记
   */
  clear() {
    if (this.editor.selection)
      EditorUtils.clearMarks(
        this.editor,
        !Range.isCollapsed(this.editor.selection),
      );
  }

  /**
   * 撤销上一步操作
   *
   * 调用编辑器的undo方法，回退到上一个历史状态
   */
  undo() {
    try {
      this.store?.editor.undo();
    } catch (e) {}
  }

  /**
   * 重做上一步被撤销的操作
   *
   * 调用编辑器的redo方法，前进到下一个历史状态
   */
  redo() {
    try {
      this.store?.editor.redo();
    } catch (e) {}
  }
}

/**
 * 
以下是 Markdown 编辑器快捷键列表及其功能说明：

| 快捷键 | 功能 |
|-------|------|
| `Cmd/Ctrl+Shift+L` | 选择当前行文本 |
| `Cmd/Ctrl+E` | 选择当前格式化的文本 |
| `Cmd/Ctrl+D` | 选择当前光标所在的单词或汉字 |
| `Cmd/Ctrl+A` | 全选编辑器内容 |
| `Cmd/Ctrl+Shift+V` | 粘贴纯文本内容（无格式） |
| `Cmd/Ctrl+1` | 设置为一级标题 (H1) |
| `Cmd/Ctrl+2` | 设置为二级标题 (H2) |
| `Cmd/Ctrl+3` | 设置为三级标题 (H3) |
| `Cmd/Ctrl+4` | 转换为普通段落 |
| `Cmd/Ctrl+0` | 转换为普通段落 |
| `Cmd/Ctrl+]` | 增加标题级别（标题变小） |
| `Cmd/Ctrl+[` | 降低标题级别（标题变大） |
| `Option/Alt+Q` | 插入或移除引用块 |
| `Cmd/Ctrl+Option/Alt+T` | 插入表格 |
| `Cmd/Ctrl+Option/Alt+C` | 插入代码块 |
| `Cmd/Ctrl+Option/Alt+/` | 插入水平分割线 |
| `Cmd/Ctrl+Option/Alt+O` | 创建有序列表 |
| `Cmd/Ctrl+Option/Alt+U` | 创建无序列表 |
| `Cmd/Ctrl+Option/Alt+S` | 创建任务列表 |
| `Cmd/Ctrl+B` | 切换文本加粗格式 |
| `Cmd/Ctrl+I` | 切换文本斜体格式 |
| `Cmd/Ctrl+Shift+S` | 切换文本删除线格式 |
| `Option/Alt+`` | 切换行内代码格式 |
| `Cmd/Ctrl+\` | 清除所有文本格式 |
| `Cmd/Ctrl+Option/Alt+M` | 插入流程图(Mermaid)代码块 |
注：`Cmd` 键在 Windows 系统上对应 `Ctrl` 键，`Option` 键在 Windows 系统上对应 `Alt` 键。
 */
const keyMap: [string, Methods<KeyboardTask>, any[]?, boolean?][] = [
  ['mod+shift+l', 'selectLine'],
  ['mod+e', 'selectFormatToCode'],
  ['mod+d', 'selectWord'],
  ['mod+a', 'selectAll'],
  ['mod+shift+v', 'pastePlainText'],
  ['mod+1', 'head', [1]],
  ['mod+2', 'head', [2]],
  ['mod+3', 'head', [3]],
  ['mod+4', 'head', [4]],
  ['mod+0', 'paragraph'],
  ['mod+]', 'increaseHead'],
  ['mod+[', 'decreaseHead'],
  ['option+q', 'insertQuote'],
  ['mod+option+t', 'insertTable'],
  ['mod+option+c', 'insertCode'],
  ['mod+option+/', 'horizontalLine'],
  ['mod+option+o', 'list', ['ordered']],
  ['mod+option+u', 'list', ['unordered']],
  ['mod+option+s', 'list', ['task']],
  ['mod+b', 'format', ['bold']],
  ['mod+i', 'format', ['italic']],
  ['mod+shift+s', 'format', ['strikethrough']],
  ['option+`', 'format', ['code']],
  ['mod+\\', 'clear'],
  ['mod+option+m', 'insertCode', ['mermaid']],
];

export const useSystemKeyboard = (
  keyTask$: Subject<{
    key: Methods<KeyboardTask>;
    args?: any[];
  }>,
  store: EditorStore,
  props: MarkdownEditorProps,
  markdownContainerRef?: React.RefObject<HTMLDivElement>,
) => {
  const task = useMemo(() => {
    return new KeyboardTask(store, props);
  }, [props.readonly]);

  useSubject(keyTask$, ({ key, args }: any) => {
    // @ts-ignore
    task[key](...(args || []));
  });

  // eslint-disable-next-line react-hooks/exhaustive-deps
  const keydown = useRefFunction((e: KeyboardEvent) => {
    if (!store) return;

    if (isHotkey('mod+c', e) || isHotkey('mod+x', e)) {
      const [node] = Editor.nodes<MediaNode | AttachNode>(store?.editor, {
        mode: 'lowest',
        match: (m) =>
          Element.isElement(m) && (m.type === 'media' || m.type === 'attach'),
      });
      if (!node) return;
      let readlUrl = node[0]?.url as string;

      if (node?.[0]?.type === 'media') {
        const url = `media://file?url=${readlUrl}&height=${
          node[0].height || ''
        }`;
        try {
          copy(url);
        } catch (error) {}
        if (isHotkey('mod+x', e)) {
          Transforms.delete(store?.editor, { at: node[1] });
          ReactEditor.focus(store?.editor);
        }
      }
      if (node?.[0]?.type === 'attach') {
        const url = `attach://file?size=${node[0].size}&name=${node[0].name}&url=${node[0]?.url}`;
        try {
          copy(url);
        } catch (error) {}

        if (isHotkey('mod+x', e)) {
          Transforms.delete(store?.editor, { at: node[1] });
          ReactEditor.focus(store?.editor);
        }
      }
    }

    if (isHotkey('backspace', e)) {
      const [node] = task.curNodes;
      if (node?.[0].type === 'media') {
        e.preventDefault();
        Transforms.removeNodes(task.editor, { at: node[1] });
        Transforms.insertNodes(task.editor, EditorUtils.p, {
          at: node[1],
          select: true,
        });
        ReactEditor.focus(task.editor);
      }
    }
    if (isHotkey('arrowUp', e) || isHotkey('arrowDown', e)) {
      const [node] = task.curNodes;
      if (node?.[0].type === 'media') {
        e.preventDefault();
        if (isHotkey('arrowUp', e)) {
          Transforms.select(
            task.editor,
            Editor.end(task.editor, EditorUtils.findPrev(task.editor, node[1])),
          );
        } else if (EditorUtils.findNext(task.editor, node[1])) {
          Transforms.select(
            task.editor,
            Editor.start(
              task.editor,
              EditorUtils.findNext(task.editor, node[1])!,
            ),
          );
        }
        ReactEditor.focus(task.editor);
      }
    }
    for (let key of keyMap) {
      if (isHotkey(key[0], e)) {
        e.preventDefault();
        e.stopPropagation();
        // @ts-ignore
        task[key[1]](...(key[2] || []));
        break;
      }
    }
  });

  useEffect(() => {
    if (props.readonly) return;
    if (!store) return;
    if (typeof window === 'undefined') return;
    markdownContainerRef?.current?.addEventListener('keydown', keydown);
    return () => {
      markdownContainerRef?.current?.removeEventListener('keydown', keydown);
    };
  }, []);
};
