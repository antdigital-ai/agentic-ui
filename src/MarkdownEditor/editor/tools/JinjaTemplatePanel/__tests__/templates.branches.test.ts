/**
 * Jinja templates：locale 缺失时 title ?? id、description ?? undefined。
 */
import { describe, expect, it } from 'vitest';
import type { LocalKeys } from '../../../../../I18n';
import { getJinjaTemplateData } from '../templates';

describe('getJinjaTemplateData branches', () => {
  it('空 locale 时 title 回退为 id，description 为 undefined', () => {
    const data = getJinjaTemplateData({} as LocalKeys);
    expect(data).toHaveLength(5);
    expect(data[0].title).toBe('variableInterpolation');
    expect(data[0].description).toBeUndefined();
    expect(data[1].title).toBe('condition');
  });

  it('仅有 title 时 description 仍为 undefined', () => {
    const locale = {
      'jinja.template.filter.title': '过滤器标题',
    } as unknown as LocalKeys;
    const data = getJinjaTemplateData(locale);
    const filter = data.find((d) => d.template === '{{  | }}');
    expect(filter?.title).toBe('过滤器标题');
    expect(filter?.description).toBeUndefined();
  });
});
