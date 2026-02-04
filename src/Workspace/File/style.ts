import type { ChatTokenType, GenerateStyle } from '../../Hooks/useStyle';
import { useEditorStyleRegister } from '../../Hooks/useStyle';

const genStyle: GenerateStyle<ChatTokenType> = (token) => {
  return {
    // 定位高亮动画关键帧
    '@keyframes flash-shadow': {
      '0%,100%': {
        boxShadow:
          '-5.23px -3.23px 12px 0 rgba(229, 255, 115, 40%), 4.23px 5.23px 16px 0 rgba(0, 206, 255, 24.12%)',
      },

      '50%': {
        boxShadow: 'none',
      },
    },

    // 文件组件样式
    [`${token.componentCls}-container`]: {
      height: '100%',
      display: 'flex',
      flexDirection: 'column',

      // 分组展示模式
      [`&--group`]: {
        [`${token.componentCls}-group`]: {
          // 分组标题栏
          [`&-header`]: {
            display: 'flex',
            alignItems: 'center',
            justifyContent: 'space-between',
            height: '40px',
            padding: '8px 0',
            cursor: 'pointer',
            transition: 'all 0.2s cubic-bezier(0.645, 0.045, 0.355, 1)',

            [`&-left, &-right`]: {
              display: 'flex',
              alignItems: 'center',
              gap: '8px',
            },
          },

          // 展开收起图标
          [`&-toggle-icon`]: {
            fontSize: 'var(--font-size-sm)',
            color: '#6c757d',
            transition: 'transform 0.2s ease',
          },

          // 文件类型图标
          [`&-type-icon`]: {
            display: 'flex',
            alignItems: 'center',

            svg: {
              width: '16px',
              height: '16px',
            },
          },

          // 文件类型名称
          [`&-type-name`]: {
            maxWidth: '200px',
            overflow: 'hidden',
            textOverflow: 'ellipsis',
            whiteSpace: 'nowrap',
            fontSize: 'var(--font-size-base)',
            fontWeight: 500,
            color: 'var(--color-gray-text-default)',
            font: 'var(--font-text-paragraph-base)',
            letterSpacing: 'var(--letter-spacing-paragraph-base, normal)',
          },

          // 文件数量
          [`&-count`]: {
            boxSizing: 'border-box',
            color: 'var(--color-gray-text-secondary)',
            font: 'var(--font-text-number-xs)',
            letterSpacing: 'var(--letter-spacing-number-xs, normal)',
            backgroundColor: 'var(--color-gray-control-fill-active)',
            padding: '4px 6px',
            borderRadius: '200px',
            minWidth: '20px',
            height: '20px',
            display: 'flex',
            alignItems: 'center',
            justifyContent: 'center',
          },
          [`&-action-btn`]: {
            cursor: 'pointer',
            transition: 'all 0.2s cubic-bezier(0.645, 0.045, 0.355, 1)',
          },
          // 分组内容区域
          [`&-content`]: {
            paddingLeft: '12px',
          },
        },
      },
    },

    // 文件项样式
    [`${token.componentCls}-item`]: {
      display: 'flex',
      alignItems: 'center',
      gap: '4px',
      marginBottom: '4px',
      padding: '4px',
      borderRadius: 'var(--radius-control-base)',
      cursor: 'pointer',
      transition: 'all 0.2s cubic-bezier(0.645, 0.045, 0.355, 1)',
      boxSizing: 'border-box',

      // 定位高亮动画
      '&:target': {
        animationName: 'flash-shadow',
        animationDuration: '3s',
        animationTimingFunction: 'ease-in-out',
        animationIterationCount: 1,
      },

      '&:last-child': {
        marginBottom: 0,
      },

      '&:hover': {
        background: 'var(--color-gray-control-fill-hover)',

        // 鼠标悬浮时显示操作区
        [`${token.componentCls}-item-actions`]: {
          opacity: 1,
          visibility: 'visible',
          pointerEvents: 'auto',
        },
      },

      // 键盘聚焦时也显示操作区，提升可访问性
      '&:focus-within': {
        [`${token.componentCls}-item-actions`]: {
          opacity: 1,
          visibility: 'visible',
          pointerEvents: 'auto',
        },
      },

      // 文件图标
      [`&-icon`]: {
        display: 'flex',
        alignItems: 'center',
        flexShrink: 0,

        svg: {
          width: '40px',
          height: '40px',
        },
      },

      // 文件信息
      [`&-info`]: {
        flex: 1,
        minWidth: 0,
      },

      // 文件名
      [`&-name`]: {
        fontSize: '13px',
        color: '#343a40',
        fontWeight: 400,
        lineHeight: 1.4,
        wordBreak: 'break-all',
      },

      // 文件详情容器
      [`&-details`]: {
        display: 'flex',
        alignItems: 'center',
        flexWrap: 'wrap',
      },

      // 文件类型、大小、时间
      [`&-type, &-size, &-time`]: {
        font: 'var(--font-text-body-sm)',
        color: 'var(--color-gray-text-light)',
        letterSpacing: 'var(--letter-spacing-body-sm, normal)',
      },

      // 禁用状态
      [`&-disabled`]: {
        cursor: 'not-allowed',
        opacity: 0.5,

        '&:hover': {
          background: 'transparent',
        },
      },

      // 分割符
      [`&-separator`]: {
        fontSize: 'var(--font-size-xs)',
        color: 'rgba(20, 22, 28, 0.07)',
        margin: '0 4px',
      },

      [`&-actions`]: {
        display: 'flex',
        alignItems: 'center',
        gap: '4px',
        // 默认隐藏，仅在 hover/focus 时显示
        opacity: 0,
        visibility: 'hidden',
        pointerEvents: 'none',
        transition: 'opacity 0.2s ease, visibility 0.2s ease',

        // 保持图标按钮颜色一致
        [`.ant-btn, .ant-btn .anticon`]: {
          color: 'var(--color-gray-text-light)',
        },
        [`.ant-btn:hover, .ant-btn:focus, .ant-btn:active, .ant-btn:hover .anticon, .ant-btn:focus .anticon, .ant-btn:active .anticon`]:
          {
            color: 'var(--color-gray-text-light)',
          },
      },

      // 文件项动作按钮（预览/下载等）图标颜色保持一致
      [`&-action-btn`]: {
        [`.anticon`]: {
          color: 'var(--color-gray-text-light)',
        },
        ['&:hover .anticon, &:focus .anticon, &:active .anticon']: {
          color: 'var(--color-gray-text-light)',
        },
      },
    },

    // 空状态
    [`${token.componentCls}-empty`]: {
      display: 'flex',
      alignItems: 'center',
      justifyContent: 'center',
      textAlign: 'center',
      padding: 24,
      minHeight: 200,
      flex: 1,
      // 让空状态在有搜索栏等头部时也能占据剩余空间
    },

    // 预览组件样式
    [`${token.componentCls}-preview`]: {
      display: 'flex',
      flexDirection: 'column',
      height: '100%',
      marginLeft: '-12px',
      marginRight: '-12px',
      background: '#fff',
      position: 'relative',

      // 预览头部
      [`&-header`]: {
        display: 'flex',
        alignItems: 'center',
        gap: '4px',
        padding: '8px 12px',
        borderBottom: '1px solid rgba(20, 22, 28, 0.07)',
        background: '#fff',
        flexShrink: 0,
        position: 'sticky',
        top: 0,
        zIndex: 10,
      },

      // 返回按钮
      [`&-back-button`]: {
        display: 'flex',
        alignItems: 'center',
        justifyContent: 'center',
        width: '32px',
        height: '32px',
        border: 'none',
        background: 'none',
        cursor: 'pointer',
        color: '#767e8b',
        transition: 'all 0.2s cubic-bezier(0.645, 0.045, 0.355, 1)',
        borderRadius: '4px',

        '&:hover': {
          background: '#f0f0f0',
        },
      },

      // 返回图标
      [`&-back-icon`]: {
        fontSize: 'var(--font-size-xl)',
      },

      // 文件信息容器
      [`&-file-info`]: {
        flex: 1,
        display: 'flex',
        flexDirection: 'column',
        gap: '4px',
      },

      // 文件标题行
      [`&-file-title`]: {
        display: 'flex',
        alignItems: 'center',
        gap: '4px',
      },

      // 文件图标
      [`&-file-icon`]: {
        display: 'flex',
        alignItems: 'center',

        svg: {
          width: '20px',
          height: '20px',
        },
      },

      // 文件名
      [`&-file-name`]: {
        color: 'var(--color-gray-text-default)',
        font: 'var(--font-text-body-emphasized-sm)',
        letterSpacing: 'var(--letter-spacing-body-emphasized-sm, normal)',
      },

      // 生成时间
      [`&-generate-time`]: {
        fontSize: '12px',
        color: '#767e8b',
      },

      // 操作按钮容器
      [`&-actions`]: {
        display: 'flex',
        alignItems: 'center',
        gap: '8px',

        // 保持预览头部操作按钮的图标颜色一致
        [`.ant-btn, .ant-btn .anticon`]: {
          color: '#767E8B',
        },
        [`.ant-btn:hover, .ant-btn:focus, .ant-btn:active, .ant-btn:hover .anticon, .ant-btn:focus .anticon, .ant-btn:active .anticon`]:
          {
            color: '#767E8B',
          },
      },

      // 预览内容区域
      [`&-content`]: {
        flex: 1,
        display: 'flex',
        flexDirection: 'column',
        overflow: 'auto',
        minHeight: 0, // 确保 flex 子项可以收缩
        padding: '16px',
      },
      '&-content-loading': {
        padding: '0 12px',
        flex: 1,
        position: 'relative',
        display: 'flex',
        flexDirection: 'column',
        overflow: 'hidden',
        justifyContent: 'center',
        alignItems: 'center',
        '&-tip': {
          font: 'var(--font-text-h6-base)',

          color: 'var(--color-gray-text-secondary)',
          display: 'flex',
          gap: 8,
          width: '100%',
          maxWidth: 419,
        },
        '&-inner': {
          position: 'relative',
          height: 'auto',
          maxWidth: 419,
          maxHeight: '200px',
          marginTop: 12,
          font: 'var(--font-text-code-base)',
          color: 'var(--color-gray-text-secondary)',
          letterSpacing: 'var(--letter-spacing-code-base, normal)',
          overflow: 'hidden',
          display: 'flex',
          alignItems: 'flex-end',
          // 渐变遮罩效果
          '&::before': {
            content: '""',
            position: 'absolute',
            top: 0,
            left: 0,
            height: 48,
            right: 0,
            background:
              'linear-gradient(to bottom, rgba(255, 255, 255, 1) 0%, rgba(255, 255, 255, 0.4) 50%, rgba(255, 255, 255, 0) 100%)',
            zIndex: 1,
            pointerEvents: 'none',
          },
          '&::after': {
            content: '""',
            position: 'absolute',
            bottom: 0,
            left: 0,
            height: 48,
            right: 0,
            background:
              'linear-gradient(to top, rgba(255, 255, 255, 1) 0%, rgba(255, 255, 255, 0.4) 50%, rgba(255, 255, 255, 0) 100%)',
            zIndex: 1,
            pointerEvents: 'none',
          },
        },
      },

      // iframe 预览
      [`&-iframe`]: {
        width: '100%',
        height: '100%',
        border: 'none',
        flex: 1,
      },

      // 占位符
      [`&-placeholder`]: {
        flex: 1,
        display: 'flex',
        alignItems: 'center',
        justifyContent: 'center',
        background: 'var(--color-gray-bg-card-white)',
      },

      // 占位符内容
      [`&-placeholder-content`]: {
        textAlign: 'center',
        color: '#8c8c8c',

        p: {
          margin: '8px 0',
          fontSize: '13px',
        },
      },
      // 不可预览占位容器
      [`&-unsupported`]: {
        display: 'flex',
        flexDirection: 'column',
        alignItems: 'center',
        justifyContent: 'center',
        gap: 12,
        height: '100%',
        minHeight: '500px',
      },
      [`&-unsupported-item`]: {
        borderRadius: ' var(--radius-card-base)',
        background: 'var(--color-gray-bg-card-white)',
        border: 'var(--color-gray-border-light)',
        boxShadow: 'var(--shadow-control-base)',
        padding: '8px',
        minWidth: 294,
        height: 56,
        marginBottom: 0,
        cursor: 'unset',
        '&:hover': {
          background: 'var(--color-gray-bg-card-white)',
          border: 'var(--color-gray-border-light)',
          boxShadow: 'var(--shadow-control-base)',
        },
      },
      // 不可预览说明文案
      [`&-unsupported-text`]: {
        font: 'var(--font-text-body-sm)',
        color: 'var(--color-text-secondary)',
      },
    },

    // 搜索框样式
    [`${token.componentCls}-search`]: {
      '.ant-input-outlined': {
        borderRadius: 'var(--radius-control-base)',
        borderColor: 'transparent',
        background: 'var(--color-gray-bg-card-light)',
        boxShadow: 'var(--shadow-border-base)',
        marginBottom: 8,
      },

      '.ant-input-outlined:hover, .ant-input-outlined:focus-within': {
        borderColor: 'var(--color-primary-control-fill-primary-active)',
      },

      '.ant-input-affix-wrapper >input.ant-input': {
        color: 'var(--color-gray-text-default)',
        font: 'var(--font-text-body-base)',
        letterSpacing: 'var(--letter-spacing-body-base, normal)',
      },

      // 搜索图标样式
      '.anticon': {
        color: 'var(--color-gray-text-secondary)',
        fontSize: 16,
      },
    },

    // 成功消息图标样式
    [`${token.componentCls}-success-icon`]: {
      fontSize: 16,
      marginRight: 8,
      color: 'var(--color-green-control-fill-primary)',
    },

    // 成功消息文本样式
    [`${token.componentCls}-message-text`]: {
      font: 'var(--font-text-body-emphasized-base)',
      color: 'var(--color-gray-text-default)',
    },

    // 分组内容容器（用于motion.div）
    [`${token.componentCls}-group-content`]: {
      overflow: 'hidden',
    },

    // 隐藏的图片预览组件
    [`${token.componentCls}-hidden-image`]: {
      display: 'none',
    },
  };
};

export function useFileStyle(prefixCls?: string) {
  return useEditorStyleRegister('WorkspaceFile', (token) => {
    const fileToken = {
      ...token,
      componentCls: `.${prefixCls}`,
    };

    return [genStyle(fileToken)];
  });
}
