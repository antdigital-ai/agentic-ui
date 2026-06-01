import { ConfigProvider } from 'antd';
import classNames from 'clsx';
import React, { memo, useContext, useMemo } from 'react';
import { I18nContext } from '../../../I18n';
import { useStyle } from './style';
import {
  formatDisplayUrl,
  isExternalLink,
  isSafeHref,
  resolveDocCardsFields,
  splitTags,
  type DocCardsFieldMap,
} from './utils';

/**
 * DocCards 组件 - 文档型卡片栅格
 *
 * 与现有图表共用同一套「HTML 注释 + GFM 表格」数据契约：
 *
 * - 一行 Markdown 表格 = 一张卡片；
 * - 表头列名按约定语义解析为 `title`/`url`/`description`/`tags`，可通过 `fieldMap` 覆盖；
 * - `cardColumns` 控制每行卡片数（1~4，默认 2）；窄屏（< 480px）强制单列。
 *
 * 解析无法定位 `title` 列时渲染带本地化文案的空态占位（i18n 键 `docCards`）；
 * 在 Markdown 路径下，上层 `parseTable` 已做过整表降级，此分支主要服务于
 * 直接消费 `DocCards` 组件且数据列名不规范的场景。
 */
export interface DocCardsProps {
  /** 标题，对应注释中的 `title` 字段；为空时不渲染 header */
  title?: React.ReactNode;
  /** 表头列定义（与 ChartRender 接口一致） */
  columns: { title?: string; dataIndex: string; key?: string }[];
  /** 已转好的数据行（与 chart 走同一份 dataSource） */
  data: Record<string, any>[];
  /** 工具栏额外节点（同 header 行右对齐） */
  toolbar?: React.ReactNode;
  /** 自定义字段名 → 表头 dataIndex 的映射 */
  fieldMap?: DocCardsFieldMap;
  /**
   * 每行卡片数，取值 `1`/`2`/`3`/`4`；缺省 `2`，传入 `1` 时呈现单列全宽列表。
   * `< 480px` viewport 通过媒体查询强制单列，确保移动端可读。
   */
  cardColumns?: number;
  /** 容器自定义类名 */
  className?: string;
  /** 容器自定义样式 */
  style?: React.CSSProperties;
}

/** 卡片列数硬上限：超过 4 列后单卡过窄、信息过密 */
const MAX_CARD_COLUMNS = 4;

/** title attribute 上完整 URL 不截断；卡片正文展示截断到该长度 */
const URL_DISPLAY_MAX_LENGTH = 64;

const toDisplayText = (raw: unknown): string => {
  if (raw === undefined || raw === null) return '';
  return String(raw);
};

const DocCardsComponent: React.FC<DocCardsProps> = ({
  title,
  columns,
  data,
  toolbar,
  fieldMap,
  cardColumns = 2,
  className,
  style,
}) => {
  const i18n = useContext(I18nContext);
  const { getPrefixCls } = useContext(ConfigProvider.ConfigContext);
  const prefixCls = getPrefixCls('agentic-doc-cards');
  const { hashId } = useStyle(prefixCls);

  const columnKeys = useMemo(
    () => columns.map((col) => col.dataIndex).filter(Boolean),
    [columns],
  );

  const fields = useMemo(
    () => resolveDocCardsFields(columnKeys, fieldMap),
    [columnKeys, fieldMap],
  );

  const safeColumnCount = Math.max(
    1,
    Math.min(MAX_CARD_COLUMNS, Math.floor(cardColumns) || 1),
  );

  // 用 repeat(N, ...) 精确控制最多 N 列；窄屏由 style.ts 中的媒体查询强制 1fr
  // minmax(0, 1fr) 防止子元素 min-content 撑破 grid track
  const gridStyle: React.CSSProperties = useMemo(
    () => ({
      gridTemplateColumns: `repeat(${safeColumnCount}, minmax(0, 1fr))`,
    }),
    [safeColumnCount],
  );

  const headerNode = useMemo(() => {
    if (!title && !toolbar) return null;
    return (
      <div
        className={classNames(`${prefixCls}-header`, hashId)}
        data-testid="doc-cards-header"
      >
        {title ? (
          <div
            className={classNames(`${prefixCls}-title`, hashId)}
            data-testid="doc-cards-title"
          >
            {title}
          </div>
        ) : null}
        {toolbar ? (
          <div
            className={classNames(`${prefixCls}-toolbar`, hashId)}
            data-testid="doc-cards-toolbar"
          >
            {toolbar}
          </div>
        ) : null}
      </div>
    );
  }, [title, toolbar, prefixCls, hashId]);

  if (!fields) {
    return (
      <div
        className={classNames(prefixCls, hashId, className)}
        style={style}
        contentEditable={false}
        data-testid="doc-cards"
      >
        {headerNode}
        <div
          className={classNames(`${prefixCls}-empty`, hashId)}
          data-testid="doc-cards-empty"
        >
          {i18n?.locale?.docCards || '卡片列表'}
        </div>
      </div>
    );
  }

  return (
    <div
      className={classNames(prefixCls, hashId, className)}
      style={style}
      contentEditable={false}
      data-testid="doc-cards"
    >
      {headerNode}
      <div
        className={classNames(`${prefixCls}-grid`, hashId)}
        style={gridStyle}
        role="list"
        data-testid="doc-cards-grid"
      >
        {data.map((row, rowIndex) => {
          const titleText = toDisplayText(row[fields.title]).trim();
          const rawUrl = fields.url
            ? toDisplayText(row[fields.url]).trim()
            : '';
          const descText = fields.description
            ? toDisplayText(row[fields.description]).trim()
            : '';
          const tags = fields.tags ? splitTags(row[fields.tags]) : [];
          // 多行同名时 rowIndex 保唯一性；fields.title 已 trim 处理过
          const cardKey = `${rowIndex}-${titleText}`;
          const safeLink = rawUrl && isSafeHref(rawUrl);
          const urlDisplay = rawUrl
            ? formatDisplayUrl(rawUrl, URL_DISPLAY_MAX_LENGTH)
            : '';

          return (
            <article
              key={cardKey}
              className={classNames(`${prefixCls}-item`, hashId)}
              role="listitem"
              data-testid={`doc-cards-item-${rowIndex}`}
            >
              {titleText ? (
                <h3
                  className={classNames(`${prefixCls}-item-title`, hashId)}
                  data-testid={`doc-cards-item-${rowIndex}-title`}
                >
                  {titleText}
                </h3>
              ) : null}
              {rawUrl ? (
                <div
                  className={classNames(`${prefixCls}-item-url`, hashId)}
                  title={rawUrl}
                  data-testid={`doc-cards-item-${rowIndex}-url`}
                >
                  {safeLink ? (
                    // 仅外部链接（http(s)/mailto/tel）开新 tab；站内绝对路径、相对路径、
                    // 锚点 (#section) 走原 tab，避免破坏浏览器原生锚点滚动等行为
                    <a
                      className={classNames(`${prefixCls}-item-link`, hashId)}
                      data-testid={`doc-cards-item-${rowIndex}-link`}
                      href={rawUrl}
                      {...(isExternalLink(rawUrl)
                        ? {
                            target: '_blank',
                            rel: 'noopener noreferrer',
                          }
                        : {})}
                    >
                      {urlDisplay}
                    </a>
                  ) : (
                    urlDisplay
                  )}
                </div>
              ) : null}
              {descText ? (
                <p
                  className={classNames(`${prefixCls}-item-desc`, hashId)}
                  data-testid={`doc-cards-item-${rowIndex}-desc`}
                >
                  {descText}
                </p>
              ) : null}
              {tags.length > 0 ? (
                <div
                  className={classNames(`${prefixCls}-item-tags`, hashId)}
                  role="list"
                  aria-label={i18n?.locale?.docCardsTags || '标签列表'}
                  data-testid={`doc-cards-item-${rowIndex}-tags`}
                >
                  {tags.map((tag, tagIndex) => (
                    <span
                      key={tag}
                      className={classNames(`${prefixCls}-tag`, hashId)}
                      role="listitem"
                      title={tag}
                      data-testid={`doc-cards-item-${rowIndex}-tag-${tagIndex}`}
                    >
                      {tag}
                    </span>
                  ))}
                </div>
              ) : null}
            </article>
          );
        })}
      </div>
    </div>
  );
};

DocCardsComponent.displayName = 'DocCards';

export const DocCards = memo(DocCardsComponent);
