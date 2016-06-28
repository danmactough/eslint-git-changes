'use strict';
const extname = require('path').extname;
const $ = require('child_process').spawnSync;

module.exports = function (options) {
  // Check if we have previous commits or this is the initial commit
  const hasPreviousCommits = $('git', ['rev-parse', '--verify', 'HEAD'], { encoding: 'utf8' }).status === 0;
  // If we have previous commits, diff against HEAD, otherwise an empty tree object
  const against = hasPreviousCommits ? 'HEAD' : '4b825dc642cb6eb9a060e54bf8d69288fbee4904';

  let diffIndexOptions = [
    'diff-index',
    '--diff-filter=AM',
    '--name-only',
    against
  ];

  if (options.c) {
    diffIndexOptions.push('--cached');
  }

  // List all javascripty files to be committed
  const diffIndex = $('git', diffIndexOptions, { encoding: 'utf8' });
  let files;

  if (diffIndex.status === 0) {
    const jsExtensionRegex = /^\.(?:js|json|jsx)$/i;
    files = diffIndex.stdout.split('\n').filter(file => {
      const extension = extname(file);
      return jsExtensionRegex.test(extension);
    });
  }
  else {
    return onError(diffIndex.stderr, diffIndex.status);
  }

  // If we found any files to check, run eslint on them
  // otherwise, just exit -- nothing to do
  if (files.length > 0) {
    const eslintResults = $('eslint', files, { encoding: 'utf8', stdio: 'inherit' });
    process.exit(eslintResults.status);
  }
};

function onError (msg, code) {
  console.error(msg);
  process.exit(code);
}
