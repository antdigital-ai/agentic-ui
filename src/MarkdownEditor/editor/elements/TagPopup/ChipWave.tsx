import classNames from 'clsx';
import React from 'react';
import { splitChipWaveText } from './chipWaveMotion';

export interface ChipWaveProps {
  /** 是否处于播放态（由 TagPopup 在认领到插入意图后开启） */
  playing: boolean;
  /** chip 展示文本（含 `$` 触发前缀，波浪作用于整个 chip 文本） */
  text: string;
  prefixCls: string;
  /** 最后一个字符的动画结束回调，用于退出播放态 */
  onFinished: () => void;
  children: React.ReactNode;
}

/**
 * Tag chip 插入波浪动画渲染器（对齐 dtcoder-ide composer-chip-wave）。
 *
 * 纯展示组件：播放态由父级 TagPopup 控制 —— TagPopup 在 path 同步的
 * effect 中「认领」onSelect 登记的一次性插入意图，认领成功才开启播放，
 * rerender / StrictMode 双执行 / 后续路径漂移都不会重播。
 *
 * 播放形态：
 * - 文本按 grapheme 拆为逐字 span，CSS 变量 --chip-wave-step/count 控制
 *   逐字延迟（keyframes chipWave：上抛 → 下压 → 回位 + 双色渐变）
 * - 容器叠一层渐变扫光（keyframes chipSweep）
 * - 最后一个字的 animationend 冒泡到容器后回调 onFinished
 */
export function ChipWave({
  playing,
  text,
  prefixCls,
  onFinished,
  children,
}: ChipWaveProps) {
  if (!playing) return <>{children}</>;

  const chars = splitChipWaveText(text);

  return (
    <span
      className={classNames(`${prefixCls}-chip-wave`)}
      data-chip-wave="active"
      onAnimationEnd={(e) => {
        // 仅在最后一个字符的 chipWave 动画结束时退出播放态
        const target = e.target as HTMLElement;
        if (
          e.animationName === 'chipWave' &&
          target.dataset?.chipWaveLast === 'true'
        ) {
          onFinished();
        }
      }}
    >
      {chars.map((char) => (
        <span
          key={char.step}
          className={`${prefixCls}-chip-wave-char`}
          data-chip-wave-last={
            char.step === chars.length - 1 ? 'true' : undefined
          }
          style={
            {
              '--chip-wave-step': char.step,
              '--chip-wave-count': chars.length,
            } as React.CSSProperties
          }
        >
          {char.text}
        </span>
      ))}
    </span>
  );
}
