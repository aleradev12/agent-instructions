import assert from 'node:assert/strict';
import { spawnSync } from 'node:child_process';
import { mkdtemp, mkdir, readFile, readdir, rm, writeFile } from 'node:fs/promises';
import os from 'node:os';
import path from 'node:path';
import test from 'node:test';
import { fileURLToPath } from 'node:url';

import { generateProject } from '../src/index.mjs';

const cliPath = fileURLToPath(new URL('../bin/agent-instructions.mjs', import.meta.url));
const instructionPaths = ['AGENTS.md', 'CLAUDE.md', '.cursor/rules/project.mdc'];
const skillPaths = ['.agents/skills', '.claude/skills', '.cursor/skills'];

for (const [target, instructions, skills] of [
  ['codex', 'AGENTS.md', '.agents/skills'],
  ['pi', 'AGENTS.md', '.agents/skills'],
  ['claude', 'CLAUDE.md', '.claude/skills'],
  ['cursor', '.cursor/rules/project.mdc', '.cursor/skills'],
]) {
  test(`generates only ${target} outputs`, async context => {
    const projectRoot = await createProject(context);
    const result = await generateProject({ projectRoot, targets: [target], log: false });
    assert.deepEqual(result.agentOutputs, [instructions]);
    assert.equal(result.agentOutput, instructions);
    assert.equal(result.skillCount, 3);
    assert.match(await get(projectRoot, instructions), /## shared:testing/);
    assert.match(await get(projectRoot, `${skills}/storybook/SKILL.md`), /name: storybook/);
    for (const output of instructionPaths.filter(output => output !== instructions)) {
      await assertMissing(projectRoot, output);
    }
    for (const output of skillPaths.filter(output => output !== skills)) {
      await assertMissing(projectRoot, `${output}/storybook/SKILL.md`);
    }
    await assertMissing(projectRoot, '.pi');
  });
}

test('all platforms share instructions and skills without duplicate Codex/Pi outputs', async context => {
  const projectRoot = await createProject(context);
  const result = await generateProject({ projectRoot, targets: ['all'], log: false });
  assert.deepEqual(result.agentOutputs, instructionPaths);
  const agents = await get(projectRoot, 'AGENTS.md');
  assert.equal(await get(projectRoot, 'CLAUDE.md'), agents);
  assert.equal(await get(projectRoot, '.cursor/rules/project.mdc'), `---\nalwaysApply: true\n---\n\n${agents}`);
  for (const output of skillPaths) {
    assert.equal(
      await get(projectRoot, `${output}/storybook/SKILL.md`),
      await get(projectRoot, '.agents/skills/storybook/SKILL.md'),
    );
  }
  const subset = await generateProject({ projectRoot, targets: ['codex', 'pi', 'codex'], log: false });
  assert.deepEqual(subset.agentOutputs, ['AGENTS.md']);
  await assertMissing(projectRoot, '.pi');
});

test('Cursor embeds instruction sources but keeps linked documents external with correct relative paths', async context => {
  const projectRoot = await createProject(context);
  await put(projectRoot, 'agent-instructions.config.json', JSON.stringify({
    defaults: { enabled: false },
    skills: { enabled: false },
  }));
  await put(projectRoot, 'docs/agents/project.md', [
    '# Project rules',
    '',
    'Before changing API, read [contracts](../api.md#contracts).',
    '[External](https://example.com/api) [Local](#local) [Root](/docs/api.md)',
    '',
    '```markdown',
    '# Example heading',
    '[example](relative.md)',
    '```',
    '',
  ].join('\n'));
  await put(projectRoot, 'docs/api.md', '# Contracts\n\nLinked-only document body.\n');
  await generateProject({ projectRoot, targets: ['all'], log: false });
  const cursor = await get(projectRoot, '.cursor/rules/project.mdc');
  assert.match(cursor, /^---\nalwaysApply: true\n---\n/);
  assert.match(cursor, /### Project rules/);
  assert.match(cursor, /\[contracts\]\(\.\.\/\.\.\/docs\/api\.md#contracts\)/);
  assert.match(cursor, /\[External\]\(https:\/\/example.com\/api\)/);
  assert.match(cursor, /\[Local\]\(#local\) \[Root\]\(\/docs\/api\.md\)/);
  assert.doesNotMatch(cursor, /Linked-only document body/);
  assert.match(cursor, /^# Example heading$/m);
  assert.match(cursor, /^\[example\]\(relative\.md\)$/m);
  assert.match(await get(projectRoot, 'AGENTS.md'), /\[contracts\]\(docs\/api\.md#contracts\)/);
  for (const output of skillPaths) {
    await assertMissing(projectRoot, output);
  }
});

test('scoped regeneration and stale skill cleanup leave other platforms unchanged', async context => {
  const projectRoot = await createProject(context);
  await put(projectRoot, 'docs/skills/local-review.md', '---\nname: local-review\ndescription: Local review.\n---\n\n# Review\n');
  await generateProject({ projectRoot, targets: ['all'], log: false });
  const agents = await get(projectRoot, 'AGENTS.md');
  const claude = await get(projectRoot, 'CLAUDE.md');
  const skill = await get(projectRoot, '.agents/skills/local-review/SKILL.md');
  await rm(path.join(projectRoot, 'docs/skills/local-review.md'));
  await put(projectRoot, 'docs/agents/new.md', '# Updated project instructions\n');
  await generateProject({ projectRoot, targets: ['cursor'], log: false });
  assert.equal(await get(projectRoot, 'AGENTS.md'), agents);
  assert.equal(await get(projectRoot, 'CLAUDE.md'), claude);
  assert.equal(await get(projectRoot, '.agents/skills/local-review/SKILL.md'), skill);
  assert.equal(await get(projectRoot, '.claude/skills/local-review/SKILL.md'), skill);
  assert.match(await get(projectRoot, '.cursor/rules/project.mdc'), /Updated project instructions/);
  await assertMissing(projectRoot, '.cursor/skills/local-review');
});

test('legacy configured outputs remain supported; explicit targets use native paths and the same sources', async context => {
  const projectRoot = await createProject(context);
  await put(projectRoot, 'agent-instructions.config.json', JSON.stringify({
    defaults: { enabled: false },
    agents: { sourceDirectory: 'sources', output: 'custom/INSTRUCTIONS.md' },
    skills: { sourceDirectory: 'procedures', outputs: ['custom/skills'] },
  }));
  await put(projectRoot, 'sources/project.md', '# Custom source\n\n[Guide](../guide.md)\n');
  const legacy = await generateProject({ projectRoot, log: false });
  assert.equal(legacy.agentOutput, 'custom/INSTRUCTIONS.md');
  assert.match(await get(projectRoot, legacy.agentOutput), /\[Guide\]\(\.\.\/guide\.md\)/);
  assert.match(await get(projectRoot, 'custom/skills/storybook/SKILL.md'), /name: storybook/);
  await assertMissing(projectRoot, 'CLAUDE.md');
  await assertMissing(projectRoot, '.cursor');
  await generateProject({ projectRoot, targets: ['cursor'], log: false });
  assert.match(await get(projectRoot, '.cursor/rules/project.mdc'), /\[Guide\]\(\.\.\/\.\.\/guide\.md\)/);
  assert.match(await get(projectRoot, '.cursor/skills/storybook/SKILL.md'), /name: storybook/);
  await assertMissing(projectRoot, 'AGENTS.md');
});

test('invalid API targets fail before creating any outputs', async context => {
  const projectRoot = await createProject(context);
  for (const targets of [[], null, 'cursor', ['unknown'], ['all', 'unknown'], ['__proto__']]) {
    await assert.rejects(generateProject({ projectRoot, targets, log: false }), /targets must|Unknown target/);
    assert.deepEqual(await readdir(projectRoot), []);
  }
});

test('explicit targets refuse manual instructions or skills before writing other outputs', async context => {
  const projectRoot = await createProject(context);
  await put(projectRoot, 'CLAUDE.md', '# Handwritten instructions\n');
  await assert.rejects(generateProject({ projectRoot, targets: ['all'], log: false }), /manually authored instructions: CLAUDE.md/);
  assert.deepEqual(await readdir(projectRoot), ['CLAUDE.md']);
  assert.equal(await get(projectRoot, 'CLAUDE.md'), '# Handwritten instructions\n');
  await rm(path.join(projectRoot, 'CLAUDE.md'));
  await put(projectRoot, '.cursor/skills/storybook/SKILL.md', '# Handwritten skill\n');
  await assert.rejects(generateProject({ projectRoot, targets: ['all'], log: false }), /manually extended skill/);
  assert.equal(await get(projectRoot, '.cursor/skills/storybook/SKILL.md'), '# Handwritten skill\n');
  await assertMissing(projectRoot, 'AGENTS.md');
  await assertMissing(projectRoot, '.agents');
  await assertMissing(projectRoot, 'CLAUDE.md');
  await assertMissing(projectRoot, '.cursor/rules');
});

test('Cursor stale skill cleanup refuses directories with extra files', async context => {
  const projectRoot = await createProject(context);
  await generateProject({ projectRoot, targets: ['cursor'], log: false });
  await put(projectRoot, '.cursor/skills/storybook/notes.md', 'Keep my notes.\n');
  await put(projectRoot, 'agent-instructions.config.json', JSON.stringify({ skills: { disabled: ['storybook'] } }));
  await assert.rejects(generateProject({ projectRoot, targets: ['cursor'], log: false }), /contains extra files/);
  assert.equal(await get(projectRoot, '.cursor/skills/storybook/notes.md'), 'Keep my notes.\n');
  assert.match(await get(projectRoot, '.cursor/skills/storybook/SKILL.md'), /name: storybook/);
});

test('CLI supports repeated targets, equals syntax, config and help', async context => {
  const projectRoot = await createProject(context);
  const help = runCli(projectRoot, ['--help']);
  assert.equal(help.status, 0, help.stderr);
  assert.match(help.stdout, /Platforms: codex, claude, pi, cursor, all/);
  assert.deepEqual(await readdir(projectRoot), []);
  await put(projectRoot, 'custom.json', JSON.stringify({ title: 'Custom title', skills: { enabled: false } }));
  const generated = runCli(projectRoot, ['--target=cursor', '--config', 'custom.json', '--target', 'claude']);
  assert.equal(generated.status, 0, generated.stderr);
  assert.match(await get(projectRoot, '.cursor/rules/project.mdc'), /# Custom title/);
  assert.match(await get(projectRoot, 'CLAUDE.md'), /# Custom title/);
  assert.match(generated.stdout, /Generated and verified .cursor\/rules\/project.mdc, CLAUDE.md/);
  await assertMissing(projectRoot, 'AGENTS.md');
  await assertMissing(projectRoot, '.cursor/skills');
});

test('CLI rejects invalid targets and arguments without generating files', async context => {
  const projectRoot = await createProject(context);
  for (const args of [
    ['--target', 'unknown'], ['--target'], ['--target='], ['--unknown'], ['cursor'], ['--config'],
  ]) {
    const result = runCli(projectRoot, args);
    assert.equal(result.status, 1, `${args}: ${result.stderr}`);
    assert.match(result.stderr, /Usage: agent-instructions/);
    assert.deepEqual(await readdir(projectRoot), []);
  }
});

function runCli(cwd, args) {
  return spawnSync(process.execPath, [cliPath, ...args], { cwd, encoding: 'utf8' });
}

async function createProject(context) {
  const root = await mkdtemp(path.join(os.tmpdir(), 'agent-targets-'));
  context.after(() => rm(root, { recursive: true, force: true }));
  return root;
}

async function put(root, name, content) {
  const filePath = path.join(root, name);
  await mkdir(path.dirname(filePath), { recursive: true });
  await writeFile(filePath, content);
}

function get(root, name) {
  return readFile(path.join(root, name), 'utf8');
}

async function assertMissing(root, name) {
  await assert.rejects(readFile(path.join(root, name)), { code: 'ENOENT' });
}
