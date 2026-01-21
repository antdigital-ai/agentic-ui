import { describe, expect, it } from 'vitest';

import { parserMdToSchema } from '../../src/MarkdownEditor/editor/parser/parserMdToSchema';

interface BenchmarkScenario {
  name: string;
  markdown: string;
  uniquePerIteration: boolean;
}

interface BenchmarkResult {
  name: string;
  iterations: number;
  warmup: number;
  totalMs: number;
  averageMs: number;
  minMs: number;
  maxMs: number;
  totalNodes: number;
}

const DEFAULT_ITERATIONS = 50;
const DEFAULT_WARMUP = 5;
const MIN_ITERATIONS = 5;
const MAX_ITERATIONS = 2000;
const MIN_WARMUP = 0;
const MAX_WARMUP = 500;
const SECTION_SEPARATOR = '\n\n';
const SMALL_REPEAT = 2;
const MEDIUM_REPEAT = 6;
const LARGE_REPEAT = 12;

const BASE_SECTION = [
  '# Benchmark Title',
  '',
  'Paragraph text with **bold** and *italic*.',
  '',
  '- Item one',
  '- Item two',
  '',
  '1. First',
  '2. Second',
  '',
  '> Blockquote line',
  '',
  '```ts',
  'const value = 1;',
  'function add(a: number, b: number) {',
  '  return a + b;',
  '}',
  '```',
  '',
  '| Col A | Col B |',
  '| --- | --- |',
  '| A | B |',
  '',
  'Inline `code` sample.',
].join('\n');

const parseEnvInt = (value: string | undefined, fallback: number): number => {
  const parsed = Number(value);
  if (!Number.isFinite(parsed)) {
    return fallback;
  }
  return Math.floor(parsed);
};

const clampNumber = (value: number, min: number, max: number): number => {
  return Math.min(max, Math.max(min, value));
};

const getEnvInt = (
  name: string,
  fallback: number,
  min: number,
  max: number,
): number => {
  return clampNumber(parseEnvInt(process.env[name], fallback), min, max);
};

const createMarkdownSample = (repeat: number): string => {
  const sections: string[] = [];
  for (let index = 0; index < repeat; index += 1) {
    sections.push(`${BASE_SECTION}\n<!-- section:${index} -->`);
  }
  return sections.join(SECTION_SEPARATOR);
};

const formatDuration = (value: number): string => `${value.toFixed(2)}ms`;

const measureScenario = (
  scenario: BenchmarkScenario,
  iterations: number,
  warmup: number,
): BenchmarkResult => {
  for (let i = 0; i < warmup; i += 1) {
    parserMdToSchema(scenario.markdown).schema.length;
  }

  const durations: number[] = [];
  let totalNodes = 0;

  for (let i = 0; i < iterations; i += 1) {
    const input = scenario.uniquePerIteration
      ? `${scenario.markdown}\n\n<!-- iteration:${i} -->`
      : scenario.markdown;
    const start = performance.now();
    const { schema } = parserMdToSchema(input);
    const end = performance.now();

    durations.push(end - start);
    totalNodes += schema.length;
  }

  const totalMs = durations.reduce((sum, value) => sum + value, 0);
  const minMs = Math.min(...durations);
  const maxMs = Math.max(...durations);
  const averageMs = totalMs / durations.length;

  return {
    name: scenario.name,
    iterations,
    warmup,
    totalMs,
    averageMs,
    minMs,
    maxMs,
    totalNodes,
  };
};

const createScenarios = (): BenchmarkScenario[] => {
  const samples = [
    { name: 'small', markdown: createMarkdownSample(SMALL_REPEAT) },
    { name: 'medium', markdown: createMarkdownSample(MEDIUM_REPEAT) },
    { name: 'large', markdown: createMarkdownSample(LARGE_REPEAT) },
  ];

  return samples.flatMap((sample) => [
    {
      name: `${sample.name}-reuse`,
      markdown: sample.markdown,
      uniquePerIteration: false,
    },
    {
      name: `${sample.name}-unique`,
      markdown: sample.markdown,
      uniquePerIteration: true,
    },
  ]);
};

describe('parseMd benchmark', () => {
  it('collects parse timing metrics', () => {
    const iterations = getEnvInt(
      'BENCH_ITERATIONS',
      DEFAULT_ITERATIONS,
      MIN_ITERATIONS,
      MAX_ITERATIONS,
    );
    const warmup = getEnvInt(
      'BENCH_WARMUP',
      DEFAULT_WARMUP,
      MIN_WARMUP,
      MAX_WARMUP,
    );

    const scenarios = createScenarios();
    const results = scenarios.map((scenario) =>
      measureScenario(scenario, iterations, warmup),
    );

    results.forEach((result) => {
      console.log(`[parseMd-benchmark] ${result.name}`, {
        iterations: result.iterations,
        warmup: result.warmup,
        totalMs: formatDuration(result.totalMs),
        averageMs: formatDuration(result.averageMs),
        minMs: formatDuration(result.minMs),
        maxMs: formatDuration(result.maxMs),
        totalNodes: result.totalNodes,
      });
      expect(result.totalNodes).toBeGreaterThan(0);
    });
  });
});
