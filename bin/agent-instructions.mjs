#!/usr/bin/env node

import { generateProject } from '../src/index.mjs';

const argumentsList = process.argv.slice(2);
let configPath = 'agent-instructions.config.json';

if (argumentsList.length > 0) {
  if (argumentsList.length !== 2 || argumentsList[0] !== '--config') {
    process.stderr.write('Usage: agent-instructions [--config <path>]\n');
    process.exit(1);
  }

  configPath = argumentsList[1];
}

try {
  await generateProject({ configPath });
} catch (error) {
  process.stderr.write(`${error.message}\n`);
  process.exit(1);
}
