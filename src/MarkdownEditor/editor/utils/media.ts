import { Transforms } from 'slate';
import { ReactEditor } from 'slate-react';
import { IEditor } from '../../BaseMarkdownEditor';
import type { EditorStore } from '../store';
import { getMediaType } from './dom';

export const getRemoteMediaType = async (url: string) => {
  if (!url) return 'other';
  if (typeof url !== 'string') return 'other';
  if (url.startsWith('data:')) {
    const mimeMatch = url.match(/^data:([^/]+)\/[^;]+/);
    const mainType = mimeMatch?.[1]?.toLowerCase();
    if (mainType === 'image') return 'image';
    if (mainType === 'video') return 'video';
    if (mainType === 'audio') return 'audio';
    return 'other';
  }
  let timeout: ReturnType<typeof setTimeout> | undefined;
  try {
    const type = getMediaType(url);
    if (type !== 'other') return type;
    let contentType = '';
    const controller = new AbortController();
    // Start the deadline before the request. Aborting after HEAD has resolved
    // leaves a stalled server blocking the insert-media UI indefinitely.
    const deadline = new Promise<never>((_, reject) => {
      timeout = setTimeout(() => {
        controller.abort();
        reject(new Error('Media type request timed out'));
      }, 1000);
    });
    const res = await Promise.race([
      fetch(url, {
        method: 'HEAD',
        signal: controller.signal,
      }),
      deadline,
    ]);
    if (!res.ok) {
      throw new Error();
    }
    contentType = res.headers.get('content-type') || '';
    return contentType.split('/')[0].trim().toLowerCase();
  } catch (e) {
    return null;
  } finally {
    if (timeout !== undefined) clearTimeout(timeout);
  }
};

export const convertRemoteImages = async (
  node: IEditor,
  store: EditorStore,
) => {
  const schema = store?.editor?.children || [];
  if (schema) {
    const stack = schema.slice();
    while (stack.length) {
      const item = stack.pop()!;
      if (item.type === 'media') {
        if (item?.url?.startsWith('http')) {
          const ext = item?.url.match(/[\w_-]+\.(png|webp|jpg|jpeg|gif|svg)/i);
          if (ext) {
            try {
              Transforms.setNodes(
                store?.editor,
                {
                  url: item?.url,
                },
                { at: ReactEditor.findPath(store?.editor, item) },
              );
            } catch (e) {
              console.error(e);
            }
          }
        } else if (item?.url?.startsWith('data:')) {
          const dataUrlType = getMediaType(item?.url);
          if (
            dataUrlType === 'image' ||
            dataUrlType === 'video' ||
            dataUrlType === 'audio'
          ) {
            try {
              Transforms.setNodes(
                store?.editor,
                {
                  url: item?.url,
                },
                { at: ReactEditor.findPath(store?.editor, item) },
              );
            } catch (e) {}
          }
        }
      } else if (item?.children?.length) {
        stack.push(...(item?.children ?? []));
      }
    }
  }
};
