// Run error handling tests.
// Usage: node testing/run-errors.js
// Requires: run from project root

var path = require('path');
var fs = require('fs');
var cp = require('child_process');

var TXTS = path.resolve('bin', 'txts');
var ERRORS_DIR = path.resolve('testing', 'errors');

// Map of test file -> expected substring in error message (stderr)
var TESTS = {
  'test_call_without_import.txts':    'is not imported',
  'test_write_unimported.txts':       'is not imported',
  'test_read_unimported.txts':        'Cannot read',
  'test_write_txts_readonly.txts':    'only "txts.OUTPUT" is writable',
  'test_variable_not_found.txts':     'REPLACE requires a source',
  'test_recursion_limit.txts':        'Recursion limit',
  'test_function_not_found.txts':     'not found in project root'
};

var CLI_TESTS = [
  {
    name: 'Missing file',
    args: ['nonexistent.txts'],
    expect: 'not found'
  },
  {
    name: 'Wrong extension',
    args: ['test.txt'],
    expect: 'must have a'
  },
  {
    name: 'Extension not specified',
    args: ['extension'],
    expect: 'Expected extension'
  },
  {
    name: 'Extension name not given for install',
    args: ['extension', 'install'],
    expect: 'Expected extension name to install'
  },
  {
    name: 'Unknown extension',
    args: ['extension', 'install', 'unknown-ext'],
    expect: 'not found'
  }
];

function runFileTest(testName, expectedSubstring) {
  var filePath = path.join(ERRORS_DIR, testName);

  if (!fs.existsSync(filePath)) {
    return { name: testName, passed: false, error: 'Test file not found: ' + filePath };
  }

  try {
    var result = cp.spawnSync('node', [TXTS, filePath], { encoding: 'utf8', cwd: ERRORS_DIR });

    var stderr = (result.stderr || '').trim();
    var stdout = (result.stdout || '').trim();
    var status = result.status;

    if (status === 0) {
      return { name: testName, passed: false, error: 'Expected non-zero exit code, but got 0' };
    }

    if (stderr.indexOf(expectedSubstring) === -1) {
      return {
        name: testName,
        passed: false,
        error: 'Expected stderr to contain "' + expectedSubstring + '"\n  Actual stderr: ' + JSON.stringify(stderr)
      };
    }

    return { name: testName, passed: true };
  } catch (err) {
    return { name: testName, passed: false, error: err.message };
  }
}

function runCliTest(test) {
  try {
    var result = cp.spawnSync('node', [TXTS].concat(test.args), { encoding: 'utf8', cwd: path.resolve('testing') });

    var stderr = (result.stderr || '').trim();
    var status = result.status;

    if (status === 0) {
      return { name: test.name, passed: false, error: 'Expected non-zero exit code, but got 0' };
    }

    if (stderr.indexOf(test.expect) === -1) {
      return {
        name: test.name,
        passed: false,
        error: 'Expected stderr to contain "' + test.expect + '"\n  Actual stderr: ' + JSON.stringify(stderr)
      };
    }

    return { name: test.name, passed: true };
  } catch (err) {
    return { name: test.name, passed: false, error: err.message };
  }
}

// === MAIN ===

var allPassed = true;
var passed = 0;
var failed = 0;

console.log('=== Txts Error Handling Tests ===\n');

console.log('--- File-based error tests ---\n');
for (var testFile in TESTS) {
  if (TESTS.hasOwnProperty(testFile)) {
    var result = runFileTest(testFile, TESTS[testFile]);

    if (result.passed) {
      console.log('  PASS  ' + result.name);
      passed++;
    } else {
      console.log('  FAIL  ' + result.name);
      console.log('        ' + result.error);
      failed++;
      allPassed = false;
    }
  }
}

console.log('\n--- CLI-level error tests ---\n');
for (var i = 0; i < CLI_TESTS.length; i++) {
  var result = runCliTest(CLI_TESTS[i]);

  if (result.passed) {
    console.log('  PASS  ' + result.name);
    passed++;
  } else {
    console.log('  FAIL  ' + result.name);
    console.log('        ' + result.error);
    failed++;
    allPassed = false;
  }
}

console.log('\n=== Results: ' + passed + ' passed, ' + failed + ' failed ===\n');

if (!allPassed) {
  process.exit(1);
}
