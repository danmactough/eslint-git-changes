var extname = require('path').extname;
var exec = require('child_process').exec;
var spawn = require('child_process').spawn;

module.exports = function (options, done) {
  findPreviousCommits(function (err, hasPreviousCommits) {
    if (err) return done(err);
    // If we have previous commits, diff against HEAD, otherwise an empty tree object
    var against = hasPreviousCommits ? 'HEAD' : '4b825dc642cb6eb9a060e54bf8d69288fbee4904';

    var diffIndexOptions = [
      'diff-index',
      '--diff-filter=AM',
      '--name-only',
      against
    ];

    if (options.c) {
      diffIndexOptions.push('--cached');
    }

    listStagedFiles(diffIndexOptions, function (err, stagedFiles) {
      if (err) return done(err);

      var files;
      var extensions = [
        'js'
      ];

      if (options.json) {
        extensions.push('json');
      }
      if (options.jsx) {
        extensions.push('jsx');
      }

      var jsExtensionRegex = new RegExp('^\\.(?:' + extensions.join('|') + ')$', 'i');

      files = stagedFiles.filter(function (file) {
        var extension = extname(file);
        return jsExtensionRegex.test(extension);
      });

      // If we found any files to check, run eslint on them
      // otherwise, just exit -- nothing to do
      if (files.length > 0) {
        if (options.json) {
          files.unshift('--plugin json');
        }
        lintFiles(files);
      }
      else {
        done();
      }
    });
  });
};

// Check if we have previous commits or this is the initial commit
function findPreviousCommits (cb) {
  var child = exec('git rev-parse --verify HEAD', { encoding: 'utf8' }, function (err, stdout, stderr) { // eslint-disable-line no-unused-vars
    if (err) return cb(buildError(err, child.exitCode));
    else return cb(null, child.exitCode === 0);
  });
}

// List all javascripty files to be committed
function listStagedFiles (diffIndexOptions, cb) {
  var child = exec('git ' + diffIndexOptions.join(' '), { encoding: 'utf8' }, function (err, stdout, stderr) {
    if (err) return cb(buildError(err, child.exitCode));
    else if (child.exitCode !== 0) return cb(buildError(stderr, child.exitCode));
    else {
      var stagedFiles = stdout.split('\n');
      return cb(null, stagedFiles);
    }
  });
}

function lintFiles (files) {
  var child = spawn('eslint', files, { encoding: 'utf8', shell: true, stdio: 'inherit' });
  child.on('close', function (code) {
    process.exit(code);
  });
}

function buildError (msg, code) {
  var error = new Error(msg);
  error.code = code;
  return error;
}
