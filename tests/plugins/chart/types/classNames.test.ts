import { describe, expect, it } from 'vitest';
import type {
  ChartClassNames,
  ChartStyles,
  ClassNameType,
} from '../../../../src/Plugins/chart/types/classNames';

describe('ChartClassNames 类型', () => {
  it('应该支持所有层级的类名', () => {
    const classNames: ChartClassNames = {
      root: 'root-class',
      toolbar: 'toolbar-class',
      statisticContainer: 'statistic-class',
      filter: 'filter-class',
      wrapper: 'wrapper-class',
      chart: 'chart-class',
    };

    expect(classNames.root).toBe('root-class');
    expect(classNames.toolbar).toBe('toolbar-class');
    expect(classNames.statisticContainer).toBe('statistic-class');
    expect(classNames.filter).toBe('filter-class');
    expect(classNames.wrapper).toBe('wrapper-class');
    expect(classNames.chart).toBe('chart-class');
  });

  it('应该支持字符串数组格式的类名', () => {
    const classNames: ChartClassNames = {
      root: ['class1', 'class2', 'class3'],
      toolbar: ['toolbar1', 'toolbar2'],
    };

    expect(classNames.root).toEqual(['class1', 'class2', 'class3']);
    expect(classNames.toolbar).toEqual(['toolbar1', 'toolbar2']);
  });

  it('应该支持对象格式的类名（条件类名）', () => {
    const classNames: ChartClassNames = {
      root: {
        'active': true,
        'disabled': false,
        'highlight': true,
      },
      toolbar: {
        'toolbar-active': true,
        'toolbar-disabled': false,
      },
    };

    expect(classNames.root).toEqual({
      'active': true,
      'disabled': false,
      'highlight': true,
    });
    expect(classNames.toolbar).toEqual({
      'toolbar-active': true,
      'toolbar-disabled': false,
    });
  });

  it('应该支持部分层级为 undefined', () => {
    const classNames: ChartClassNames = {
      root: 'root-class',
      toolbar: undefined,
      statisticContainer: 'statistic-class',
    };

    expect(classNames.root).toBe('root-class');
    expect(classNames.toolbar).toBeUndefined();
    expect(classNames.statisticContainer).toBe('statistic-class');
  });

  it('应该支持所有层级都为 undefined', () => {
    const classNames: ChartClassNames = {};

    expect(classNames.root).toBeUndefined();
    expect(classNames.toolbar).toBeUndefined();
    expect(classNames.statisticContainer).toBeUndefined();
  });
});

describe('ChartStyles 类型', () => {
  it('应该支持所有层级的样式', () => {
    const styles: ChartStyles = {
      root: { width: '100px', height: '200px' },
      toolbar: { padding: '10px' },
      statisticContainer: { display: 'flex' },
      filter: { marginBottom: '10px' },
      wrapper: { marginTop: '20px' },
      chart: { minHeight: '300px' },
    };

    expect(styles.root).toEqual({ width: '100px', height: '200px' });
    expect(styles.toolbar).toEqual({ padding: '10px' });
    expect(styles.statisticContainer).toEqual({ display: 'flex' });
    expect(styles.filter).toEqual({ marginBottom: '10px' });
    expect(styles.wrapper).toEqual({ marginTop: '20px' });
    expect(styles.chart).toEqual({ minHeight: '300px' });
  });

  it('应该支持部分层级为 undefined', () => {
    const styles: ChartStyles = {
      root: { width: '100px' },
      toolbar: undefined,
      statisticContainer: { display: 'flex' },
    };

    expect(styles.root).toEqual({ width: '100px' });
    expect(styles.toolbar).toBeUndefined();
    expect(styles.statisticContainer).toEqual({ display: 'flex' });
  });

  it('应该支持所有层级都为 undefined', () => {
    const styles: ChartStyles = {};

    expect(styles.root).toBeUndefined();
    expect(styles.toolbar).toBeUndefined();
    expect(styles.statisticContainer).toBeUndefined();
  });
});

describe('ClassNameType 类型', () => {
  it('应该支持字符串格式', () => {
    const className: ClassNameType = 'my-class';
    expect(className).toBe('my-class');
  });

  it('应该支持字符串数组格式', () => {
    const className: ClassNameType = ['class1', 'class2', 'class3'];
    expect(className).toEqual(['class1', 'class2', 'class3']);
  });

  it('应该支持对象格式（条件类名）', () => {
    const className: ClassNameType = {
      'active': true,
      'disabled': false,
      'highlight': true,
    };
    expect(className).toEqual({
      'active': true,
      'disabled': false,
      'highlight': true,
    });
  });
});

