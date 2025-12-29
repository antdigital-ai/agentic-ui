/**
 * @fileoverview 语言选项配置工具
 * 生成用于语言选择器的选项数据
 * @author Code Plugin Team
 */

import React from 'react';
import { langIconMap } from '../langIconMap';

/**
 * 语言选择器的选项配置
 *
 * 功能：
 * - 从 langIconMap 生成选项数据
 * - 每个选项包含语言名称和对应图标
 * - 用于 Antd AutoComplete 组件
 *
 * 数据结构：
 * - value: 语言名称（字符串）
 * - label: React 元素，包含图标和语言名称
 *
 * @example
 * ```tsx
 * // 在 AutoComplete 中使用
 * <AutoComplete options={langOptions} />
 * ```
 */
export const langOptions = Array.from(langIconMap).map(([lang, Icon]) => {
  return {
    // 语言名称作为选项的值
    value: lang,
    // 渲染包含图标和文字的标签
    label: (
      <span style={{ display: 'flex', alignItems: 'center' }}>
        {/* 语言图标 */}
        <Icon size={'1em'} />
        {/* 语言名称，添加间距 */}
        <span style={{ marginLeft: '0.25em' }}>{lang}</span>
      </span>
    ),
  };
});
