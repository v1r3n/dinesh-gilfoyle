#!/usr/bin/env node

import assert from 'node:assert/strict';
import { cpSync, existsSync, mkdirSync, mkdtempSync, readFileSync, rmSync, writeFileSync } from 'node:fs';
import { tmpdir } from 'node:os';
import { basename, dirname, join } from 'node:path';
import { spawnSync } from 'node:child_process';

const root = process.cwd();
const requiredAssets = [
  'SKILL.md',
  'gilfoyle-agent.md',
  'dinesh-agent.md',
  'comic-template.html',
];
const systemPath = '/usr/bin:/bin:/usr/sbin:/sbin';
let sandbox;

function fail(message) {
  throw new Error(message);
}

function quoteShell(value) {
  return `'${value.replaceAll("'", "'\\''")}'`;
}

function makeArchive() {
  const sourceRoot = join(sandbox, 'archive-source', 'dinesh-gilfoyle-main');
  mkdirSync(sourceRoot, { recursive: true });
  cpSync(join(root, 'dg'), join(sourceRoot, 'dg'), { recursive: true });
  cpSync(join(root, 'cursor'), join(sourceRoot, 'cursor'), { recursive: true });
  cpSync(join(root, 'windsurf'), join(sourceRoot, 'windsurf'), { recursive: true });

  const archive = join(sandbox, 'source.tar.gz');
  const result = spawnSync('/usr/bin/tar', [
    '-czf', archive, '-C', dirname(sourceRoot), basename(sourceRoot),
  ], { encoding: 'utf8', timeout: 5_000 });
  if (result.error || result.status !== 0) {
    fail(`could not create local source archive: ${result.error?.message ?? result.stderr.trim()}`);
  }
  return archive;
}

function install(client, archive) {
  const runDir = join(sandbox, client);
  const home = join(runDir, 'home');
  const bin = join(runDir, 'bin');
  mkdirSync(bin, { recursive: true });
  writeFileSync(join(bin, 'curl'), `#!/bin/sh\nexec /bin/cat ${quoteShell(archive)}\n`, { mode: 0o755 });
  writeFileSync(join(bin, client), '#!/bin/sh\nexit 0\n', { mode: 0o755 });

  const result = spawnSync('/bin/bash', ['docs/install.sh'], {
    cwd: root,
    encoding: 'utf8',
    timeout: 10_000,
    env: { ...process.env, HOME: home, PATH: `${bin}:${systemPath}` },
  });
  if (result.error?.code === 'ETIMEDOUT') fail(`${client} installation timed out`);
  if (result.error) fail(`${client} installation could not start: ${result.error.message}`);
  if (result.status !== 0) fail(`${client} installation failed: ${(result.stderr || result.stdout).trim()}`);
  if (!result.stdout.includes('Ready to review. Gilfoyle is already disappointed.')) {
    fail(`${client} installation omitted the completion message`);
  }
  return home;
}

function assertBundle(home, target) {
  for (const asset of requiredAssets) {
    const installed = join(home, target, asset);
    assert.ok(existsSync(installed), `missing ${target}/${asset}`);
    assert.deepEqual(readFileSync(installed), readFileSync(join(root, 'dg', asset)), `${target}/${asset} differs from dg/${asset}`);
  }
}

function assertNoStandaloneDestinations(home) {
  assert.ok(!existsSync(join(home, '.cursor', 'dg.mdc')), 'Cursor destination changed during full-integration install');
  assert.ok(!existsSync(join(home, '.codeium', 'windsurf', 'rules', 'dg.md')), 'Windsurf destination changed during full-integration install');
}

try {
  sandbox = mkdtempSync(join(tmpdir(), 'dg-install-check-'));
  const archive = makeArchive();

  // The issue #2 reproduction must be the first product assertion.
  const claudeHome = install('claude', archive);
  const claudeTemplate = join(claudeHome, '.claude', 'skills', 'dg', 'comic-template.html');
  assert.ok(existsSync(claudeTemplate), 'Claude Code installation is missing comic-template.html');
  assert.deepEqual(readFileSync(claudeTemplate), readFileSync(join(root, 'dg', 'comic-template.html')), 'Claude Code comic-template.html differs from dg/comic-template.html');
  assertBundle(claudeHome, '.claude/skills/dg');
  assertNoStandaloneDestinations(claudeHome);

  const codexHome = install('codex', archive);
  const codexTemplate = join(codexHome, '.codex', 'skills', 'dg', 'comic-template.html');
  assert.ok(existsSync(codexTemplate), 'Codex CLI installation is missing comic-template.html');
  assert.deepEqual(readFileSync(codexTemplate), readFileSync(join(root, 'dg', 'comic-template.html')), 'Codex CLI comic-template.html differs from dg/comic-template.html');
  assertBundle(codexHome, '.codex/skills/dg');
  assertNoStandaloneDestinations(codexHome);

  const opencodeHome = install('opencode', archive);
  const opencodeTemplate = join(opencodeHome, '.config', 'opencode', 'skills', 'dg', 'comic-template.html');
  assert.ok(existsSync(opencodeTemplate), 'OpenCode installation is missing comic-template.html');
  assert.deepEqual(readFileSync(opencodeTemplate), readFileSync(join(root, 'dg', 'comic-template.html')), 'OpenCode comic-template.html differs from dg/comic-template.html');
  assertBundle(opencodeHome, '.config/opencode/skills/dg');
  assertNoStandaloneDestinations(opencodeHome);
} catch (error) {
  console.error(error.message);
  process.exitCode = 1;
} finally {
  if (sandbox && existsSync(sandbox)) rmSync(sandbox, { recursive: true, force: true });
}
