import type { AttachmentFile, MessageBubbleData } from '@ant-design/agentic-ui';
import { BubbleList } from '@ant-design/agentic-ui';
import { CheckCircleFilled } from '@ant-design/icons';
import { Image, message } from 'antd';
import React, { useState } from 'react';

const assistantMeta = {
  avatar:
    'https://mdn.alipayobjects.com/huamei_re70wt/afts/img/A*ed7ZTbwtgIQAAAAAQOAAAAgAemuEAQ/original',
  title: 'AI 助手',
};

const IMAGE_1 =
  'https://mdn.alipayobjects.com/huamei_ptjqan/afts/img/A*IsRPRJJps0cAAAAAAAAAAAAADkN6AQ/original';
const IMAGE_2 =
  'https://mdn.alipayobjects.com/huamei_ptjqan/afts/img/A*jThjRaPDP3kAAAAAAAAAAAAAekN6AQ/original';
const IMAGE_3 =
  'https://gw.alipayobjects.com/zos/antfincdn/XAosXuNZyF/BiazfanxmamNRoxxVxka.png';
const IMAGE_4 =
  'https://mdn.alipayobjects.com/huamei_ptjqan/afts/img/A*IsRPRJJps0cAAAAAAAAAAAAADkN6AQ/original';

// 消息正文里直接嵌入 agentic-ui-filemap 代码块
const MESSAGES: MessageBubbleData[] = [
  {
    id: '1',
    role: 'assistant',
    content: `以下是本次设计评审的相关截图，请选择需要归档的图片：

\`\`\`agentic-ui-filemap
{
  "fileList": [
    { "uuid": "img-1", "name": "首页设计稿.jpg",  "type": "image/jpeg", "url": "${IMAGE_1}", "previewUrl": "${IMAGE_1}" },
    { "uuid": "img-2", "name": "移动端适配.png",   "type": "image/png",  "url": "${IMAGE_2}", "previewUrl": "${IMAGE_2}" },
    { "uuid": "img-3", "name": "交互流程图.png",   "type": "image/png",  "url": "${IMAGE_3}", "previewUrl": "${IMAGE_3}" },
    { "uuid": "img-4", "name": "配色方案.jpg",    "type": "image/jpeg", "url": "${IMAGE_4}", "previewUrl": "${IMAGE_4}" }
  ]
}
\`\`\`

点击图片可放大预览，勾选后点击"归档"完成操作。`,
    createAt: Date.now() - 5000,
    updateAt: Date.now() - 5000,
    meta: assistantMeta,
    isFinished: true,
  },
];

export default () => {
  const [selected, setSelected] = useState<Set<string>>(new Set());
  const [previewSrc, setPreviewSrc] = useState<string | null>(null);

  const toggleSelect = (uuid: string) => {
    setSelected((prev) => {
      const next = new Set(prev);
      if (next.has(uuid)) {
        next.delete(uuid);
      } else {
        next.add(uuid);
      }
      return next;
    });
  };

  const handleArchive = () => {
    if (selected.size === 0) {
      message.warning('请先选择要归档的图片');
      return;
    }
    message.success(`已归档 ${selected.size} 张图片`);
    setSelected(new Set());
  };

  return (
    <div style={{ padding: 24, background: 'var(--main-bg-color, #f5f5f5)' }}>
      <BubbleList
        bubbleList={MESSAGES}
        assistantMeta={assistantMeta}
        pure
        markdownRenderConfig={{
          renderMode: 'markdown',
          fileMapConfig: {
            // 点击图片时自定义预览（不走 antd 内置灯箱）
            onPreview: (file: AttachmentFile) => {
              setPreviewSrc(file.previewUrl || file.url || null);
            },
            // itemRender：在每个图片缩略图上叠加「选择」勾选框
            itemRender: (file: AttachmentFile, defaultDom: React.ReactNode) => {
              const isSelected = selected.has(file.uuid || file.name);
              return (
                <div
                  key={file.uuid || file.name}
                  style={{ position: 'relative', display: 'inline-block' }}
                >
                  {defaultDom}
                  {/* 右上角勾选按钮 */}
                  <div
                    role="checkbox"
                    aria-checked={isSelected}
                    tabIndex={0}
                    onClick={(e) => {
                      e.stopPropagation();
                      toggleSelect(file.uuid || file.name);
                    }}
                    onKeyDown={(e) => {
                      if (e.key === 'Enter' || e.key === ' ') {
                        e.preventDefault();
                        e.stopPropagation();
                        toggleSelect(file.uuid || file.name);
                      }
                    }}
                    style={{
                      position: 'absolute',
                      top: 6,
                      right: 6,
                      width: 22,
                      height: 22,
                      borderRadius: '50%',
                      background: isSelected
                        ? 'transparent'
                        : 'rgba(0,0,0,0.35)',
                      display: 'flex',
                      alignItems: 'center',
                      justifyContent: 'center',
                      cursor: 'pointer',
                      transition: 'all 0.2s',
                      border: isSelected ? 'none' : '1.5px solid #fff',
                    }}
                  >
                    {isSelected && (
                      <CheckCircleFilled
                        style={{ color: '#1677ff', fontSize: 22 }}
                      />
                    )}
                  </div>
                </div>
              );
            },
          },
        }}
      />

      {/* 底部操作栏 */}
      <div
        style={{
          marginTop: 16,
          display: 'flex',
          alignItems: 'center',
          gap: 12,
        }}
      >
        <span style={{ color: '#666', fontSize: 13 }}>
          已选 {selected.size} 张
        </span>
        <button
          type="button"
          onClick={handleArchive}
          style={{
            padding: '6px 20px',
            background: selected.size > 0 ? '#1677ff' : '#d9d9d9',
            color: '#fff',
            border: 'none',
            borderRadius: 6,
            cursor: selected.size > 0 ? 'pointer' : 'not-allowed',
            fontSize: 13,
            transition: 'background 0.2s',
          }}
        >
          归档所选
        </button>
        {selected.size > 0 && (
          <button
            type="button"
            onClick={() => setSelected(new Set())}
            style={{
              padding: '6px 16px',
              background: 'transparent',
              color: '#666',
              border: '1px solid #d9d9d9',
              borderRadius: 6,
              cursor: 'pointer',
              fontSize: 13,
            }}
          >
            取消
          </button>
        )}
      </div>

      {/* 自定义大图预览 */}
      {previewSrc && (
        <Image
          src={previewSrc}
          style={{ display: 'none' }}
          preview={{
            visible: true,
            src: previewSrc,
            onVisibleChange: (v) => {
              if (!v) setPreviewSrc(null);
            },
          }}
        />
      )}
    </div>
  );
};
