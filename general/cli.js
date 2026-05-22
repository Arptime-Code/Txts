var path = require('path');
var executor = require('./executor');
var helpers = require('./helpers');

// === CONSTANTS ===

var TXTS_CONFIG_DIR_NAME = '.txts';
var EXTENSIONS_CONFIG_DIR = 'extensions';
var EXTENSIONS_CONFIG_FILE = 'extensions.json';

function getExtensionsConfigDir() {
  return path.join(helpers.getHomeDir(), TXTS_CONFIG_DIR_NAME, EXTENSIONS_CONFIG_DIR);
}

function getExtensionsConfigPath() {
  return path.join(getExtensionsConfigDir(), EXTENSIONS_CONFIG_FILE);
}

function getExtensionsConfig() {
  var configPath = getExtensionsConfigPath();

  if (!helpers.fileExists(configPath)) {
    return {};
  }

  var content = helpers.readFile(configPath);
  return JSON.parse(content);
}

function writeExtensionsConfig(config) {
  var configPath = getExtensionsConfigPath();

  helpers.ensureDir(getExtensionsConfigDir());
  helpers.writeFile(configPath, JSON.stringify(config, null, 2));
}

// === VERSION ===

function getVersion() {
  var pkg = require(path.join(__dirname, '..', 'package.json'));
  return pkg.version;
}

// === COMMAND DISPATCH ===

function run(args) {
  if (args.length === 0) {
    printHelp();
    return;
  }

  var firstArg = args[0];

  if (firstArg === '--help' || firstArg === '-h') {
    printHelp();
    return;
  }

  if (firstArg === '--version' || firstArg === '-v') {
    console.log('txts v' + getVersion());
    return;
  }

  if (firstArg === 'extension') {
    handleExtension(args.slice(1));
    return;
  }

  handleRun(args);
}

function printHelp() {
  var helpText = [
    'txts v' + getVersion() + ' - A minimalist programming language',
    '',
    'Usage:',
    '  txts <file.txts> [output.txt]    Run a txts program',
    '  txts extension install <name>     Install an extension',
    '  txts extension <name>             Run an extension',
    '  txts --help, -h                   Show this help message',
    '  txts --version, -v                Print version',
    '',
    'If no output file is given, output is written to stdout.',
    '',
    'Extensions:',
    '  txtspm  - Package manager for txts projects'
  ];

  console.log(helpText.join('\n'));
}

function handleRun(args) {
  var filePath = args[0];
  var outputTarget = args[1] || executor.OUTPUT_TARGET_STDOUT;

  var resolvedPath = path.resolve(filePath);

  if (!helpers.fileExists(resolvedPath)) {
    console.error('Error: File "' + filePath + '" not found.');
    process.exit(1);
  }

  if (!resolvedPath.endsWith(helpers.TXTS_EXTENSION)) {
    console.error('Error: File must have a "' + helpers.TXTS_EXTENSION + '" extension.');
    process.exit(1);
  }

  try {
    executor.runProgram(resolvedPath, outputTarget);
  } catch (err) {
    console.error('Error: ' + err.message);
    process.exit(1);
  }
}

function handleExtension(args) {
  if (args.length === 0) {
    console.error('Error: Expected extension name or "install".');
    console.error('Usage: txts extension install <name>');
    console.error('       txts extension <name>');
    process.exit(1);
  }

  var subcommand = args[0];

  if (subcommand === 'install') {
    var installName = args[1];

    if (!installName) {
      console.error('Error: Expected extension name to install.');
      process.exit(1);
    }

    handleInstallExtension(installName);
    return;
  }

  handleRunExtension(subcommand);
}

function handleInstallExtension(name) {
  var bundledExtensions = {
    txtspm: {
      name: 'txtspm',
      description: 'txts package manager',
      path: '../extensions/txtspm/index.js'
    }
  };

  if (!bundledExtensions[name]) {
    console.error('Error: Extension "' + name + '" not found.');
    process.exit(1);
  }

  var config = getExtensionsConfig();

  if (config[name]) {
    console.log('Extension "' + name + '" is already installed.');
    return;
  }

  config[name] = bundledExtensions[name];
  writeExtensionsConfig(config);

  console.log('Extension "' + name + '" installed successfully.');
}

function handleRunExtension(name) {
  var config = getExtensionsConfig();
  var extension = config[name];

  if (!extension) {
    console.error('Error: Extension "' + name + '" is not installed.');
    console.error('Install it with: txts extension install ' + name);
    process.exit(1);
  }

  var extensionPath = path.resolve(__dirname, extension.path);

  if (!helpers.fileExists(extensionPath)) {
    console.error('Error: Extension "' + name + '" files not found at ' + extensionPath);
    process.exit(1);
  }

  var extensionModule = require(extensionPath);

  if (typeof extensionModule.start === 'function') {
    extensionModule.start();
  } else {
    console.error('Error: Extension "' + name + '" does not export a start function.');
    process.exit(1);
  }
}

// === MODULE EXPORTS ===

module.exports = {
  run: run,
  printHelp: printHelp,
  handleRun: handleRun,
  handleExtension: handleExtension
};
