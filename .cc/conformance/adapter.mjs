#!/usr/bin/env node

/**
 * Conformance adapter for the static /dg installer.
 *
 * docs/install.sh is not a server: its public interface is a one-shot shell
 * command.  Each reset therefore creates a fresh, isolated HOME and a local
 * source-archive fixture; each Install action runs that command to completion.
 */
import { createInterface } from 'node:readline';
import { spawnSync } from 'node:child_process';
import {
  chmodSync,
  copyFileSync,
  existsSync,
  lstatSync,
  mkdirSync,
  mkdtempSync,
  readdirSync,
  readFileSync,
  rmSync,
  writeFileSync,
} from 'node:fs';
import { tmpdir } from 'node:os';
import { basename, dirname, join, resolve } from 'node:path';
import { fileURLToPath } from 'node:url';

const repoRoot = resolve(dirname(fileURLToPath(import.meta.url)), '../..');
const installer = join(repoRoot, 'docs', 'install.sh');
const assets = [
  'SKILL.md',
  'gilfoyle-agent.md',
  'dinesh-agent.md',
  'comic-template.html',
];
const targets = {
  claude: '.claude/skills/dg',
  codex: '.codex/skills/dg',
  opencode: '.config/opencode/skills/dg',
};
const summaries = {
  claude: 'Claude Code',
  codex: 'Codex CLI',
  opencode: 'OpenCode',
};
const supportedAgents = new Set(Object.keys(targets));
let sandbox;
let lastResult = 'idle';

function fail(message) {
  throw new Error(message);
}

function run(command, args, options = {}) {
  const child = spawnSync(command, args, {
    encoding: 'utf8',
    timeout: 10_000,
    ...options,
  });
  if (child.error) fail(`${command} could not start: ${child.error.message}`);
  if (child.status !== 0) {
    fail(`${command} failed (${child.status ?? 'signal'}): ${child.stderr || child.stdout}`.trim());
  }
  return child;
}

function writeExecutable(path, source) {
  writeFileSync(path, source, 'utf8');
  chmodSync(path, 0o755);
}

function createArchive(root) {
  const sourceRoot = join(root, 'source', 'dinesh-gilfoyle-main');
  const sourceDg = join(sourceRoot, 'dg');
  mkdirSync(sourceDg, { recursive: true });
  for (const asset of assets) {
    copyFileSync(join(repoRoot, 'dg', asset), join(sourceDg, asset));
  }

  const archive = join(root, 'source.tar.gz');
  run('tar', ['-czf', archive, '-C', dirname(sourceRoot), basename(sourceRoot)]);
  return archive;
}

function reset() {
  if (!existsSync(installer)) {
    fail(`Cannot start program: public installer is missing at ${installer}`);
  }

  if (sandbox) rmSync(sandbox.root, { recursive: true, force: true });
  const root = mkdtempSync(join(tmpdir(), 'dg-installer-conformance-'));
  const home = join(root, 'home');
  const bin = join(root, 'bin');
  mkdirSync(home);
  mkdirSync(bin);

  const archive = createArchive(root);
  writeExecutable(join(bin, 'curl'), `#!/bin/sh\ncat ${JSON.stringify(archive)}\n`);

  // Keep PATH limited to these known commands so exactly one agent is detected.
  for (const command of ['bash', 'cat', 'mktemp', 'tar', 'rm', 'mkdir', 'cp']) {
    const location = run('sh', ['-c', `command -v ${command}`]).stdout.trim();
    if (!location) fail(`Cannot start program: required command ${command} is unavailable`);
    writeExecutable(join(bin, command), `#!/bin/sh\nexec ${JSON.stringify(location)} \"$@\"\n`);
  }

  sandbox = { root, home, bin };
  lastResult = 'idle';
}

function install(agent) {
  if (!supportedAgents.has(agent)) fail(`Unknown agent: ${String(agent)}`);
  if (!sandbox) reset();
  writeExecutable(join(sandbox.bin, agent), '#!/bin/sh\nexit 0\n');
  try {
    const child = spawnSync('bash', [installer], {
      cwd: repoRoot,
      env: { HOME: sandbox.home, PATH: sandbox.bin },
      encoding: 'utf8',
      timeout: 10_000,
    });
    if (child.error) fail(`Installer could not start: ${child.error.message}`);
    if (child.status !== 0) {
      fail(`Installer failed (${child.status ?? 'signal'}): ${child.stderr || child.stdout}`.trim());
    }
    if (!child.stdout.includes(summaries[agent])) {
      fail(`Installer completed without the ${summaries[agent]} detected-agent summary`);
    }
  } finally {
    rmSync(join(sandbox.bin, agent), { force: true });
  }
  lastResult = 'installed';
  return lastResult;
}

function regularFiles(agent) {
  if (!sandbox) return [];
  const target = join(sandbox.home, targets[agent]);
  if (!existsSync(target)) return [];
  return readdirSync(target)
    .filter((name) => lstatSync(join(target, name)).isFile())
    .sort();
}

function isComplete(agent) {
  const files = regularFiles(agent);
  if (files.length !== assets.length || files.some((file, index) => file !== [...assets].sort()[index])) {
    return false;
  }
  const target = join(sandbox.home, targets[agent]);
  return assets.every((asset) =>
    readFileSync(join(target, asset)).equals(readFileSync(join(repoRoot, 'dg', asset))),
  );
}

function inspect(agent) {
  if (!supportedAgents.has(agent)) fail(`Unknown agent: ${String(agent)}`);
  lastResult = isComplete(agent) ? 'complete' : 'incomplete';
  return lastResult;
}

function state() {
  return {
    installed: Object.fromEntries(Object.keys(targets).map((agent) => [agent, regularFiles(agent)])),
    result: lastResult,
  };
}

function handle(request) {
  if (!request || typeof request !== 'object') fail('Request must be a JSON object');
  if (request.op === 'reset') {
    reset();
    return { ok: true };
  }
  if (request.op === 'state') return { ok: true, state: state() };
  if (request.op !== 'step') fail(`Unknown operation: ${String(request.op)}`);
  if (!Array.isArray(request.args) || request.args.length !== 1) {
    fail('Each action requires one positional agent argument');
  }
  let result;
  if (request.action === 'Install') result = install(request.args[0]);
  else if (request.action === 'Inspect') result = inspect(request.args[0]);
  else fail(`Unknown action: ${String(request.action)}`);
  return { ok: true, result };
}

const input = createInterface({ input: process.stdin, crlfDelay: Infinity });
input.on('line', (line) => {
  let response;
  try {
    response = handle(JSON.parse(line));
  } catch (error) {
    console.error(error instanceof Error ? error.message : String(error));
    response = { ok: false, error: error instanceof Error ? error.message : String(error) };
  }
  process.stdout.write(`${JSON.stringify(response)}\n`);
});
input.on('close', () => {
  if (sandbox) rmSync(sandbox.root, { recursive: true, force: true });
});
