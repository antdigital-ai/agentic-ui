# Spacing design tokens

The spacing system is based on a 4px unit.

## Tokens

| Token | Value | Pixel |
|-------|-------|-------|
| `--padding-0-25x` | 0.25 unit | 1px |
| `--padding-0-5x` | 0.5 unit | 2px |
| `--padding-1x` | 1 unit | 4px |
| `--padding-2x` | 2 units | 8px |
| `--padding-3x` | 3 units | 12px |
| `--padding-4x` | 4 units | 16px |
| `--padding-5x` | 5 units | 20px |
| `--padding-6x` | 6 units | 24px |
| `--padding-8x` | 8 units | 32px |
| `--padding-12x` | 12 units | 48px |

## Usage

Use these tokens for `padding`, `margin`, `gap`, and other spacing properties.

```css
.container {
  padding: var(--padding-4x); /* 16px */
  gap: var(--padding-2x); /* 8px */
}
```
