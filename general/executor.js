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
    fileImports: {},
    outputBuffer: ''
  };
}

// === TOP-LEVEL ENTRY ===

function runProgram(filePath, outputTarget) {
  var projectRoot = resolver.findProjectRoot(path.dirname(filePath));

  var fileResolvedPath = path.resolve(filePath);
  var context = createContext(projectRoot);

  executeFile(fileResolvedPath, context);

  // txts.OUTPUT is resolved immediately at each ADD — outputBuffer accumulates
  var outputValue = context.outputBuffer;

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
    } else if (command.type === 'add') {
      executeAdd(command, context);
    } else if (command.type === 'replace') {
      executeReplace(command, context);
    }
  }
}

// === IMPORT ===

function executeImport(command, context) {
  var libraryName = command.library;
  var projectRoot = context.projectRoot;

  // Built-in txts library is always valid
  if (libraryName === builtins.TXTS_LIBRARY_NAME) {
    context.fileImports[libraryName] = true;
    return;
  }

  // Check if library resolves: either self-import (project folder name)
  // or a folder under .local-txtspm/
  var isSelf = resolver.isSelfImport(libraryName, projectRoot);
  var libPath = resolver.resolveLibraryPath(libraryName, projectRoot);

  if (!isSelf && !libPath) {
    throw new Error('Cannot import "' + libraryName +
      '": no library found with that name. ' +
      'Make sure the library name matches the project folder name, ' +
      'or create a folder named "' + libraryName + '" under .local-txtspm/.');
  }

  context.fileImports[libraryName] = true;
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
  // No PRIVATE isolation — all ADD variables are globally visible
}

// === ADD (hybrid chain assignment) ===
// ADD resolves references eagerly if the variable already exists.
// If the variable hasn't been defined yet, it stores a lazy ref
// (forward reference) that resolves when the variable is defined.

function executeAdd(command, context) {
  var target = command.target;
  var source = command.source;

  if (!source) {
    throw new Error('ADD requires a source. Usage: ADD library.variable "text" or ADD library.variable library.ref');
  }

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

  // === SPECIAL HANDLING: txts.OUTPUT resolves immediately at ADD time ===
  if (target.library === builtins.TXTS_LIBRARY_NAME && target.name === builtins.OUTPUT_VARIABLE_NAME) {
    // CLEAR resets output buffer
    if (source.type === 'reference' &&
        source.library === builtins.TXTS_LIBRARY_NAME &&
        source.name === builtins.CLEAR_VARIABLE_NAME) {
      context.outputBuffer = '';
      return;
    }

    if (source.type === 'string') {
      context.outputBuffer += source.value;
      return;
    }

    if (source.type === 'reference') {
      context.variables[source.library] = context.variables[source.library] || {};
      if (context.variables[source.library][source.name] !== undefined) {
        var resolved = resolveReferenceSafe(context, source.library, source.name);
        context.outputBuffer += resolved;
      }
      // If the referenced variable doesn't exist, output nothing (empty string)
      return;
    }

    return;
  }

  // === NORMAL CHAIN-BASED HANDLING for non-OUTPUT variables ===

  // Create namespace if needed
  context.variables[target.library] = context.variables[target.library] || {};

  // Check for CLEAR
  var isClear = source.type === 'reference' &&
    source.library === builtins.TXTS_LIBRARY_NAME &&
    source.name === builtins.CLEAR_VARIABLE_NAME;

  if (isClear) {
    // Reset chain to empty
    if (Array.isArray(context.variables[target.library][target.name])) {
      context.variables[target.library][target.name] = [];
    } else {
      context.variables[target.library][target.name] = [];
    }
    return;
  }

  // Create chain if it doesn't exist
  if (context.variables[target.library][target.name] === undefined) {
    context.variables[target.library][target.name] = [];
  }

  // If it's already a resolved string (from REPLACE freeze), convert back to array
  if (typeof context.variables[target.library][target.name] === 'string') {
    context.variables[target.library][target.name] = [{type: 'value', value: context.variables[target.library][target.name]}];
  }

  // Append item(s) to chain.
  // For reference sources with an existing chain, copy its items
  // (values and refs) into the target — a snapshot that preserves
  // forward refs while being independent from the source variable.
  // If the source doesn't exist yet, store a single forward ref.
  if (source.type === 'reference') {
    var srcVar = context.variables[source.library] && context.variables[source.library][source.name];
    if (Array.isArray(srcVar)) {
      // Source exists with a chain — copy its items
      for (var j = 0; j < srcVar.length; j++) {
        context.variables[target.library][target.name].push(srcVar[j]);
      }
    } else {
      // Source doesn't exist or is a plain value — store single ref/value
      var item = makeItem(source, context);
      if (item) {
        context.variables[target.library][target.name].push(item);
      }
    }
  } else {
    var item = makeItem(source, context);
    if (item) {
      context.variables[target.library][target.name].push(item);
    }
  }
}

// === REPLACE (update a variable's definition) ===
//
// REPLACE var1 "text"   — replaces var1's chain with the string "text".
//                          No other variables are affected.
//
// REPLACE var1 var2      — replaces var1's chain with a ref to var2.
//                          Also does a global substitution: all existing
//                          {type:'ref'} items pointing to var1 are replaced
//                          with refs to var2. This fully redirects var1 to var2
//                          everywhere.

function executeReplace(command, context) {
  var target = command.target;
  var sources = command.sources;

  if (sources.length === 0) {
    throw new Error('REPLACE requires a source. Usage: REPLACE library.variable "text" or REPLACE library.variable library.ref');
  }

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

  // Create namespace if needed
  context.variables[target.library] = context.variables[target.library] || {};

  var source = sources[0];

  // Build the replacement item
  var replacementItem;
  if (source.type === 'string') {
    replacementItem = { type: 'value', value: source.value };
  } else {
    // reference — create a ref item pointing to the source variable
    if (!context.fileImports[source.library]) {
      throw new Error('Cannot read "' + source.library + '.' + source.name +
        '": library "' + source.library + '" is not imported in this file. ' +
        'Use IMPORT ' + source.library + ' first.');
    }
    replacementItem = { type: 'ref', library: source.library, name: source.name };
  }

  // Replace target's own chain with just the replacement item
  context.variables[target.library][target.name] = [replacementItem];

  // Global substitution: when source is a reference, scan all chains for
  // {type:'ref'} items pointing to the target and replace them with the
  // new source ref. This fully redirects var1 → var2 everywhere.
  //
  // Additionally, delete the target variable itself. Any future
  // references to it (created via ADD after this point) will be
  // dead forward refs that resolve to empty string — they have
  // nothing to do with the redirect.
  //
  // When source is a string (reset), no global scan — other chains that
  // reference the target keep their refs and follow the redirect naturally.
  //
  // Only delete for ref-source replacements (redirects).
  // String-source replacements (resets) keep the target alive.
  if (source.type === 'reference') {
    for (var libName in context.variables) {
      if (context.variables.hasOwnProperty(libName)) {
        var lib = context.variables[libName];
        for (var varName in lib) {
          if (lib.hasOwnProperty(varName)) {
            var chain = lib[varName];
            if (Array.isArray(chain)) {
              for (var i = 0; i < chain.length; i++) {
                if (chain[i].type === 'ref' &&
                    chain[i].library === target.library &&
                    chain[i].name === target.name) {
                  chain[i] = replacementItem;
                }
              }
            }
          }
        }
      }
    }

    // Delete the target variable so new refs to it have nothing to do with the redirect
    delete context.variables[target.library][target.name];
  }
}

// === ITEM CREATION ===
//
// Stores a string value or a single name-based ref.
// For reference sources, always stores {type:'ref', library, name}
// regardless of whether the variable exists yet. Resolution follows
// through redirects naturally at resolve time.

function makeItem(source, context) {
  if (source.type === 'string') {
    return { type: 'value', value: source.value };
  }
  if (source.type === 'reference') {
    return { type: 'ref', library: source.library, name: source.name };
  }
  return null;
}

// === CHAIN RESOLUTION ===

function resolveChain(context, library, name, _depth) {
  if (_depth > 20) {
    throw new Error('Maximum reference depth exceeded when resolving ' + library + '.' + name);
  }

  var items = context.variables[library][name];
  if (!Array.isArray(items)) {
    return items || '';
  }

  var result = '';
  for (var i = 0; i < items.length; i++) {
    if (items[i].type === 'value') {
      result += items[i].value;
    } else if (items[i].type === 'ref') {
      result += resolveReferenceSafe(context, items[i].library, items[i].name, _depth + 1);
    }
  }
  return result;
}

function resolveReferenceSafe(context, library, name, _depth) {
  _depth = _depth || 0;
  if (_depth > 20) {
    throw new Error('Maximum reference depth exceeded when resolving ' + library + '.' + name);
  }

  context.variables[library] = context.variables[library] || {};

  if (context.variables[library][name] !== undefined) {
    var val = context.variables[library][name];
    if (Array.isArray(val)) {
      return resolveChain(context, library, name, _depth);
    }
    return val;
  }

  // Ref to nonexistent variable resolves to empty string
  return '';
}

// Safe version for runProgram output (handles missing vars)
function resolveReferenceSafeForOutput(context, library, name) {
  context.variables[library] = context.variables[library] || {};
  var val = context.variables[library][name];
  if (!val) {
    return '';
  }
  if (Array.isArray(val)) {
    return resolveChain(context, library, name, 0);
  }
  return val;
}

// === MODULE EXPORTS ===

module.exports = {
  runProgram: runProgram,
  createContext: createContext,
  executeFile: executeFile,
  executeCommands: executeCommands,
  executeImport: executeImport,
  executeCall: executeCall,
  executeAdd: executeAdd,
  executeReplace: executeReplace,
  resolveChain: resolveChain,
  resolveReferenceSafe: resolveReferenceSafe,
  OUTPUT_TARGET_STDOUT: OUTPUT_TARGET_STDOUT
};
