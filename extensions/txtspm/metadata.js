var path = require('path');
var helpers = require('../../general/helpers');
var resolver = require('../../general/resolver');

// === CONSTANTS ===

var METADATA_FILENAME = 'txts-metadata.json';
var TXTS_EXTENSION = helpers.TXTS_EXTENSION;

// === METADATA MANAGEMENT ===

function readMetadata(projectPath) {
  var metadataPath = path.join(projectPath, METADATA_FILENAME);

  if (!helpers.fileExists(metadataPath)) {
    return null;
  }

  var content = helpers.readFile(metadataPath);
  return JSON.parse(content);
}

function writeMetadata(projectPath, metadata) {
  var metadataPath = path.join(projectPath, METADATA_FILENAME);
  var content = JSON.stringify(metadata, null, 2);
  helpers.writeFile(metadataPath, content);
}

// === METADATA GENERATION ===

function generateMetadata(projectRoot) {
  var projectName = helpers.getProjectName(projectRoot);
  var existingMetadata = readMetadata(projectRoot);

  var functions = buildFunctionsList(projectRoot, existingMetadata);
  var dependencies = buildDependenciesList(projectRoot);

  var metadata = {
    Title: projectName,
    Description: getExistingField(existingMetadata, 'Description', ''),
    Keywords: getExistingField(existingMetadata, 'Keywords', []),
    Version: getExistingField(existingMetadata, 'Version', '0.0.0'),
    Variation: getExistingField(existingMetadata, 'Variation', ''),
    Functions: functions,
    Type: getExistingField(existingMetadata, 'Type', 'program'),
    Dependencies: dependencies
  };

  return metadata;
}

function buildFunctionsList(projectRoot, existingMetadata) {
  var functionNames = helpers.listTxtsFiles(projectRoot);
  var functions = [];
  var existingFunctions = {};

  if (existingMetadata && Array.isArray(existingMetadata.Functions)) {
    for (var e = 0; e < existingMetadata.Functions.length; e++) {
      var ef = existingMetadata.Functions[e];
      existingFunctions[ef.Name] = ef;
    }
  }

  for (var i = 0; i < functionNames.length; i++) {
    var name = functionNames[i];

    if (existingFunctions[name]) {
      functions.push({
        Name: name,
        Description: existingFunctions[name].Description || ''
      });
    } else {
      functions.push({
        Name: name,
        Description: ''
      });
    }
  }

  return functions;
}

function buildDependenciesList(projectRoot) {
  var dependencies = [];
  var seen = {};
  var files = findAllTxtsFilesRecursive(projectRoot, projectRoot);

  for (var i = 0; i < files.length; i++) {
    var filePath = files[i];
    var content = helpers.readFile(filePath);
    var lines = content.split('\n');

    for (var j = 0; j < lines.length; j++) {
      var line = lines[j].trim();

      if (line.startsWith('IMPORT ')) {
        var libName = line.slice(7).trim();

        if (libName && libName !== 'txts' && !seen[libName]) {
          var projectName = helpers.getProjectName(projectRoot);

          if (libName !== projectName) {
            seen[libName] = true;
            dependencies.push(libName);
          }
        }
      }
    }
  }

  return dependencies;
}

function findAllTxtsFilesRecursive(dirPath, projectRoot) {
  var result = [];
  var entries = require('fs').readdirSync(dirPath, { withFileTypes: true });

  for (var i = 0; i < entries.length; i++) {
    var entry = entries[i];
    var fullPath = path.join(dirPath, entry.name);

    if (entry.isDirectory()) {
      if (entry.name !== '.local-txtspm' && entry.name !== 'node_modules' &&
          entry.name !== '.git' && entry.name !== 'testing' && entry.name !== 'docs') {
        var subResults = findAllTxtsFilesRecursive(fullPath, projectRoot);
        result = result.concat(subResults);
      }
    } else if (entry.isFile() && entry.name.endsWith(TXTS_EXTENSION)) {
      result.push(fullPath);
    }
  }

  return result;
}

function getExistingField(existingMetadata, fieldName, defaultValue) {
  if (existingMetadata && existingMetadata[fieldName] !== undefined) {
    return existingMetadata[fieldName];
  }

  return defaultValue;
}

// === MODULE EXPORTS ===

module.exports = {
  METADATA_FILENAME: METADATA_FILENAME,
  readMetadata: readMetadata,
  writeMetadata: writeMetadata,
  generateMetadata: generateMetadata,
  buildFunctionsList: buildFunctionsList,
  buildDependenciesList: buildDependenciesList
};
