import { readFile } from 'node:fs/promises';
import { resolve } from 'node:path';

const guides = [
  {
    file: '.claude/INSTALL.md',
    target: '~/.claude/skills/dg/comic-template.html',
    invocation: '/dg',
  },
  {
    file: '.codex/INSTALL.md',
    target: '~/.codex/skills/dg/comic-template.html',
    invocation: '$dg',
  },
  {
    file: '.opencode/INSTALL.md',
    target: '~/.config/opencode/skills/dg/comic-template.html',
    invocation: '/dg',
  },
];

function fail(reason) {
  process.stderr.write(`${reason}\n`);
  process.exitCode = 1;
}

try {
  for (const guide of guides) {
    const contents = await readFile(resolve(process.cwd(), guide.file), 'utf8');

    if (!/four-file bundle/i.test(contents)) {
      throw new Error(`${guide.file} does not describe installation as a four-file bundle`);
    }
    if (!contents.includes('comic-template.html') || !contents.includes(guide.target)) {
      throw new Error(`${guide.file} does not name ${guide.target}`);
    }
    if (!contents.includes(guide.invocation)) {
      throw new Error(`${guide.file} does not preserve the ${guide.invocation} invocation label`);
    }
  }
} catch (error) {
  fail(error.message);
}
