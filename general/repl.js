var readline = require('readline');
var path = require('path');
var parser = require('./parser');
var executor = require('./executor');
var resolver = require('./resolver');
var builtins = require('./builtins');

// === CONSTANTS ===

var EXIT_COMMANDS = ['exit', 'quit', 'q'];
var PROMPT = 'txts> ';

// === REPL START ===

function startRepl() {
  var projectRoot = resolver.findProjectRoot(process.cwd());
  var context = executor.createContext(projectRoot);

  var rl = readline.createInterface({
    input: process.stdin,
    output: process.stdout,
    prompt: PROMPT,
    terminal: true
  });

  var version = getVersion();
  console.log('txts REPL v' + version + ' — Type txts commands interactively.');
  console.log('  Commands: IMPORT  CALL  VARIABLE');
  console.log('  Meta:     .help  .clear  .vars  .reset  exit');
  console.log('');
  rl.prompt();

  rl.on('line', function(line) {
    var trimmed = line.trim();

    if (isExitCommand(trimmed)) {
      rl.close();
      return;
    }

    if (trimmed.length === 0) {
      rl.prompt();
      return;
    }

    if (trimmed.startsWith('.')) {
      handleMetaCommand(trimmed, context);
      rl.prompt();
      return;
    }

    try {
      processLine(trimmed, context);
    } catch (err) {
      console.error('Error: ' + err.message);
    }

    rl.prompt();
  });

  rl.on('close', function() {
    console.log('');
    process.exit(0);
  });
}

// === LINE PROCESSING ===

function processLine(line, context) {
  var command = parser.parseLine(line);

  if (!command) {
    console.log('(Lines without a command prefix are treated as comments)');
    return;
  }

  var prevOutput = getOutputValue(context);

  if (command.type === 'import') {
    executor.executeImport(command, context);
    console.log('(imported ' + command.library + ')');
  } else if (command.type === 'call') {
    executor.executeCall(command, context);
  } else if (command.type === 'variable') {
    executor.executeVariable(command, context);
  }

  var newOutput = getOutputValue(context);

  if (newOutput !== prevOutput && newOutput.length > 0) {
    console.log(newOutput);
  }
}

// === OUTPUT ===

function getOutputValue(context) {
  if (context.variables[builtins.TXTS_LIBRARY_NAME]) {
    return context.variables[builtins.TXTS_LIBRARY_NAME][builtins.OUTPUT_VARIABLE_NAME] || '';
  }

  return '';
}

// === META COMMANDS ===

function handleMetaCommand(line, context) {
  var parts = line.split(' ').filter(function(p) { return p.length > 0; });
  var cmd = parts[0].toLowerCase();

  switch (cmd) {
    case '.help':
      printMetaHelp();
      break;

    case '.clear':
      if (context.variables[builtins.TXTS_LIBRARY_NAME]) {
        context.variables[builtins.TXTS_LIBRARY_NAME][builtins.OUTPUT_VARIABLE_NAME] = '';
      }
      console.log('(output cleared)');
      break;

    case '.vars':
      printVariables(context);
      break;

    case '.reset':
      context.variables = builtins.createBuiltinVariables();
      context.fileImports = {};
      context.recursionDepth = 0;
      console.log('(context reset to clean state)');
      break;

    default:
      console.log('Unknown meta-command "' + cmd + '". Type .help for available commands.');
      break;
  }
}

function printMetaHelp() {
  console.log('Meta-commands:');
  console.log('  .help              Show this message');
  console.log('  .clear             Clear txts.OUTPUT');
  console.log('  .vars              Show all variables and their values');
  console.log('  .reset             Reset the execution context to a clean state');
  console.log('  exit, quit, q      Exit the REPL');
  console.log('');
  console.log('txts commands:');
  console.log('  IMPORT <library>');
  console.log('  VARIABLE <lib.var> "<value>"');
  console.log('  VARIABLE <lib.var> <lib.ref>');
  console.log('  CALL <lib.function>');
}

function printVariables(context) {
  var found = false;

  for (var lib in context.variables) {
    if (context.variables.hasOwnProperty(lib)) {
      var vars = context.variables[lib];
      for (var name in vars) {
        if (vars.hasOwnProperty(name)) {
          // Skip internal sentinel variables
          if (name === 'CLEAR') {
            continue;
          }
          found = true;
          var val = vars[name];
          console.log('  ' + lib + '.' + name + ' = "' + val + '"');
        }
      }
    }
  }

  if (!found) {
    console.log('(no variables)');
  }
}

// === EXIT ===

function isExitCommand(input) {
  for (var i = 0; i < EXIT_COMMANDS.length; i++) {
    if (input.toLowerCase() === EXIT_COMMANDS[i]) {
      return true;
    }
  }

  return false;
}

// === VERSION ===

function getVersion() {
  var pkg = require(path.join(__dirname, '..', 'package.json'));
  return pkg.version;
}

// === MODULE EXPORTS ===

module.exports = {
  startRepl: startRepl
};
