const { Octokit } = require('octokit');
// const config = require('./.config.json');
const AdmZip = require('adm-zip');
const fs = require('fs-extra');

const OWNER = 'reasonly8';
const TARGET_REPO = 'reasonly8-notes';
const TARGET_BRANCH = 'main';
const API_VERSION = '2022-11-28';
const GITHUB_TOKEN = process.argv[2]; // Apply Github Token: https://github.com/settings/tokens
const DIR_RE = `^${OWNER}-${TARGET_REPO}-.*?$`;
const DIR = './resources';
const FOLDER_NAME = 'notes';

if (!GITHUB_TOKEN) {
  throw new Error('`token` is not exist on command line.');
}

/**
 * Request target repository's zip file
 * @returns
 */
async function getTargetRepoZip() {
  const octokit = new Octokit({
    auth: GITHUB_TOKEN,
  });

  const res = await octokit.request('GET /repos/{owner}/{repo}/zipball/{ref}', {
    owner: OWNER,
    repo: TARGET_REPO,
    ref: TARGET_BRANCH,
    headers: {
      'X-GitHub-Api-Version': API_VERSION,
    },
  });

  if (!(res.data instanceof ArrayBuffer)) {
    throw new Error('Error: data is not ArrayBuffer.');
  }
  return res.data;
}

/**
 * Unzip data to outputPath
 * @param {ArrayBuffer} data zip file ArrayBuffer
 * @param {string} outputPath unzip to ...
 */
function unzip(data, outputPath) {
  const zip = new AdmZip(Buffer.from(data));
  zip.extractAllTo(outputPath, /* overwrite */ true, true);
}

/**
 * rename to FOLDER_NAME
 */
function rename() {
  const paths = fs.readdirSync(DIR);
  const targetPath = paths.find(path => {
    return new RegExp(DIR_RE).test(path);
  });
  const destPath = `${DIR}/${FOLDER_NAME}`;
  const curPath = `${DIR}/${targetPath}`;

  fs.copySync(curPath, destPath);
  fs.rmSync(curPath, { recursive: true });
}

async function main() {
  const data = await getTargetRepoZip();
  unzip(data, DIR);
  rename();
}

main();
