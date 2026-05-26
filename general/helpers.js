var fs = require('fs');
var path = require('path');
var os = require('os');

// === CONSTANTS ===

var TXTS_EXTENSION = '.txts';
var QUOTED_STRING_PATTERN = /^"[^"]*"$/;

// === FILE OPERATIONS ===

function readFile(filePath) {
  return fs.readFileSync(filePath, 'utf-8');
}

function writeFile(filePath, content) {
  fs.writeFileSync(filePath, content, 'utf-8');
}

function fileExists(filePath) {
  return fs.existsSync(filePath);
}

function ensureDir(dirPath) {
  fs.mkdirSync(dirPath, { recursive: true });
}

function removeDir(dirPath) {
  fs.rmSync(dirPath, { recursive: true, force: true });
}

function listTxtsFiles(dirPath) {
  var result = [];

  if (!fileExists(dirPath)) {
    return result;
  }

  var entries = fs.readdirSync(dirPath, { withFileTypes: true });

  for (var i = 0; i < entries.length; i++) {
    var entry = entries[i];

    if (entry.isFile() && entry.name.endsWith(TXTS_EXTENSION)) {
      var nameWithoutExt = entry.name.slice(0, -TXTS_EXTENSION.length);
      result.push(nameWithoutExt);
    }
  }

  return result;
}

function listTxtsFilesFullPath(dirPath) {
  var result = [];

  if (!fileExists(dirPath)) {
    return result;
  }

  var entries = fs.readdirSync(dirPath, { withFileTypes: true });

  for (var i = 0; i < entries.length; i++) {
    var entry = entries[i];

    if (entry.isFile() && entry.name.endsWith(TXTS_EXTENSION)) {
      result.push(path.join(dirPath, entry.name));
    }
  }

  return result;
}

function readdirNames(dirPath) {
  if (!fileExists(dirPath)) {
    return [];
  }

  return fs.readdirSync(dirPath);
}

function copyDir(src, dest) {
  ensureDir(dest);
  var entries = fs.readdirSync(src, { withFileTypes: true });

  for (var i = 0; i < entries.length; i++) {
    var entry = entries[i];
    var srcPath = path.join(src, entry.name);
    var destPath = path.join(dest, entry.name);

    if (entry.isDirectory()) {
      copyDir(srcPath, destPath);
    } else if (entry.isFile()) {
      fs.copyFileSync(srcPath, destPath);
    }
  }
}

function isDirectoryEmpty(dirPath) {
  if (!fileExists(dirPath)) {
    return true;
  }

  return fs.readdirSync(dirPath).length === 0;
}

// === STRING MODE ===

var stringMode = 'parsed';

function setStringMode(mode) {
  if (mode === 'raw' || mode === 'parsed') {
    stringMode = mode;
  }
}

function getStringMode() {
  return stringMode;
}

// === STRING PARSING ===

function isQuotedString(str) {
  return QUOTED_STRING_PATTERN.test(str);
}

function stripQuotes(str) {
  if (str.length >= 2 && str[0] === '"' && str[str.length - 1] === '"') {
    var inner = str.slice(1, -1);

    if (stringMode === 'parsed') {
      try {
        return JSON.parse('"' + inner + '"');
      } catch (e) {
        return inner;
      }
    }

    return inner;
  }

  return str;
}

function parseDottedReference(str) {
  var dotIndex = str.indexOf('.');

  if (dotIndex === -1 || dotIndex === 0 || dotIndex === str.length - 1) {
    return null;
  }

  return {
    library: str.slice(0, dotIndex),
    name: str.slice(dotIndex + 1)
  };
}

// === PATH HELPERS ===

function getHomeDir() {
  return os.homedir();
}

function getProjectName(rootPath) {
  return path.basename(rootPath);
}

// === MODULE EXPORTS ===

module.exports = {
  TXTS_EXTENSION: TXTS_EXTENSION,
  readFile: readFile,
  writeFile: writeFile,
  fileExists: fileExists,
  ensureDir: ensureDir,
  removeDir: removeDir,
  listTxtsFiles: listTxtsFiles,
  listTxtsFilesFullPath: listTxtsFilesFullPath,
  readdirNames: readdirNames,
  copyDir: copyDir,
  isDirectoryEmpty: isDirectoryEmpty,
  isQuotedString: isQuotedString,
  stripQuotes: stripQuotes,
  setStringMode: setStringMode,
  getStringMode: getStringMode,
  parseDottedReference: parseDottedReference,
  getHomeDir: getHomeDir,
  getProjectName: getProjectName
};
