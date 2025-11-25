import { runFunction } from '@ant-design/pro-components';
import { ChevronDown } from '@sofa-design/icons';
import { ConfigProvider, Dropdown, MenuProps } from 'antd';
import classNames from 'classnames';
import React, {
  MouseEvent,
  ReactNode,
  useContext,
  useEffect,
  useRef,
  useState,
} from 'react';
import { BaseEditor } from 'slate';
import { ReactEditor, useSlate } from 'slate-react';
import { SuggestionConnext } from '../../../../MarkdownInputField/Suggestion';
import { useStyle } from './style';

type TagPopupItem = Array<{
  label: string;
  key: string | number;
  onClick?: (v: string) => void;
}>;

type SuggestionContextValue = React.ContextType<typeof SuggestionConnext>;

type RenderProps = TagPopupProps & {
  text?: string;
  placeholder?: string;
  autoOpen?: boolean;
  onSelect?: (
    value: string,
    path?: number[],
    tagNode?: Record<string, any>,
  ) => void;
};

export type TagPopupProps = {
  /**
   * 子元素内容
   */
  children?: React.ReactNode;
  /**
   * 下拉菜单项列表或返回下拉菜单项列表的函数
   */
  items?: TagPopupItem | ((props: RenderProps) => Promise<TagPopupItem>);
  /**
   * 组件CSS前缀类名
   */
  prefixCls?: string | string[] | false;
  /**
   * 自定义下拉菜单渲染函数
   * @param defaultNode 默认渲染的节点
   * @param props 组件属性
   */
  dropdownRender?: (
    defaultNode: ReactNode,
    props: RenderProps,
  ) => React.ReactNode;
  /**
   * 下拉菜单的自定义样式
   */
  dropdownStyle?: React.CSSProperties;
  /**
   * 菜单属性配置
   */
  menu?: MenuProps;
  /**
   * 当没有数据时显示的内容
   */
  notFoundContent?: React.ReactNode;
  /**
   * 下拉菜单主体的样式
   */
  bodyStyle?: React.CSSProperties;
  /**
   * 组件自定义类名
   */
  className?: string;
  /**
   * 控制下拉菜单是否展开
   */
  open?: boolean;
  /**
   * 下拉菜单展开状态变化的回调函数
   * @param open 是否展开
   */
  onOpenChange?: (open: boolean) => void;
  /**
   * 在弹出框打开之前的回调函数
   * 可以用于控制弹出框是否打开
   * @param open 是否打开
   * @param props 组件属性
   * @returns 是否允许打开
   */
  beforeOpenChange?: (open: boolean, props: RenderProps) => boolean;
  /**
   * 自定义标签渲染函数
   * @param props 组件属性
   * @param defaultDom 默认渲染的DOM
   * @returns 自定义渲染的React节点
   */
  tagRender?: (
    props: Omit<RenderProps, 'onSelect'> & {
      onSelect: (value: string, tagNode?: Record<string, any>) => void;
    },
    defaultDom: ReactNode,
  ) => React.ReactNode;
  /**
   * 自定义标签文本渲染函数
   * @param props 组件属性
   * @param text 文本内容
   * @returns 处理后的文本
   */
  tagTextRender?: (props: RenderProps, text: string) => string;
  /**
   * 标签文本的样式，可以是样式对象或返回样式对象的函数
   */
  tagTextStyle?:
    | ((props: RenderProps) => React.CSSProperties)
    | React.CSSProperties;
  /**
   * 标签文本的类名
   */
  tagTextClassName?: string;
  /**
   * 输入值改变时触发的回调函数
   * @param value 输入的值
   * @param props 组件属性
   * @returns
   */
  onChange?: (value: string, props: RenderProps) => void;

  type?: 'panel' | 'dropdown';
};

/**
 * TagPopup 组件 - 在编辑器中显示一个标签弹出选择框
 *
 * 该组件在编辑器中创建一个交互式标签选择弹出框，允许用户从预定义列表中选择标签。
 * 当选择一个标签时，会调用提供的回调函数并关闭弹出框。该组件与 Slate 编辑器集成，
 * 可以感知当前的节点路径。
 *
 * @param props - 组件属性
 * @param props.items - 可选的下拉菜单项列表
 * @param props.onSelect - 当选择一个项时的回调函数，接收所选项的键和路径
 * @param props.children - 触发器元素内容
 * @param props.dropdownRender - 自定义下拉菜单渲染函数
 * @param props.dropdownStyle - 下拉菜单的样式
 * @param props.menu - 自定义菜单配置
 * @param props.notFoundContent - 未找到内容时显示的内容
 * @param props.className - 组件的额外 CSS 类名
 * @param props.open - 控制下拉菜单是否打开
 * @param props.onOpenChange - 下拉菜单打开状态变化时的回调
 * @param props.text - 包含文本内容
 *
 * @returns 一个带有下拉菜单的标签弹出组件
 */
const getNodePath = (
  editor: BaseEditor & ReactEditor,
  domRef: React.RefObject<HTMLDivElement>,
) => {
  if (!domRef.current) return null;
  const slateNode = ReactEditor.toSlateNode(editor, domRef.current);
  return ReactEditor.findPath(editor, slateNode);
};

const updateNodeContext = (
  editor: BaseEditor & ReactEditor,
  domRef: React.RefObject<HTMLDivElement>,
  suggestionConnext: SuggestionContextValue,
  props: RenderProps,
  onSelect: RenderProps['onSelect'],
  pathRef: React.MutableRefObject<number[] | undefined>,
) => {
  const path = getNodePath(editor, domRef);
  if (!path) return;

  pathRef.current = path;

  if (suggestionConnext?.triggerNodeContext) {
    suggestionConnext.triggerNodeContext.current = {
      ...props,
      text: props.text,
    };
  }

  if (suggestionConnext?.onSelectRef) {
    suggestionConnext.onSelectRef.current = (newValue: string) => {
      const currentPath = getNodePath(editor, domRef);
      onSelect?.(newValue, currentPath || path || []);
      suggestionConnext?.setOpen?.(false);
    };
  }
};

const loadItemsData = async (
  items:
    | TagPopupItem
    | ((props: RenderProps) => Promise<TagPopupItem>)
    | undefined,
  props: RenderProps,
  setLoading: (loading: boolean) => void,
  setSelectedItems: (items: TagPopupItem) => void,
) => {
  if (typeof items !== 'function') return;

  setLoading(true);
  const result = await items(props);
  if (Array.isArray(result)) {
    setSelectedItems(result || []);
  }
  setLoading(false);
};

const initializeAutoOpen = (
  autoOpen: boolean | undefined,
  type: string | undefined,
  setOpen: (open: boolean) => void,
  suggestionConnext: SuggestionContextValue,
) => {
  if (!autoOpen) return;

  if (type === 'dropdown') {
    setOpen(true);
    return;
  }

  suggestionConnext?.setOpen?.(true);
};

const handleMouseEnter = (domRef: React.RefObject<HTMLDivElement>) => {
  const target = domRef.current;
  if (!target) return;
  target.removeAttribute('data-no-focus');
};

const handleMouseLeave = (domRef: React.RefObject<HTMLDivElement>) => {
  const target = domRef.current;
  if (!target) return;
  target.setAttribute('data-no-focus', '');
};

const createDefaultDom = (
  domRef: React.RefObject<HTMLDivElement>,
  baseCls: string,
  hashId: string,
  loading: boolean,
  selectedItems: TagPopupItem,
  children: React.ReactNode,
  text: string | undefined,
  placeholder: string | undefined,
  isOpen: boolean,
) => {
  const isEmpty = !text?.trim();
  const hasItems = selectedItems?.length > 0;

  return (
    <div
      ref={domRef}
      data-tag-popup-input
      data-no-focus
      className={classNames(`${baseCls}-tag-popup-input`, hashId, {
        empty: isEmpty,
        [`${baseCls}-tag-popup-input-loading`]: loading,
        [`${baseCls}-tag-popup-input-has-arrow`]: hasItems,
      })}
      onMouseEnter={() => handleMouseEnter(domRef)}
      onMouseLeave={() => handleMouseLeave(domRef)}
      title={placeholder}
      contentEditable={!hasItems ? undefined : false}
    >
      {children}
      {hasItems && (
        <ChevronDown
          className={classNames(`${baseCls}-tag-popup-input-arrow `, hashId, {
            empty: isEmpty,
            open: isOpen,
          })}
        />
      )}
    </div>
  );
};

const getRenderDom = (
  tagRender: TagPopupProps['tagRender'],
  props: RenderProps,
  defaultDom: ReactNode,
  onSelect: RenderProps['onSelect'],
  currentNodePath: React.MutableRefObject<number[] | undefined>,
) => {
  if (!tagRender) return defaultDom;

  return tagRender(
    {
      ...props,
      text: props.text,
      onSelect: (value: string, tagNode?: Record<string, any>) => {
        onSelect?.(value?.trim() || '', currentNodePath.current || [], tagNode);
      },
    },
    defaultDom,
  );
};

const handlePanelClick = (
  suggestionConnext: SuggestionContextValue,
  props: RenderProps,
  onSelect: RenderProps['onSelect'],
  currentNodePath: React.MutableRefObject<number[] | undefined>,
) => {
  if (suggestionConnext?.triggerNodeContext) {
    suggestionConnext.triggerNodeContext.current = {
      ...props,
      text: props.text,
    };
  }

  if (suggestionConnext?.onSelectRef) {
    suggestionConnext.onSelectRef.current = (newValue: string) => {
      onSelect?.(newValue?.trim() || '', currentNodePath.current || []);
      suggestionConnext?.setOpen?.(false);
    };
  }

  suggestionConnext?.setOpen?.(true);
};

const canOpen = (
  props: RenderProps,
  placeholder: string | undefined,
): boolean => {
  if (!props.beforeOpenChange) return true;

  return props.beforeOpenChange(true, {
    ...props,
    text: props.text,
    placeholder,
  });
};

const handleClick = (
  e: MouseEvent,
  props: RenderProps,
  placeholder: string | undefined,
  type: string | undefined,
  suggestionConnext: SuggestionContextValue,
  onSelect: RenderProps['onSelect'],
  currentNodePath: React.MutableRefObject<number[] | undefined>,
) => {
  e.preventDefault();
  e.stopPropagation();

  if (!canOpen(props, placeholder)) return;
  if (type === 'dropdown') return;

  handlePanelClick(suggestionConnext, props, onSelect, currentNodePath);
};

export const TagPopup = (props: RenderProps) => {
  const { onSelect, items, children, type } = props || {};
  const editor = useSlate();
  const [open, setOpen] = useState(false);
  const [loading, setLoading] = React.useState(false);
  const domRef = useRef<HTMLDivElement>(null);
  const suggestionConnext = useContext(SuggestionConnext);
  const antdContext = useContext(ConfigProvider.ConfigContext);
  const baseCls = antdContext?.getPrefixCls(
    'agentic-md-editor-tag-popup-input',
  );
  const { wrapSSR, hashId } = useStyle(baseCls);
  const currentNodePath = useRef<number[]>();

  useEffect(() => {
    const path = getNodePath(editor, domRef);
    if (path) {
      currentNodePath.current = path;
    }
  }, [editor.children, props.text]);

  useEffect(() => {
    updateNodeContext(
      editor,
      domRef,
      suggestionConnext,
      props,
      onSelect,
      currentNodePath,
    );
  }, [props.text]);

  const [selectedItems, setSelectedItems] = useState(() => {
    return typeof items === 'function' ? [] : items || [];
  });

  useEffect(() => {
    loadItemsData(items, props, setLoading, setSelectedItems);
  }, [open, items]);

  useEffect(() => {
    props.onChange?.(props.text || '', {
      ...props,
      text: props.text,
      onSelect: (value: string) => {
        onSelect?.(value?.trim() || '', currentNodePath.current || []);
      },
    });
  }, [props.text, suggestionConnext.open]);

  useEffect(() => {
    initializeAutoOpen(props.autoOpen, type, setOpen, suggestionConnext);
  }, []);

  const placeholder = props.placeholder;
  const isOpen = type === 'dropdown' ? open : suggestionConnext?.open || false;
  const defaultDom = createDefaultDom(
    domRef,
    baseCls,
    hashId,
    loading,
    selectedItems,
    children,
    props.text,
    placeholder,
    isOpen,
  );
  const renderDom = getRenderDom(
    props.tagRender,
    props,
    defaultDom,
    onSelect,
    currentNodePath,
  );

  return wrapSSR(
    <div
      className={classNames(
        baseCls,
        hashId,
        props.className,
        props.prefixCls,
        props.tagTextClassName,
        `${baseCls}-type-${type}`,
      )}
      style={{
        ...runFunction(props.tagTextStyle, {
          ...props,
          text: props.text,
          placeholder,
        }),
      }}
      onClick={(e) =>
        handleClick(
          e,
          props,
          placeholder,
          type,
          suggestionConnext,
          onSelect,
          currentNodePath,
        )
      }
    >
      {type === 'dropdown' ? (
        <Dropdown
          trigger={['click']}
          open={open}
          onOpenChange={setOpen}
          menu={{
            items: selectedItems as MenuProps['items'],
            onClick: (e) => {
              onSelect?.(e.key?.trim() || '', currentNodePath.current || []);
              suggestionConnext?.setOpen?.(false);
            },
          }}
        >
          {renderDom}
        </Dropdown>
      ) : (
        renderDom
      )}
    </div>,
  );
};
