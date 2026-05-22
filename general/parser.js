var helpers = require('./helpers');

// === CONSTANTS ===

var IMPORT_PREFIX = 'IMPORT ';
var CALL_PREFIX = 'CALL ';
var VARIABLE_PREFIX = 'VARIABLE ';

// === PARSING FUNCTIONS ===

function parseFile(content) {
  var lines = content.split('\n');
  var commands = [];

  for (var i = 0; i < lines.length; i++) {
    var line = lines[i].trim();
    var command = parseLine(line);

    if (command) {
      commands.push(command);
    }
  }

  return commands;
}

function parseLine(line) {
  if (!line) {
    return null;
  }

  if (line.startsWith(IMPORT_PREFIX)) {
    return parseImport(line.slice(IMPORT_PREFIX.length).trim());
  }

  if (line.startsWith(CALL_PREFIX)) {
    return parseCall(line.slice(CALL_PREFIX.length).trim());
  }

  if (line.startsWith(VARIABLE_PREFIX)) {
    return parseVariable(line.slice(VARIABLE_PREFIX.length).trim());
  }

  return null;
}

function parseImport(rest) {
  if (!rest) {
    return null;
  }

  return {
    type: 'import',
    library: rest
  };
}

function parseCall(rest) {
  if (!rest) {
    return null;
  }

  var ref = helpers.parseDottedReference(rest);

  if (!ref) {
    return null;
  }

  return {
    type: 'call',
    library: ref.library,
    function: ref.name
  };
}

function parseVariable(rest) {
  if (!rest) {
    return null;
  }

  var parts = rest.split(' ').filter(function(p) { return p.length > 0; });

  if (parts.length < 1) {
    return null;
  }

  var targetStr = parts[0];
  var target = helpers.parseDottedReference(targetStr);

  if (!target) {
    return null;
  }

  var sourceStr = parts.slice(1).join(' ');
  var source = parseSourceToken(sourceStr.trim());

  if (!source) {
    return null;
  }

  return {
    type: 'variable',
    target: target,
    source: source
  };
}

function parseSourceToken(token) {
  if (!token) {
    return null;
  }

  if (helpers.isQuotedString(token)) {
    return {
      type: 'string',
      value: helpers.stripQuotes(token)
    };
  }

  var ref = helpers.parseDottedReference(token);

  if (ref) {
    return {
      type: 'reference',
      library: ref.library,
      name: ref.name
    };
  }

  return null;
}

// === MODULE EXPORTS ===

module.exports = {
  parseFile: parseFile,
  parseLine: parseLine,
  parseImport: parseImport,
  parseCall: parseCall,
  parseVariable: parseVariable
};
