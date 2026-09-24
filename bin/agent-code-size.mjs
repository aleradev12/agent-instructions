#!/usr/bin/env node

import { inspectCodeSize } from '../src/code-size.mjs';

const args = process.argv.slice(2);
const files = [];
let strict = false;
let literalPaths = false;

try {
  for (const argument of args) {
    if (!literalPaths && argument === '--help') {
      process.stdout.write('Usage: agent-code-size [--strict] [--] [source-file ...]\nWithout files, checks Git tracked and non-ignored untracked sources.\nDefault: report only. --strict: fail on oversized source files.\nSee Code Style for size policy and package README for exclusions.\n');
      process.exit(0);
    }
    if (!literalPaths && argument === '--') {
      literalPaths = true;
    } else if (!literalPaths && argument === '--strict') {
      strict = true;
    } else if (!literalPaths && argument.startsWith('-')) {
      throw new Error(`Unknown option: ${argument}`);
    } else {
      files.push(argument);
    }
  }

  const result = await inspectCodeSize({ files: files.length ? files : undefined });
  for (const finding of result.findings) {
    process.stdout.write(`${finding.level}: ${finding.path} (${finding.lines} lines)\n`);
  }
  process.stdout.write(`Checked ${result.checked} sources; skipped ${result.skipped}; ${result.findings.length} size signals. Not an architecture review.\n`);
  process.exitCode = strict && result.findings.some(finding => finding.level === 'oversized') ? 1 : 0;
} catch (error) {
  process.stderr.write(`${error.message}\n`);
  process.exitCode = 2;
}
