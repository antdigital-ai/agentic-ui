# Color design tokens

The project uses a comprehensive system of CSS variables for colors, following the pattern: `--color-{hue}-{role}-{state}`.

## Naming pattern

- **Hue**: `primary`, `gray`, `blue`, `red`, `green`, `gold`
- **Role**: `bg-page`, `bg-card`, `control-fill`, `text`, `border`
- **State** (optional): `hover`, `active`, `disabled`, `light`, `dark`

## Common Tokens

### Primary (Brand)
Used for primary actions, active states, and brand elements.
- `--color-primary-bg-page-light`
- `--color-primary-control-fill-primary` (Primary button bg)
- `--color-primary-text-default`
- `--color-primary-border-light`

### Gray (Neutral)
Used for text, backgrounds, and borders.
- `--color-gray-bg-page`
- `--color-gray-bg-card-light`
- `--color-gray-text-default` (Main text)
- `--color-gray-text-secondary` (Secondary text)
- `--color-gray-border-light`

### Functional Colors
- **Blue**: Info / Action (`--color-blue-text-default`)
- **Red**: Error / Danger (`--color-red-text-default`, `--color-red-bg-tip`)
- **Green**: Success (`--color-green-text-default`)

## Usage Examples

```css
.my-card {
  background: var(--color-gray-bg-card-light);
  border: 1px solid var(--color-gray-border-light);
  color: var(--color-gray-text-default);
}

.my-button {
  background: var(--color-primary-control-fill-primary);
  color: #fff;
}
```

## Best Practices
- Always use CSS variables instead of hex codes.
- Use `text-default` for primary text and `text-secondary` for less important info.
- Use `bg-card` for containers and `bg-page` for the main background.
