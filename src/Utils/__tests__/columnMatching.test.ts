import { describe, expect, it } from 'vitest';
import {
  canResolveDocCardsTitleColumn,
  columnKeyMatchesConfiguredField,
  DOC_CARDS_FIELD_ALIASES,
  resolveChartAxisFieldToColumnKey,
  resolveDocCardsFields,
} from '../columnMatching';

describe('columnMatching', () => {
  describe('columnKeyMatchesConfiguredField', () => {
    it('精确相等命中', () => {
      expect(columnKeyMatchesConfiguredField('年份', '年份')).toBe(true);
    });

    it('全角与半角括号单位后缀视为同一逻辑列名', () => {
      expect(
        columnKeyMatchesConfiguredField('GDP总量（万亿元）', 'GDP总量'),
      ).toBe(true);
      expect(columnKeyMatchesConfiguredField('销量(万台)', '销量')).toBe(true);
    });

    it('多层括号后缀也命中', () => {
      expect(columnKeyMatchesConfiguredField('指标(A)(B)', '指标')).toBe(true);
    });

    it('「prefix 重合但非括号后缀」不命中', () => {
      expect(columnKeyMatchesConfiguredField('GDP总量估算', 'GDP总量')).toBe(
        false,
      );
    });

    it('空字符串与未传值不命中', () => {
      expect(columnKeyMatchesConfiguredField('', '年份')).toBe(false);
      expect(columnKeyMatchesConfiguredField('年份', '')).toBe(false);
      expect(columnKeyMatchesConfiguredField('   ', '年份')).toBe(false);
    });
  });

  describe('resolveChartAxisFieldToColumnKey', () => {
    it('短名命中带单位的列', () => {
      expect(
        resolveChartAxisFieldToColumnKey('GDP总量', [
          '年份',
          'GDP总量（万亿元）',
        ]),
      ).toBe('GDP总量（万亿元）');
    });

    it('精确相等优先', () => {
      expect(resolveChartAxisFieldToColumnKey('年份', ['年份'])).toBe('年份');
    });

    it('找不到时原样返回', () => {
      expect(resolveChartAxisFieldToColumnKey('未知', ['a', 'b'])).toBe('未知');
    });

    it('undefined / null / 空白透传', () => {
      expect(resolveChartAxisFieldToColumnKey(undefined, ['a'])).toBeUndefined();
      expect(resolveChartAxisFieldToColumnKey('   ', ['a'])).toBe('   ');
    });
  });

  describe('DOC_CARDS_FIELD_ALIASES', () => {
    it('包含 4 个语义字段', () => {
      expect(Object.keys(DOC_CARDS_FIELD_ALIASES).sort()).toEqual([
        'description',
        'tags',
        'title',
        'url',
      ]);
    });

    it('title 别名包含中英文常见写法', () => {
      expect(DOC_CARDS_FIELD_ALIASES.title).toContain('名称');
      expect(DOC_CARDS_FIELD_ALIASES.title).toContain('标题');
      expect(DOC_CARDS_FIELD_ALIASES.title).toContain('title');
    });
  });

  describe('resolveDocCardsFields', () => {
    it('全字段命中默认别名', () => {
      expect(
        resolveDocCardsFields(['名称', '地址', '简介', '亮点']),
      ).toEqual({
        title: '名称',
        url: '地址',
        description: '简介',
        tags: '亮点',
      });
    });

    it('fieldMap 优先于默认别名', () => {
      expect(
        resolveDocCardsFields(['Foo', '名称'], { title: 'Foo' })?.title,
      ).toBe('Foo');
    });

    it('命中带括号单位的列', () => {
      expect(
        resolveDocCardsFields(['名称（站点）', 'URL'])?.title,
      ).toBe('名称（站点）');
    });

    it('无主标题列时返回 null', () => {
      expect(resolveDocCardsFields(['col1', 'col2'])).toBeNull();
    });
  });

  describe('canResolveDocCardsTitleColumn', () => {
    it('命中默认别名时 true', () => {
      expect(canResolveDocCardsTitleColumn(['名称', 'col2'])).toBe(true);
      expect(canResolveDocCardsTitleColumn(['title'])).toBe(true);
    });

    it('override 命中（即便表头无默认别名）时 true', () => {
      expect(canResolveDocCardsTitleColumn(['Foo', 'Bar'], 'Foo')).toBe(true);
    });

    it('什么都不命中时 false', () => {
      expect(canResolveDocCardsTitleColumn(['col1', 'col2'])).toBe(false);
    });
  });
});
