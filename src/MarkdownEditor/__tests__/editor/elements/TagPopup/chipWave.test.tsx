import { act, render, screen } from '@testing-library/react';
import React from 'react';
import { describe, expect, it, vi } from 'vitest';
import { ChipWave } from '../../../../editor/elements/TagPopup/ChipWave';
import {
  consumeTagChipWave,
  markTagChipWave,
  splitChipWaveText,
} from '../../../../editor/elements/TagPopup/chipWaveMotion';

describe('chipWaveMotion - 标记 / 认领存储', () => {
  const makeEditor = () => ({ id: 'editor' }) as any;

  it('mark 后 consume 命中一次，之后不再命中', () => {
    const editor = makeEditor();
    markTagChipWave(editor, '$optimize');

    expect(consumeTagChipWave(editor, '$optimize')).toBe(true);
    // 已消费：同文本、不同文本都不再命中
    expect(consumeTagChipWave(editor, '$optimize')).toBe(false);
    expect(consumeTagChipWave(editor, '$other')).toBe(false);
  });

  it('consume 前后空白被 trim，两侧语义一致', () => {
    const editor = makeEditor();
    markTagChipWave(editor, '$optimize ');
    expect(consumeTagChipWave(editor, ' $optimize ')).toBe(true);
  });

  it('不同 editor 实例的意图互相隔离（WeakMap）', () => {
    const editorA = makeEditor();
    const editorB = makeEditor();
    markTagChipWave(editorA, '$cmd');

    expect(consumeTagChipWave(editorB, '$cmd')).toBe(false);
    expect(consumeTagChipWave(editorA, '$cmd')).toBe(true);
  });

  it('空 / 纯空白文本不登记也不命中', () => {
    const editor = makeEditor();
    markTagChipWave(editor, '');
    markTagChipWave(editor, '   ');
    expect(consumeTagChipWave(editor, '')).toBe(false);
    expect(consumeTagChipWave(editor, undefined)).toBe(false);
  });
});

describe('splitChipWaveText - grapheme 拆分', () => {
  it('ASCII 文本逐字拆分并带步进序号', () => {
    expect(splitChipWaveText('abc')).toEqual([
      { text: 'a', step: 0 },
      { text: 'b', step: 1 },
      { text: 'c', step: 2 },
    ]);
  });

  it('中文按字拆分', () => {
    expect(splitChipWaveText('你好')).toEqual([
      { text: '你', step: 0 },
      { text: '好', step: 1 },
    ]);
  });

  it('空文本返回空数组', () => {
    expect(splitChipWaveText('')).toEqual([]);
  });

  it('emoji 不被拆碎（grapheme 簇）', () => {
    const chars = splitChipWaveText('👍');
    expect(chars).toHaveLength(1);
    expect(chars[0].text).toBe('👍');
  });
});

describe('ChipWave - 播放渲染', () => {
  it('未播放时透传 children', () => {
    const { container } = render(
      <ChipWave
        playing={false}
        text="abc"
        prefixCls="test"
        onFinished={() => {}}
      >
        <span data-testid="plain">plain</span>
      </ChipWave>,
    );
    expect(screen.getByTestId('plain')).toBeInTheDocument();
    expect(container.querySelector('[data-chip-wave]')).toBeNull();
  });

  it('播放时逐字渲染并注入 CSS 变量', () => {
    const { container } = render(
      <ChipWave playing={true} text="ab" prefixCls="test" onFinished={() => {}}>
        <span>ignored</span>
      </ChipWave>,
    );

    const wave = container.querySelector('[data-chip-wave="active"]');
    expect(wave).not.toBeNull();

    const chars = container.querySelectorAll('.test-chip-wave-char');
    expect(chars).toHaveLength(2);
    expect(chars[0]).toHaveTextContent('a');
    expect(chars[0].getAttribute('style')).toContain('--chip-wave-step: 0');
    expect(chars[1]).toHaveAttribute('data-chip-wave-last', 'true');
  });

  it('最后一个字符的 chipWave animationend 触发 onFinished', () => {
    const onFinished = vi.fn();
    const { container } = render(
      <ChipWave
        playing={true}
        text="ab"
        prefixCls="test"
        onFinished={onFinished}
      >
        <span>ignored</span>
      </ChipWave>,
    );

    const chars = container.querySelectorAll('.test-chip-wave-char');

    act(() => {
      // 非目标动画名：忽略
      chars[0].dispatchEvent(
        new AnimationEvent('animationend', {
          animationName: 'other',
          bubbles: true,
        }),
      );
    });
    expect(onFinished).not.toHaveBeenCalled();

    act(() => {
      // 目标动画名但非最后一个字符：忽略
      chars[0].dispatchEvent(
        new AnimationEvent('animationend', {
          animationName: 'chipWave',
          bubbles: true,
        }),
      );
    });
    expect(onFinished).not.toHaveBeenCalled();

    act(() => {
      // 最后一个字符的 chipWave 动画：触发
      chars[1].dispatchEvent(
        new AnimationEvent('animationend', {
          animationName: 'chipWave',
          bubbles: true,
        }),
      );
    });
    expect(onFinished).toHaveBeenCalledTimes(1);
  });
});
