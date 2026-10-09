import { useMergedState } from 'rc-util';
import React from 'react';
import { useRefFunction } from '../../Hooks/useRefFunction';
import type { AttachmentFile } from '../AttachmentButton/types';
import type { MarkdownInputFieldProps } from '../types/MarkdownInputFieldProps';

/**
 * 状态管理 Hook
 * 管理 MarkdownInputField 组件的基础状态
 */
export const useMarkdownInputFieldState = (
  props: Pick<MarkdownInputFieldProps, 'value' | 'onChange' | 'attachment'>,
) => {
  const [isHover, setHover] = React.useState(false);
  const [isLoading, setIsLoading] = React.useState(false);
  const [isEnlarged, setIsEnlarged] = React.useState(false);

  const lastValueRef = React.useRef(props.value ?? '');
  const lastRequestedValueRef = React.useRef(props.value ?? '');
  const wasControlledRef = React.useRef(props.value !== undefined);
  // 通知统一走 setValue（单参数、去重）；useMergedState 的 onChange 回调
  // 会带 prevValue 第二参且受控/非受控触发时机不同，直接复用会造成双重通知。
  const [value, triggerValueChange] = useMergedState('', {
    value: props.value,
    postState: (nextValue) =>
      props.value === undefined && wasControlledRef.current
        ? lastValueRef.current
        : (nextValue ?? lastValueRef.current),
  });
  React.useLayoutEffect(() => {
    lastValueRef.current = value;
  }, [value]);
  React.useLayoutEffect(() => {
    wasControlledRef.current = props.value !== undefined;
    if (props.value !== undefined) {
      lastRequestedValueRef.current = props.value;
    }
  }, [props.value]);
  const setValue = useRefFunction((nextValue: string) => {
    // Programmatic changes can also arrive through Slate's debounced onChange.
    // Deduplicate before useMergedState queues its asynchronous notification.
    if (lastRequestedValueRef.current === nextValue) return;
    lastRequestedValueRef.current = nextValue;
    triggerValueChange(nextValue);
    props.onChange?.(nextValue);
  });

  const [fileMap, setFileMap] = useMergedState<
    Map<string, AttachmentFile> | undefined
  >(undefined, {
    value: props.attachment?.fileMap,
    onChange: props.attachment?.onFileMapChange,
  });

  return {
    isHover,
    setHover,
    isLoading,
    setIsLoading,
    isEnlarged,
    setIsEnlarged,
    value,
    setValue,
    fileMap,
    setFileMap,
  };
};
