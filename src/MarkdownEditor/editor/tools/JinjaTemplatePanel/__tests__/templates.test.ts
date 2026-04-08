import { describe, expect, it } from 'vitest';
import { cnLabels } from '../../../../../I18n';
import {
  getJinjaTemplateData,
  JINJA_DOC_LINK,
  JINJA_TEMPLATE_BASE,
  JINJA_TEMPLATE_DATA,
} from '../templates';

describe('JINJA_TEMPLATE_BASE', () => {
  it('has 5 built-in template items with id and template', () => {
    expect(JINJA_TEMPLATE_BASE).toHaveLength(5);
    const ids = [
      'variableInterpolation',
      'condition',
      'loop',
      'filter',
      'setVariable',
    ];
    JINJA_TEMPLATE_BASE.forEach((item, i) => {
      expect(item).toHaveProperty('id', ids[i]);
      expect(item).toHaveProperty('template');
      expect(typeof item.template).toBe('string');
      expect(item.template.length).toBeGreaterThan(0);
    });
  });
});

describe('getJinjaTemplateData', () => {
  it('returns 5 items with title, optional description, and template', () => {
    const data = getJinjaTemplateData(cnLabels);
    expect(data).toHaveLength(5);
    const titles = ['变量插值', '条件语句', '循环遍历', '过滤器', '设置变量'];
    data.forEach((item, i) => {
      expect(item).toHaveProperty('title', titles[i]);
      expect(item).toHaveProperty('template');
      expect(typeof item.template).toBe('string');
      expect(item.template.length).toBeGreaterThan(0);
    });
  });
});

describe('JINJA_TEMPLATE_DATA', () => {
  it('equals getJinjaTemplateData(cnLabels)', () => {
    expect(JINJA_TEMPLATE_DATA).toEqual(getJinjaTemplateData(cnLabels));
  });

  it('variable interpolation item has expected template', () => {
    const variable = JINJA_TEMPLATE_DATA.find((t) => t.title === '变量插值');
    expect(variable).toBeDefined();
    expect(variable!.template).toBe('{{ }}');
    expect(variable!.description).toBe('{{ variable }}');
  });
});

describe('JINJA_DOC_LINK', () => {
  it('is a non-empty URL string', () => {
    expect(typeof JINJA_DOC_LINK).toBe('string');
    expect(JINJA_DOC_LINK.length).toBeGreaterThan(0);
    expect(JINJA_DOC_LINK).toMatch(/^https?:\/\//);
  });
});
