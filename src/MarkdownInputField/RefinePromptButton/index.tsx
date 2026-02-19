import { LoadingOutlined } from '@ant-design/icons';
import { TextOptimize } from '@sofa-design/icons';
import { ConfigProvider, Tooltip } from 'antd';
import React, { useContext } from 'react';
import { ErrorBoundary } from 'react-error-boundary';
import { ActionIconBox } from '../../Components/ActionIconBox';
import { isBrowserEnv } from './env';
import { useStyle } from './style';
type RefinePromptButtonProps = {
  isHover: boolean;
  status: 'idle' | 'loading';
  onRefine: () => void;
  style?: React.CSSProperties;
  compact?: boolean;
  disabled?: boolean;
};

export const RefinePromptButton: React.FC<RefinePromptButtonProps> = (
  props,
) => {
  const { disabled, status, onRefine } = props;
  const { getPrefixCls } = useContext(ConfigProvider.ConfigContext);
  const baseCls = getPrefixCls('agentic-md-input-field-refine-button');
  const { wrapSSR } = useStyle(baseCls);

  const handleClick = () => {
    if (disabled) return;
    if (status === 'loading') return;
    onRefine();
  };

  const renderIcon = () => {
    if (status === 'loading') return <LoadingOutlined />;
    return <TextOptimize />;
  };

  if (!isBrowserEnv()) {
    return null;
  }

  return wrapSSR(
    <Tooltip title={status === 'loading' ? '优化中' : '一键优化提示词'}>
      <ActionIconBox
        title={'优化提示词'}
        onClick={handleClick}
        data-testid="refine-prompt-button"
      >
        <ErrorBoundary fallback={<div />}>{renderIcon()}</ErrorBoundary>
      </ActionIconBox>
    </Tooltip>,
  );
};
