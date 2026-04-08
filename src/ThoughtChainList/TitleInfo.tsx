import {
  ChevronsDownUp,
  ChevronsUpDown,
  Newspaper,
  TableProperties,
  Wrench,
} from '@sofa-design/icons';
import { Popover } from 'antd';
import classNames from 'clsx';
import { motion } from 'framer-motion';
import React, { useContext, useMemo } from 'react';
import { DocMeta } from '.';
import { I18nContext } from '../I18n';
import { ActionIconBox } from '../index';
import { CostMillis } from './CostMillis';
import { FlipText } from './FlipText';

/**
 * TitleInfo 组件 - 标题信息组件
 *
 * 该组件用于显示思维链项的标题信息，包括标题文本、耗时、类别、元数据等。
 * 支持折叠/展开功能、元数据点击、自定义渲染等。
 *
 * @component
 * @description 标题信息组件，显示思维链项的标题和相关信息
 * @param {Object} props - 组件属性
 * @param {number} [props.costMillis] - 耗时（毫秒）
 * @param {string} props.category - 标题类别
 * @param {string} props.title - 标题文本
 * @param {string} props.prefixCls - 样式前缀
 * @param {string} props.hashId - 样式哈希ID
 * @param {boolean} props.collapse - 是否折叠
 * @param {boolean} [props.isFinished] - 是否已完成
 * @param {(collapse: boolean) => void} props.setCollapse - 设置折叠状态
 * @param {(meta: Partial<DocMeta>) => void} [props.onMetaClick] - 元数据点击回调
 * @param {string} [props.instanceId] - 实例ID
 * @param {Function} [props.titleExtraRender] - 标题额外渲染函数
 * @param {Record<string, Array>} props.meta - 元数据对象
 *
 * @example
 * ```tsx
 * <TitleInfo
 *   title="分析用户需求"
 *   category="thinking"
 *   costMillis={1500}
 *   collapse={false}
 *   setCollapse={(collapse) => setCollapse(collapse)}
 *   meta={{ knowledge: [{ name: "知识库1", icon: "db", uuid: "1" }] }}
 * />
 * ```
 *
 * @returns {React.ReactElement} 渲染的标题信息组件
 *
 * @remarks
 * - 支持标题中的元数据标签解析
 * - 提供折叠/展开功能
 * - 显示操作耗时
 * - 支持元数据点击交互
 * - 提供自定义渲染扩展
 * - 支持国际化
 * - 美观的动画效果
 * - 响应式布局
 */
export const TitleInfo = (props: {
  costMillis?: number;
  category: string;
  title?: string;
  prefixCls: string;
  setCollapse?: (collapse: boolean) => void;
  collapse: boolean;
  hashId: string;
  isFinished?: boolean;
  onMetaClick?: (meta: Partial<DocMeta>) => void;
  instanceId?: string;
  titleExtraRender?: (defaultDom: React.ReactNode) => React.ReactNode;
  meta?: Record<
    string,
    {
      name: string;
      icon: string;
      uuid: string;
      type: string;
      description: string;
    }[]
  >;
}) => {
  const { collapse, isFinished, setCollapse } = props;
  const { locale } = useContext(I18nContext);
  const titleDom = useMemo(() => {
    const titleSegments = props?.title?.split(/(\$\{.*})/);

    return titleSegments?.map((tag, index) => {
      const meta = props.meta || {};
      if (tag.startsWith('${') && tag.endsWith('}')) {
        let infoTitle = tag;
        const metaList =
          [meta[tag.replaceAll('${', '')?.replaceAll('}', '')]].flat(1) || [];

        if (Array.isArray(metaList)) {
          if (metaList.length > 1) {
            if (props.category === 'RagRetrieval') {
              infoTitle = locale?.multipleKnowledgeBases;
            } else if (props.category === 'TableSql') {
              infoTitle = metaList.at(0)?.name + locale?.multipleTables;
            } else if (props.category === 'ToolCall') {
              infoTitle = metaList.at(0)?.name + locale?.multipleTools;
            } else {
              infoTitle = metaList.at(0)?.name + locale?.multipleData;
            }
          }
          if (metaList.length === 1) {
            infoTitle = metaList.at(0)?.name || tag;
          }
        }
        return (
          <Popover
            key={index}
            open={metaList.length > 1 ? undefined : false}
            trigger="hover"
            content={
              <div
                style={{
                  display: 'flex',
                  flexWrap: 'wrap',
                  flexDirection: 'column',
                  gap: '4px',
                  maxHeight: 400,
                  overflow: 'auto',
                  textAlign: 'left',
                  width: '100%',
                }}
              >
                {[metaList]
                  ?.flat(1)
                  .filter((item) => item)
                  .map((item, subIndex) => {
                    return (
                      <motion.span
                        key={`${index}-${subIndex}`}
                        className={classNames(
                          `${props.prefixCls}-content-list-item-info`,
                          props.hashId,
                        )}
                        onClick={() => {
                          props?.onMetaClick?.({
                            doc_name: item.name,
                            doc_id: item.uuid,
                            type: item.type,
                            origin_text: item.description,
                          });
                        }}
                      >
                        <span
                          style={{
                            overflow: 'hidden',
                            textWrap: 'nowrap',
                            textOverflow: 'ellipsis',
                            whiteSpace: 'nowrap',
                            textAlign: 'left',
                          }}
                        >
                          {item.name}
                        </span>
                      </motion.span>
                    );
                  })}
              </div>
            }
          >
            <motion.span
              key={index}
              className={classNames(
                `${props.prefixCls}-content-list-item-info`,
                `${props.prefixCls}-content-list-item-info-tag`,
                props.hashId,
              )}
            >
              {props.category === 'ToolCall' && (
                <Wrench width={18} height={18} style={{ fontSize: 18 }} />
              )}
              {props.category === 'RagRetrieval' && (
                <Newspaper width={18} height={18} style={{ fontSize: 18 }} />
              )}
              {props.category === 'TableSql' ? (
                <TableProperties
                  style={{ fontSize: 18 }}
                  width={18}
                  height={18}
                />
              ) : null}
              <span
                className={classNames(
                  `${props.prefixCls}-content-list-item-info-tag-text`,
                  props.hashId,
                )}
              >
                {isFinished ? (
                  infoTitle || tag
                ) : (
                  <FlipText word={infoTitle || tag} />
                )}
              </span>
            </motion.span>
          </Popover>
        );
      }
      return (
        <span
          key={index}
          style={{
            overflow: 'hidden',
            textWrap: 'nowrap',
            textOverflow: 'ellipsis',
            whiteSpace: 'nowrap',
          }}
        >
          {isFinished ? tag : <FlipText word={tag} />}
        </span>
      );
    });
  }, [props.title]);

  const extraTitleDom = (
    <ActionIconBox
      data-testid="action-icon-box"
      title={collapse ? locale?.expand : locale?.collapse}
      onClick={() => {
        setCollapse?.(!collapse);
      }}
    >
      {!collapse ? (
        <ChevronsDownUp data-testid="expand-icon" />
      ) : (
        <ChevronsUpDown data-testid="collapse-icon" />
      )}
    </ActionIconBox>
  );

  return useMemo(
    () => (
      <div
        data-testid="title-info"
        className={classNames(
          `${props.prefixCls}-content-list-item-info`,
          props.hashId,
        )}
      >
        <div
          data-testid="title-text"
          className={classNames(
            `${props.prefixCls}-content-list-item-info-title`,
            props.hashId,
          )}
        >
          {titleDom}
          <CostMillis costMillis={props.costMillis} />
        </div>
        <div
          className={classNames(
            `${props.prefixCls}-content-list-item-info-action`,
            props.hashId,
          )}
        >
          {props.titleExtraRender
            ? props.titleExtraRender(extraTitleDom)
            : extraTitleDom}
        </div>
      </div>
    ),
    [titleDom, isFinished, collapse, props.costMillis],
  );
};
