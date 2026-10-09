import type { BaseEditor } from 'slate';
import type { ReactEditor } from 'slate-react';

/**
 * Tag chip 插入波浪动画的「标记 / 认领」存储。
 *
 * 对齐 dtcoder-ide 的 composerChipShimmer：动画意图是纯呈现层状态，
 * 只存在于内存（绝不序列化进文档），且一次插入只播一轮 ——
 * rerender、StrictMode 双挂载、卸载重挂都不会重播。
 *
 * key 使用 chip 最终文本而非 Slate path：onSelect 插入零宽空格后，
 * TagPopup 的 DOM ref 可能仍解析到旧位置（零宽空格 leaf），path 会漂移；
 * 而插入的 chip 文本是确定的身份标识，不受 DOM↔Slate 映射影响。
 */
const pendingChipWaves = new WeakMap<BaseEditor, Set<string>>();

/**
 * 在 chip 插入完成后登记待播放动画。
 *
 * 调用时机：onSelect 主 transform（删旧文、插新文、置 tag/code mark、
 * 插入前置零宽空格）之后，`newText` 即 chip 的最终完整文本
 * （如 `$optimize`，含触发前缀）。
 */
export function markTagChipWave(editor: BaseEditor, chipText: string): void {
  const text = chipText?.trim();
  if (!text) return;
  let pending = pendingChipWaves.get(editor);
  if (!pending) {
    pending = new Set();
    pendingChipWaves.set(editor, pending);
  }
  pending.add(text);
}

/**
 * TagPopup 在 chip 文本同步到位后认领一次；命中即播放，未命中（已播过/
 * 无动画意图）返回 false。同文本只播一轮，由 Set.delete 一次性消费保证。
 */
export function consumeTagChipWave(
  editor: BaseEditor & ReactEditor,
  chipText: string | undefined,
): boolean {
  const text = chipText?.trim();
  if (!text) return false;
  const pending = pendingChipWaves.get(editor);
  if (!pending) return false;
  return pending.delete(text);
}

export interface ChipWaveChar {
  text: string;
  step: number;
}

/**
 * 按 grapheme 拆分 chip 文本，供逐字波浪渲染。
 *
 * Intl.Segmenter 正确处理 CJK、emoji（ZWJ 序列、旗帜）等组合字符，
 * 环境不支持时回退 Array.from（按 code point 拆，emoji 可能多拆但不报错）。
 */
export function splitChipWaveText(text: string): ChipWaveChar[] {
  const chars =
    typeof Intl !== 'undefined' && 'Segmenter' in Intl
      ? Array.from(
          new Intl.Segmenter(undefined, { granularity: 'grapheme' }).segment(
            text,
          ),
          (s) => s.segment,
        )
      : Array.from(text);
  return chars.map((t, step) => ({ text: t, step }));
}

/** 系统减弱动态效果偏好下不播放（对齐 dtcoder-ide 的 reduce 分支） */
export function prefersReducedMotion(): boolean {
  if (typeof window === 'undefined' || !window.matchMedia) return false;
  return window.matchMedia('(prefers-reduced-motion: reduce)').matches;
}
