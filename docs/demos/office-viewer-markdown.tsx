import {
  createRendererCodeBlockPlugin,
  getDefaultWasmUrl,
  MarkdownRenderer,
  OfficeViewer,
} from '@ant-design/agentic-ui';
import {
  DownloadOutlined,
  FileExcelOutlined,
  FilePptOutlined,
  FileWordOutlined,
  ZoomInOutlined,
} from '@ant-design/icons';
import {
  Alert,
  Button,
  Card,
  Descriptions,
  Modal,
  Segmented,
  Space,
  Tag,
  Typography,
} from 'antd';
import React, { useCallback, useEffect, useMemo, useState } from 'react';
import { OFFICE_SAMPLES } from './office-viewer-samples';

type OfficeKind = 'docx' | 'xlsx' | 'pptx';

interface OfficeFileItem {
  /** 文件名（含扩展名，用于类型识别与兜底标题） */
  name: string;
  /** 卡片展示标题（可选） */
  title?: string;
  /** 文件地址 */
  url: string;
}

type DemoView = 'render' | 'source';

const KIND_LABEL: Record<OfficeKind, string> = {
  docx: 'Word 文档',
  xlsx: 'Excel 表格',
  pptx: 'PowerPoint 演示',
};

const OFFICE_MARKDOWN = `## 本周产出文档

智能体已整理好本次评审材料，**点击卡片**即可在线预览：

- Word / Excel 渲染为紧凑文件卡片，点击打开详情
- PPTX 卡片内直接渲染 **幻灯片缩略图列表**，点击任意一页查看详情

\`\`\`agentic-ui-office
{
  "files": [
    {
      "name": "项目立项说明书.docx",
      "title": "项目立项说明书",
      "url": "${OFFICE_SAMPLES.docx.url}"
    },
    {
      "name": "预算明细表.xlsx",
      "title": "预算明细表",
      "url": "${OFFICE_SAMPLES.xlsx.url}"
    },
    {
      "name": "评审汇报.pptx",
      "title": "评审汇报",
      "url": "${OFFICE_SAMPLES.pptx.url}"
    }
  ]
}
\`\`\`
`;

const KIND_META: Record<
  OfficeKind,
  { icon: React.ReactNode; color: string; label: string }
> = {
  docx: { icon: <FileWordOutlined />, color: '#2b7cd3', label: 'Word' },
  xlsx: { icon: <FileExcelOutlined />, color: '#1e7145', label: 'Excel' },
  pptx: { icon: <FilePptOutlined />, color: '#d24726', label: 'PPT' },
};

/** 解析 agentic-ui-office 代码块 JSON；格式非法或缺 files 时返回空数组 */
const parseOfficeFiles = (code: string): OfficeFileItem[] => {
  try {
    const parsed = JSON.parse(code) as { files?: OfficeFileItem[] };
    return (parsed.files ?? []).filter((item) => !!item?.url);
  } catch {
    return [];
  }
};

/** 按 name / url 中的扩展名推断格式；无法识别时返回 null */
const inferKind = (item: OfficeFileItem): OfficeKind | null => {
  const source = `${item.name || ''}${item.url || ''}`.toLowerCase();
  if (source.includes('.docx')) return 'docx';
  if (source.includes('.xlsx')) return 'xlsx';
  if (source.includes('.pptx')) return 'pptx';
  return null;
};

/** Word / Excel：紧凑文件卡片，点击打开轻量详情 */
const SimpleFileCard: React.FC<{
  item: OfficeFileItem;
  onPreview: (item: OfficeFileItem) => void;
}> = ({ item, onPreview }) => {
  const kind = inferKind(item) ?? 'docx';
  const meta = KIND_META[kind];
  return (
    <Card
      hoverable
      size="small"
      styles={{ body: { display: 'flex', alignItems: 'center', gap: 12 } }}
      onClick={() => onPreview(item)}
    >
      <span
        style={{
          width: 44,
          height: 44,
          borderRadius: 10,
          background: `${meta.color}1a`,
          color: meta.color,
          fontSize: 24,
          display: 'flex',
          alignItems: 'center',
          justifyContent: 'center',
          flexShrink: 0,
        }}
      >
        {meta.icon}
      </span>
      <div style={{ flex: 1, minWidth: 0 }}>
        <div
          style={{
            fontWeight: 600,
            overflow: 'hidden',
            textOverflow: 'ellipsis',
            whiteSpace: 'nowrap',
          }}
        >
          {item.title || item.name}
        </div>
        <div style={{ color: '#999', fontSize: 12, marginTop: 2 }}>
          {meta.label} · 点击查看详情
        </div>
      </div>
    </Card>
  );
};

interface SlideThumb {
  index: number;
  dataUrl?: string;
}

/** 缩略图尺寸与 DPR 常量（2x 保证 retina 清晰度） */
const THUMB_WIDTH = 160;
const THUMB_DPR = 2;
/** 加载完成前的兜底宽高比 */
const DEFAULT_SLIDE_RATIO = 16 / 9;

/**
 * PPTX：卡片内渲染幻灯片缩略图列表
 *
 * 用 PptxPresentation 逐页离屏渲染为 dataUrl（不渲染文档正文），
 * 点击任意一页 / 「查看详情」回调 onPreview 打开详情
 */
const PptxSlideListCard: React.FC<{
  item: OfficeFileItem;
  onPreview: (item: OfficeFileItem) => void;
}> = ({ item, onPreview }) => {
  const [thumbs, setThumbs] = useState<SlideThumb[]>([]);
  const [slideRatio, setSlideRatio] = useState(DEFAULT_SLIDE_RATIO);
  const [failed, setFailed] = useState(false);

  useEffect(() => {
    let cancelled = false;
    // presentation 供循环渲染缩略图使用，cleanup 时统一释放
    let presentation: { destroy: () => void } | null = null;

    const run = async () => {
      setThumbs([]);
      setFailed(false);
      setSlideRatio(DEFAULT_SLIDE_RATIO);
      try {
        const { PptxPresentation } = await import('@silurus/ooxml/pptx');
        const pres = await PptxPresentation.load(item.url, {
          wasmUrl: getDefaultWasmUrl('pptx'),
        });
        if (cancelled) {
          pres.destroy();
          return;
        }
        presentation = pres;
        setSlideRatio(pres.slideWidth / Math.max(1, pres.slideHeight));
        setThumbs(
          Array.from({ length: pres.slideCount }, (_, index) => ({ index })),
        );

        for (let index = 0; index < pres.slideCount; index++) {
          if (cancelled) return;
          const canvas = document.createElement('canvas');
          canvas.width = THUMB_WIDTH * THUMB_DPR;
          canvas.height = Math.round(
            (THUMB_WIDTH * THUMB_DPR * pres.slideHeight) /
              Math.max(1, pres.slideWidth),
          );
          await pres.renderSlide(canvas, index, {
            width: THUMB_WIDTH * THUMB_DPR,
          });
          if (cancelled) return;
          const dataUrl = canvas.toDataURL();
          setThumbs((prev) =>
            prev.map((thumb) =>
              thumb.index === index ? { ...thumb, dataUrl } : thumb,
            ),
          );
        }
      } catch {
        if (!cancelled) setFailed(true);
      }
    };

    void run();
    return () => {
      cancelled = true;
      presentation?.destroy();
    };
  }, [item.url]);

  const meta = KIND_META.pptx;

  return (
    <Card
      size="small"
      style={{ gridColumn: '1 / -1' }}
      title={
        <span style={{ display: 'inline-flex', alignItems: 'center', gap: 8 }}>
          <span style={{ color: meta.color, fontSize: 18 }}>{meta.icon}</span>
          {item.title || item.name}
          {thumbs.length > 0 && <Tag>{thumbs.length} 页</Tag>}
        </span>
      }
      extra={
        <Button
          type="link"
          size="small"
          icon={<ZoomInOutlined />}
          onClick={() => onPreview(item)}
        >
          查看详情
        </Button>
      }
    >
      {failed ? (
        <div style={{ color: '#999' }}>
          幻灯片加载失败：请确认已安装 @silurus/ooxml
        </div>
      ) : (
        <div style={{ display: 'flex', gap: 12, overflowX: 'auto' }}>
          {thumbs.map((thumb) => (
            <div
              key={thumb.index}
              onClick={() => onPreview(item)}
              style={{
                position: 'relative',
                flexShrink: 0,
                width: THUMB_WIDTH,
                aspectRatio: String(slideRatio),
                borderRadius: 8,
                overflow: 'hidden',
                border: '1px solid #f0f0f0',
                background: '#fafafa',
                cursor: 'pointer',
              }}
            >
              {thumb.dataUrl ? (
                <img
                  src={thumb.dataUrl}
                  alt={`第 ${thumb.index + 1} 页`}
                  style={{
                    display: 'block',
                    width: '100%',
                    height: '100%',
                    objectFit: 'contain',
                  }}
                />
              ) : (
                <div
                  style={{
                    position: 'absolute',
                    inset: 0,
                    display: 'flex',
                    alignItems: 'center',
                    justifyContent: 'center',
                    color: '#bbb',
                    fontSize: 12,
                  }}
                >
                  加载中…
                </div>
              )}
              <span
                style={{
                  position: 'absolute',
                  left: 6,
                  bottom: 6,
                  padding: '0 6px',
                  borderRadius: 4,
                  background: 'rgba(0, 0, 0, 0.45)',
                  color: '#fff',
                  fontSize: 12,
                  lineHeight: '18px',
                }}
              >
                第 {thumb.index + 1} 页 · 点击查看详情
              </span>
            </div>
          ))}
        </div>
      )}
    </Card>
  );
};

/**
 * agentic-ui-office 代码块 → Office 卡片列表
 *
 * Word / Excel 渲染为 SimpleFileCard；PPTX 渲染为 PptxSlideListCard（占满整行）
 */
const OfficeFileList: React.FC<{
  code: string;
  onPreview: (item: OfficeFileItem) => void;
}> = ({ code, onPreview }) => {
  const files = useMemo(() => parseOfficeFiles(code), [code]);

  if (!files.length) {
    return (
      <pre>agentic-ui-office：JSON 解析失败，需提供 {'{ files: [...] }'}</pre>
    );
  }

  const pptxFiles = files.filter((item) => inferKind(item) === 'pptx');
  const plainFiles = files.filter((item) => inferKind(item) !== 'pptx');

  return (
    <div
      style={{
        display: 'grid',
        gridTemplateColumns: 'repeat(auto-fill, minmax(240px, 1fr))',
        gap: 12,
        margin: '12px 0',
      }}
    >
      {plainFiles.map((item) => (
        <SimpleFileCard key={item.url} item={item} onPreview={onPreview} />
      ))}
      {pptxFiles.map((item) => (
        <PptxSlideListCard key={item.url} item={item} onPreview={onPreview} />
      ))}
    </div>
  );
};

/**
 * Markdown 中渲染 Office 卡片 demo
 *
 * - 经 createRendererCodeBlockPlugin 注册 `agentic-ui-office` 代码块渲染器
 * - Word / Excel 渲染为文件卡片；PPTX 卡片内展示幻灯片缩略图列表
 * - 点击卡片先弹轻量详情（文件信息 + 下载），再点「完整预览」进入 OfficeViewer
 */
const OfficeViewerMarkdownDemo: React.FC = () => {
  const [view, setView] = useState<DemoView>('render');
  const [preview, setPreview] = useState<OfficeFileItem | null>(null);
  const [showFullPreview, setShowFullPreview] = useState(false);

  const openPreview = useCallback((item: OfficeFileItem) => {
    setPreview(item);
    setShowFullPreview(false);
  }, []);

  const plugins = useMemo(
    () => [
      createRendererCodeBlockPlugin({
        'agentic-ui-office': ({ code }) => (
          <OfficeFileList code={code} onPreview={openPreview} />
        ),
      }),
    ],
    [openPreview],
  );

  const previewKind = preview ? inferKind(preview) : null;

  return (
    <div>
      <Alert
        type="info"
        showIcon
        style={{ marginBottom: 12 }}
        message="Markdown 内渲染 Office 卡片"
        description="通过 createRendererCodeBlockPlugin 注册 `agentic-ui-office` 代码块渲染器：Word / Excel 渲染为文件卡片，PPTX 卡片内展示幻灯片缩略图列表；点击卡片先展示轻量详情，再点「完整预览」进入 OfficeViewer（需安装 optional peer @silurus/ooxml）。"
      />
      <Segmented
        style={{ marginBottom: 12 }}
        value={view}
        options={[
          { label: '渲染效果', value: 'render' },
          { label: 'Markdown 源码', value: 'source' },
        ]}
        onChange={(value) => setView(value as DemoView)}
      />
      {view === 'render' ? (
        <div
          style={{
            border: '1px dashed #d9d9d9',
            borderRadius: 8,
            padding: 16,
            background: '#fafafa',
          }}
        >
          <MarkdownRenderer content={OFFICE_MARKDOWN} plugins={plugins} />
        </div>
      ) : (
        <pre
          style={{
            margin: 0,
            padding: 16,
            maxHeight: 420,
            overflow: 'auto',
            background: '#1f1f1f',
            color: '#e6e6e6',
            borderRadius: 8,
            fontSize: 12,
            lineHeight: 1.6,
            whiteSpace: 'pre-wrap',
            wordBreak: 'break-word',
          }}
        >
          {OFFICE_MARKDOWN}
        </pre>
      )}

      <Modal
        open={!!preview}
        title={preview?.title || preview?.name}
        footer={null}
        centered
        width={showFullPreview ? 'min(1080px, 94vw)' : 520}
        destroyOnHidden
        onCancel={() => {
          setPreview(null);
          setShowFullPreview(false);
        }}
      >
        {preview &&
          (showFullPreview ? (
            <OfficeViewer
              key={preview.url}
              file={preview.url}
              fileName={preview.name}
              fileType={previewKind ?? undefined}
              height="70vh"
            />
          ) : (
            <div>
              <div
                style={{
                  display: 'flex',
                  alignItems: 'center',
                  gap: 12,
                  marginBottom: 16,
                }}
              >
                <span
                  style={{
                    width: 48,
                    height: 48,
                    borderRadius: 10,
                    background: `${(previewKind ? KIND_META[previewKind] : KIND_META.docx).color}1a`,
                    color: (previewKind
                      ? KIND_META[previewKind]
                      : KIND_META.docx
                    ).color,
                    fontSize: 26,
                    display: 'flex',
                    alignItems: 'center',
                    justifyContent: 'center',
                    flexShrink: 0,
                  }}
                >
                  {(previewKind ? KIND_META[previewKind] : KIND_META.docx).icon}
                </span>
                <Typography.Title level={5} style={{ margin: 0 }}>
                  {preview.title || preview.name}
                </Typography.Title>
              </div>
              <Descriptions
                column={1}
                size="small"
                style={{ marginBottom: 20 }}
                items={[
                  { key: 'name', label: '文件名', children: preview.name },
                  {
                    key: 'kind',
                    label: '类型',
                    children: previewKind
                      ? KIND_LABEL[previewKind]
                      : '未知（缺少扩展名）',
                  },
                  { key: 'url', label: '来源', children: preview.url },
                ]}
              />
              <Space style={{ display: 'flex', justifyContent: 'flex-end' }}>
                <Button onClick={() => window.open(preview.url)}>
                  <DownloadOutlined /> 下载
                </Button>
                <Button
                  type="primary"
                  icon={<ZoomInOutlined />}
                  onClick={() => setShowFullPreview(true)}
                >
                  完整预览
                </Button>
              </Space>
            </div>
          ))}
      </Modal>
    </div>
  );
};

export default OfficeViewerMarkdownDemo;
