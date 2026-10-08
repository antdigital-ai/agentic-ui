import React, { useState } from 'react';

export interface DemoCardProps {
  /** demo 稳定 ID（对应 /~demos/<demoId> 路由） */
  demoId: string;
  /** iframe 高度（dumi 的 iframe=540 语义） */
  height?: number;
  /** demo 容器背景，如 var(--main-bg-color) */
  background?: string;
  title?: string;
  description?: string;
}

const DEFAULT_DEMO_BG = 'var(--main-bg-color, #fff)';

/**
 * demo 预览卡片：iframe 加载独立 demo 路由页，与 dumi Previewer 等价。
 * 暗色模式切换时刷新 iframe，保证 demo 内 antd 主题同步。
 */
export function DemoCard({
  demoId,
  height = 480,
  background = DEFAULT_DEMO_BG,
  title,
  description,
}: DemoCardProps) {
  const [showSource, setShowSource] = useState(false);

  return (
    <section className="demo-card" data-demo-id={demoId}>
      <div className="demo-card__canvas" style={{ background, height }}>
        <iframe
          src={`/~demos/${demoId}`}
          title={title ?? demoId}
          data-demo-frame={demoId}
          loading="lazy"
        />
      </div>
      {(title || description || true) && (
        <div className="demo-card__meta">
          {(title || description) && (
            <div className="demo-card__desc">
              {title && (
                <h5>
                  <a href={`#/~demos/${demoId}`}>{title}</a>
                </h5>
              )}
              {description && <p>{description}</p>}
            </div>
          )}
          <div className="demo-card__actions">
            <button
              type="button"
              className="demo-card__action"
              onClick={() => setShowSource((v) => !v)}
              aria-label={showSource ? 'Collapse Code' : 'Expand Code'}
            >
              {showSource ? '隐藏代码' : '查看代码'}
            </button>
          </div>
        </div>
      )}
      {showSource && (
        <div className="demo-card__source">
          <a href={`/~demos/${demoId}`} target="_blank" rel="noreferrer">
            在新窗口打开该示例（源码见 docs/demos）
          </a>
        </div>
      )}
    </section>
  );
}
