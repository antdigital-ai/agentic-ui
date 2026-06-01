/**
 * title: 懒加载 PDF 跳转示例
 * description: 模拟 PDF 双栏展示，点击左侧段落跳转到右侧对应位置并强制加载内容
 */
import {
  BaseMarkdownEditor,
  MarkdownEditorInstance,
} from '@ant-design/agentic-ui';
import { Button, Card, Space, Spin } from 'antd';
import React, { useCallback, useEffect, useRef, useState } from 'react';

// 生成段落数据
const generateParagraphs = () => {
  const paragraphs = [];
  for (let i = 1; i <= 30; i++) {
    const id = `para-${i}`;
    paragraphs.push({
      id,
      title: `第 ${i} 段`,
      // 在标题中添加段落ID作为HTML属性
      content: `## 段落 ${i} {#${id}}\n\n这是第 ${i} 个段落的内容。包含一些**重要信息**和详细描述。\n\n> 这个段落可能包含引用、列表等多种元素。\n\n\`\`\`javascript\n// 段落 ${i} 的代码示例\nconst paragraphId = "${id}";\nconsole.log("当前段落:", paragraphId);\n\`\`\`\n\n- 要点 1\n- 要点 2\n- 要点 3\n\n`,
    });
  }
  return paragraphs;
};

// 自定义占位符组件（可以使用 hooks）
const CustomPlaceholder: React.FC<{
  paragraphId: string;
  paragraphIndex: number;
  height: number;
  isIntersecting: boolean;
  style: React.CSSProperties;
  onForceLoad?: (id: string) => void;
}> = ({
  paragraphId,
  paragraphIndex,
  height,
  isIntersecting,
  style,
  onForceLoad,
}) => {
  const placeholderRef = useRef<HTMLDivElement>(null);
  const [isLoading, setIsLoading] = useState(false);

  useEffect(() => {
    const handleForceLoad = (e: Event) => {
      const customEvent = e as CustomEvent;
      const targetId = customEvent.detail?.paragraphId;

      if (targetId === paragraphId) {
        console.log(`占位符 ${paragraphId} 收到强制加载事件`);
        setIsLoading(true);
        onForceLoad?.(paragraphId);

        // 模拟加载延迟
        setTimeout(() => {
          setIsLoading(false);
        }, 500);
      }
    };

    const element = placeholderRef.current;
    if (element) {
      element.addEventListener('forceLoad', handleForceLoad);
      return () => {
        element.removeEventListener('forceLoad', handleForceLoad);
      };
    }
  }, [paragraphId, onForceLoad]);
  return (
    <div
      ref={placeholderRef}
      style={{
        ...style,
        height,
        minHeight: height,
        border: '2px dashed #d9d9d9',
        borderRadius: 8,
        backgroundColor: isLoading ? '#e6f7ff' : '#fafafa',
        display: 'flex',
        flexDirection: 'column',
        justifyContent: 'center',
        alignItems: 'center',
        transition: 'all 0.3s',
      }}
      data-content-id={paragraphId}
      data-placeholder="true"
      className="pml-item pml-placeholder"
    >
      {isLoading ? (
        <Spin tip="强制加载中...">
          <div style={{ minHeight: 48 }} aria-hidden />
        </Spin>
      ) : (
        <>
          <div
            style={{
              color: isIntersecting ? '#52c41a' : '#999',
              fontSize: '14px',
              marginBottom: 8,
            }}
          >
            {isIntersecting ? '🔄 正在加载...' : '💤 等待加载'}
          </div>
          <div style={{ color: '#bbb', fontSize: '12px' }}>
            段落 #{paragraphIndex + 1}
          </div>
          <div
            style={{
              color: '#ddd',
              fontSize: '11px',
              fontFamily: 'monospace',
              marginTop: 4,
            }}
          >
            ID: {paragraphId}
          </div>
        </>
      )}
    </div>
  );
};

export default () => {
  const paragraphs = generateParagraphs();
  const editorRef = useRef<MarkdownEditorInstance>(null);
  const containerRef = useRef<HTMLDivElement>(null);
  const [selectedId, setSelectedId] = useState<string | null>(null);
  const [loadedParagraphs, setLoadedParagraphs] = useState<Set<string>>(
    new Set(),
  );
  const [forceLoadKey] = useState(0);

  // 生成 Markdown 内容，每个段落都有唯一 ID
  const markdownContent = paragraphs.map((p) => p.content).join('\n---\n\n');

  // 追踪当前段落（使用 ref 在渲染过程中动态更新）
  const currentParagraphIdRef = useRef<string>('');
  const currentPlaceholderParagraphIdRef = useRef<string>('');

  // 存储每个段落的高度
  const [paragraphHeights] = useState(() => {
    const map = new Map<string, number>();
    paragraphs.forEach((p, index) => {
      // 模拟不同段落的高度
      const baseHeight = 200;
      const variance = (index % 3) * 50;
      map.set(p.id, baseHeight + variance);
    });
    return map;
  });

  // 处理强制加载回调
  const handleForceLoad = useCallback((id: string) => {
    console.log(`标记段落 ${id} 为已加载`);
    setLoadedParagraphs((prev) => new Set(prev).add(id));
  }, []);

  /**
   * 点击左侧段落，滚动到右侧对应位置并强制加载
   */
  const handleParagraphClick = useCallback((paragraphId: string) => {
    setSelectedId(paragraphId);

    // 查找目标元素（可能是占位符或实际内容）
    const targetElement = document.querySelector(
      `[data-content-id="${paragraphId}"]`,
    ) as HTMLElement;

    if (!targetElement) {
      console.warn(`未找到 ID 为 "${paragraphId}" 的段落`);
      return;
    }

    const isPlaceholder = targetElement.dataset.placeholder === 'true';

    // 如果是占位符，强制触发加载
    if (isPlaceholder) {
      console.log(`准备强制加载占位符: ${paragraphId}`);

      // 方案1: 等待滚动动画完成后触发自定义事件
      setTimeout(() => {
        const event = new CustomEvent('forceLoad', {
          bubbles: true,
          detail: { paragraphId },
        });
        targetElement.dispatchEvent(event);
      }, 600);
      targetElement.scrollIntoView({
        behavior: 'smooth',
        block: 'center',
      });
    } else {
      targetElement.scrollIntoView({
        behavior: 'smooth',
        block: 'center',
      });
    }
    setTimeout(() => {
      targetElement.scrollIntoView({
        behavior: 'smooth',
        block: 'center',
      });
    }, 600);
  }, []);

  return (
    <div style={{ display: 'flex', gap: 16, height: '80vh' }}>
      {/* 左侧：段落列表（模拟 PDF） */}
      <Card
        title="PDF 段落列表"
        style={{ width: 300, overflow: 'auto' }}
        styles={{ body: { padding: 8 } }}
      >
        <Space direction="vertical" style={{ width: '100%' }}>
          {paragraphs.map((para) => (
            <Button
              key={para.id}
              type={selectedId === para.id ? 'primary' : 'default'}
              block
              onClick={() => handleParagraphClick(para.id)}
              style={{
                textAlign: 'left',
                height: 'auto',
                padding: '8px 12px',
              }}
            >
              <div>
                <div style={{ fontWeight: 'bold' }}>{para.title}</div>
                <div
                  style={{
                    fontSize: 12,
                    color: selectedId === para.id ? '#fff' : '#999',
                    marginTop: 4,
                  }}
                >
                  ID: {para.id}
                  {loadedParagraphs.has(para.id) && (
                    <span style={{ marginLeft: 8 }}>✓ 已加载</span>
                  )}
                </div>
              </div>
            </Button>
          ))}
        </Space>
      </Card>

      {/* 右侧：懒加载编辑器 */}
      <Card
        title="文档内容（懒加载）"
        style={{ flex: 1, overflow: 'hidden' }}
        styles={{ body: { padding: 0, height: 'calc(100% - 57px)' } }}
      >
        <div
          ref={containerRef}
          style={{ height: '100%', overflow: 'auto', padding: 16 }}
        >
          <BaseMarkdownEditor
            key={`editor-${forceLoadKey}`}
            editorRef={editorRef}
            initValue={markdownContent}
            readonly
            lazy={{
              enable: true,
              // 使用测量的平均高度作为占位符高度
              placeholderHeight: (() => {
                if (paragraphHeights.size === 0) return 120;
                const totalHeight = Array.from(
                  paragraphHeights.values(),
                ).reduce((sum, h) => sum + h, 0);
                return Math.ceil(totalHeight / paragraphHeights.size);
              })(),
              rootMargin: '100px',
              // 自定义懒加载占位符渲染
              renderPlaceholder: (() => {
                const heightMap = paragraphHeights;

                return ({ height, style, isIntersecting, elementInfo }) => {
                  // 使用当前段落ID（会在 eleItemRender 中更新）
                  const paragraphId =
                    currentPlaceholderParagraphIdRef.current ||
                    `element-${elementInfo?.index || 0}`;
                  const realHeight = heightMap.get(paragraphId) || height;

                  return (
                    <CustomPlaceholder
                      key={`placeholder-${elementInfo?.index || 0}`}
                      paragraphId={paragraphId}
                      paragraphIndex={elementInfo?.index || 0}
                      height={realHeight}
                      isIntersecting={isIntersecting}
                      style={style}
                      onForceLoad={handleForceLoad}
                    />
                  );
                };
              })(),
            }}
            eleItemRender={(eleProps, defaultDom) => {
              // 跳过表格单元格和表格行
              if (
                eleProps.element.type === 'table-cell' ||
                eleProps.element.type === 'table-row'
              ) {
                return defaultDom;
              }

              // 如果是 heading，提取段落ID并更新当前段落
              if (eleProps.element.type === 'head') {
                const text =
                  (eleProps.element as any).children?.[0]?.text || '';
                const match = text.match(/段落 (\d+)/);
                if (match) {
                  const newParagraphId = `para-${match[1]}`;
                  currentParagraphIdRef.current = newParagraphId;
                  currentPlaceholderParagraphIdRef.current = newParagraphId;
                  console.log(`✅ 检测到标题，设置段落ID: ${newParagraphId}`);
                }
              }

              // 如果是分隔符，清空当前段落
              if (eleProps.element.type === 'thematic-break') {
                currentParagraphIdRef.current = '';
              }

              const paragraphId = currentParagraphIdRef.current;

              return (
                <div
                  data-content-id={paragraphId || undefined}
                  className="pml-item"
                  data-element-type={eleProps.element.type}
                >
                  {defaultDom}
                </div>
              );
            }}
            style={{
              border: 'none',
              minHeight: '100%',
            }}
          />
        </div>
      </Card>
    </div>
  );
};
