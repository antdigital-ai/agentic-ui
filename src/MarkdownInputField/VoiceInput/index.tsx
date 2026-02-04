import { Mic } from '@sofa-design/icons';
import { ConfigProvider, Tooltip } from 'antd';
import classNames from 'classnames';
import React, { useContext } from 'react';
import { ErrorBoundary } from 'react-error-boundary';
import { I18nContext } from '../../I18n';
import VoicingLottie from '../../Icons/animated/VoicingLottie';
import { useStyle } from './style';

export type VoiceRecognizer = {
  start: () => Promise<void>;
  stop: () => Promise<void>;
};

export type CreateRecognizer = (handlers: {
  // 标识句子开始，内容为空
  onSentenceBegin: () => void;
  // 中间结果 比如语音输入 123，这个函数被调用三次，分别输入 1, 12, 123
  onPartial: (text: string) => void;
  // 句子结束 比如语音输入 123, 输入 123
  onSentenceEnd: (text: string) => void;
  onError?: (error: unknown) => void;
}) => Promise<VoiceRecognizer>;

type VoiceInputButtonProps = {
  recording: boolean;
  disabled?: boolean;
  onStart: () => Promise<void>;
  onStop: () => Promise<void>;
  style?: React.CSSProperties;
  title?: React.ReactNode;
};

/**
 * 语音输入按钮。
 * - recording=false：未开始
 * - recording=true：录音中
 * 外部通过 `createRecognizer` 提供语音识别实现。
 */
export const VoiceInputButton: React.FC<VoiceInputButtonProps> = (props) => {
  const { recording, disabled, onStart, onStop, style } = props;
  const { getPrefixCls } = useContext(ConfigProvider.ConfigContext);
  const baseCls = getPrefixCls('agentic-md-input-field-voice-button');
  const { wrapSSR, hashId } = useStyle(baseCls);
  const dom = props.title ? (
    <div
      style={{
        display: 'flex',
        alignItems: 'center',
        gap: 4,
      }}
    >
      {recording ? <VoicingLottie size={16} /> : <Mic />}
      <div
        style={{
          font: 'var(--font-text-body-base)',
          letterSpacing: 'var(--letter-spacing-body-base, normal)',
          color: 'var(--color-gray-text-default)',
        }}
      >
        {props.title}
      </div>
    </div>
  ) : recording ? (
    <VoicingLottie size={16} />
  ) : (
    <Mic />
  );

  const { locale } = useContext(I18nContext);

  return wrapSSR(
    <Tooltip
      mouseEnterDelay={1}
      arrow={false}
      title={
        recording
          ? locale?.['input.voiceInputting'] || '语音输入中，点击可停止。'
          : locale?.['input.voiceInput'] || '语音输入'
      }
    >
      <div
        data-testid="voice-input-button"
        role="button"
        aria-pressed={recording}
        className={classNames(baseCls, hashId, {
          [`${baseCls}-disabled`]: disabled,
          [`${baseCls}-recording`]: recording,
        })}
        style={style}
        onClick={async () => {
          if (disabled) return;
          if (recording) {
            await onStop();
          } else {
            await onStart();
          }
        }}
      >
        <ErrorBoundary fallback={<div />}>{dom}</ErrorBoundary>
      </div>
    </Tooltip>,
  );
};

export default VoiceInputButton;
