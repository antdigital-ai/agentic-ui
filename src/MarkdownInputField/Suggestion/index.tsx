import { Dropdown, Spin } from 'antd';
import { useMergedState } from 'rc-util';
import React, { useEffect, useRef, useState } from 'react';
import { useRefFunction } from '../../Hooks/useRefFunction';
import type { MarkdownEditorProps } from '../../MarkdownEditor';
import type { TagPopupProps } from '../../MarkdownEditor/editor/elements/TagPopup';

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
 * 建议面板状态的 React 上下文
 *
 * 该上下文用于管理建议面板（Suggestion）的显示状态，允许组件树中的任何组件访问或修改面板的开关状态。
 *
 * @interface
 * @property {boolean} [open] - 控制建议面板是否打开的状态
 * @property {function} [setOpen] - 设置建议面板开关状态的函数
 * @example
 * // 在消费组件中使用此上下文
 * const { open, setOpen } = useContext(SuggestionContext);
 * // 打开建议面板
 * setOpen?.(true);
 */
export const SuggestionContext = React.createContext<{
  open?: boolean;
  setOpen?: (open: boolean) => void;
  isRender: true;
  onSelectRef?: React.MutableRefObject<
    ((value: string) => void | undefined) | undefined
  >;
  triggerNodeContext?: React.MutableRefObject<
    | (TagPopupProps & {
        text?: string;
        placeholder?: string;
      })
    | undefined
  >;
}>({
  isRender: true,
});

/**
 * @deprecated 拼写错误的旧名，请使用 `SuggestionContext`。
 * 保留作为向后兼容别名，将在下一个大版本移除。
 */
export const SuggestionConnext = SuggestionContext;

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
  tagInputProps?: MarkdownEditorProps['tagInputProps'];
}> = (props) => {
  const onSelectRef =
    useRef<(value: string, path?: number[]) => void | undefined>(undefined);

  const triggerNodeContext = useRef<
    TagPopupProps & { text?: string; placeholder?: string }
  >(undefined);
  const {
    items = [],
    dropdownRender,
    menu,
    dropdownStyle,
    notFoundContent,
  } = props.tagInputProps || {};

  const [open, setOpen] = useMergedState(false, {
    value: props?.tagInputProps?.open,
    onChange: props?.tagInputProps?.onOpenChange,
  });

  const [loading, setLoading] = useState(false);
  const [selectedItems, setSelectedItems] = useState<SuggestionMenuItem[]>(
    () => {
      if (typeof items === 'function') {
        return [];
      }
      return items.map((item) => {
        const { key } = item || {};

        return {
          ...item,
          onClick: () => {
            setOpen(false);
            onSelectRef.current?.(`${key}` || '');
          },
        };
      });
    },
  );

  // 同步外部静态 items 数组的变化（非函数形式时）
  useEffect(() => {
    if (typeof items === 'function') {
      return;
    }
    setSelectedItems(
      items.map((item) => {
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
