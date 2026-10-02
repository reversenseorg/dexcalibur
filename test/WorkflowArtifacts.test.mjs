import { strict as assert } from 'node:assert';
import { readFileSync } from 'node:fs';
import test from 'node:test';
import yaml from 'js-yaml';
import {spawnSync} from 'node:child_process';

const workflow = yaml.load(readFileSync(new URL('../.github/workflows/CI.yml', import.meta.url), 'utf8'));

test('release download pattern selects the platform artifacts produced by build', () => {
    const download = workflow.jobs.release_upload.steps.find(step => step.uses === 'actions/download-artifact@v4').with;
    const uploads = workflow.jobs.build.steps.filter(step => step.uses === 'actions/upload-artifact@v4' && step.with.name.startsWith('dxc-platform-'));
    assert.equal(uploads.length, 2);
    assert.equal(download.pattern, 'dxc-platform-*.tar.gz');
    assert.equal(download['merge-multiple'], true);
    assert.equal(download.path, 'out/');
    const upload = workflow.jobs.release_upload.steps.find(step => step.run).run;
    assert.match(upload, /\.\/out\/dxc-platform-ubuntu-latest\.\*\.tar\.gz/);
    for (const step of uploads) {
        assert.match(step.with.name, /^dxc-platform-.*\.(node|deno)\.tar\.gz$/);
    }
});

test('Docker context belongs to the checkout in the Docker job', () => {
    const steps = workflow.jobs.docker.steps;
    const checkout = steps.find(step => step.uses === 'actions/checkout@v4').with;
    const build = steps.find(step => step.uses === 'docker/build-push-action@v6').with;
    assert.equal(build.context, `./${checkout.path}`);
    assert.ok(build.file.startsWith(`${build.context}/`));
});

test('extra Docker notification reflects the job result', () => {
    const extra = yaml.load(readFileSync(new URL('../.github/workflows/DockerExtra.yml', import.meta.url), 'utf8'));
    const script = extra.jobs['notify-discord'].steps.find(step => step.run).run;
    const selection = script.slice(script.indexOf('if [['), script.indexOf('RUN_URL='));
    const bash = process.platform === 'win32' ? 'C:/Program Files/Git/bin/bash.exe' : 'bash';
    for (const [result, expected] of [['success', 'SUCCESS'], ['cancelled', 'CANCELLED'], ['failure', 'FAILED']]) {
        const execution = spawnSync(bash, ['-c', selection + '\nprintf "%s" "$STATUS"'], {
            env: {...process.env, PUBLISH: result}, encoding: 'utf8'
        });
        assert.ifError(execution.error);
        assert.equal(execution.status, 0, execution.stderr);
        assert.equal(execution.stdout, expected);
    }
});
