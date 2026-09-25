/**
 * textSwapMotion 分支：默认 easing 与自定义 easing。
 */
import { describe, expect, it } from 'vitest';
import { TEXT_SWAP_EASING } from '../constants';
import {
  TEXT_SWAP_ENTER_KEYFRAME_NAME,
  textSwapEnterAnimationBoth,
  textSwapEnterAnimationForwards,
  textSwapEnterKeyframes,
} from '../textSwapMotion';

describe('textSwapMotion branches', () => {
  it('forwards 默认 easing', () => {
    expect(textSwapEnterAnimationForwards(200)).toBe(
      `${TEXT_SWAP_ENTER_KEYFRAME_NAME} 200ms ${TEXT_SWAP_EASING} forwards`,
    );
  });

  it('forwards 自定义 easing', () => {
    expect(textSwapEnterAnimationForwards(120, 'linear')).toContain(
      '120ms linear forwards',
    );
  });

  it('both 默认与自定义 easing', () => {
    expect(textSwapEnterAnimationBoth(80)).toContain(
      `${TEXT_SWAP_EASING} both`,
    );
    expect(textSwapEnterAnimationBoth(80, 'ease-in')).toBe(
      `${TEXT_SWAP_ENTER_KEYFRAME_NAME} 80ms ease-in both`,
    );
  });

  it('keyframes 导出包含入口名', () => {
    expect(
      textSwapEnterKeyframes[`@keyframes ${TEXT_SWAP_ENTER_KEYFRAME_NAME}`],
    ).toBeTruthy();
  });
});
