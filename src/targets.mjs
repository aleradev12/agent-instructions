const platforms = {
  codex: { instructions: 'AGENTS.md', skills: '.agents/skills' },
  claude: { instructions: 'CLAUDE.md', skills: '.claude/skills' },
  pi: { instructions: 'AGENTS.md', skills: '.agents/skills' },
  cursor: { instructions: '.cursor/rules/project.mdc', skills: '.cursor/skills' },
};

export function selectOutputs(configuration, targets) {
  if (targets === undefined) {
    return {
      agentOutputs: [{ output: configuration.agents.output, cursorRule: false }],
      skillOutputs: configuration.skills.outputs,
    };
  }

  if (!Array.isArray(targets) || targets.length === 0) {
    throw new Error('targets must be a non-empty array of platform names');
  }

  const supported = [...Object.keys(platforms), 'all'];
  for (const target of targets) {
    if (!supported.includes(target)) {
      throw new Error(`Unknown target: ${target}. Choose ${supported.join(', ')}.`);
    }
  }

  const selected = new Set(targets.includes('all') ? Object.keys(platforms) : targets);
  const agentOutputs = new Map();
  const skillOutputs = new Set();

  for (const target of selected) {
    const platform = platforms[target];
    agentOutputs.set(platform.instructions, {
      output: platform.instructions,
      cursorRule: target === 'cursor',
    });
    skillOutputs.add(platform.skills);
  }

  return {
    agentOutputs: [...agentOutputs.values()],
    skillOutputs: [...skillOutputs],
  };
}
