var path = require('path');
var repl = require('../repl');
var operations = require('./operations');
var helpers = require('../../general/helpers');
var resolver = require('../../general/resolver');

// === CONSTANTS ===

var PROMPT = 'txtspm> ';
var GREETING = 'txtspm - txts package manager (type "help" for commands)';

// === FUNCTIONS ===

function start() {
  repl.createRepl(handleCommand, {
    prompt: PROMPT,
    greeting: GREETING
  });
}

function handleCommand(input) {
  var parts = input.split(' ').filter(function(p) { return p.length > 0; });
  var command = parts[0].toLowerCase();
  var args = parts.slice(1);

  var projectRoot = findProjectRoot();

  if (!projectRoot) {
    console.error('Error: Could not find project root.');
    return;
  }

  switch (command) {
    case 'init':
      operations.handleInit(projectRoot);
      break;

    case 'save':
      operations.handleSave(projectRoot);
      break;

    case 'import':
      handleImportWithArgs(args, projectRoot);
      break;

    case 'delete':
      handleDeleteWithArgs(args);
      break;

    case 'list':
      operations.handleList();
      break;

    case 'search':
      operations.handleSearch(args.join(' '));
      break;

    case 'update':
      operations.handleUpdate(projectRoot);
      break;

    case 'help':
      operations.handleHelp();
      break;

    default:
      console.log('Unknown command "' + command + '". Type "help" for available commands.');
      break;
  }
}

function handleImportWithArgs(args, projectRoot) {
  if (args.length < 1) {
    console.error('Error: Expected project name.');
    console.error('Usage: import <name>');
    return;
  }

  operations.handleImport(args[0], projectRoot);
}

function handleDeleteWithArgs(args) {
  if (args.length < 1) {
    console.error('Error: Expected project name.');
    console.error('Usage: delete <name>');
    return;
  }

  operations.handleDelete(args[0]);
}

function findProjectRoot() {
  var currentPath = process.cwd();

  return resolver.findProjectRoot(currentPath);
}

// === MODULE EXPORTS ===

module.exports = {
  start: start
};
