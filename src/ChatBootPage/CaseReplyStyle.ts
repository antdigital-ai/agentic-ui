import { genStyleHooks, type GenStyleFn } from '../Hooks/useStyle';

const genStyle: GenStyleFn<'ChatBootCaseReply'> = (token) => {
  return {
    [token.componentCls]: {
      maxWidth: '322px',
      background: token.colorFillQuaternary,
      borderRadius: 'var(--radius-card-base)',
      boxShadow: 'inset 0 0 1px 0 rgba(0, 0, 0, 0.15)',
      position: 'relative',
      overflow: 'hidden',
      // cursor 由组件按需注入：有 onClick 时注入 data-clickable="true"
      cursor: 'default',
      transition: 'all 0.3s ease-in-out',

      // 可点击态：组件存在 onClick 时注入 data-clickable="true"
      '&[data-clickable="true"]': {
        cursor: 'pointer',

        '&:hover': {
          backgroundColor: token.colorBgElevated,
          boxShadow: '0 2px 12px 0 rgba(0, 0, 0, 0.08)',
          transform: 'scale(1.02)',
        },

        '&:active': {
          transform: 'scale(0.95)',
        },
      },

      // cover 区域
      '&-cover': {
        WebkitMaskImage:
          '-webkit-linear-gradient(to bottom, black 0%, black 60%, transparent 100%)',
        maskImage:
          'linear-gradient(to bottom, black 0%, black 60%, transparent 100%)',
        width: '100%',
        height: 166,
        display: 'flex',
        justifyContent: 'center',
      },

      // coverContent 白色子卡片
      '&-cover-content': {
        width: '80%',
        marginTop: '32px',
        height: 144,
        borderRadius: 'var(--radius-modal-base)',
        boxShadow:
          '0px 0px 1px 0px rgba(71, 98, 234, 0.05), 0px 6px 16px 0px rgba(71, 98, 234, 0.12)',
        background: '#ffffff',
        padding: '16px',
        transition: 'all 0.3s cubic-bezier(0.4, 0, 0.2, 1)',
        transform: 'rotate(0deg) translateY(0)',
      },

      // P1-1：原本通过 React state 切换 `&-cover-content-hovered` 类来驱动该动画，
      // 这会让每次 hover 进出都触发整组件 rerender。改为 CSS :hover 直驱，
      // hovered 类名仍保留作为程序化触发钩子（与 :hover 等价）。
      [`&:hover ${token.componentCls}-cover-content, &-cover-content-hovered`]:
        {
          transform: 'rotate(8deg) translateY(16px)',
        },

      // 引号图标
      '&-quote-icon': {
        width: '24px',
        height: '24px',
        marginBottom: '8px',

        '& svg': {
          width: '24px',
          height: '24px',
        },
      },

      // 引用文字
      '&-quote-text': {
        fontSize: '15px',
        fontWeight: 400,
        lineHeight: '20px',
        color: 'var(--color-gray-text-light)',
        maxHeight: '80px',
        overflow: 'hidden',
        display: '-webkit-box',
        WebkitLineClamp: 4,
        WebkitBoxOrient: 'vertical',
        textOverflow: 'ellipsis',
      },

      // 底部内容区域
      '&-bottom': {
        position: 'relative',
        height: 80,
        padding: '16px 20px 20px',
      },

      // 标题
      '&-title': {
        fontSize: '16px',
        fontWeight: 600,
        lineHeight: '26px',
        color: 'var(--color-gray-text-default)',
        marginTop: 0,
        marginBottom: '4px',
      },

      // 描述
      '&-description': {
        fontSize: '13px',
        fontWeight: 400,
        lineHeight: '22px',
        color: 'var(--color-gray-text-secondary)',
        overflow: 'hidden',
        textOverflow: 'ellipsis',
        whiteSpace: 'nowrap',
      },

      // buttonBar 按钮区域
      '&-button-bar': {
        position: 'absolute',
        textAlign: 'right',
        bottom: '8px',
        left: '16px',
        right: '16px',
        marginBottom: 0,
        background: 'linear-gradient(to right, #ffffff00 0%, #ffffff 40%)',
        borderRadius: '4px',
        padding: '8px',
        width: 'auto',
        opacity: 0,
        transform: 'translateY(10px)',
        transition: 'all 0.3s cubic-bezier(0.4, 0, 0.2, 1)',
        pointerEvents: 'none',

        // buttonBar 内的按钮样式
        '& button': {
          backgroundColor: token.colorText,
          color: token.colorBgContainer,
          borderRadius: '36px',
          padding: '8px 16px',
          cursor: 'pointer',
          border: 'none',
          fontSize: '14px',
          transition: 'all 0.2s ease-in-out',
          display: 'inline-flex',
          alignItems: 'center',
          gap: '8px',

          '&:hover': {
            backgroundColor: '#333333',
            transform: 'translateY(-2px)',
          },

          '&:active': {
            transform: 'translateY(0)',
          },
        },
      },

      // 箭头图标
      '&-arrow-icon': {
        width: '18px',
        height: '18px',
        borderRadius: '200px',
        background: '#FFFFFF',
        color: 'var(--color-primary-text-secondary)',
        display: 'inline-flex',
        alignItems: 'center',
        justifyContent: 'center',
        flexShrink: 0,
        transition: 'transform 300ms cubic-bezier(0.4, 0, 0.2, 1)',
        transform: 'translateX(0)',

        '& svg': {
          width: '12px',
          height: '12px',
        },
      },

      // P1-7：原写法 '&-button-bar button:hover &-arrow-icon' 在 cssinjs 嵌套上下文里，
      // 第二个 `&` 仍然是 componentCls 自身，会被展开成
      // `${prefix}-button-bar button:hover ${prefix}-button-bar-arrow-icon`
      // （因为本块此时仍位于 `&-button-bar` 的上层），实际 DOM 类名是 `${prefix}-arrow-icon`，
      // 因此 hover 平移动画完全失效。改写为顶层规则并显式拼出 componentCls 与子修饰符：
      [`&-button-bar button:hover ${token.componentCls}-arrow-icon`]: {
        transform: 'translateX(4px)',
      },

      // P1-1：buttonBar 显示状态原来由 React state 切类驱动，改用 CSS :hover 直驱；
      // 同时保留 `-visible` 修饰符作为程序化触发钩子。
      [`&:hover ${token.componentCls}-button-bar, &-button-bar-visible`]: {
        opacity: 1,
        transform: 'translateY(0)',
        pointerEvents: 'auto',
      },
    },
  };
};

const useGenStyle = genStyleHooks('ChatBootCaseReply', genStyle);

/**
 * CaseReply 组件样式
 */
export const useStyle = (prefixCls?: string) => {
  const [, hashId] = useGenStyle(prefixCls ?? 'ChatBootCaseReply');
  return { hashId };
};
