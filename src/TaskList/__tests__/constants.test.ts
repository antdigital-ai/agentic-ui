import React from 'react';
import { describe, expect, it } from 'vitest';
import {
  getArrowRotation,
  getTaskStatusStyleKey,
  hasTaskContent,
  isTaskInProgress,
} from '../constants';

describe('TaskList constants', () => {
  it('isTaskInProgress 合并 pending 与 loading', () => {
    expect(isTaskInProgress('loading')).toBe(true);
    expect(isTaskInProgress('pending')).toBe(true);
    expect(isTaskInProgress('success')).toBe(false);
    expect(isTaskInProgress('error')).toBe(false);
  });

  it('getTaskStatusStyleKey 将进行中态映射为 loading 样式类', () => {
    expect(getTaskStatusStyleKey('pending')).toBe('loading');
    expect(getTaskStatusStyleKey('loading')).toBe('loading');
    expect(getTaskStatusStyleKey('success')).toBe('success');
    expect(getTaskStatusStyleKey('error')).toBe('error');
  });

  it('getArrowRotation collapsed 分支', () => {
    expect(getArrowRotation(true).transform).toBe('rotate(0deg)');
    expect(getArrowRotation(false).transform).toBe('rotate(180deg)');
  });

  it('hasTaskContent 数组与单节点', () => {
    expect(hasTaskContent([])).toBe(false);
    expect(hasTaskContent(['a'])).toBe(true);
    expect(hasTaskContent(null)).toBe(false);
    expect(hasTaskContent('')).toBe(false);
    expect(hasTaskContent(0)).toBe(false);
    expect(hasTaskContent(React.createElement('span'))).toBe(true);
  });
});
