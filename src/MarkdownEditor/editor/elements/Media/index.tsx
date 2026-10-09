import { DeleteFilled } from '@ant-design/icons';
import { Modal, Popover } from 'antd';
import React, { useContext, useEffect, useRef, useState } from 'react';
import { Editor, Node, Transforms } from 'slate';
import { ReactEditor } from 'slate-react';
import { ActionIconBox } from '../../../../Components/ActionIconBox';
import { useRefFunction } from '../../../../Hooks/useRefFunction';
import { I18nContext } from '../../../../I18n';
import { shouldRenderUrlAsPlainText } from '../../../../Utils/htmlUrlSafety';
import { ElementProps, MediaNode } from '../../../el';
import { useElementSelected } from '../../../hooks/editor';
import { deleteMediaAtPath } from '../../plugins/cardPluginBehavior';
import { useEditorStore } from '../../store';
import { MediaContent, resolveMediaType } from './MediaContent';

export { ResizeImage } from '../Image';

const popoverStyles = { body: { padding: 8 }, content: { padding: 8 } };

export const Media = React.memo(function Media({
  element,
  attributes,
  children,
}: ElementProps<MediaNode>) {
  const { markdownEditorRef, readonly } = useEditorStore();
  const selected = useElementSelected(element);
  const { locale } = useContext(I18nContext);
  const [toolbarOpen, setToolbarOpen] = useState(false);
  const mountedRef = useRef(true);
  useEffect(() => {
    mountedRef.current = true;
    return () => {
      mountedRef.current = false;
    };
  }, []);
  useEffect(() => {
    if (!selected || readonly) setToolbarOpen(false);
  }, [selected, readonly]);

  const getCurrentPath = useRefFunction(() => {
    if (!mountedRef.current) return;
    const editor = markdownEditorRef.current;
    if (!editor) return;
    try {
      const path = ReactEditor.findPath(editor, element);
      if (Node.get(editor, path) === element) return path;
    } catch {
      // A pending modal or resize can finish after this node was removed.
    }
  });

  const updateSize = useRefFunction(
    (size: { width: number | string; height: number | string }) => {
      if (readonly) return;
      const path = getCurrentPath();
      if (path)
        Transforms.setNodes(markdownEditorRef.current, size, { at: path });
    },
  );

  const removeMedia = useRefFunction(() => {
    if (readonly) return;
    const path = getCurrentPath();
    if (path) deleteMediaAtPath(markdownEditorRef.current, path);
  });

  const isPlayerControl = (target: EventTarget | null) =>
    target instanceof HTMLElement &&
    !!target.closest('video, audio, a, button, input, [role="button"]');

  const type = resolveMediaType(element);
  const unsafeUrl = !!element.url && shouldRenderUrlAsPlainText(element.url);

  return (
    <div
      {...attributes}
      data-be="media"
      data-drag-el={(!readonly && !unsafeUrl) || undefined}
      data-testid={unsafeUrl ? undefined : 'media-container'}
      data-selected={selected || undefined}
      style={{
        position: 'relative',
        display: 'flex',
        alignItems: 'flex-end',
        width: '100%',
        maxWidth: '100%',
        boxSizing: 'border-box',
        userSelect: 'none',
      }}
      draggable={false}
      onContextMenu={(event) => event.stopPropagation()}
      onMouseDown={(event) => {
        event.stopPropagation();
        if (readonly || isPlayerControl(event.target)) return;
        const path = getCurrentPath();
        if (!path) return;
        event.preventDefault();
        Transforms.select(
          markdownEditorRef.current,
          Editor.start(markdownEditorRef.current, path),
        );
        ReactEditor.focus(markdownEditorRef.current);
      }}
      onDragStart={(event) => {
        event.preventDefault();
        event.stopPropagation();
      }}
    >
      <Popover
        arrow={false}
        destroyOnHidden
        trigger={['hover', 'focus']}
        open={!readonly && !unsafeUrl && toolbarOpen}
        onOpenChange={(open) => setToolbarOpen(open)}
        styles={popoverStyles}
        content={
          <ActionIconBox
            data-testid="media-delete-button"
            title={locale?.delete || '删除'}
            type="danger"
            onClick={(event) => {
              event.stopPropagation();
              if (readonly) return;
              Modal.confirm({
                title: locale?.deleteMedia || '删除媒体',
                content: locale?.confirmDelete || '确定删除该媒体吗？',
                onOk: removeMedia,
              });
            }}
          >
            <DeleteFilled />
          </ActionIconBox>
        }
      >
        <div
          tabIndex={readonly ? -1 : 0}
          contentEditable={false}
          data-be="media-container"
          draggable={false}
          style={{ padding: 4, maxWidth: '100%', boxSizing: 'border-box' }}
          onClick={(event) => {
            if (isPlayerControl(event.target)) {
              event.stopPropagation();
              return;
            }
            if (!readonly) setToolbarOpen(true);
          }}
        >
          <MediaContent
            element={element}
            readonly={readonly}
            selected={(type === 'image' || type === 'other') && selected}
            onResizeStop={updateSize}
          />
          <div style={{ display: 'none' }}>{children}</div>
        </div>
      </Popover>
    </div>
  );
});
