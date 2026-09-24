import assert from 'node:assert/strict';
import { execFileSync, spawnSync } from 'node:child_process';
import { mkdtemp, mkdir, rm, symlink, writeFile } from 'node:fs/promises';
import os from 'node:os';
import path from 'node:path';
import { fileURLToPath } from 'node:url';
import test from 'node:test';

import { inspectCodeSize } from '../src/code-size.mjs';

const cli = fileURLToPath(new URL('../bin/agent-code-size.mjs', import.meta.url));

test('counts physical lines at boundaries, including CRLF and missing final newline', async context => {
  const projectRoot = await createProject(context);
  const fixtures = {
    'empty.ts': '',
    'small.ts': 'line\n'.repeat(350),
    'warn.ts': 'line\r\n'.repeat(351),
    'almost.ts': Array(499).fill('line').join('\n'),
    'large file.ts': 'line\n'.repeat(500),
  };
  for (const [name, content] of Object.entries(fixtures)) await put(projectRoot, name, content);
  const result = await inspectCodeSize({ projectRoot, files: [...Object.keys(fixtures), 'small.ts'] });
  assert.equal(result.checked, 5);
  assert.deepEqual(result.findings, [
    { path: 'large file.ts', lines: 500, level: 'oversized' },
    { path: 'almost.ts', lines: 499, level: 'warning' },
    { path: 'warn.ts', lines: 351, level: 'warning' },
  ]);
});

test('skips non-source, declarations, generated/build outputs and symlink files', async context => {
  const projectRoot = await createProject(context);
  const files = ['README.md', '.env', 'types.d.ts', 'schema.generated.ts', 'generated/code.ts', 'dist/code.js', 'node_modules/code.js'];
  for (const name of files) await put(projectRoot, name, 'line\n'.repeat(501));
  await put(projectRoot, 'real.ts', 'line\n');
  await symlink(path.join(projectRoot, 'real.ts'), path.join(projectRoot, 'link.ts'));
  const result = await inspectCodeSize({ projectRoot, files: [...files, 'link.ts', 'real.ts'] });
  assert.equal(result.checked, 1);
  assert.equal(result.skipped, 8);
  assert.deepEqual(result.findings, []);
});

test('Git discovery includes tracked and new source, excludes ignored and tolerates deletion', async context => {
  const projectRoot = await createProject(context);
  execFileSync('git', ['init', '-q'], { cwd: projectRoot });
  await put(projectRoot, '.gitignore', 'ignored.ts\n');
  await put(projectRoot, 'tracked.ts', 'line\n');
  await put(projectRoot, 'deleted.ts', 'line\n');
  execFileSync('git', ['add', '.'], { cwd: projectRoot });
  await rm(path.join(projectRoot, 'deleted.ts'));
  await put(projectRoot, 'new.ts', 'line\n'.repeat(500));
  await put(projectRoot, 'ignored.ts', 'line\n'.repeat(900));
  const result = await inspectCodeSize({ projectRoot });
  assert.equal(result.checked, 2);
  assert.deepEqual(result.findings.map(finding => finding.path), ['new.ts']);
});

test('CLI is advisory by default, strict is opt-in, and invalid input fails distinctly', async context => {
  const projectRoot = await createProject(context);
  await put(projectRoot, 'large.ts', 'line\n'.repeat(500));
  await put(projectRoot, 'warn.ts', 'line\n'.repeat(351));
  assert.equal(runCli(projectRoot, ['large.ts']).status, 0);
  assert.equal(runCli(projectRoot, ['--strict', 'large.ts']).status, 1);
  assert.equal(runCli(projectRoot, ['--strict', 'warn.ts']).status, 0);
  assert.equal(runCli(projectRoot, ['missing.ts']).status, 2);
  assert.equal(runCli(projectRoot, ['--unknown']).status, 2);
  assert.equal(runCli(projectRoot, ['--help']).status, 0);
  assert.equal(runCli(projectRoot, ['../outside.ts']).status, 2);
  const noGit = runCli(projectRoot, []);
  assert.equal(noGit.status, 2);
  assert.match(noGit.stderr, /Cannot list Git source files/);
});

function runCli(cwd, args) {
  return spawnSync(process.execPath, [cli, ...args], { cwd, encoding: 'utf8' });
}

async function createProject(context) {
  const projectRoot = await mkdtemp(path.join(os.tmpdir(), 'agent-code-size-'));
  context.after(() => rm(projectRoot, { recursive: true, force: true }));
  return projectRoot;
}

async function put(root, name, content) {
  const target = path.join(root, name);
  await mkdir(path.dirname(target), { recursive: true });
  await writeFile(target, content);
}
