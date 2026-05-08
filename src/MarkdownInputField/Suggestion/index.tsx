import { Dropdown, Spin } from 'antd';
import { useMergedState } from 'rc-util';
import React, { useEffect, useRef, useState } from 'react';
import { useRefFunction } from '../../Hooks/useRefFunction';
// SuggestionContext 提取到独立文件，打断与 TagPopup 的循环依赖
import { SuggestionContext } from './SuggestionContext';

export { SuggestionConnext, SuggestionContext } from './SuggestionContext';

/**
 * Suggestion 组件的 tagInputProps 类型定义
 * 从 MarkdownEditorProps['tagInputProps'] 内联，避免循环依赖
 */
interface SuggestionTagInputProps {
  enable?: boolean;
  placeholder?: string;
  type?: 'panel' | 'dropdown';
  items?:
    | Array<{ key: string | number; label: string }>
    | ((
        context: Record<string, any>,
      ) => Promise<Array<{ key: string | number; label: string }>>);
  open?: boolean;
  onOpenChange?: (open: boolean) => void;
  dropdownRender?: (
    content: React.ReactNode,
    props: Record<string, any>,
  ) => React.ReactNode;
  menu?: React.ReactNode;
  dropdownStyle?: React.CSSProperties;
  notFoundContent?: React.ReactNode;
  onChange?: (value: string) => void;
}

/**
 * Suggestion 内部维护的可点击菜单项形态
 *
 * 由 `tagInputProps.items`（静态数组或异步加载结果）映射而来，
 * 在原始 item 上额外注入 `onClick`，供 Dropdown 菜单点击触发选择。
 */
type SuggestionMenuItem = {
  label: string;
  key: string | number;
  onClick: () => void;
};

/**
 * 静态空数组兜底引用。
 *
 * 用作 `props.tagInputProps.items` 未传时的稳定 fallback —— 严禁在解构默认值
 * 处写 `items = []`：那会让每次渲染都生成新的 `[]` 引用，下游 useEffect 依赖
 * `[items]` 永远变化，触发 setState → re-render → 死循环。该 bug 在 jsdom
 * 下被 React 批处理掩盖，但在 happy-dom 下会直接表现为渲染卡死。
 */
const EMPTY_ITEMS: ReadonlyArray<{ key: string | number; label: string }> =
  Object.freeze([]);

/**
 * Suggestion 组件 - 自动完成建议组件
 *
 * 该组件提供输入框的自动完成功能，支持静态建议列表和动态加载建议。
 * 当用户输入时显示相关建议，支持键盘导航和点击选择。
 *
 * @component
 * @description 自动完成建议组件，提供输入建议和选择功能
 * @param {Object} props - 组件属性
 * @param {React.ReactNode} props.children - 子组件，通常是输入框
 * @param {TagInputProps} [props.tagInputProps] - 标签输入配置
 * @param {Array|Function} [props.tagInputProps.items] - 建议项列表或加载函数
 * @param {boolean} [props.tagInputProps.open] - 是否显示下拉菜单
 * @param {(open: boolean) => void} [props.tagInputProps.onOpenChange] - 下拉菜单状态变化回调
 * @param {Function} [props.tagInputProps.dropdownRender] - 自定义下拉菜单渲染
 * @param {React.ReactNode} [props.tagInputProps.menu] - 自定义菜单内容
 * @param {React.CSSProperties} [props.tagInputProps.dropdownStyle] - 下拉菜单样式
 * @param {React.ReactNode} [props.tagInputProps.notFoundContent] - 无数据时显示的内容
 *
 * @example
 * ```tsx
 * <Suggestion
 *   tagInputProps={{
 *     items: [
 *       { key: 'item1', label: '建议项1' },
 *       { key: 'item2', label: '建议项2' }
 *     ],
 *     onOpenChange: (open) => console.log('下拉状态:', open)
 *   }}
 * >
 *   <Input placeholder="请输入..." />
 * </Suggestion>
 * ```
 *
 * @returns {React.ReactElement} 渲染的自动完成建议组件
 *
 * @remarks
 * - 支持静态建议列表和动态加载
 * - 提供键盘导航功能
 * - 支持自定义下拉菜单渲染
 * - 支持加载状态显示
 * - 自动处理选择事件
 * - 支持自定义样式和内容
 */
export const Suggestion: React.FC<{
  children: React.ReactNode;
  tagInputProps?: SuggestionTagInputProps;
}> = (props) => {
  const onSelectRef =
    useRef<(value: string, path?: number[]) => void | undefined>(undefined);

  const triggerNodeContext = useRef<
    Record<string, any> & { text?: string; placeholder?: string }
  >(undefined);
  const {
    items: rawItems,
    dropdownRender,
    menu,
    dropdownStyle,
    notFoundContent,
  } = props.tagInputProps || {};

  // 注意：此处不能写成 `items = []` 默认值的解构形式。
  // 原因是 `[]` 字面量每次渲染都是新引用，会让下方 useEffect 的 [items]
  // 依赖永远变化，触发 setSelectedItems → re-render → 新 [] → 再次触发 ... 形成
  // 真实存在的死循环（jsdom 下被批处理掩盖，happy-dom 下直接表现为渲染卡死）。
  const items = rawItems ?? EMPTY_ITEMS;

  const [open, setOpen] = useMergedState(false, {
    value: props?.tagInputProps?.open,
    onChange: props?.tagInputProps?.onOpenChange,
  });

  const [loading, setLoading] = useState(false);

  // 用 ref 桥接 onSelectRef / setOpen，使 onClick 不依赖每次新建的闭包，
  // 从而让 selectedItems 仅在原始 items 数组真正变化时才重建。
  const buildMenuItems = (
    list: ReadonlyArray<{ key: string | number; label: string }>,
  ): SuggestionMenuItem[] =>
    list.map((item) => {
      const { key } = item || ({} as { key?: string | number });
      return {
        ...item,
        onClick: () => {
          setOpen(false);
          onSelectRef.current?.(`${key}` || '');
        },
      };
    });

  const [selectedItems, setSelectedItems] = useState<SuggestionMenuItem[]>(
    () => {
      if (typeof items === 'function') {
        return [];
      }
      return buildMenuItems(items);
    },
  );

  // 同步外部静态 items 数组的变化（非函数形式时）
  useEffect(() => {
    if (typeof items === 'function') {
      return;
    }
    setSelectedItems(buildMenuItems(items));
    // 只有 items 真正变化（含 EMPTY_ITEMS 这样稳定引用的兜底）时才重算。
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [items]);

  useEffect(() => {
    if (typeof items !== 'function') {
      return;
    }
    let cancelled = false;
    const loadingData = async () => {
      setLoading(true);
      try {
        const result = await items(triggerNodeContext.current!);
        if (cancelled) {
          return;
        }
        if (Array.isArray(result)) {
          setSelectedItems(
            result.map((item) => {
              const { key } = item || {};
              return {
                ...item,
                onClick: () => {
                  setOpen(false);
                  onSelectRef.current?.(`${key}` || '');
                },
              };
            }),
          );
        }
      } catch (error) {
        // 异步加载失败不应抛到全局 unhandled rejection；
        // 调用方可通过自身在 items 里 catch 来上报，这里只保证 UI 不卡在 loading。
        if (process.env.NODE_ENV !== 'production') {
          // eslint-disable-next-line no-console
          console.warn('[Suggestion] items() loading failed:', error);
        }
      } finally {
        if (!cancelled) {
          setLoading(false);
        }
      }
    };
    loadingData();
    return () => {
      cancelled = true;
    };
    // 依赖 items：函数引用变化（如外部 useCallback 更新依赖）时重新加载，避免拿到陈旧结果
  }, [open, items]);

  const dropdownRenderRender = useRefFunction(
    (defaultDropdownContent: React.ReactNode) => {
      if (dropdownRender) {
        return (
          <div
            style={{
              width: '100%',
              height: '100%',
            }}
            onKeyDown={(e) => {
              e.stopPropagation();
              e.preventDefault();
            }}
          >
            {loading ? (
              <Spin />
            ) : (
              dropdownRender(defaultDropdownContent, {
                ...props,
                ...triggerNodeContext.current,
                onSelect: (value: string, path?: number[]) => {
                  onSelectRef.current?.(`${value}` || '', path);
                  setOpen(false);
                },
              })
            )}
          </div>
        );
      } else if (menu! && items!) {
        return notFoundContent || '';
      } else {
        return defaultDropdownContent;
      }
    },
  );

  return (
    <SuggestionContext.Provider
      value={{
        open,
        setOpen,
        isRender: true,
        onSelectRef,
        triggerNodeContext,
      }}
    >
      <Dropdown
        open={open}
        autoFocus={true}
        trigger={['click']}
        overlayStyle={dropdownStyle}
        menu={
          menu
            ? menu
            : {
                items: selectedItems,
                onKeyDown: (e) => {
                  e.stopPropagation();
                  e.preventDefault();
                },
              }
        }
        forceRender
        destroyOnHidden={false}
        placement="top"
        onOpenChange={(isOpenChanged) => {
          if (isOpenChanged) return;
          setOpen(isOpenChanged);
        }}
        popupRender={dropdownRenderRender}
      >
        {props.children}
      </Dropdown>
    </SuggestionContext.Provider>
  );
};
