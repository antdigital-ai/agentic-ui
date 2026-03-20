import { Editor, Node, Path, Transforms } from 'slate';
import { Elements, MarkdownEditorProps } from '../../BaseMarkdownEditor';
import { isMarkdown } from '../utils';
import { getMediaType } from '../utils/dom';
import { EditorUtils } from '../utils/editorUtils';
import { isHtml } from '../utils/htmlToMarkdown';
import { toUnixPath } from '../utils/path';
import { insertParsedHtmlNodes } from './insertParsedHtmlNodes';
import { parseMarkdownToNodesAndInsert } from './parseMarkdownToNodesAndInsert';

/**
 * 处理粘贴的 Slate Markdown 片段
 */
export const handleSlateMarkdownFragment = (
  editor: Editor,
  clipboardData: DataTransfer,
  currentTextSelection: any,
) => {
  try {
    const encoded = clipboardData.getData('application/x-slate-md-fragment');
    const fragment = JSON.parse(encoded || '[]').map((node: any) => {
      if (node.type === 'card') {
        return {
          ...node,
          children: [
            {
              type: 'card-before',
              children: [{ text: '' }],
            },
            ...node.children,
            {
              type: 'card-after',
              children: [{ text: '' }],
            },
          ],
        };
      }
      return node;
    });

    if (
      fragment.length === 1 &&
      fragment?.at(0).type === 'paragraph' &&
      currentTextSelection
    ) {
      const text = Node.string(fragment.at(0));
      if (text) {
        Transforms.insertText(editor, text, {
          at: currentTextSelection.focus,
        });
        return true;
      }
      return true;
    }

    if (fragment.length === 0) return true;
    EditorUtils.replaceSelectedNode(editor, fragment);
    return true;
  } catch (error) {
    console.log('error', error);
    return false;
  }
};

/**
 * 处理粘贴的 HTML 内容
 */
export const handleHtmlPaste = async (
  editor: Editor,
  clipboardData: DataTransfer,
  editorProps: MarkdownEditorProps,
) => {
  try {
    const html = await clipboardData.getData('text/html');
    const rtf = await clipboardData.getData('text/rtf');

    if (html) {
      return await insertParsedHtmlNodes(editor, html, editorProps, rtf);
    }
    return false;
  } catch (error) {
    console.log('error', error);
    return false;
  }
};

/**
 * 处理粘贴的文件
 */
export const handleFilesPaste = async (
  editor: Editor,
  clipboardData: DataTransfer,
  editorProps: MarkdownEditorProps,
) => {
  try {
    const fileList = clipboardData.files;
    if (fileList.length > 0 && editorProps.image?.upload) {
      try {
        const url = [];
        for await (const file of fileList) {
          if (editorProps.image?.upload) {
            const serverUrl = await editorProps.image.upload([file]);
            url.push(serverUrl);
          }
        }
        const selection = editor?.selection?.focus?.path;
        const node = selection
          ? Node.get(editor, Path.parent(selection)!)
          : null;

        const at = selection
          ? EditorUtils.findNext(editor, selection)!
          : undefined;

        [url].flat(2).forEach((u) => {
          if (!u) return null;
          Transforms.insertNodes(
            editor,
            EditorUtils.createMediaNode(u, 'image'),
            {
              at: [
                ...(node && node.type === 'table-cell'
                  ? selection!
                  : at
                    ? at
                    : [editor.children.length - 1]),
              ],
            },
          );
        });
        return true;
      } catch (error) {
        console.log('error', error);
        return false;
      }
    }
    return false;
  } catch (error) {
    console.log('error', error);
    return false;
  }
};

/**
 * 处理特殊文本格式（media:// 和 attach:// 链接）
 */
export const handleSpecialTextPaste = (
  editor: Editor,
  text: string,
  selection: any,
) => {
  if (text.startsWith('media://') || text.startsWith('attach://')) {
    const path = EditorUtils.findMediaInsertPath(editor);
    const urlObject = new URL(text);
    let url = urlObject.searchParams.get('url');
    if (url && !url.startsWith('http') && !url.startsWith('blob:http')) {
      url = toUnixPath(url);
    }
    if (path && url) {
      if (text.startsWith('media://')) {
        Transforms.insertNodes(
          editor,
          EditorUtils.createMediaNode(url!, 'image'),
          { select: true, at: path },
        );
        const next = Editor.next(editor, { at: path });
        if (next && next[0].type === 'paragraph' && !Node.string(next[0])) {
          Transforms.delete(editor, { at: selection! });
        }
        return true;
      }
      if (text.startsWith('attach://')) {
        Transforms.insertNodes(
          editor,
          {
            type: 'attach',
            name: urlObject.searchParams.get('name'),
            size: Number(urlObject.searchParams.get('size') || 0),
            url: url || undefined,
            children: [{ text: '' }],
          },
          { select: true, at: path },
        );
        const next = Editor.next(editor, { at: path });
        if (next && next[0].type === 'paragraph' && !Node.string(next[0])) {
          Transforms.delete(editor, { at: selection! });
        }
        return true;
      }
    }
  }
  return false;
};

/**
 * 处理 HTTP 链接
 */
export const handleHttpLinkPaste = (
  editor: Editor,
  text: string,
  selection: any,
  store: any,
) => {
  if (text.startsWith('http')) {
    // 添加更严格的URL类型判断，避免误识别
    const mediaType = getMediaType(text);

    // 检查是否为明确的媒体类型
    if (['image', 'video', 'audio'].includes(mediaType)) {
      // 进一步验证URL是否真的包含媒体文件
      const isValidMediaUrl = (url: string, type: string): boolean => {
        if (!url) return false;

        // 检查是否为blob URL或data URL
        if (url.startsWith('blob:') || url.startsWith('data:')) {
          return true;
        }

        // 根据媒体类型检查文件扩展名
        const mediaExtensions = {
          image: [
            '.jpg',
            '.jpeg',
            '.png',
            '.gif',
            '.svg',
            '.webp',
            '.bmp',
            '.ico',
          ],
          video: ['.mp4', '.webm', '.ogg', '.avi', '.mov', '.wmv', '.flv'],
          audio: ['.mp3', '.wav', '.ogg', '.aac', '.m4a', '.flac'],
        };

        const extensions =
          mediaExtensions[type as keyof typeof mediaExtensions] || [];
        const hasValidExtension = extensions.some((ext) =>
          url.toLowerCase().includes(ext),
        );

        // 检查URL是否包含媒体相关的路径
        const mediaPaths = {
          image: ['/image', '/img', '/photo', '/picture', '/avatar', '/icon'],
          video: ['/video', '/media', '/movie', '/clip'],
          audio: ['/audio', '/music', '/sound', '/voice'],
        };

        const paths = mediaPaths[type as keyof typeof mediaPaths] || [];
        const hasMediaPath = paths.some((path) =>
          url.toLowerCase().includes(path),
        );

        return hasValidExtension || hasMediaPath;
      };

      // 只有当URL确实是媒体文件时才作为媒体处理
      if (isValidMediaUrl(text, mediaType)) {
        const path = EditorUtils.findMediaInsertPath(editor);
        if (!path) return false;
        Transforms.insertNodes(
          editor,
          EditorUtils.createMediaNode(text, 'image'),
          {
            select: true,
            at: selection!,
          },
        );
        return true;
      }
    }

    // 如果不是明确的媒体文件，或者验证失败，则作为链接处理
    store.insertLink(text);
    return true;
  }
  return false;
};

/**
 * 处理普通文本粘贴
 */
export const handlePlainTextPaste = async (
  editor: Editor,
  text: string,
  selection: any,
  plugins: any,
) => {
  if (isMarkdown(text)) {
    await parseMarkdownToNodesAndInsert(editor, text, plugins);
    return true;
  }
  if (isHtml(text)) {
    const success = await insertParsedHtmlNodes(editor, text, plugins, '');
    if (success) return true;
  }

  if (selection) {
    Transforms.insertText(editor, text, { at: selection });
  } else {
    Transforms.insertNodes(editor, [
      {
        type: 'paragraph',
        children: [{ text }],
      },
    ]);
  }
  return true;
};

/**
 * 检查是否需要直接插入文本（在特定节点类型中）
 */
export const shouldInsertTextDirectly = (editor: Editor, selection: any) => {
  if (!selection?.focus) return false;

  const rangeNodes = Editor?.node(editor, [selection.focus.path.at(0)!]);
  if (!rangeNodes) return false;

  const rangeNode = rangeNodes.at(0) as Elements;
  return [
    'table-cell',
    'table-row',
    'table',
    'code',
    'schema',
    'apaasify',
    'agentic-ui-task',
    'agentic-ui-toolusebar',
    'agentic-ui-usertoolbar',
  ].includes(rangeNode.type);
};

/**
 * 处理标签节点的粘贴
 */
export const handleTagNodePaste = (
  editor: Editor,
  currentTextSelection: any,
  clipboardData: DataTransfer,
  curNode: any,
) => {
  if (curNode?.tag) {
    const text = clipboardData.getData('text/plain');
    if (text) {
      Transforms.insertText(editor, text, {
        at: currentTextSelection.focus,
      });
      return true;
    }
  }
  return false;
};
