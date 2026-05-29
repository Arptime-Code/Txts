var helpers = require('./helpers');

// === CONSTANTS ===

var IMPORT_PREFIX = 'IMPORT ';
var CALL_PREFIX = 'CALL ';
var ADD_PREFIX = 'ADD ';
var REPLACE_PREFIX = 'REPLACE ';

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

  if (line.startsWith(ADD_PREFIX)) {
    return parseAdd(line.slice(ADD_PREFIX.length).trim());
  }

  if (line.startsWith(REPLACE_PREFIX)) {
    return parseReplace(line.slice(REPLACE_PREFIX.length).trim());
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

function parseAdd(rest) {
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

  return {
    type: 'add',
    target: target,
    source: source  // may be null — executor will throw error
  };
}

function parseReplace(rest) {
  if (!rest) {
    return null;
  }

  var parts = rest.split(' ').filter(function(p) { return p.length > 0; });

  var targetStr = parts[0];
  var target = helpers.parseDottedReference(targetStr);

  if (!target) {
    return null;
  }

  var sources = [];
  if (parts.length > 1) {
    var sourceStr = parts.slice(1).join(' ');
    var source = parseSourceToken(sourceStr.trim());
    if (source) {
      sources.push(source);
    }
  }

  return {
    type: 'replace',
    target: target,
    sources: sources  // may be empty — executor will throw error
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
  parseAdd: parseAdd,
  parseReplace: parseReplace
};
