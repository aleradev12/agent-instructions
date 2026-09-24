import { execFileSync } from 'node:child_process';
import { lstat, readFile } from 'node:fs/promises';
import path from 'node:path';

const sourceExtensions = new Set([
  '.js', '.jsx', '.mjs', '.cjs', '.ts', '.tsx', '.mts', '.cts',
  '.vue', '.svelte', '.py', '.go', '.rs', '.java', '.kt', '.swift',
]);
const excludedDirectories = new Set([
  'node_modules', 'vendor', 'dist', 'build', 'coverage', 'generated',
  '__generated__', '__snapshots__', '.git', '.pi',
]);

export async function inspectCodeSize({ projectRoot = process.cwd(), files } = {}) {
  const root = path.resolve(projectRoot);
  const fromGit = files === undefined;
  const candidates = files ?? listGitFiles(root);
  const findings = [];
  let checked = 0;
  let skipped = 0;
  const visited = new Set();

  for (const candidate of candidates) {
    const absolutePath = path.resolve(root, candidate);
    const relativePath = path.relative(root, absolutePath);
    if (relativePath === '..' || relativePath.startsWith(`..${path.sep}`)) {
      throw new Error(`Source path must stay inside the project: ${candidate}`);
    }
    if (visited.has(absolutePath)) continue;
    visited.add(absolutePath);
    if (!isSourceFile(relativePath)) {
      skipped += 1;
      continue;
    }

    let stat;
    try {
      stat = await lstat(absolutePath);
    } catch (error) {
      if (fromGit && error.code === 'ENOENT') {
        skipped += 1;
        continue;
      }
      throw error;
    }
    if (stat.isSymbolicLink()) {
      skipped += 1;
      continue;
    }
    if (!stat.isFile()) throw new Error(`Expected a source file: ${candidate}`);

    const content = await readFile(absolutePath, 'utf8');
    const lines = content.length === 0 ? 0 : content.split('\n').length - Number(content.endsWith('\n'));
    checked += 1;
    if (lines > 350) {
      findings.push({
        path: relativePath.split(path.sep).join('/'),
        lines,
        level: lines >= 500 ? 'oversized' : 'warning',
      });
    }
  }

  findings.sort((left, right) => right.lines - left.lines || left.path.localeCompare(right.path));
  return { checked, skipped, findings };
}

function isSourceFile(relativePath) {
  const segments = relativePath.split(path.sep);
  return sourceExtensions.has(path.extname(relativePath))
    && !segments.some(segment => excludedDirectories.has(segment))
    && !/\.d\.(?:ts|mts|cts)$/.test(relativePath)
    && !/\.(?:generated|gen)\./.test(path.basename(relativePath));
}

function listGitFiles(root) {
  try {
    return execFileSync('git', ['ls-files', '--cached', '--others', '--exclude-standard', '-z'], {
      cwd: root,
      encoding: 'utf8',
      maxBuffer: 16 * 1024 * 1024,
      stdio: ['ignore', 'pipe', 'pipe'],
    }).split('\0').filter(Boolean);
  } catch (error) {
    throw new Error('Cannot list Git source files. Run in a Git checkout or provide explicit file paths.', { cause: error });
  }
}
