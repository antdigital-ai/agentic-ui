import React, { useEffect, useRef, useState } from 'react';

interface MakeCanvasRevealEffectProps {
  colors?: number[][];
  dotSize?: number;
  containerClassName?: string;
  animationSpeed?: number;
}

export const MakeCanvasRevealEffect: React.FC<MakeCanvasRevealEffectProps> = ({
  colors = [[91, 59, 159]],
  dotSize = 3,
  containerClassName = '',
  animationSpeed = 5,
}) => {
  const canvasRef = useRef<HTMLCanvasElement>(null);
  const [dimensions, setDimensions] = useState({ width: 0, height: 0 });

  // 使用第一个颜色作为主色
  const color = colors[0];
  const colorString = color.join(', ');

  // Handle resize
  useEffect(() => {
    const canvas = canvasRef.current;
    if (!canvas || !canvas.parentElement) return;

    const parent = canvas.parentElement;

    const updateDimensions = () => {
      const rect = parent.getBoundingClientRect();
      setDimensions({
        width: rect.width || parent.offsetWidth,
        height: rect.height || parent.offsetHeight,
      });
    };

    // 使用 ResizeObserver 监听父容器尺寸变化
    const resizeObserver = new ResizeObserver(() => {
      updateDimensions();
    });

    resizeObserver.observe(parent);

    // 初始化尺寸
    updateDimensions();

    // 延迟再次更新，确保 DOM 完全渲染
    const timer = setTimeout(updateDimensions, 100);

    return () => {
      resizeObserver.disconnect();
      clearTimeout(timer);
    };
  }, []);

  // Pre-calculate cached particle data to avoid heavy math in the render loop
  const particleDataRef = useRef<Float32Array | null>(null);
  const colsRef = useRef(0);
  const rowsRef = useRef(0);

  useEffect(() => {
    const canvas = canvasRef.current;
    if (!canvas || dimensions.width === 0 || dimensions.height === 0) return;

    // Set exact resolution
    canvas.width = dimensions.width;
    canvas.height = dimensions.height;

    const ctx = canvas.getContext('2d', { alpha: true });
    if (!ctx) return;

    // Configuration
    const gridSize = dotSize;
    const gap = 1;
    const totalSize = gridSize + gap;
    const diffusionSpeed = 500 / animationSpeed; // pixels per second expansion

    const cols = Math.ceil(canvas.width / totalSize);
    const rows = Math.ceil(canvas.height / totalSize);

    colsRef.current = cols;
    rowsRef.current = rows;

    // Initialize particle data cache
    // Structure: [isFlickering (0/1), staticOpacity, hueIndex (0/1/2)]
    const dataSize = cols * rows * 3;
    const data = new Float32Array(dataSize);

    for (let i = 0; i < cols; i++) {
      for (let j = 0; j < rows; j++) {
        const index = (i + j * cols) * 3;

        // Static hash for structure
        const p1 = i * 12.9898;
        const p2 = j * 78.233;
        const dtStatic = Math.sin(p1 + p2) * 43758.5453;
        const staticVal = dtStatic - Math.floor(dtStatic); // 0..1

        // 1. Determine if flickering (20%)
        const isFlickering = staticVal < 0.2 ? 1 : 0;
        data[index] = isFlickering;

        // 2. Calculate static opacity (for the 80%)
        let staticOpacity = 0;
        if (!isFlickering) {
          const normalizedStatic = (staticVal - 0.2) / 0.8; // 0..1
          if (normalizedStatic < 0.5) {
            // First 50% of range maps to 0.1 - 0.3
            staticOpacity = 0.1 + normalizedStatic * 0.4;
          } else {
            // Last 50% of range maps to 0.3 - 1.0
            staticOpacity = 0.3 + (normalizedStatic - 0.5) * 1.4;
          }
        }
        data[index + 1] = staticOpacity;

        // 3. Hue choice
        data[index + 2] = (i + j) % 3;
      }
    }
    particleDataRef.current = data;

    let animationFrameId: number;
    const startTime = performance.now();

    // Parse color
    const [r, g, b] = color;

    // Helper to convert RGB to HSL
    const rgbToHsl = (r: number, g: number, b: number) => {
      const rNorm = r / 255;
      const gNorm = g / 255;
      const bNorm = b / 255;
      const max = Math.max(rNorm, gNorm, bNorm);
      const min = Math.min(rNorm, gNorm, bNorm);
      let h = 0;
      let s: number;
      const l = (max + min) / 2;

      if (max === min) {
        h = s = 0; // achromatic
      } else {
        const d = max - min;
        s = l > 0.5 ? d / (2 - max - min) : d / (max + min);
        switch (max) {
          case rNorm:
            h = (gNorm - bNorm) / d + (gNorm < bNorm ? 6 : 0);
            break;
          case gNorm:
            h = (bNorm - rNorm) / d + 2;
            break;
          case bNorm:
            h = (rNorm - gNorm) / d + 4;
            break;
        }
        h /= 6;
      }
      return [h * 360, s * 100, l * 100];
    };

    // Force saturation to 100% as requested
    const [hBase, , lBase] = rgbToHsl(r, g, b);
    const sBase = 100;

    // Pre-calculate the 3 color variants strings (without alpha) to save string building time
    // Increase L by 30%
    const finalL = Math.min(100, lBase * 1.3);

    const colorVariants = [
      `hsla(${(hBase + 0 + 360) % 360}, ${sBase}%, ${finalL}%,`, // 0: Neutral
      `hsla(${(hBase - 20 + 360) % 360}, ${sBase}%, ${finalL}%,`, // 1: -20
      `hsla(${(hBase + 20 + 360) % 360}, ${sBase}%, ${finalL}%,`, // 2: +20
    ];

    const render = (time: number) => {
      // Performance: Limit clear area if needed, but clearRect is fast
      ctx.clearRect(0, 0, canvas.width, canvas.height);

      const timeSinceStart = time - startTime;

      // Diffusion Radius (expanding ellipse - wider horizontally)
      const currentRadius = (timeSinceStart / 1000) * diffusionSpeed;

      // Origin: Center of the canvas
      const originX = (cols * totalSize) / 2;
      const originY = (rows * totalSize) / 2;

      // Ellipse parameters: horizontal stretch (wider on X-axis)
      // Horizontal radius is larger, vertical radius is smaller
      const ellipseRadiusX = currentRadius * 1.2; // Horizontal radius (wider)
      const ellipseRadiusY = currentRadius * 0.9; // Vertical radius (slightly narrower)

      // Optimization: Only loop through the bounding box of the ellipse
      // Add a buffer for fade out
      const radiusBuffer = 50;

      // Calculate grid bounds for ellipse
      const minX = originX - ellipseRadiusX - radiusBuffer;
      const maxX = originX + ellipseRadiusX + radiusBuffer;
      const minY = originY - ellipseRadiusY - radiusBuffer;
      const maxY = originY + ellipseRadiusY + radiusBuffer;

      const startCol = Math.max(0, Math.floor(minX / totalSize));
      const endCol = Math.min(cols, Math.ceil(maxX / totalSize));
      const startRow = Math.max(0, Math.floor(minY / totalSize));
      const endRow = Math.min(rows, Math.ceil(maxY / totalSize));

      // Global time step for flickering (6fps)
      const timeStep = Math.floor(timeSinceStart / (1000 / 6));

      const pData = particleDataRef.current;
      if (!pData) return;

      for (let i = startCol; i < endCol; i++) {
        for (let j = startRow; j < endRow; j++) {
          const x = i * totalSize;
          const y = j * totalSize;

          // Ellipse distance check: (x/a)² + (y/b)² <= 1
          const dx = x - originX;
          const dy = y - originY;

          // Normalized ellipse equation
          const ellipseValue =
            (dx / ellipseRadiusX) ** 2 + (dy / ellipseRadiusY) ** 2;

          // Skip if outside ellipse
          if (ellipseValue > 1) continue;

          // Calculate normalized distance from center (0 to 1) for edge fading
          const normalizedDist = Math.sqrt(ellipseValue);

          // Retrieve cached data
          const dataIndex = (i + j * cols) * 3;
          const isFlickering = pData[dataIndex];
          const hueType = pData[dataIndex + 2];

          let opacity;

          if (isFlickering) {
            // Dynamic random value
            const p1 = i * 12.9898;
            const p2 = j * 78.233;
            const p3 = timeStep * 43758.5453;
            const dt = Math.sin(p1 + p2 + p3) * 43758.5453;
            const randomVal = dt - Math.floor(dt); // 0..1
            opacity = 0.1 + randomVal * 0.9;
          } else {
            // Static pre-calculated
            opacity = pData[dataIndex + 1];
          }

          // Vertical fade out
          const verticalFade = 1 - (j / rows) * (j / rows); // Optimized Math.pow(x, 2)
          opacity *= verticalFade;

          // Soft edge for diffusion (ellipse edge)
          // Calculate distance from ellipse edge
          const distFromEdge =
            (1 - normalizedDist) * Math.min(ellipseRadiusX, ellipseRadiusY);
          const fadeDistance = 50;
          if (distFromEdge < fadeDistance) {
            opacity *= distFromEdge / fadeDistance;
          }

          if (opacity > 0.05) {
            // Use pre-calculated color string parts
            // hueType 0 -> index 0, 1 -> index 1, 2 -> index 2
            const colorPrefix = colorVariants[hueType];
            // Fast string concat
            ctx.fillStyle = colorPrefix + opacity + ')';
            ctx.fillRect(x, y, gridSize, gridSize);
          }
        }
      }

      animationFrameId = requestAnimationFrame(render);
    };

    animationFrameId = requestAnimationFrame(render);

    return () => {
      cancelAnimationFrame(animationFrameId);
    };
  }, [colorString, dimensions, dotSize, animationSpeed]);

  return (
    <canvas
      ref={canvasRef}
      className={containerClassName}
      style={{
        position: 'absolute',
        top: 0,
        left: 0,
        width: '100%',
        height: '100%',
        pointerEvents: 'none',
        mixBlendMode: 'screen',
      }}
    />
  );
};
