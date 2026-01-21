import fs from 'fs';
import path from 'path';
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

interface BenchmarkRecord {
  timestamp: string;
  iterations: number;
  warmup: number;
  nodeVersion: string;
  platform: string;
  results: BenchmarkResult[];
}

const DEFAULT_ITERATIONS = 50;
const DEFAULT_WARMUP = 5;
const MIN_ITERATIONS = 5;
const MAX_ITERATIONS = 2000;
const MIN_WARMUP = 0;
const MAX_WARMUP = 500;
const DEFAULT_APPEND_STEPS = 20;
const MIN_APPEND_STEPS = 5;
const MAX_APPEND_STEPS = 200;
const SECTION_SEPARATOR = '\n\n';
const SMALL_REPEAT = 2;
const MEDIUM_REPEAT = 6;
const LARGE_REPEAT = 12;
const APPEND_BASE_REPEAT = 2;
const APPEND_CHUNK_REPEAT = 1;
const BENCHMARK_OUTPUT_DIR = 'benchmarks';
const BENCHMARK_OUTPUT_FILE = 'parseMd.benchmark.jsonl';

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

const writeBenchmarkResults = (record: BenchmarkRecord): void => {
  const outputDir = path.join(process.cwd(), BENCHMARK_OUTPUT_DIR);
  const outputPath = path.join(outputDir, BENCHMARK_OUTPUT_FILE);

  try {
    fs.mkdirSync(outputDir, { recursive: true });
    fs.appendFileSync(outputPath, `${JSON.stringify(record)}\n`, 'utf8');
    console.log(`[parseMd-benchmark] saved: ${outputPath}`);
  } catch (error) {
    console.log('[parseMd-benchmark] save failed', error);
  }
};

const measureIncrementalAppendScenario = (
  scenarioName: string,
  baseMarkdown: string,
  appendChunk: string,
  steps: number,
  warmup: number,
): BenchmarkResult => {
  for (let i = 0; i < warmup; i += 1) {
    parserMdToSchema(baseMarkdown).schema.length;
  }

  const durations: number[] = [];
  let totalNodes = 0;
  let current = baseMarkdown;

  for (let i = 0; i < steps; i += 1) {
    current = `${current}${SECTION_SEPARATOR}${appendChunk}\n<!-- append:${i} -->`;
    const start = performance.now();
    const { schema } = parserMdToSchema(current);
    const end = performance.now();

    durations.push(end - start);
    totalNodes += schema.length;
  }

  const totalMs = durations.reduce((sum, value) => sum + value, 0);
  const minMs = Math.min(...durations);
  const maxMs = Math.max(...durations);
  const averageMs = totalMs / durations.length;

  return {
    name: scenarioName,
    iterations: steps,
    warmup,
    totalMs,
    averageMs,
    minMs,
    maxMs,
    totalNodes,
  };
};

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
    const appendSteps = getEnvInt(
      'BENCH_APPEND_STEPS',
      DEFAULT_APPEND_STEPS,
      MIN_APPEND_STEPS,
      MAX_APPEND_STEPS,
    );

    const scenarios = createScenarios();
    const results = scenarios.map((scenario) =>
      measureScenario(scenario, iterations, warmup),
    );
    const appendResult = measureIncrementalAppendScenario(
      'append-growth',
      createMarkdownSample(APPEND_BASE_REPEAT),
      createMarkdownSample(APPEND_CHUNK_REPEAT),
      appendSteps,
      warmup,
    );
    const allResults = [...results, appendResult];

    writeBenchmarkResults({
      timestamp: new Date().toISOString(),
      iterations,
      warmup,
      nodeVersion: process.version,
      platform: `${process.platform}-${process.arch}`,
      results: allResults,
    });

    allResults.forEach((result) => {
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
