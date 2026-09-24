import assert from 'node:assert/strict';
import { mkdtemp, mkdir, readFile, rm, writeFile } from 'node:fs/promises';
import os from 'node:os';
import path from 'node:path';
import test from 'node:test';

import { generateProject } from '../src/index.mjs';

test('combines shared defaults with local instructions', async testContext => {
  const projectRoot = await createProject(testContext);
  await writeProjectFile(projectRoot, 'docs/agents/project.md', '# Project Rule\n\nKeep project-specific behavior explicit.\n');

  const result = await generateProject({ projectRoot, log: false });
  const output = await readFile(path.join(projectRoot, 'AGENTS.md'), 'utf8');

  assert.equal(result.agentDocumentCount, 10);
  assert.match(output, /## shared:code-style/);
  assert.match(output, /## docs\/agents\/project\.md/);
  assert.match(output, /### Project Rule/);
  assert.equal(result.skillCount, 2);
  const sharedSkill = await readFile(path.join(projectRoot, '.agents/skills/board-task-workflow/SKILL.md'), 'utf8');
  assert.match(sharedSkill, /GPT Luna/);
  assert.equal(sharedSkill, await readFile(path.join(projectRoot, '.claude/skills/board-task-workflow/SKILL.md'), 'utf8'));
  assert.match(await readFile(path.join(projectRoot, '.agents/skills/storybook/SKILL.md'), 'utf8'), /React web and React Native/);
});

test('can disable individual defaults or the complete default set', async testContext => {
  const projectRoot = await createProject(testContext);
  await writeProjectFile(projectRoot, 'docs/agents/project.md', '# Local Only\n');
  await writeConfiguration(projectRoot, {
    defaults: { enabled: true, disabled: ['fsd'] },
    skills: { enabled: false },
  });

  await generateProject({ projectRoot, log: false });
  let output = await readFile(path.join(projectRoot, 'AGENTS.md'), 'utf8');
  assert.doesNotMatch(output, /## shared:fsd/);
  assert.match(output, /## shared:testing/);

  await writeConfiguration(projectRoot, {
    defaults: { enabled: false },
    skills: { enabled: false },
  });
  await generateProject({ projectRoot, log: false });
  output = await readFile(path.join(projectRoot, 'AGENTS.md'), 'utf8');
  assert.doesNotMatch(output, /## shared:/);
  assert.match(output, /## docs\/agents\/project\.md/);
});

test('disables shared skills without removing local project skills', async testContext => {
  const projectRoot = await createProject(testContext);
  await writeProjectFile(projectRoot, 'docs/skills/project-review.md', [
    '---',
    'name: project-review',
    'description: "Review project contracts."',
    '---',
    '',
    '# Review',
  ].join('\n'));
  await generateProject({ projectRoot, log: false });
  await writeConfiguration(projectRoot, { skills: { disabled: ['board-task-workflow'] } });
  const result = await generateProject({ projectRoot, log: false });
  assert.equal(result.skillCount, 2);
  await assert.rejects(readFile(path.join(projectRoot, '.agents/skills/board-task-workflow/SKILL.md'), 'utf8'), { code: 'ENOENT' });
  assert.match(await readFile(path.join(projectRoot, '.agents/skills/storybook/SKILL.md'), 'utf8'), /React web and React Native/);
  assert.match(await readFile(path.join(projectRoot, '.agents/skills/project-review/SKILL.md'), 'utf8'), /# Review/);
});

test('rejects unknown disabled and duplicate shared skill names', async testContext => {
  const projectRoot = await createProject(testContext);
  await writeConfiguration(projectRoot, { skills: { disabled: ['missing-skill'] } });
  await assert.rejects(generateProject({ projectRoot, log: false }), /Unknown shared skill/);

  await writeConfiguration(projectRoot, {});
  await writeProjectFile(projectRoot, 'docs/skills/board-task-workflow.md', [
    '---',
    'name: board-task-workflow',
    'description: "Another board skill."',
    '---',
    '',
    '# Duplicate',
  ].join('\n'));
  await assert.rejects(generateProject({ projectRoot, log: false }), /Duplicate shared and project skill name/);
});

test('generates matching Codex and Claude skills and removes stale output', async testContext => {
  const projectRoot = await createProject(testContext);
  const skillSource = [
    '---',
    'name: project-review',
    'description: "Review changes against project contracts."',
    '---',
    '',
    '# Project Review',
    '',
    'Read the project contracts before reviewing.',
    '',
  ].join('\n');
  await writeProjectFile(projectRoot, 'docs/skills/project-review.md', skillSource);

  await generateProject({ projectRoot, log: false });
  const codexPath = path.join(projectRoot, '.agents/skills/project-review/SKILL.md');
  const claudePath = path.join(projectRoot, '.claude/skills/project-review/SKILL.md');
  assert.equal(await readFile(codexPath, 'utf8'), await readFile(claudePath, 'utf8'));

  await rm(path.join(projectRoot, 'docs/skills/project-review.md'));
  await generateProject({ projectRoot, log: false });
  await assert.rejects(readFile(codexPath, 'utf8'), { code: 'ENOENT' });
  await assert.rejects(readFile(claudePath, 'utf8'), { code: 'ENOENT' });
});

async function createProject(testContext) {
  const projectRoot = await mkdtemp(path.join(os.tmpdir(), 'agent-instructions-'));
  testContext.after(() => rm(projectRoot, { recursive: true, force: true }));
  return projectRoot;
}

async function writeConfiguration(projectRoot, configuration) {
  await writeProjectFile(
    projectRoot,
    'agent-instructions.config.json',
    `${JSON.stringify(configuration, null, 2)}\n`,
  );
}

async function writeProjectFile(projectRoot, relativePath, content) {
  const filePath = path.join(projectRoot, relativePath);
  await mkdir(path.dirname(filePath), { recursive: true });
  await writeFile(filePath, content, 'utf8');
}
