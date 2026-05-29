var path = require('path');
var helpers = require('./helpers');

// === CONSTANTS ===

var LOCAL_TXTS_DIR = '.local-txtspm';

// === FUNCTIONS ===

function findProjectRoot(startPath) {
  return path.resolve(startPath);
}

function resolveLibraryPath(libraryName, projectRoot) {
  var localPath = path.join(projectRoot, LOCAL_TXTS_DIR, libraryName);

  if (helpers.fileExists(localPath)) {
    var localStat = require('fs').statSync(localPath);

    if (localStat.isDirectory()) {
      return localPath;
    }
  }

  return null;
}

function resolveFunctionPath(libraryName, functionName, projectRoot) {
  // Self-import: look directly in the project root
  if (isSelfImport(libraryName, projectRoot)) {
    var selfFnPath = path.join(projectRoot, functionName + helpers.TXTS_EXTENSION);

    if (helpers.fileExists(selfFnPath)) {
      return selfFnPath;
    }

    return null;
  }

  // External library: look in .local-txtspm/<libraryName>/
  var libPath = resolveLibraryPath(libraryName, projectRoot);

  if (!libPath) {
    return null;
  }

  var fnPath = path.join(libPath, functionName + helpers.TXTS_EXTENSION);

  if (helpers.fileExists(fnPath)) {
    return fnPath;
  }

  return null;
}

function getLibraryFunctions(libraryPath) {
  return helpers.listTxtsFiles(libraryPath);
}

function getLibraryFunctionPaths(libraryPath) {
  return helpers.listTxtsFilesFullPath(libraryPath);
}

function isSelfImport(libraryName, projectRoot) {
  var projectName = helpers.getProjectName(projectRoot);
  return libraryName === projectName;
}

// === MODULE EXPORTS ===

module.exports = {
  findProjectRoot: findProjectRoot,
  resolveLibraryPath: resolveLibraryPath,
  resolveFunctionPath: resolveFunctionPath,
  getLibraryFunctions: getLibraryFunctions,
  getLibraryFunctionPaths: getLibraryFunctionPaths,
  isSelfImport: isSelfImport
};
