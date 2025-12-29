import { DeleteOutlined } from '@ant-design/icons';
import { ConfigProvider, Tooltip } from 'antd';
import React, { useContext, useRef } from 'react';
import { NodeEntry, Transforms } from 'slate';
import { ReactEditor } from 'slate-react';
import { I18nContext } from '../../../I18n';
import { ChartNode, EditorUtils } from '../../../MarkdownEditor';
import { useEditorStore } from '../../../MarkdownEditor/editor/store';
import { useStyle } from './ChartAttrToolBarStyle';

/**
 * ChartAttrToolBar 组件 - 图表属性工具栏组件
 *
 * 该组件提供图表编辑时的属性工具栏，支持图表配置、删除等操作。
 * 集成到 Markdown 编辑器中，提供图表节点的交互功能。
 *
 * @component
 * @description 图表属性工具栏组件，提供图表编辑功能
 * @param {Object} props - 组件属性
 * @param {Array} [props.options] - 工具栏选项配置
 * @param {React.ReactNode} props.options.icon - 选项图标
 * @param {string} [props.options.title] - 选项标题
 * @param {React.CSSProperties} [props.options.style] - 选项样式
 * @param {() => void} [props.options.onClick] - 选项点击回调
 * @param {NodeEntry<ChartNode>} props.node - 图表节点
 * @param {React.ReactNode} [props.title] - 工具栏标题
 *
 * @example
 * ```tsx
 * <ChartAttrToolBar
 *   node={chartNode}
 *   title="图表设置"
 *   options={[
 *     {
 *       icon: <SettingIcon />,
 *       title: "设置",
 *       onClick: () => console.log('设置图表')
 *     }
 *   ]}
 * />
 * ```
 *
 * @returns {React.ReactElement} 渲染的图表属性工具栏组件
 *
 * @remarks
 * - 集成到 Markdown 编辑器
 * - 支持图表节点删除
 * - 提供自定义工具栏选项
 * - 支持只读模式
 * - 阻止事件冒泡
 * - 使用 Tooltip 提供提示
 * - 响应式布局设计
 */
export const ChartAttrToolBar: React.FC<{
  options?: {
    icon: React.ReactNode;
    title?: string;
    style?: React.CSSProperties;
    onClick?: () => void;
  }[];
  node: NodeEntry<ChartNode>;
  title?: React.ReactNode;
}> = (props) => {
  const { markdownEditorRef, readonly } = useEditorStore();
  const i18n = useContext(I18nContext);

  const chartNodeRef = useRef<NodeEntry<ChartNode>>();

  const remove = React.useCallback(() => {
    const chart = props.node;
    if (!chart) return;

    Transforms.delete(markdownEditorRef.current, {
      at: EditorUtils.findPath(markdownEditorRef.current, chart!),
    });
    chartNodeRef.current = undefined;
    ReactEditor.focus(markdownEditorRef.current);
  }, [markdownEditorRef.current]);

  const context = useContext(ConfigProvider.ConfigContext);
  const baseClassName = context?.getPrefixCls(`chart-attr-toolbar`);

  const { wrapSSR, hashId } = useStyle(baseClassName);
  return wrapSSR(
    <div
      className={[baseClassName, hashId].filter(Boolean).join(' ')}
      style={{
        width: 'auto',
      }}
      contentEditable={false}
      data-testid="chart-attr-toolbar"
      onClick={(e) => {
        e.stopPropagation();
      }}
    >
      <div
        style={{
          flex: 1,
          fontWeight: 'bold',
        }}
        onClick={(e) => {
          e.stopPropagation();
        }}
      >
        {props.title}
      </div>
      {props?.options?.map((item, index) => {
        if (!item.icon) return null;

        if (!item.title) {
          return (
            <div
              key={index}
              className={[`${baseClassName}-item`, hashId]
                .filter(Boolean)
                .join(' ')}
              onClick={item.onClick}
              style={item.style}
            >
              {item.icon}
            </div>
          );
        }
        return (
          <Tooltip mouseEnterDelay={0.3} key={index} title={item.title}>
            <div
              className={[`${baseClassName}-item`, hashId]
                .filter(Boolean)
                .join(' ')}
              onClick={item.onClick}
            >
              {item.icon}
            </div>
          </Tooltip>
        );
      })}
      {readonly ? null : (
        <Tooltip mouseEnterDelay={0.3} title={i18n?.locale?.delete || '删除'}>
          <div
            className={[`${baseClassName}-item`, hashId]
              .filter(Boolean)
              .join(' ')}
          >
            <DeleteOutlined onClick={remove} />
          </div>
        </Tooltip>
      )}
    </div>,
  );
};
