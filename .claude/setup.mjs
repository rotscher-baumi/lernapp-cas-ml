import { spawnSync } from 'node:child_process';
import path from 'node:path';
import { fileURLToPath } from 'node:url';

export const project = fileURLToPath(new URL('..', import.meta.url));
export const installSteps = [];

export function setupCloud({ env = process.env, run = spawnSync, log = console.log, actions = false } = {}) {
  if (actions && env.GITHUB_ACTIONS !== 'true') {
    throw new Error('--actions is only supported inside GitHub Actions.');
  }
  if (!actions && env.CLAUDE_CODE_REMOTE !== 'true') {
    log('Claude setup: not a cloud session; local dependencies are unchanged.');
    return;
  }
  for (const step of installSteps) {
    log(`Claude setup: ${step.command} ${step.args.join(' ')} in ${step.cwd}`);
    const result = run(step.command, step.args, {
      cwd: path.resolve(project, step.cwd), env, shell: false, stdio: 'inherit',
      timeout: step.timeout,
    });
    if (result.error) throw result.error;
    if (result.status !== 0) {
      throw new Error(`${step.command} failed (${result.signal || result.status}); setup is incomplete. No automatic retry.`);
    }
  }
  log(installSteps.length
    ? 'Claude setup: dependencies installed. Run the checks documented in .claude/cloud.md.'
    : 'Claude setup: no package installation required; this repository has no application dependency manifest.');
}

if (process.argv[1] && path.resolve(process.argv[1]) === fileURLToPath(import.meta.url)) {
  try {
    const args = process.argv.slice(2);
    if (args.length > 1 || args.some(arg => arg !== '--actions')) {
      throw new Error('Unknown setup option; only --actions is supported.');
    }
    setupCloud({ actions: args.includes('--actions') });
  } catch (error) {
    console.error(`Claude setup: ${error.message}`);
    process.exitCode = 1;
  }
}
