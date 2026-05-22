var path = require('path');
var parser = require('./parser');
var resolver = require('./resolver');
var builtins = require('./builtins');
var helpers = require('./helpers');

// === CONSTANTS ===

var RECURSION_LIMIT = 50;
var OUTPUT_TARGET_STDOUT = 'stdout';

// === CONTEXT MANAGEMENT ===

function createContext(projectRoot) {
  return {
    variables: builtins.createBuiltinVariables(),
    projectRoot: projectRoot,
    recursionDepth: 0,
    fileImports: {}
  };
}

// === TOP-LEVEL ENTRY ===

function runProgram(filePath, outputTarget) {
  var projectRoot = resolver.findProjectRoot(path.dirname(filePath));

  var fileResolvedPath = path.resolve(filePath);
  var context = createContext(projectRoot);

  executeFile(fileResolvedPath, context);

  var outputValue = '';

  if (context.variables[builtins.TXTS_LIBRARY_NAME]) {
    outputValue = context.variables[builtins.TXTS_LIBRARY_NAME][builtins.OUTPUT_VARIABLE_NAME] || '';
  }

  if (outputTarget === OUTPUT_TARGET_STDOUT) {
    process.stdout.write(outputValue);
  } else {
    helpers.writeFile(outputTarget, outputValue);
  }
}

// === FILE EXECUTION ===

function executeFile(filePath, context) {
  if (!helpers.fileExists(filePath)) {
    return;
  }

  context.fileImports = {};

  var content = helpers.readFile(filePath);
  var commands = parser.parseFile(content);

  executeCommands(commands, context);
}

function executeCommands(commands, context) {
  for (var i = 0; i < commands.length; i++) {
    var command = commands[i];

    if (command.type === 'import') {
      executeImport(command, context);
    } else if (command.type === 'call') {
      executeCall(command, context);
    } else if (command.type === 'variable') {
      executeVariable(command, context);
    }
  }
}

// === IMPORT ===

function executeImport(command, context) {
  var libraryName = command.library;

  context.fileImports[libraryName] = true;

  if (libraryName === builtins.TXTS_LIBRARY_NAME) {
    return;
  }
}

// === CALL ===

function executeCall(command, context) {
  if (!context.fileImports[command.library]) {
    throw new Error('Cannot CALL ' + command.library + '.' + command.function +
      ': library "' + command.library + '" is not imported in this file. ' +
      'Use IMPORT ' + command.library + ' first.');
  }

  if (context.recursionDepth >= RECURSION_LIMIT) {
    throw new Error('Recursion limit of ' + RECURSION_LIMIT + ' reached when calling ' +
      command.library + '.' + command.function);
  }

  var fnPath = resolver.resolveFunctionPath(command.library, command.function, context.projectRoot);

  if (!fnPath) {
    throw new Error('Function "' + command.library + '.' + command.function +
      '" not found in project root ' + context.projectRoot);
  }

  var savedImports = context.fileImports;

  context.recursionDepth = context.recursionDepth + 1;

  executeFile(fnPath, context);

  context.fileImports = savedImports;
  context.recursionDepth = context.recursionDepth - 1;
}

// === VARIABLE ===

function executeVariable(command, context) {
  var target = command.target;
  var source = command.source;

  if (target.library === builtins.TXTS_LIBRARY_NAME &&
      target.name !== builtins.OUTPUT_VARIABLE_NAME) {
    throw new Error('Cannot assign to "' + target.library + '.' + target.name +
      '": only "' + builtins.TXTS_LIBRARY_NAME + '.' + builtins.OUTPUT_VARIABLE_NAME +
      '" is writable in the internal "' + builtins.TXTS_LIBRARY_NAME + '" library.');
  }

  if (!context.fileImports[target.library]) {
    throw new Error('Cannot assign to "' + target.library + '.' + target.name +
      '": library "' + target.library + '" is not imported in this file. ' +
      'Use IMPORT ' + target.library + ' first.');
  }

  if (source.type === 'reference') {
    if (!context.fileImports[source.library]) {
      throw new Error('Cannot read "' + source.library + '.' + source.name +
        '": library "' + source.library + '" is not imported in this file. ' +
        'Use IMPORT ' + source.library + ' first.');
    }
  }

  var resolvedValue = resolveValue(context, source);

  if (typeof resolvedValue !== 'string') {
    return;
  }

  // Lazily create namespace if it doesn't exist
  context.variables[target.library] = context.variables[target.library] || {};

  // txts.CLEAR always clears the variable (sets to empty string)
  var isClear = source.type === 'reference' &&
    source.library === builtins.TXTS_LIBRARY_NAME &&
    source.name === builtins.CLEAR_VARIABLE_NAME;

  if (isClear) {
    context.variables[target.library][target.name] = '';
  } else {
    // Append the source value to the target's current value
    var currentValue = context.variables[target.library][target.name] || '';
    context.variables[target.library][target.name] = currentValue + resolvedValue;
  }
}

// === VALUE RESOLUTION ===

function resolveValue(context, source) {
  if (source.type === 'string') {
    return source.value;
  }

  if (source.type === 'reference') {
    return resolveReference(context, source.library, source.name);
  }

  return null;
}

function resolveReference(context, library, name) {
  context.variables[library] = context.variables[library] || {};

  var libVars = context.variables[library];

  if (libVars[name] === undefined) {
    throw new Error('Variable "' + library + '.' + name + '" does not exist in library "' + library + '".');
  }

  return libVars[name];
}

// === MODULE EXPORTS ===

module.exports = {
  runProgram: runProgram,
  createContext: createContext,
  executeFile: executeFile,
  executeCommands: executeCommands,
  executeImport: executeImport,
  executeCall: executeCall,
  executeVariable: executeVariable,
  resolveReference: resolveReference,
  resolveValue: resolveValue,
  OUTPUT_TARGET_STDOUT: OUTPUT_TARGET_STDOUT
};
