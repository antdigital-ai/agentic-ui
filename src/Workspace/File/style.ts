import { genStyleHooks, type GenStyleFn } from '../../Hooks/useStyle';

const genStyle: GenStyleFn<'WorkspaceFile'> = (token) => {
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
      minWidth: 0,
      overflowX: 'hidden',
      display: 'flex',
      flexDirection: 'column',

      [`${token.componentCls}-panel-loading`]: {
        flex: 1,
        display: 'flex',
        alignItems: 'center',
        justifyContent: 'center',
        minHeight: 0,
      },

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
            color: token.colorTextTertiary || token.colorTextSecondary,
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
          // 分组内容外壳：使用 grid-template-rows: 0fr ↔ 1fr 实现纯 CSS 折叠动画
          // 不依赖 framer-motion，浏览器原生过渡 grid 行高，避免写死 max-height
          [`&-content-wrapper`]: {
            display: 'grid',
            gridTemplateRows: '1fr',
            opacity: 1,
            transition:
              'grid-template-rows 0.26s cubic-bezier(0.4, 0, 0.2, 1), opacity 0.2s linear',

            '&[data-collapsed="true"]': {
              gridTemplateRows: '0fr',
              opacity: 0,
              // 折叠完成前后避免触发焦点/点击
              pointerEvents: 'none',
            },
          },

          // 分组内容区域：作为 grid 子项，min-height: 0 让 0fr 能真正坍缩
          [`&-content`]: {
            minHeight: 0,
            overflow: 'hidden',
            paddingLeft: '12px',
          },
        },
      },
    },

    // 文件项共用子元素（平铺 / 树通过 --list、--tree 区分布局）
    [`${token.componentCls}-item`]: {
      boxSizing: 'border-box',
      borderRadius: 'var(--radius-control-base)',
      transition: 'all 0.2s cubic-bezier(0.645, 0.045, 0.355, 1)',
      maxWidth: '100%',

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
        color: token.colorText,
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
        color: token.colorSplit,
        margin: '0 4px',
      },

      [`&-actions`]: {
        position: 'absolute',
        right: 0,
        top: 0,
        bottom: 0,
        zIndex: 1,
        display: 'flex',
        alignItems: 'center',
        gap: '4px',
        padding: 0,
        borderStartEndRadius: 'var(--radius-control-base)',
        borderEndEndRadius: 'var(--radius-control-base)',
        background: 'var(--color-gray-bg-card-white)',
        // 默认隐藏，仅在 hover/focus 时显示
        opacity: 0,
        visibility: 'hidden',
        pointerEvents: 'none',
        transition: 'opacity 0.2s ease, visibility 0.2s ease',

        // 保持图标按钮颜色一致
        [`${token.antCls}-btn, ${token.antCls}-btn ${token.iconCls}`]: {
          color: 'var(--color-gray-text-light)',
        },
        [`${token.antCls}-btn:hover, ${token.antCls}-btn:focus, ${token.antCls}-btn:active, ${token.antCls}-btn:hover ${token.iconCls}, ${token.antCls}-btn:focus ${token.iconCls}, ${token.antCls}-btn:active ${token.iconCls}`]:
          {
            color: 'var(--color-gray-text-light)',
          },
      },

      // 文件项动作按钮（预览/下载等）图标颜色保持一致
      [`&-action-btn`]: {
        [token.iconCls]: {
          color: 'var(--color-gray-text-light)',
        },
        [`&:hover ${token.iconCls}, &:focus ${token.iconCls}, &:active ${token.iconCls}`]:
          {
            color: 'var(--color-gray-text-light)',
          },
      },
    },

    // 平铺列表行
    [`${token.componentCls}-item--list`]: {
      position: 'relative',
      display: 'flex',
      width: '100%',
      alignItems: 'center',
      gap: '4px',
      marginBottom: '4px',
      padding: '4px',
      cursor: 'pointer',

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

        [`${token.componentCls}-item-actions`]: {
          opacity: 1,
          visibility: 'visible',
          pointerEvents: 'auto',
          background: 'var(--color-gray-control-fill-hover)',
        },
      },

      '&:focus-within': {
        [`${token.componentCls}-item-actions`]: {
          opacity: 1,
          visibility: 'visible',
          pointerEvents: 'auto',
          background: 'var(--color-gray-control-fill-hover)',
        },
      },
    },

    // 文件树叶子行
    [`${token.componentCls}-item--tree`]: {
      position: 'relative',
      display: 'inline-flex',
      width: '100%',
      maxWidth: 'none',
      alignItems: 'center',
      gap: '4px',
      marginBottom: 0,
      padding: 0,
      cursor: 'default',
      background: 'transparent',

      '&:hover': {
        background: 'transparent',
      },

      [`${token.componentCls}-item-icon`]: {
        display: 'none',
      },

      [`${token.componentCls}-item-details`]: {
        display: 'none',
      },

      [`${token.componentCls}-item-info`]: {
        flex: 1,
        minWidth: 0,
      },

      [`${token.componentCls}-item-name`]: {
        minWidth: 0,
        overflow: 'hidden',
        wordBreak: 'normal',
      },

      [`${token.componentCls}-item-name-text`]: {
        display: 'block',
        overflow: 'hidden',
        whiteSpace: 'nowrap',
        textOverflow: 'ellipsis',
      },

      [`${token.componentCls}-item-actions`]: {
        opacity: 1,
        visibility: 'visible',
        pointerEvents: 'auto',
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
      minWidth: 0,
      overflowX: 'hidden',
      marginLeft: '-12px',
      marginRight: '-12px',
      background: token.colorBgContainer,
      position: 'relative',

      // 预览头部
      [`&-header`]: {
        display: 'flex',
        alignItems: 'center',
        gap: '4px',
        minWidth: 0,
        padding: '8px 12px',
        borderBottom: `1px solid ${token.colorBorderSecondary || token.colorBorder}`,
        background: token.colorBgContainer,
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
        color: token.colorTextTertiary || token.colorTextSecondary,
        transition: 'all 0.2s cubic-bezier(0.645, 0.045, 0.355, 1)',
        borderRadius: token.borderRadiusSM || 4,

        '&:hover': {
          background: token.colorFillTertiary || token.colorFillSecondary,
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
        color: token.colorTextTertiary || token.colorTextSecondary,
      },

      // 操作按钮容器
      [`&-actions`]: {
        display: 'flex',
        alignItems: 'center',
        gap: '8px',

        // 保持预览头部操作按钮的图标颜色一致
        [`${token.antCls}-btn, ${token.antCls}-btn ${token.iconCls}`]: {
          color: token.colorTextTertiary || token.colorTextSecondary,
        },
        [`${token.antCls}-btn:hover, ${token.antCls}-btn:focus, ${token.antCls}-btn:active, ${token.antCls}-btn:hover ${token.iconCls}, ${token.antCls}-btn:focus ${token.iconCls}, ${token.antCls}-btn:active ${token.iconCls}`]:
          {
            color: token.colorTextTertiary || token.colorTextSecondary,
          },
      },

      // 预览内容区域
      [`&-content`]: {
        flex: 1,
        display: 'flex',
        flexDirection: 'column',
        minWidth: 0,
        overflowX: 'hidden',
        overflowY: 'auto',
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
            background: `linear-gradient(to bottom, ${token.colorBgContainer}, transparent)`,
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
            background: `linear-gradient(to top, ${token.colorBgContainer}, transparent)`,
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
        color: token.colorTextTertiary || token.colorTextSecondary,

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
        color: 'var(--color-text-secondary, var(--color-gray-text-secondary))',
      },
    },

    [`${token.componentCls}-toolbar`]: {
      display: 'flex',
      alignItems: 'center',
      gap: token.marginXS ?? 8,
      flexShrink: 0,
      minWidth: 0,
      maxWidth: '100%',
      marginBottom: 8,
    },

    [`${token.componentCls}-toolbar-search`]: {
      flex: 1,
      minWidth: 0,
      [`${token.componentCls}-search ${token.antCls}-input-outlined`]: {
        marginBottom: 0,
      },
    },

    [`${token.componentCls}-toolbar-switch`]: {
      flexShrink: 0,
      [`${token.antCls}-segmented-item-label`]: {
        display: 'inline-flex',
        alignItems: 'center',
        justifyContent: 'center',
        minWidth: 28,
        minHeight: 24,
      },
    },

    [`${token.componentCls}-toolbar-switch-icon`]: {
      display: 'inline-flex',
      alignItems: 'center',
      justifyContent: 'center',
      color: token.colorText,
      lineHeight: 0,
    },

    [`${token.componentCls}-toolbar-switch--trailing`]: {
      marginInlineStart: 'auto',
    },

    [`${token.componentCls}-tree-panel`]: {
      flex: 1,
      minHeight: 0,
      minWidth: 0,
      display: 'flex',
      flexDirection: 'column',
      overflow: 'hidden',
    },

    // 搜索框样式
    [`${token.componentCls}-search`]: {
      width: '100%',
      minWidth: 0,
      boxSizing: 'border-box',
      [`${token.antCls}-input-affix-wrapper`]: {
        width: '100%',
        maxWidth: '100%',
        minWidth: 0,
      },
      [`${token.antCls}-input-outlined`]: {
        borderRadius: 'var(--radius-control-base)',
        borderColor: 'transparent',
        background: 'var(--color-gray-bg-card-light)',
        boxShadow: 'var(--shadow-border-base)',
        marginBottom: 8,
      },

      [`${token.antCls}-input-outlined:hover, ${token.antCls}-input-outlined:focus-within`]:
        {
          borderColor: 'var(--color-primary-control-fill-primary-active)',
        },

      [`${token.antCls}-input-affix-wrapper >input${token.antCls}-input`]: {
        color: 'var(--color-gray-text-default)',
        font: 'var(--font-text-body-base)',
        letterSpacing: 'var(--letter-spacing-body-base, normal)',
      },

      // 搜索图标样式
      [token.iconCls]: {
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

    // 查看更多按钮
    [`${token.componentCls}-show-more`]: {
      display: 'flex',
      alignItems: 'center',
      justifyContent: 'center',
      padding: '6px 0',
      cursor: 'pointer',
      color: 'var(--color-gray-text-secondary)',
      font: 'var(--font-text-body-sm)',
      letterSpacing: 'var(--letter-spacing-body-sm, normal)',
      transition: 'color 0.2s ease',
      userSelect: 'none',

      '&:hover': {
        color: 'var(--color-primary-control-fill-primary-active)',
      },

      svg: {
        marginLeft: '4px',
        width: '12px',
        height: '12px',
      },
    },
  };
};

const useGenStyle = genStyleHooks('WorkspaceFile', genStyle);

export function useFileStyle(prefixCls?: string) {
  const [, hashId] = useGenStyle(prefixCls ?? 'WorkspaceFile');
  return { hashId };
}
