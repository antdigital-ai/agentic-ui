# Typography design tokens

The project uses a comprehensive set of typography tokens that combine font-weight, font-size, and line-height.

## Naming Pattern
`--font-text-{category}-{variant}-{size}`

- **Category**: `body`, `paragraph`, `h1`-`h6`, `code`, `number`
- **Variant** (optional): `emphasized`
- **Size**: `xs`, `sm`, `base`, `lg`, `xl`, ...

## Usage

```css
.my-text {
  font: var(--font-text-body-base);
}

.my-heading {
  font: var(--font-text-h1-base);
  color: var(--color-gray-text-default);
}
```

## Available Tokens

### Body
Used for short text, UI labels.
- `--font-text-body-sm`
- `--font-text-body-base`
- `--font-text-body-lg`
- `--font-text-body-emphasized-base`

### Paragraph
Used for long-form text.
- `--font-text-paragraph-base`
- `--font-text-paragraph-lg`

### Headings
- `--font-text-h1-base`
- `--font-text-h2-base`
- ...
- `--font-text-h6-base`

### Code
- `--font-text-code-base`
