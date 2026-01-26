import {
  Bubble,
  type AttachmentFile,
  type BrowserItem,
  type MessageBubbleData,
  VisualList,
  type VisualListItem,
  Workspace,
} from '@ant-design/agentic-ui';
import type {
  FileNode,
  GroupNode,
} from '@ant-design/agentic-ui/Workspace/types';
import React, { useMemo, useRef } from 'react';

const HIGHLIGHT_ANIMATION_DURATION_MS = 1500;
const HIGHLIGHT_ANIMATION_ITERATIONS = 3;
const HIGHLIGHT_TOTAL_MS =
  HIGHLIGHT_ANIMATION_DURATION_MS * HIGHLIGHT_ANIMATION_ITERATIONS;
const MOCK_TIME = 1703123456789;

function getChatFileDomId(fileId: string) {
  return `chat-file-${fileId}`;
}

const CHAT_WEB_RESULTS_ANCHOR_ID = 'chat-web-results';

const createMockFile = (
  name: string,
  type: string,
  size: number,
  url: string,
): AttachmentFile => ({
  name,
  type,
  size,
  url,
  lastModified: MOCK_TIME,
  webkitRelativePath: '',
  arrayBuffer: () => Promise.resolve(new ArrayBuffer(0)),
  bytes: () => Promise.resolve(new Uint8Array(0)),
  text: () => Promise.resolve(''),
  stream: () => new ReadableStream(),
  slice: () => new Blob(),
});

function inferMimeTypeByName(name: string) {
  const ext = (name.split('.').pop() || '').toLowerCase();
  switch (ext) {
    case 'pdf':
      return 'application/pdf';
    case 'doc':
      return 'application/msword';
    case 'docx':
      return 'application/vnd.openxmlformats-officedocument.wordprocessingml.document';
    case 'png':
      return 'image/png';
    case 'jpg':
    case 'jpeg':
      return 'image/jpeg';
    case 'gif':
      return 'image/gif';
    case 'json':
      return 'application/json';
    case 'md':
      return 'text/markdown';
    case 'txt':
      return 'text/plain';
    default:
      return 'application/octet-stream';
  }
}

const WEB_AVATAR_SRC_LIST: string[] = [
  'https://avatars.githubusercontent.com/u/507615?s=40&v=4',
  'https://avatars.githubusercontent.com/u/49217418?s=40&v=4',
  'https://avatars.githubusercontent.com/u/27722486?s=40&v=4',
  'https://avatars.githubusercontent.com/u/5378891?s=40&v=4',
  'https://avatars.githubusercontent.com/u/3580607?s=40&v=4',
  'https://avatars.githubusercontent.com/u/13595509?s=40&v=4',
  'https://avatars.githubusercontent.com/u/49827327?s=40&v=4',
  'https://avatars.githubusercontent.com/u/465125?s=40&v=4',
  'https://avatars.githubusercontent.com/u/29775873?s=40&v=4',
  'https://avatars.githubusercontent.com/u/8358236?s=40&v=4',
];

const WorkspaceFileLocateDemo: React.FC = () => {
  const bubbleRef = useRef<any>();
  const deps: any[] = [];
  const highlightTimersRef = useRef<Record<string, number>>({});

  const nodes = useMemo<(FileNode | GroupNode)[]>(
    () => [
      {
        id: 'group-doc',
        name: '文档',
        type: 'word',
        collapsed: false,
        children: [
          {
            id: 'file-1',
            name: '项目需求文档.docx',
            size: '2.3MB',
            lastModified: '12:30',
            canLocate: true,
          },
          {
            id: 'file-2',
            name: '会议纪要.docx',
            size: '1.1MB',
            lastModified: '10:12',
            canLocate: true,
          },
        ],
      },
      {
        id: 'group-pdf',
        name: 'PDF',
        type: 'pdf',
        collapsed: false,
        children: [
          {
            id: 'file-3',
            name: '产品说明书.pdf',
            size: '3.2MB',
            lastModified: '11:20',
            canLocate: true,
          },
        ],
      },
    ],
    [],
  );

  const flatFiles = useMemo(() => {
    return nodes.flatMap((n) =>
      'children' in n ? n.children : ([n] as FileNode[]),
    );
  }, [nodes]);

  const fileMetaMap = useMemo(() => {
    const map = new Map<
      string,
      {
        name: string;
        size?: string | number;
        lastModified?: string | number | Date;
      }
    >();
    flatFiles.forEach((f) => {
      if (f.id) {
        map.set(String(f.id), {
          name: String(f.name),
          size: f.size,
          lastModified: f.lastModified,
        });
      }
    });
    return map;
  }, [flatFiles]);

  const chatItems = useMemo(
    () => [
      { id: 'm1', role: 'assistant', text: '我已经整理了需要的材料。' },
      {
        id: 'm2',
        role: 'assistant',
        text: '这里是需求文档，后续实现会按这个来。',
        fileId: 'file-1',
      },
      { id: 'm3', role: 'user', text: '好的，麻烦把关键点再列一下。' },
      {
        id: 'm4',
        role: 'assistant',
        text: '我补充了会议纪要，包含决策与待办。',
        fileId: 'file-2',
      },
      {
        id: 'm5',
        role: 'assistant',
        text: '产品说明书也在这里，便于查阅细节。',
        fileId: 'file-3',
      },
      { id: 'm6', role: 'user', text: '收到。' },
    ],
    [],
  );

  const handleReply = (content: string) => {
    // demo：这里只做示意，不做真实回复逻辑
    console.log('reply:', content);
  };

  const triggerHighlight = (el: HTMLElement | null, highlightClass: string) => {
    if (!el) return;
    el.classList.remove(highlightClass);
    // eslint-disable-next-line @typescript-eslint/no-unused-expressions
    el.offsetWidth; // 强制 reflow 以重启动画
    el.classList.add(highlightClass);

    const timerKey = `${highlightClass}::${el.id}`;
    const prevTimer = highlightTimersRef.current[timerKey];
    if (prevTimer) window.clearTimeout(prevTimer);
    highlightTimersRef.current[timerKey] = window.setTimeout(() => {
      el.classList.remove(highlightClass);
      delete highlightTimersRef.current[timerKey];
    }, HIGHLIGHT_TOTAL_MS);
  };

  const handleLocateFile = (file: FileNode) => {
    const fileId = String(file.id || '');
    if (!fileId) return;

    // 滚动定位到对话流中该文件出现的位置（容器内滚动）
    const el = document.getElementById(getChatFileDomId(fileId));
    el?.scrollIntoView?.({ behavior: 'smooth', block: 'center' });

    triggerHighlight(el, 'workspace-file-locate-chat-file--highlight');
  };

  const handleLocateWeb = (item: BrowserItem) => {
    // 网页定位：效果参考脚注示例，定位到“网页聚合视图（VisualList）”
    const el = document.getElementById(CHAT_WEB_RESULTS_ANCHOR_ID);
    el?.scrollIntoView?.({ behavior: 'smooth', block: 'center' });
    triggerHighlight(el, 'workspace-browser-locate-web-list--highlight');
  };

  const browserSuggestions = useMemo(
    () => [
      { id: 's1', label: '搜索产品说明书与关键参数', count: 5 },
      { id: 's2', label: '搜索会议纪要相关的背景资料', count: 5 },
    ],
    [],
  );

  const browserResultsMap: Record<string, BrowserItem[]> = useMemo(
    () => ({
      s1: [
        {
          id: 'w-1',
          title: '产品说明书（PDF）下载与预览',
          site: 'docs.example.com',
          url: 'https://docs.example.com/product-manual',
          canLocate: true,
        },
        {
          id: 'w-2',
          title: '关键参数速查表（2026）',
          site: 'kb.example.com',
          url: 'https://kb.example.com/params',
          canLocate: true,
        },
        {
          id: 'w-3',
          title: '兼容性与约束说明',
          site: 'support.example.com',
          url: 'https://support.example.com/compat',
          canLocate: true,
        },
        {
          id: 'w-7',
          title: 'PDF 阅读与标注最佳实践',
          site: 'guide.example.com',
          url: 'https://guide.example.com/pdf-reading',
          canLocate: true,
        },
        {
          id: 'w-8',
          title: '产品参数 FAQ（常见问题）',
          site: 'faq.example.com',
          url: 'https://faq.example.com/params',
          canLocate: true,
        },
      ],
      s2: [
        {
          id: 'w-4',
          title: '会议纪要模板与最佳实践',
          site: 'wiki.example.com',
          url: 'https://wiki.example.com/meeting-notes',
          canLocate: true,
        },
        {
          id: 'w-5',
          title: '需求评审 Checklist',
          site: 'process.example.com',
          url: 'https://process.example.com/review-checklist',
          canLocate: true,
        },
        {
          id: 'w-6',
          title: '风险登记与跟踪方法',
          site: 'pm.example.com',
          url: 'https://pm.example.com/risk',
          canLocate: true,
        },
        {
          id: 'w-9',
          title: '会议纪要：行动项如何写得可执行',
          site: 'writing.example.com',
          url: 'https://writing.example.com/action-items',
          canLocate: true,
        },
        {
          id: 'w-10',
          title: '评审会议主持与节奏控制',
          site: 'facilitation.example.com',
          url: 'https://facilitation.example.com/review',
          canLocate: true,
        },
      ],
    }),
    [],
  );

  const allWebItems = useMemo(() => {
    return Object.values(browserResultsMap).flat();
  }, [browserResultsMap]);

  const webVisualItems: VisualListItem[] = useMemo(() => {
    return allWebItems.slice(0, 10).map((w, index) => ({
      id: String(w.id),
      src: WEB_AVATAR_SRC_LIST[index % WEB_AVATAR_SRC_LIST.length]!,
      title: w.title,
      href: w.url,
      alt: w.title,
    }));
  }, [allWebItems]);

  const browserRequest = (suggestion: { id: string }) => ({
    items: browserResultsMap[suggestion.id] || [],
    loading: false,
  });

  return (
    <div style={{ padding: 12 }}>
      <style>
        {`
@keyframes flash-shadow {
  0%, 100% {
    box-shadow: -5.23px -3.23px 12px 0 rgba(229, 255, 115, 40%),
      4.23px 5.23px 16px 0 rgba(0, 206, 255, 24.12%);
  }

  50% {
    box-shadow: none;
  }
}

.workspace-file-locate-chat-file {
  border-radius: 12px;
}

.workspace-file-locate-chat-file--highlight {
}

/* 仅高亮 Bubble 内部的“文件卡片”区域（FileMapViewItem / Image） */
.workspace-file-locate-chat-file--highlight .ant-agentic-md-editor-file-view-list-item,
.workspace-file-locate-chat-file--highlight .ant-agentic-md-editor-file-view-list-image {
  animation-name: flash-shadow;
  animation-duration: ${HIGHLIGHT_ANIMATION_DURATION_MS}ms;
  animation-timing-function: ease-in-out;
  animation-iteration-count: ${HIGHLIGHT_ANIMATION_ITERATIONS};
}

/* 网页卡片高亮：只高亮卡片本体 */
.workspace-browser-locate-web-list--highlight .visual-list-container {
  animation-name: flash-shadow;
  animation-duration: ${HIGHLIGHT_ANIMATION_DURATION_MS}ms;
  animation-timing-function: ease-in-out;
  animation-iteration-count: ${HIGHLIGHT_ANIMATION_ITERATIONS};
}
        `}
      </style>
      <div
        style={{
          display: 'flex',
          gap: 16,
          height: 600,
          maxHeight: 600,
        }}
      >
        {/* 左侧：对话 */}
        <div
          style={{
            flex: 1,
            minWidth: 0,
            border: '1px solid #f0f0f0',
            borderRadius: 8,
            background: '#fff',
            display: 'flex',
            flexDirection: 'column',
          }}
        >
          <div
            style={{
              padding: '12px 12px 8px',
              borderBottom: '1px solid #f0f0f0',
              fontWeight: 600,
            }}
          >
            对话
          </div>
          <div style={{ padding: 12, overflow: 'auto', flex: 1 }}>
            <div style={{ display: 'flex', flexDirection: 'column', gap: 12 }}>
              {chatItems.map((item, idx) => {
                const isUser = item.role === 'user';
                const hasFile = Boolean(item.fileId);

                const avatar = isUser
                  ? ({
                    avatar:
                      'https://gw.alipayobjects.com/zos/antfincdn/XAosXuNZyF/BiazfanxmamNRoxxVxka.png',
                    title: '开发者',
                    description: '前端工程师',
                  } as const)
                  : ({
                    avatar:
                      'https://mdn.alipayobjects.com/huamei_re70wt/afts/img/A*ed7ZTbwtgIQAAAAAQOAAAAgAemuEAQ/original',
                    title: 'Ant Design Assistant',
                    description: 'AI 助手',
                  } as const);

                const originData: MessageBubbleData = {
                  id: item.id,
                  role: isUser ? 'user' : 'assistant',
                  content: item.text,
                  createAt: MOCK_TIME - (chatItems.length - idx) * 8000,
                  updateAt: MOCK_TIME - (chatItems.length - idx) * 8000,
                  isFinished: true,
                  meta: avatar,
                };

                const fileMeta = item.fileId
                  ? fileMetaMap.get(String(item.fileId))
                  : undefined;
                const fileName = fileMeta?.name || '文件';

                return (
                  <div key={item.id}>
                    <Bubble
                      markdownRenderConfig={{
                        tableConfig: {
                          pure: true,
                        },
                      }}
                      avatar={originData.meta!}
                      placement={isUser ? 'right' : 'left'}
                      deps={deps}
                      bubbleRef={bubbleRef}
                      pure
                      originData={originData}
                      onReply={handleReply}
                    />

                    {hasFile && (
                      <div
                        style={{
                          display: 'flex',
                          justifyContent: isUser ? 'flex-end' : 'flex-start',
                          marginTop: 8,
                        }}
                      >
                        <div
                          id={getChatFileDomId(item.fileId!)}
                          className="workspace-file-locate-chat-file"
                          style={{ width: 'min(520px, 90%)' }}
                        >
                          <Bubble
                            avatar={avatar}
                            markdownRenderConfig={{
                              tableConfig: {
                                pure: true,
                              },
                            }}
                            placement={isUser ? 'right' : 'left'}
                            deps={deps}
                            bubbleRef={bubbleRef}
                            pure
                            originData={{
                              id: `${item.id}-file`,
                              role: isUser ? 'user' : 'assistant',
                              content: `这里是文件：${fileName}`,
                              createAt:
                                MOCK_TIME - (chatItems.length - idx) * 8000 + 1,
                              updateAt:
                                MOCK_TIME - (chatItems.length - idx) * 8000 + 1,
                              isFinished: true,
                              meta: avatar,
                              fileMap: new Map([
                                [
                                  fileName,
                                  createMockFile(
                                    fileName,
                                    inferMimeTypeByName(fileName),
                                    typeof fileMeta?.size === 'number'
                                      ? fileMeta.size
                                      : 1024 * 1024,
                                    fileName.toLowerCase().endsWith('.png') ||
                                      fileName.toLowerCase().endsWith('.jpg') ||
                                      fileName
                                        .toLowerCase()
                                        .endsWith('.jpeg')
                                      ? 'https://gw.alipayobjects.com/zos/antfincdn/XAosXuNZyF/BiazfanxmamNRoxxVxka.png'
                                      : `https://example.com/${encodeURIComponent(fileName)}`,
                                  ),
                                ],
                              ]),
                            }}
                          />
                        </div>
                      </div>
                    )}
                  </div>
                );
              })}

              {/* 网页结果（参考 footnote-demo 的卡片视觉风格） */}
              <div>
                <Bubble
                  markdownRenderConfig={{
                    tableConfig: {
                      pure: true,
                    },
                  }}
                  avatar={{
                    avatar:
                      'https://mdn.alipayobjects.com/huamei_re70wt/afts/img/A*ed7ZTbwtgIQAAAAAQOAAAAgAemuEAQ/original',
                    title: 'Ant Design Assistant',
                    description: 'AI 助手',
                  }}
                  placement="left"
                  deps={deps}
                  bubbleRef={bubbleRef}
                  pure
                  bubbleRenderConfig={{
                    afterMessageRender: (props) => {
                      if (props?.originData?.id !== 'm-web') return null;
                      return (
                        <div
                          id={CHAT_WEB_RESULTS_ANCHOR_ID}
                          style={{ padding: 16 }}
                        >
                          <VisualList
                            data={webVisualItems}
                            shape="circle"
                            description={`${webVisualItems.length} 个网页`}
                          />
                        </div>
                      );
                    },
                  }}
                  originData={{
                    id: 'm-web',
                    role: 'assistant',
                    content: '我在浏览器里整理了几条可参考的网页来源（可从右侧工作空间定位到这里）。',
                    createAt: MOCK_TIME + 1000,
                    updateAt: MOCK_TIME + 1000,
                    isFinished: true,
                    meta: {
                      avatar:
                        'https://mdn.alipayobjects.com/huamei_re70wt/afts/img/A*ed7ZTbwtgIQAAAAAQOAAAAgAemuEAQ/original',
                      title: 'Ant Design Assistant',
                      description: 'AI 助手',
                    },
                    extra: {
                      showWebRefs: true,
                    },
                  }}
                />
              </div>
            </div>
          </div>
        </div>

        {/* 右侧：工作空间 */}
        <div style={{ flex: 1, minWidth: 0 }}>
          <Workspace title="工作空间">
            <Workspace.Browser
              tab={{
                key: 'browser',
                title: '浏览器',
              }}
              suggestions={browserSuggestions}
              request={browserRequest}
              onLocate={handleLocateWeb}
            />
            <Workspace.File
              tab={{ count: 3 }}
              nodes={nodes}
              onLocate={handleLocateFile}
            />
          </Workspace>
        </div>
      </div>
    </div>
  );
};

export default WorkspaceFileLocateDemo;
