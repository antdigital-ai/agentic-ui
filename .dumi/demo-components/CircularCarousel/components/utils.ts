export function getGradientSvg(rgb: string): string {
  const [r, g, b] = rgb.split(',').map((n) => parseInt(n.trim()));

  const mixWhite = (factor: number) => {
    return `${Math.round(r + (255 - r) * factor)},${Math.round(g + (255 - g) * factor)},${Math.round(b + (255 - b) * factor)}`;
  };

  const stops = [
    { offset: '0', color: rgb, opacity: 0.47 },
    { offset: '0.125', color: mixWhite(0.1), opacity: 0.54 },
    { offset: '0.25', color: mixWhite(0.2), opacity: 0.61 },
    { offset: '0.375', color: mixWhite(0.3), opacity: 0.67 },
    { offset: '0.5', color: mixWhite(0.4), opacity: 0.74 },
    { offset: '0.75', color: mixWhite(0.6), opacity: 0.87 },
    { offset: '1', color: '255,255,255', opacity: 1 },
  ];

  const stopTags = stops
    .map(
      (s) =>
        `<stop stop-color='rgba(${s.color},${s.opacity})' offset='${s.offset}'/>`,
    )
    .join('');

  return `data:image/svg+xml;utf8,<svg viewBox='0 0 480 780' xmlns='http://www.w3.org/2000/svg' preserveAspectRatio='none'><rect x='0' y='0' height='100%' width='100%' fill='url(%23grad)' opacity='0.2'/><defs><radialGradient id='grad' gradientUnits='userSpaceOnUse' cx='0' cy='0' r='10' gradientTransform='matrix(-0.9 34.15 -62.221 -1.6398 249 625.5)' >${stopTags}</radialGradient></defs></svg>`;
}
