import { PlayLottie } from '@ant-design/agentic-ui';
import { ChevronDown, Pause } from '@sofa-design/icons';
import { ConfigProvider, Dropdown, Flex, Tooltip } from 'antd';
import classNames from 'classnames';
import React, { useMemo, useState } from 'react';
import { useSpeechSynthesis } from '../../../Hooks/useSpeechSynthesis';
import VoicingLottie from '../../../Icons/animated/VoicingLottie';
import { useStyle } from './style';
import { UseSpeechAdapter } from './types';

export type {
  UseSpeechAdapter,
  UseSpeechSynthesisOptions,
  UseSpeechSynthesisResult,
} from './types';

export type VoiceButtonProps = {
  /** 朗读文本 */
  text: string;
  /** 初始倍速，默认 1 */
  defaultRate?: number;
  /** 可选倍速，默认 [1.5, 1.25, 1, 0.75] */
  rateOptions?: number[];
  /**
   * 外部语音适配器（可替换默认 Web Speech 实现）
   * - 提供后组件一律视为“支持语音播报”，按钮将可用
   * - 适配器需实现 start/stop/pause/resume 与倍速控制（必要时内部重启）
   */
  useSpeech?: UseSpeechAdapter;
};

export const VoiceButton: React.FC<VoiceButtonProps> = ({
  text,
  defaultRate = 1,
  rateOptions = [1.5, 1.25, 1, 0.75],
  useSpeech,
}) => {
  const configContext = React.useContext(ConfigProvider.ConfigContext);
  const prefixCls =
    configContext?.getPrefixCls(`agent-voice-button`) || 'agent-voice-button';
  const { wrapSSR, hashId } = useStyle(prefixCls);
  const [isPlayHover, setIsPlayHover] = useState<boolean>(false);
  const [isPlayingHovered, setIsPlayingHovered] = useState(false);

  // 首渲染冻结适配器，防止运行时切换导致 Hooks 调用顺序风险
  const speechAdapter = useMemo(() => useSpeech || useSpeechSynthesis, []);
  const { isSupported, isPlaying, rate, setRate, start, stop, pause, resume } =
    speechAdapter({
      text,
      defaultRate,
    });

  // 如果外部提供了自定义适配器，则视为一定可用，避免受浏览器 Web Speech 支持度影响
  const isFeatureSupported = useMemo(
    () => speechAdapter !== useSpeechSynthesis || isSupported,
    [speechAdapter, isSupported],
  );

  const handleClick = () => {
    if (!isFeatureSupported || !text) return;
    if (!isPlaying) {
      start();
      return;
    }
    stop();
  };

  const handleStop = () => {
    setIsPlayingHovered(false);
    setIsPlayHover(false);
    stop();
  };

  const handlePlayingMouseEnter = () => {
    setIsPlayingHovered(true);
    if (isPlaying) {
      pause();
    }
  };

  const handlePlayingMouseLeave = () => {
    setIsPlayingHovered(false);
    if (isPlaying) {
      resume();
    }
  };

  const tooltipText = useMemo(() => {
    if (!isFeatureSupported) return '当前环境不支持语音播报';
    return isPlaying ? '停止播报' : '语音播报';
  }, [isFeatureSupported, isPlaying]);

  const normalizedRateOptions = useMemo(() => {
    const set = new Set<number>([...rateOptions, 1]);
    return Array.from(set).sort((a, b) => b - a);
  }, [rateOptions]);

  const menuItems = useMemo(
    () =>
      normalizedRateOptions.map((r) => ({
        key: String(r),
        label: (
          <div className={classNames(`${prefixCls}-rateItem`, hashId)}>
            <span>{`${r}x`}</span>
            {r === rate ? <span>✓</span> : null}
          </div>
        ),
      })),
    [normalizedRateOptions, rate, prefixCls, hashId],
  );

  const rateDisplay = useMemo(() => `${rate}x`, [rate]);

  return wrapSSR(
    <div
      style={{
        display: 'flex',
        alignItems: 'center',
        gap: 8,
      }}
    >
      {!isPlaying ? (
        <div
          onMouseEnter={() => setIsPlayHover(true)}
          onMouseLeave={() => setIsPlayHover(false)}
          onClick={handleClick}
          className={classNames(`${prefixCls}-playBox`, hashId)}
          role="button"
          tabIndex={0}
          aria-label={'语音播报'}
          aria-disabled={!isFeatureSupported || !text}
        >
          <Tooltip title={tooltipText} mouseEnterDelay={0.1}>
            <Flex align="center" justify="center">
              <PlayLottie active={isPlayHover} />
            </Flex>
          </Tooltip>
        </div>
      ) : (
        <div className={classNames(`${prefixCls}-playingWrap`, hashId)}>
          <div
            className={classNames(`${prefixCls}-playingBox`, hashId)}
            onMouseEnter={handlePlayingMouseEnter}
            onMouseLeave={handlePlayingMouseLeave}
            onClick={handleStop}
            role="button"
            tabIndex={0}
            aria-label={'停止播报'}
          >
            <Tooltip title={tooltipText} mouseEnterDelay={0.1}>
              <Flex align="center" justify="center">
                {isPlayingHovered ? (
                  <Pause fontSize={14} />
                ) : (
                  <VoicingLottie size={16} />
                )}
              </Flex>
            </Tooltip>
          </div>
          <Dropdown
            trigger={['click']}
            menu={{
              items: menuItems,
              onClick: (info) => {
                const v = Number(info.key);
                if (!Number.isNaN(v)) setRate(v);
              },
            }}
          >
            <div className={classNames(`${prefixCls}-rateBox`, hashId)}>
              <span style={{ fontSize: 12 }}>
                {rate === 1 ? '倍速' : rateDisplay}
              </span>
              <ChevronDown fontSize={14} />
            </div>
          </Dropdown>
        </div>
      )}
    </div>,
  );
};

export default VoiceButton;
