import { ExportOutlined, RightOutlined } from '@ant-design/icons';

import { ConfigProvider, Descriptions, Drawer, Popover } from 'antd';
import classNames from 'clsx';
import dayjs from 'dayjs';
import React, { useContext, useMemo } from 'react';
import { ActionIconBox } from '../../Components/ActionIconBox';
import { I18nContext } from '../../I18n';
import { DocMeta } from '../../ThoughtChainList/types';
import { BubbleConfigContext } from '../BubbleConfigProvide';
import { DocInfoListProps } from '../types/DocInfo';
import { useStyle } from './docInfoStyle';
import { ReadonlyMarkdownContent } from './ReadonlyMarkdownContent';

const createPlaceholderReplacer = (
  placeholders: NonNullable<DocInfoListProps['reference_url_info_list']>,
) => {
  const replacements = new Map<string, string>();
  placeholders.forEach((item) => {
    const id = item?.placeholder;
    const destination = item?.url || item?.doc_id;
    if (id == null || id === '' || destination == null || destination === '')
      return;
    for (const token of [`\`\${${id}}\``, `$[${id}]`, `$${id}`]) {
      if (!replacements.has(token)) replacements.set(token, `(${destination})`);
    }
  });
  if (!replacements.size) return (content: string) => content;
  const pattern = new RegExp(
    [...replacements.keys()]
      .sort((a, b) => b.length - a.length)
      .map((token) => token.replace(/[.*+?^${}()|[\]\\]/g, '\\$&'))
      .join('|'),
    'g',
  );
  return (content: string) =>
    content.replace(pattern, (token) => replacements.get(token)!);
};

/**
 * 文档信息列表组件，用于展示引用的内容列表。
 *
 * 该组件提供以下功能：
 * - 展示引用文档的列表
 * - 支持展开/收起文档列表
 * - 提供文档预览功能
 * - 支持点击查看原文
 *
 * @component
 * @param {Object} props - 组件属性
 * @param {Array} props.reference_url_info_list - 引用URL信息列表，用于替换占位符
 * @param {Array<Object>} [props.options] - 文档信息选项列表，包含文档内容和元数据
 * @param {Function} [props.onOriginUrlClick] - 点击原文链接的回调函数
 * @param {Function} [props.render] - 自定义渲染函数，用于自定义列表项的渲染
 *
 * @returns {JSX.Element} 文档信息列表组件
 */
export const DocInfoList: React.FC<DocInfoListProps> = ({
  reference_url_info_list,
  ...props
}) => {
  const [expanded, setExpanded] = React.useState(true);
  const configContext = useContext(ConfigProvider.ConfigContext);
  const baseCls = configContext?.getPrefixCls(`agent-doc-info`);
  const chatContext = useContext(BubbleConfigContext);
  const { locale } = useContext(I18nContext);
  const { hashId } = useStyle(baseCls);

  const docInfoList = useMemo(
    () => (props.options || []).filter((item) => item),
    [props.options],
  );
  const replacePlaceholders = useMemo(
    () => createPlaceholderReplacer(reference_url_info_list ?? []),
    [reference_url_info_list],
  );

  const [docMeta, setDocMeta] = React.useState<DocMeta | null>(null);
  const openOriginal = (url?: string) => {
    if (!url) return;
    if (props.onOriginUrlClick) {
      props.onOriginUrlClick(url);
    } else {
      window.open(url);
    }
  };

  return (
    <>
      {docMeta ? (
        <Drawer
          title={locale?.['chat.message.preview'] || '预览' + docMeta?.doc_name}
          open={!!docMeta}
          onClose={() => {
            setDocMeta(null);
          }}
          width={'40vw'}
        >
          <Descriptions
            column={1}
            items={[
              {
                label: locale?.['docInfo.name'] || '名称',
                span: 1,
                children: docMeta?.doc_name || docMeta?.answer,
              },
              {
                label: locale?.['docInfo.updateTime'] || '更新时间',
                span: 1,
                children: dayjs(docMeta?.upload_time).format(
                  'YYYY-MM-DD HH:mm:ss',
                ),
              },
              {
                label: locale?.['docInfo.type'] || '类型',
                span: 1,
                children: docMeta?.type,
              },
              {
                label: locale?.['docInfo.content'] || '内容',
                span: 1,
                children: docMeta?.origin_text,
              },
            ]}
          />
        </Drawer>
      ) : null}
      <div
        style={{
          display: 'flex',
          gap: 4,
          flexWrap: 'wrap',
          flexDirection: 'column',
          maxWidth: '100%',
        }}
        className={classNames(baseCls, hashId, {
          [`${baseCls}-compact`]: chatContext?.compact,
        })}
      >
        <div
          className={classNames(`${baseCls}-label`, hashId, {
            [`${baseCls}-label-compact`]: chatContext?.compact,
          })}
          onClick={() => {
            setExpanded(!expanded);
          }}
          role="button"
          tabIndex={0}
          aria-expanded={!expanded}
          onKeyDown={(event) => {
            if (event.key !== 'Enter' && event.key !== ' ') return;
            event.preventDefault();
            setExpanded((previous) => !previous);
          }}
        >
          <span
            style={{
              fontSize: '0.9em',
            }}
          >
            {locale?.['docInfo.referenceContent'] || '引用内容'}
            {':'}{' '}
            <span
              style={{
                fontWeight: 'bold',
              }}
            >
              {docInfoList.length}{' '}
            </span>
            {locale?.['docInfo.items'] || '项'}
          </span>

          <div
            style={{
              height: '1.6em',
              borderRadius: '12px',
              opacity: 1,
              background: '#FFFFFF',
              fontSize: '1em',
              boxSizing: 'border-box',
              border: '1px solid #E6ECF4',
              padding: '0px 16px',
            }}
          >
            <span
              style={{
                transition: 'all 0.3s cubic-bezier(0.4, 0, 0.2, 1)',
                fontSize: '0.9em',
                display: 'flex',
                alignItems: 'center',
                justifyContent: 'center',
                gap: 4,
              }}
            >
              {!expanded
                ? locale?.['docInfo.collapse'] || '收起'
                : locale?.['docInfo.expand'] || '展开'}
              <RightOutlined
                style={{
                  fontSize: '0.9em',
                  transition: 'all 0.3s cubic-bezier(0.4, 0, 0.2, 1)',
                  transform: expanded ? 'rotate(90deg)' : 'rotate(-90deg)',
                }}
              />
            </span>
          </div>
        </div>
        {/* 列表展开/收起的高度+透明度过渡由 inline transition 控制；
            列表与子项的入场淡入由 CSS keyframes 控制（参见 docInfoStyle.ts）。
            每个子项通过 --doc-item-delay 实现 staggered 入场，等价于
            原 framer-motion 父级 staggerChildren 的效果。 */}
        <div
          className={classNames(`${baseCls}-list`, hashId)}
          style={{
            height: expanded ? '0px' : 'auto',
            opacity: expanded ? 0 : 1,
            transition: 'all 0.3s cubic-bezier(0.4, 0, 0.2, 1)',
            border: expanded ? 'none' : '1px solid rgba(0,0,0,0.1)',
            borderRadius: '12px',
            display: 'flex',
            flexDirection: 'column',
            maxWidth: '100%',
            padding: expanded ? 0 : '12px',
            background: '#FBFCFD',
          }}
        >
          {(expanded ? [] : docInfoList).map((item, index) => {
            const dom = (
              <div
                key={index}
                className={classNames(`${baseCls}-list-item`, hashId)}
                title={item?.content}
                onClick={() => {
                  openOriginal(item.originUrl);
                }}
                style={
                  {
                    '--doc-item-delay': `${Math.min(index, 4) * 0.05}s`,
                  } as React.CSSProperties
                }
              >
                <div
                  className={classNames(`${baseCls}-list-item-title`, hashId)}
                  style={{
                    width: '100%',
                  }}
                >
                  <img
                    className={classNames(`${baseCls}-list-item-icon`, hashId)}
                    alt=""
                    src="https://mdn.alipayobjects.com/huamei_ptjqan/afts/img/A*kF_GTppRbp4AAAAAAAAAAAAADkN6AQ/original"
                    style={{
                      boxSizing: 'content-box',
                      flexShrink: 0,
                      padding: 4,
                    }}
                  />
                  <div
                    style={{
                      display: 'flex',
                      flex: 1,
                      flexDirection: 'column',
                      maxWidth: 'calc(100% - 24px)',
                    }}
                  >
                    <div
                      style={{
                        overflow: 'hidden',
                        textOverflow: 'ellipsis',
                        display: '-webkit-box',
                        WebkitLineClamp: 1,
                        lineHeight: '24px',
                        WebkitBoxOrient: 'vertical',
                        maxWidth: 'calc(100% - 24px)',
                      }}
                    >
                      {replacePlaceholders(item?.content || '')}
                    </div>
                    {item?.docMeta?.doc_name ? (
                      <div
                        style={{
                          fontSize: '12px',
                          fontWeight: 'normal',
                          lineHeight: '22px',
                          textAlign: 'justify',
                          color: '#B9C0CB',
                          overflow: 'hidden',
                          textOverflow: 'ellipsis',
                          maxWidth: '100%',
                          display: '-webkit-box',
                          WebkitLineClamp: 1,
                          WebkitBoxOrient: 'vertical',
                        }}
                      >
                        {item?.docMeta?.doc_name}
                      </div>
                    ) : null}
                  </div>
                  {item?.originUrl ? (
                    <ActionIconBox
                      title={
                        locale?.['chat.message.viewOriginal'] || '查看原文'
                      }
                      style={{
                        fontSize: '1em',
                      }}
                      onClick={(e) => {
                        e.stopPropagation();
                        e.preventDefault();
                        // originUrl 已在外层条件保证存在
                        openOriginal(item.originUrl);
                      }}
                    >
                      <ExportOutlined />
                    </ActionIconBox>
                  ) : null}
                </div>
              </div>
            );
            const renderedItem = props.render ? props.render(item, dom) : dom;
            if ((item?.content?.trim().length || 0) < 20 || !renderedItem) {
              return (
                <React.Fragment key={index}>{renderedItem}</React.Fragment>
              );
            }

            return (
              <Popover
                key={index}
                placement="left"
                destroyOnHidden
                content={
                  <div
                    style={{
                      width: 400,
                      maxHeight: 400,
                      overflow: 'auto',
                      display: 'flex',
                      flexDirection: 'column',
                      gap: 12,
                    }}
                  >
                    <ReadonlyMarkdownContent
                      tableConfig={{ actions: { fullScreen: 'modal' } }}
                      style={{
                        padding: 0,
                        width: '100%',
                      }}
                      content={item?.content?.trim() || ''}
                    />
                    {item?.docMeta ? (
                      <div
                        style={{
                          borderRadius: '12px',
                          opacity: 1,
                          display: 'flex',
                          flexDirection: 'row',
                          alignItems: 'center',
                          padding: '10px',
                          gap: '10px',
                          alignSelf: 'stretch',
                          background: '#FBFCFD',
                          cursor: 'pointer',
                          zIndex: 1,
                        }}
                        onClick={() => {
                          setDocMeta(item.docMeta);
                        }}
                      >
                        <img
                          style={{
                            width: 24,
                          }}
                          src={
                            'https://mdn.alipayobjects.com/huamei_ptjqan/afts/img/A*kF_GTppRbp4AAAAAAAAAAAAADkN6AQ/original'
                          }
                        />
                        <div
                          style={{
                            overflow: 'hidden',
                            textOverflow: 'ellipsis',
                            WebkitBoxOrient: 'vertical',
                            WebkitLineClamp: 2,
                            display: '-webkit-box',
                          }}
                        >
                          {item?.docMeta?.doc_name || item?.docMeta.answer}
                        </div>
                      </div>
                    ) : null}
                  </div>
                }
              >
                {renderedItem}
              </Popover>
            );
          })}
        </div>
      </div>
    </>
  );
};
