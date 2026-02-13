import { describe, expect, it } from 'vitest';
import {
  JINJA_DOC_LINK,
  JINJA_TEMPLATE_DATA,
} from '../templates';

describe('JINJA_TEMPLATE_DATA', () => {
  it('has 5 built-in template items', () => {
    expect(JINJA_TEMPLATE_DATA).toHaveLength(5);
  });

  it('each item has title, optional description, and template', () => {
    const titles = [
      '变量插值',
      '条件语句',
      '循环遍历',
      '过滤器',
      '设置变量',
    ];
    JINJA_TEMPLATE_DATA.forEach((item, i) => {
      expect(item).toHaveProperty('title', titles[i]);
      expect(item).toHaveProperty('template');
      expect(typeof item.template).toBe('string');
      expect(item.template.length).toBeGreaterThan(0);
    });
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
