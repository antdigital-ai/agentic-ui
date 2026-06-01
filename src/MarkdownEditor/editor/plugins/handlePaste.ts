import {
  BaseSelection,
  Editor,
  Element,
  Node,
  Path,
  Range,
  Text,
  Transforms,
} from 'slate';
import { Elements, MarkdownEditorProps } from '../../BaseMarkdownEditor';
import type { MarkdownEditorPlugin } from '../../plugin';
import type { EditorStore } from '../store';
import { isMarkdown } from '../utils';
import { getMediaType } from '../utils/dom';
import { EditorUtils } from '../utils/editorUtils';
import { isHtml } from '../utils/htmlToMarkdown';
import { toUnixPath } from '../utils/path';
import { insertParsedHtmlNodes } from './insertParsedHtmlNodes';
import { parseMarkdownToNodesAndInsert } from './parseMarkdownToNodesAndInsert';

const isValidSlateNode = (node: unknown): node is Node => {
  if (Element.isElement(node)) return true;
  if (Text.isText(node)) return true;
  return false;
};

/** 媒体文件扩展名映射 */
const MEDIA_EXTENSIONS = {
  image: ['.jpg', '.jpeg', '.png', '.gif', '.svg', '.webp', '.bmp', '.ico'],
  video: ['.mp4', '.webm', '.ogg', '.avi', '.mov', '.wmv', '.flv'],
  audio: ['.mp3', '.wav', '.ogg', '.aac', '.m4a', '.flac'],
} as const;

/** 媒体相关路径关键词映射 */
const MEDIA_PATHS = {
  image: ['/image', '/img', '/photo', '/picture', '/avatar', '/icon'],
  video: ['/video', '/media', '/movie', '/clip'],
  audio: ['/audio', '/music', '/sound', '/voice'],
} as const;

type MediaType = keyof typeof MEDIA_EXTENSIONS;

/** 验证 URL 是否为有效的媒体资源链接 */
const isValidMediaUrl = (url: string, type: string): boolean => {
  if (!url) return false;

  if (url.startsWith('blob:') || url.startsWith('data:')) {
    return true;
  }

  const extensions = MEDIA_EXTENSIONS[type as MediaType] ?? [];
  const lowerUrl = url.toLowerCase();
  const hasValidExtension = extensions.some((ext) => lowerUrl.includes(ext));

  const paths = MEDIA_PATHS[type as MediaType] ?? [];
  const hasMediaPath = paths.some((mediaPath) => lowerUrl.includes(mediaPath));

  return hasValidExtension || hasMediaPath;
};

/** 需要直接插入文本的节点类型 */
const DIRECT_INSERT_NODE_TYPES = [
  'table-cell',
  'table-row',
  'table',
  'code',
  'schema',
  'apaasify',
  'agentic-ui-task',
  'agentic-ui-toolusebar',
  'agentic-ui-usertoolbar',
  'agentic-ui-filemap',
] as const;

/**
 * 处理粘贴的 Slate Markdown 片段
 */
export const handleSlateMarkdownFragment = (
  editor: Editor,
  clipboardData: DataTransfer,
  currentTextSelection: BaseSelection,
) => {
  try {
    const encoded = clipboardData.getData('application/x-slate-md-fragment');
    const raw = JSON.parse(encoded || '[]');
    const parsed = (Array.isArray(raw) ? raw : []).filter(isValidSlateNode);
    const fragment = parsed.map((node: Node) => {
      if (Element.isElement(node) && node.type === 'card') {
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
      (fragment[0] as any)?.type === 'paragraph' &&
      currentTextSelection
    ) {
      // 单段落用 insertFragment(children) 保留 marks（bold / italic / mark / 颜色等），
      // 旧版本走 insertText 会丢全部叶子样式。
      const children = (fragment[0] as any)?.children;
      if (Array.isArray(children) && children.length) {
        Transforms.insertFragment(editor, children);
        return true;
      }
      return true;
    }

    if (fragment.length === 0) return true;
    EditorUtils.replaceSelectedNode(editor, fragment);
    return true;
  } catch (error) {
    console.error('[handlePaste] 处理 Slate fragment 粘贴失败:', error);
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
    // getData 是同步方法，返回 string，不需要 await
    const html = clipboardData.getData('text/html');
    const rtf = clipboardData.getData('text/rtf');

    if (html) {
      return await insertParsedHtmlNodes(editor, html, editorProps, rtf);
    }
    return false;
  } catch (error) {
    console.error('[handlePaste] 处理 HTML 粘贴失败:', error);
    return false;
  }
};

/** 根据 File.type / 文件名后缀判断目标节点类型 */
const detectFileMediaType = (
  file: File,
): 'image' | 'video' | 'audio' | 'attachment' => {
  const mime = (file.type || '').toLowerCase();
  if (mime.startsWith('image/')) return 'image';
  if (mime.startsWith('video/')) return 'video';
  if (mime.startsWith('audio/')) return 'audio';
  // 退到扩展名兜底（部分操作系统拷贝的 File.type 为空）
  const ext = (file.name || '').toLowerCase().match(/\.([a-z0-9]+)$/)?.[1];
  if (!ext) return 'attachment';
  if (MEDIA_EXTENSIONS.image.some((e) => e === '.' + ext)) return 'image';
  if (MEDIA_EXTENSIONS.video.some((e) => e === '.' + ext)) return 'video';
  if (MEDIA_EXTENSIONS.audio.some((e) => e === '.' + ext)) return 'audio';
  return 'attachment';
};

const buildAttachNode = (
  url: string,
  file: File,
): {
  type: 'attach';
  name: string;
  size: number;
  url: string;
  children: { text: string }[];
} => ({
  type: 'attach',
  name: file.name,
  size: file.size,
  url,
  children: [{ text: '' }],
});

/**
 * 处理粘贴的文件。按 mime / 扩展名分流到 image/video/audio/attach；
 * 多文件一次性批量上传，避免拆成 N 次单文件请求。
 */
export const handleFilesPaste = async (
  editor: Editor,
  clipboardData: DataTransfer,
  editorProps: MarkdownEditorProps,
) => {
  try {
    const fileList = clipboardData.files;
    if (fileList.length === 0 || !editorProps.image?.upload) {
      return false;
    }

    const files = Array.from(fileList);
    // 一次批量上传；上传函数本身就接受 File[]
    const uploadResult = await editorProps.image.upload(files);
    const uploadedUrls = (
      Array.isArray(uploadResult) ? uploadResult : [uploadResult]
    ).filter((u): u is string => typeof u === 'string' && !!u);

    if (uploadedUrls.length === 0) return false;

    const focusPath = editor?.selection?.focus?.path;
    const parentNode = focusPath
      ? Node.get(editor, Path.parent(focusPath)!)
      : null;

    const insertAt = focusPath
      ? EditorUtils.findNext(editor, focusPath)!
      : undefined;

    uploadedUrls.forEach((uploadedUrl, idx) => {
      const file = files[idx] || files[0];
      const mediaType = detectFileMediaType(file);
      const node =
        mediaType === 'attachment'
          ? buildAttachNode(uploadedUrl, file)
          : EditorUtils.createMediaNode(uploadedUrl, mediaType);
      Transforms.insertNodes(editor, node as any, {
        at: [
          ...(parentNode && parentNode.type === 'table-cell'
            ? focusPath!
            : insertAt
              ? insertAt
              : [editor.children.length - 1]),
        ],
      });
    });
    return true;
  } catch (error) {
    console.error('[handlePaste] 文件粘贴上传失败:', error);
    return false;
  }
};

/**
 * 处理特殊文本格式（media:// 和 attach:// 链接）
 */
export const handleSpecialTextPaste = (
  editor: Editor,
  text: string,
  selection: BaseSelection,
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
        Editor.withoutNormalizing(editor, () => {
          Transforms.insertNodes(
            editor,
            EditorUtils.createMediaNode(url!, 'image'),
            { select: true, at: path },
          );
          const next = Editor.next(editor, { at: path });
          if (next && next[0].type === 'paragraph' && !Node.string(next[0])) {
            Transforms.delete(editor, { at: selection! });
          }
        });
        return true;
      }
      if (text.startsWith('attach://')) {
        Editor.withoutNormalizing(editor, () => {
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
        });
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
  selection: BaseSelection,
  store: Pick<EditorStore, 'insertLink'>,
) => {
  if (!text.startsWith('http')) return false;

  const mediaType = getMediaType(text);

  if (['image', 'video', 'audio'].includes(mediaType)) {
    if (isValidMediaUrl(text, mediaType)) {
      const path = EditorUtils.findMediaInsertPath(editor);
      if (!path) return false;
      Transforms.insertNodes(
        editor,
        EditorUtils.createMediaNode(text, 'image'),
        {
          select: true,
          at: selection ?? undefined,
        },
      );
      return true;
    }
  }

  store.insertLink(text);
  return true;
};

/**
 * 处理普通文本粘贴
 */
export const handlePlainTextPaste = async (
  editor: Editor,
  text: string,
  selection: BaseSelection,
  plugins: MarkdownEditorPlugin[],
  allowedTypes?: string[],
  options?: { parseMarkdownInPlainText?: boolean },
) => {
  // parseMarkdownInPlainText 默认 true，保留旧行为；显式关掉时走原样插入
  const parseMd = options?.parseMarkdownInPlainText !== false;
  if (parseMd && isMarkdown(text)) {
    await parseMarkdownToNodesAndInsert(editor, text, plugins);
    return true;
  }
  // 仅当 allowedTypes 允许 text/html 时才走 HTML 解析，
  // 避免绕过调用方对 pasteConfig.allowedTypes 的限制
  const htmlAllowed = !allowedTypes || allowedTypes.includes('text/html');
  if (parseMd && htmlAllowed && isHtml(text)) {
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
export const shouldInsertTextDirectly = (
  editor: Editor,
  selection: BaseSelection,
) => {
  if (!selection?.focus) return false;

  const rangeNodes = Editor?.node(editor, [selection.focus.path.at(0)!]);
  if (!rangeNodes) return false;

  const rangeNode = rangeNodes.at(0) as Elements;
  return (DIRECT_INSERT_NODE_TYPES as readonly string[]).includes(
    rangeNode.type,
  );
};

/**
 * 处理标签节点的粘贴
 */
export const handleTagNodePaste = (
  editor: Editor,
  currentTextSelection: Range,
  clipboardData: DataTransfer,
  curNode: Node & { tag?: boolean | null },
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
