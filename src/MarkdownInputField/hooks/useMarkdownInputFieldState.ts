import { useMergedState } from 'rc-util';
import React from 'react';
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

  const [value, setValue] = useMergedState('', {
    value: props.value,
    onChange: props.onChange,
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
