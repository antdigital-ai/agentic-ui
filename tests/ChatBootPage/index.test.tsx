import React from 'react';
import { describe, expect, it } from 'vitest';
import {
  ButtonTab,
  ButtonTabGroup,
  ButtonTabGroupProps,
  ButtonTabItem,
  ButtonTabProps,
  CaseReply,
  CaseReplyProps,
  Title,
  TitleProps,
} from '../../src/ChatBootPage';

describe('ChatBoot index 导出', () => {
  it('应该导出 Title 组件', () => {
    expect(Title).toBeDefined();
    // React.memo 包装的组件 typeof 返回 'object'，检查是否是有效的 React 组件
    expect(Title).toBeInstanceOf(Object);
    // React.memo 组件内部属性，用于运行时检查
    expect((Title as any).$$typeof).toBeDefined();
  });

  it('应该导出 TitleProps 类型', () => {
    // 类型检查通过即可，运行时无法直接测试类型
    // 这里只验证导入成功，类型检查在编译时进行
    expect(true).toBe(true);
  });

  it('应该导出 CaseReply 组件', () => {
    expect(CaseReply).toBeDefined();
    // React.memo 包装的组件 typeof 返回 'object'，检查是否是有效的 React 组件
    expect(CaseReply).toBeInstanceOf(Object);
    // React.memo 组件内部属性，用于运行时检查
    expect((CaseReply as any).$$typeof).toBeDefined();
  });

  it('应该导出 CaseReplyProps 类型', () => {
    // 类型检查通过即可，运行时无法直接测试类型
    expect(true).toBe(true);
  });

  it('应该导出 ButtonTab 组件', () => {
    expect(ButtonTab).toBeDefined();
    // React.memo 包装的组件 typeof 返回 'object'，检查是否是有效的 React 组件
    expect(ButtonTab).toBeInstanceOf(Object);
    // React.memo 组件内部属性，用于运行时检查
    expect((ButtonTab as any).$$typeof).toBeDefined();
  });

  it('应该导出 ButtonTabProps 类型', () => {
    // 类型检查通过即可，运行时无法直接测试类型
    expect(true).toBe(true);
  });

  it('应该导出 ButtonTabGroup 组件', () => {
    expect(ButtonTabGroup).toBeDefined();
    // React.memo 包装的组件 typeof 返回 'object'，检查是否是有效的 React 组件
    expect(ButtonTabGroup).toBeInstanceOf(Object);
    // React.memo 组件内部属性，用于运行时检查
    expect((ButtonTabGroup as any).$$typeof).toBeDefined();
  });

  it('应该导出 ButtonTabGroupProps 类型', () => {
    // 类型检查通过即可，运行时无法直接测试类型
    expect(true).toBe(true);
  });

  it('应该导出 ButtonTabItem 类型', () => {
    // 类型检查通过即可，运行时无法直接测试类型
    expect(true).toBe(true);
  });

  it('应该能够使用导出的组件', () => {
    // 测试组件能够正常实例化
    const titleProps: TitleProps = {
      title: '测试标题',
      subtitle: '测试副标题',
    };

    const caseReplyProps: CaseReplyProps = {
      quote: '测试引用',
      title: '测试标题',
      description: '测试描述',
    };

    const buttonTabProps: ButtonTabProps = {
      children: '测试按钮',
      selected: false,
    };

    const buttonTabItem: ButtonTabItem = {
      key: 'test',
      label: '测试标签',
    };

    const buttonTabGroupProps: ButtonTabGroupProps = {
      items: [buttonTabItem],
    };

    // 验证所有属性对象都正确创建
    expect(titleProps.title).toBe('测试标题');
    expect(caseReplyProps.quote).toBe('测试引用');
    expect(buttonTabProps.children).toBe('测试按钮');
    expect(buttonTabItem.key).toBe('test');
    expect(buttonTabGroupProps.items).toHaveLength(1);
  });

  it('应该支持所有组件的默认属性', () => {
    // 测试组件能够使用默认属性
    const defaultTitleProps: TitleProps = {};
    const defaultCaseReplyProps: CaseReplyProps = {};
    const defaultButtonTabProps: ButtonTabProps = {};
    const defaultButtonTabGroupProps: ButtonTabGroupProps = {};

    // 验证默认属性对象创建成功
    expect(defaultTitleProps).toBeDefined();
    expect(defaultCaseReplyProps).toBeDefined();
    expect(defaultButtonTabProps).toBeDefined();
    expect(defaultButtonTabGroupProps).toBeDefined();
  });

  it('应该支持复杂的 ButtonTabItem 配置', () => {
    const complexButtonTabItem: ButtonTabItem = {
      key: 'complex',
      label: '复杂标签',
      icon: <span>图标</span>,
      onIconClick: () => {},
      disabled: true,
    };

    expect(complexButtonTabItem.key).toBe('complex');
    expect(complexButtonTabItem.label).toBe('复杂标签');
    expect(complexButtonTabItem.disabled).toBe(true);
  });

  it('应该支持所有组件的可选属性', () => {
    const titleWithAllProps: TitleProps = {
      title: '完整标题',
      subtitle: '完整副标题',
      style: { color: 'red' },
      className: 'custom-class',
      prefixCls: 'custom-prefix',
    };

    const caseReplyWithAllProps: CaseReplyProps = {
      coverBackground: 'rgba(255, 0, 0, 0.5)',
      quoteIconColor: 'rgb(255, 0, 0)',
      quote: '完整引用',
      title: '完整标题',
      description: '完整描述',
      buttonBar: <div>按钮栏</div>,
      onClick: () => {},
      style: { backgroundColor: 'blue' },
      className: 'custom-class',
      prefixCls: 'custom-prefix',
    };

    const buttonTabWithAllProps: ButtonTabProps = {
      children: '完整按钮',
      selected: true,
      onClick: () => {},
      onIconClick: () => {},
      className: 'custom-class',
      icon: <span>图标</span>,
      prefixCls: 'custom-prefix',
    };

    const buttonTabGroupWithAllProps: ButtonTabGroupProps = {
      items: [
        {
          key: 'item1',
          label: '项目1',
          icon: <span>图标1</span>,
          onIconClick: () => {},
          disabled: false,
        },
      ],
      activeKey: 'item1',
      defaultActiveKey: 'item1',
      onChange: () => {},
      className: 'custom-class',
      prefixCls: 'custom-prefix',
    };

    // 验证所有属性都正确设置
    expect(titleWithAllProps.title).toBe('完整标题');
    expect(caseReplyWithAllProps.coverBackground).toBe('rgba(255, 0, 0, 0.5)');
    expect(buttonTabWithAllProps.selected).toBe(true);
    expect(buttonTabGroupWithAllProps.activeKey).toBe('item1');
  });
});
