#!/usr/bin/env node

import { parseArgs } from 'node:util';

import { generateProject } from '../src/index.mjs';

const usage = [
  'Usage: agent-instructions [--config <path>] [--target <platform>]... [--help]',
  'Platforms: codex, claude, pi, cursor, all. Repeat --target to select several.',
  'Without --target, preserves the configured instruction and skill outputs.',
].join('\n');

try {
  const { values } = parseArgs({
    options: {
      config: { type: 'string' },
      target: { type: 'string', multiple: true },
      help: { type: 'boolean' },
    },
  });

  if (values.help) {
    process.stdout.write(`${usage}\n`);
  } else {
    await generateProject({ configPath: values.config, targets: values.target });
  }
} catch (error) {
  process.stderr.write(`${error.message}\n${usage}\n`);
  process.exitCode = 1;
}
