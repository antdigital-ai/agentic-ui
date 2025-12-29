import { COLORS } from '../../constants/colors';
/**
 * 统一的标签样式配置
 * 集中管理所有标签相关的样式，避免重复定义
 */

// 函数标签样式 (fnc)
export const FNC_TAG_STYLES = {
  background: 'var(--color-gray-border-light)',
  color: 'var(--color-gray-text-light)',
  font: 'var(--font-text-number-xs)',
  fontSize: 12,
  fontWeight: 500,
  letterSpacing: 'var(--letter-spacing-number-xs, normal)',
  height: '20px',
  minWidth: '20px',
  margin: '0 2px',
  top: '0',
  position: 'relative' as const,
  textAlign: 'center' as const,
  justifyContent: 'center' as const,
  transition: 'all 0.3s',
  display: 'inline-flex' as const,
  alignItems: 'center' as const,
  cursor: 'pointer',
  width: 'max-content',
  maxWidth: 'min(860px,100%)',
  padding: 2,
  borderRadius: 12,
  '&:hover': {
    background: 'var(--color-gray-control-fill-secondary-active)',
    color: 'var(--color-gray-text-secondary)',
  },
};

// 函数定义标签样式 (fnd)
export const FND_TAG_STYLES = {
  paddingLeft: '0.125em',
  paddingRight: '0.125em',
  color: COLORS.green.dark,
  transitionDuration: '200ms',
  '&:hover': {
    color: COLORS.green.dark,
  },
};

// 导出所有标签样式的统一对象
export const TAG_STYLES = {
  fnc: FNC_TAG_STYLES,
  fnd: FND_TAG_STYLES,
};
