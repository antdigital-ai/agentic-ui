import { genStyleHooks, type GenStyleFn } from '../Hooks/useStyle';

const genStyle: GenStyleFn<'AgenticLayout'> = (token) => {
  return {
    [token.componentCls]: {
      display: 'flex',
      flexDirection: 'row',
      height: '100%',
      minHeight: 600,
      backgroundColor: 'transparent',
      overflow: 'hidden',
      border: 'none',
      boxSizing: 'border-box',
      margin: token.marginXXS,
      '*': {
        boxSizing: 'border-box',
      },
      // 主体内容区域
      [`${token.componentCls}-body`]: {
        display: 'flex',
        flex: 1,
        minWidth: 0,
        boxShadow: token.boxShadowTertiary,
        borderRadius: token.borderRadiusLG,
        overflow: 'hidden',
        border: `1px solid ${token.colorBorderSecondary}`,
      },

      // 左侧栏基础样式（宽度/padding 由 inline style 控制，避免与 class 打架）
      [`${token.componentCls}-sidebar-left`]: {
        display: 'flex',
        flexDirection: 'column',
        backgroundColor: token.colorBgLayout,
        borderInlineEnd: `1px solid ${token.colorBorderSecondary}`,
        overflow: 'hidden',
        boxSizing: 'border-box',
      },

      // 右侧栏包装器
      [`${token.componentCls}-sidebar-wrapper-right`]: {
        display: 'flex',
        alignItems: 'stretch',
        height: '100%',
      },

      // 右侧栏（宽度/padding/opacity 同样交由 inline style 控制）
      [`${token.componentCls}-sidebar-right`]: {
        borderInlineEnd: 'none',
        height: '100%',
      },

      // 折叠态：仅保留无法用 inline style 表达的子元素隐藏（避免折叠瞬间内容溢出）
      [`${token.componentCls}-sidebar-right-collapsed`]: {
        [`${token.componentCls}-sidebar-content`]: {
          display: 'none',
        },
      },

      // 拖拽手柄
      [`${token.componentCls}-resize-handle`]: {
        width: 6,
        cursor: 'col-resize',
        backgroundColor: 'transparent',
        position: 'relative',
        zIndex: 10,
        flexShrink: 0,
        marginInline: 1,
        // 键盘聚焦时给出可视化反馈（a11y 必要项）
        '&:focus-visible': {
          outline: `2px solid ${token.colorPrimaryBorderHover}`,
          outlineOffset: -2,
        },
        '&::before': {
          content: '""',
          position: 'absolute',
          insetInlineStart: '50%',
          top: 0,
          bottom: 0,
          width: 6,
          backgroundColor: 'transparent',
          transform: 'translateX(-50%)',
          // 拆成 transitionProperty/Duration/TimingFunction 三段式，
          // 避免某些 IDE 对简写串的属性名归属告警。
          transitionProperty: 'background-color',
          transitionDuration: token.motionDurationMid,
          transitionTimingFunction: token.motionEaseInOut,
        },
        '&:hover::before': {
          backgroundColor: token.colorPrimaryBorderHover,
        },
      },

      // 侧边栏内容
      [`${token.componentCls}-sidebar-content`]: {
        flex: 1,
        display: 'flex',
        flexDirection: 'column',
        overflow: 'hidden',
        width: '100%',
        height: '100%',
      },

      // 主内容区域：用 flex 自适应分配 LayoutHeader 与正文，
      // 避免历史上 height: calc(100% - 48px) 在没有 header 时少 48px 的问题。
      //
      // 圆角策略：
      // - 默认仅设置「右上、右下」圆角（左上/左下交给左侧栏来呈现）；
      // - 当 -main 是 -body 的第一个直接子元素时（未传 left），
      //   补齐左上/左下圆角，避免与外层 -body 的圆角错位形成尖角；
      // - 当左侧栏处于折叠态（width:0 不可见）时，-main 视觉上是最左可见块，
      //   同样需要补齐左上/左下圆角；此时通过相邻兄弟选择器命中。
      [`${token.componentCls}-main`]: {
        flex: 1,
        minWidth: 0,
        display: 'flex',
        flexDirection: 'column',
        backgroundColor: token.colorBgLayout,
        borderStartStartRadius: 0,
        borderEndStartRadius: 0,
        borderStartEndRadius: token.borderRadiusLG,
        borderEndEndRadius: token.borderRadiusLG,
        overflow: 'hidden',
        '&:first-child': {
          borderStartStartRadius: token.borderRadiusLG,
          borderEndStartRadius: token.borderRadiusLG,
        },
        [`${token.componentCls}-main-content`]: {
          flex: 1,
          minHeight: 0,
          overflow: 'auto',
          // 与 LayoutHeader 同款浅灰底色，避免 header / messages 区域颜色断层。
          background: 'var(--color-gray-bg-page-light)',
        },
      },

      // 左栏折叠时，紧随其后的 -main 视觉上成为最左可见块，
      // 此时需要补齐左上/左下圆角，避免顶部/底部出现直角缺口。
      [`${token.componentCls}-sidebar-left-collapsed + ${token.componentCls}-main`]:
        {
          borderStartStartRadius: token.borderRadiusLG,
          borderEndStartRadius: token.borderRadiusLG,
        },
    },
  };
};

const useGenStyle = genStyleHooks('AgenticLayout', genStyle);

export const useAgenticLayoutStyle = (prefixCls: string) => {
  const [, hashId] = useGenStyle(prefixCls);
  return { hashId };
};
