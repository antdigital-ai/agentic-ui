import React, { useEffect, useRef, useState } from 'react';
import { CanvasWrapper } from '../style';

interface CanvasRevealEffectProps {
  color?: string;
  dotSize?: number;
  index?: number;
  smoothIndex?: any;
}

export const CanvasRevealEffect: React.FC<CanvasRevealEffectProps> = ({
  color = '255, 255, 255',
  dotSize = 3,
}) => {
  const canvasRef = useRef<HTMLCanvasElement>(null);
  const [dimensions, setDimensions] = useState({ width: 0, height: 0 });

  // Handle resize
  useEffect(() => {
    const handleResize = () => {
      if (canvasRef.current) {
        const { offsetWidth, offsetHeight } = canvasRef.current;
        setDimensions({ width: offsetWidth, height: offsetHeight });
      }
    };
    handleResize();
    window.addEventListener('resize', handleResize);
    return () => window.removeEventListener('resize', handleResize);
  }, []);

  // Pre-calculate cached particle data
  const particleDataRef = useRef<Float32Array | null>(null);
  const colsRef = useRef(0);
  const rowsRef = useRef(0);

  useEffect(() => {
    const canvas = canvasRef.current;
    if (!canvas || dimensions.width === 0 || dimensions.height === 0) return;

    canvas.width = dimensions.width;
    canvas.height = dimensions.height;

    const ctx = canvas.getContext('2d', { alpha: true });
    if (!ctx) return;

    // Configuration
    const gridSize = dotSize;
    const gap = 1;
    const totalSize = gridSize + gap;
    const diffusionSpeed = 500; // pixels per second expansion

    const cols = Math.ceil(canvas.width / totalSize);
    const rows = Math.ceil(canvas.height / totalSize);

    colsRef.current = cols;
    rowsRef.current = rows;

    // Initialize particle data cache
    const dataSize = cols * rows * 3;
    const data = new Float32Array(dataSize);

    for (let i = 0; i < cols; i++) {
      for (let j = 0; j < rows; j++) {
        const index = (i + j * cols) * 3;

        const p1 = i * 12.9898;
        const p2 = j * 78.233;
        const dtStatic = Math.sin(p1 + p2) * 43758.5453;
        const staticVal = dtStatic - Math.floor(dtStatic);

        const isFlickering = staticVal < 0.2 ? 1 : 0;
        data[index] = isFlickering;

        let staticOpacity = 0;
        if (!isFlickering) {
          const normalizedStatic = (staticVal - 0.2) / 0.8;
          if (normalizedStatic < 0.5) {
            staticOpacity = 0.1 + normalizedStatic * 0.4;
          } else {
            staticOpacity = 0.3 + (normalizedStatic - 0.5) * 1.4;
          }
        }
        data[index + 1] = staticOpacity;
        data[index + 2] = (i + j) % 3;
      }
    }
    particleDataRef.current = data;

    let animationFrameId: number;
    const startTime = performance.now();

    const [r, g, b] = color.split(',').map((c) => parseInt(c.trim()));

    const rgbToHsl = (r: number, g: number, b: number) => {
      const rNorm = r / 255;
      const gNorm = g / 255;
      const bNorm = b / 255;
      const max = Math.max(rNorm, gNorm, bNorm);
      const min = Math.min(rNorm, gNorm, bNorm);
      let h = 0;
      let s;
      const l = (max + min) / 2;

      if (max === min) {
        h = s = 0;
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

    const [hBase, , lBase] = rgbToHsl(r, g, b);
    const sBase = 100;
    const finalL = Math.min(100, lBase * 1.3);

    const colors = [
      `hsla(${(hBase + 0 + 360) % 360}, ${sBase}%, ${finalL}%,`,
      `hsla(${(hBase - 20 + 360) % 360}, ${sBase}%, ${finalL}%,`,
      `hsla(${(hBase + 20 + 360) % 360}, ${sBase}%, ${finalL}%,`,
    ];

    const render = (time: number) => {
      ctx.clearRect(0, 0, canvas.width, canvas.height);

      const timeSinceStart = time - startTime;
      const currentRadius = (timeSinceStart / 1000) * diffusionSpeed;

      const originX = (cols * totalSize) / 2;
      const originY = (rows * totalSize) / 2;

      const radiusBuffer = 50;
      const effectiveRadius = currentRadius;

      const minX = originX - effectiveRadius - radiusBuffer;
      const maxX = originX + effectiveRadius + radiusBuffer;
      const minY = originY - effectiveRadius - radiusBuffer;
      const maxY = originY + effectiveRadius + radiusBuffer;

      const startCol = Math.max(0, Math.floor(minX / totalSize));
      const endCol = Math.min(cols, Math.ceil(maxX / totalSize));
      const startRow = Math.max(0, Math.floor(minY / totalSize));
      const endRow = Math.min(rows, Math.ceil(maxY / totalSize));

      const timeStep = Math.floor(timeSinceStart / (1000 / 6));

      const pData = particleDataRef.current;
      if (!pData) return;

      for (let i = startCol; i < endCol; i++) {
        for (let j = startRow; j < endRow; j++) {
          const x = i * totalSize;
          const y = j * totalSize;

          const dx = x - originX;
          const dy = y - originY;
          const distSq = dx * dx + dy * dy;

          if (distSq > (effectiveRadius + 50) ** 2) continue;

          const dist = Math.sqrt(distSq);
          if (dist > effectiveRadius) continue;

          const dataIndex = (i + j * cols) * 3;
          const isFlickering = pData[dataIndex];
          const hueType = pData[dataIndex + 2];

          let opacity;

          if (isFlickering) {
            const p1 = i * 12.9898;
            const p2 = j * 78.233;
            const p3 = timeStep * 43758.5453;
            const dt = Math.sin(p1 + p2 + p3) * 43758.5453;
            const randomVal = dt - Math.floor(dt);
            opacity = 0.1 + randomVal * 0.9;
          } else {
            opacity = pData[dataIndex + 1];
          }

          const verticalFade = 1 - (j / rows) * (j / rows);
          opacity *= verticalFade;

          const distFromEdge = effectiveRadius - dist;
          if (distFromEdge < 50) {
            opacity *= distFromEdge / 50;
          }

          if (opacity > 0.05) {
            const colorPrefix = colors[hueType];
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
  }, [color, dimensions, dotSize]);

  return (
    <CanvasWrapper
      ref={canvasRef}
      style={{
        position: 'absolute',
        inset: 0,
        width: '100%',
        height: '100%',
        pointerEvents: 'none',
        mixBlendMode: 'screen',
      }}
    />
  );
};
