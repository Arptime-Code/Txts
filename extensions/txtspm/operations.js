var path = require('path');
var helpers = require('../../general/helpers');
var metadataModule = require('./metadata');
var searchModule = require('./search');

// === CONSTANTS ===

var LOCAL_DIR_NAME = '.local-txtspm';
var README_FILENAME = 'README.md';

// === INIT ===

function handleInit(projectRoot) {
  var readmePath = path.join(projectRoot, README_FILENAME);

  if (!helpers.fileExists(readmePath)) {
    helpers.writeFile(readmePath, '');
    console.log('Created ' + README_FILENAME);
  } else {
    console.log(README_FILENAME + ' already exists.');
  }

  var metadata = metadataModule.generateMetadata(projectRoot);
  metadataModule.writeMetadata(projectRoot, metadata);
  console.log('Created ' + metadataModule.METADATA_FILENAME);

  var localDir = path.join(projectRoot, LOCAL_DIR_NAME);
  helpers.ensureDir(localDir);
  console.log('Created ' + LOCAL_DIR_NAME + '/');

  console.log('Project initialized.');
}

// === SAVE ===

function handleSave(projectRoot) {
  var txtspmHomePath = searchModule.getTxtspmHomePath();
  helpers.ensureDir(txtspmHomePath);

  var projectName = helpers.getProjectName(projectRoot);
  var destPath = path.join(txtspmHomePath, projectName);

  if (helpers.fileExists(destPath)) {
    helpers.removeDir(destPath);
  }

  var entries = require('fs').readdirSync(projectRoot, { withFileTypes: true });

  for (var i = 0; i < entries.length; i++) {
    var entry = entries[i];

    if (entry.name === LOCAL_DIR_NAME || entry.name === 'node_modules' ||
        entry.name === '.git') {
      continue;
    }

    var srcPath = path.join(projectRoot, entry.name);
    var destItemPath = path.join(destPath, entry.name);

    if (entry.isDirectory()) {
      helpers.copyDir(srcPath, destItemPath);
    } else if (entry.isFile()) {
      helpers.ensureDir(path.dirname(destItemPath));
      require('fs').copyFileSync(srcPath, destItemPath);
    }
  }

  var metadata = metadataModule.generateMetadata(projectRoot);
  metadataModule.writeMetadata(destPath, metadata);

  console.log('Project "' + projectName + '" saved to ' + txtspmHomePath);
}

// === IMPORT ===

function handleImport(name, projectRoot) {
  var txtspmHomePath = searchModule.getTxtspmHomePath();
  var sourcePath = path.join(txtspmHomePath, name);

  if (!helpers.fileExists(sourcePath)) {
    console.error('Error: Project "' + name + '" not found in ' + txtspmHomePath);
    return;
  }

  var localDir = path.join(projectRoot, LOCAL_DIR_NAME);
  helpers.ensureDir(localDir);

  var destPath = path.join(localDir, name);

  if (helpers.fileExists(destPath)) {
    helpers.removeDir(destPath);
  }

  helpers.copyDir(sourcePath, destPath);
  console.log('Project "' + name + '" imported into ' + LOCAL_DIR_NAME + '/');
}

// === DELETE ===

function handleDelete(name) {
  var txtspmHomePath = searchModule.getTxtspmHomePath();
  var projectPath = path.join(txtspmHomePath, name);

  if (!helpers.fileExists(projectPath)) {
    console.error('Error: Project "' + name + '" not found in ' + txtspmHomePath);
    return;
  }

  helpers.removeDir(projectPath);
  console.log('Project "' + name + '" deleted from ' + txtspmHomePath);
}

// === LIST ===

function handleList() {
  var txtspmHomePath = searchModule.getTxtspmHomePath();

  if (!helpers.fileExists(txtspmHomePath)) {
    console.log('No projects saved yet.');
    return;
  }

  var names = helpers.readdirNames(txtspmHomePath);

  if (names.length === 0) {
    console.log('No projects saved yet.');
    return;
  }

  console.log('Saved projects:');

  for (var i = 0; i < names.length; i++) {
    console.log('  - ' + names[i]);
  }
}

// === SEARCH ===

function handleSearch(query) {
  if (!query) {
    console.error('Error: Expected a search query.');
    console.error('Usage: search <query>');
    return;
  }

  var results = searchModule.searchAll(query);

  if (results.length === 0) {
    console.log('No results found for "' + query + '".');
    return;
  }

  console.log('Search results for "' + query + '":');

  for (var i = 0; i < results.length; i++) {
    var r = results[i];
    console.log('  - ' + r.name + ' (match: ' + r.matchedField + ', score: ' + r.score + ')');
  }
}

// === UPDATE ===

function handleUpdate(projectRoot) {
  var metadata = metadataModule.generateMetadata(projectRoot);
  metadataModule.writeMetadata(projectRoot, metadata);
  console.log('Metadata updated.');

  var dependencies = metadata.Dependencies;

  if (dependencies.length === 0) {
    console.log('No dependencies to import.');
    return;
  }

  var localDir = path.join(projectRoot, LOCAL_DIR_NAME);
  helpers.ensureDir(localDir);

  for (var i = 0; i < dependencies.length; i++) {
    var depName = dependencies[i];
    var depDestPath = path.join(localDir, depName);

    if (helpers.fileExists(depDestPath)) {
      console.log('Dependency "' + depName + '" already imported.');
      continue;
    }

    var txtspmHomePath = searchModule.getTxtspmHomePath();
    var depSourcePath = path.join(txtspmHomePath, depName);

    if (!helpers.fileExists(depSourcePath)) {
      console.log('Warning: Dependency "' + depName + '" not found in ' + txtspmHomePath);
      continue;
    }

    helpers.copyDir(depSourcePath, depDestPath);
    console.log('Imported dependency "' + depName + '".');
  }
}

// === HELP ===

function handleHelp() {
  var helpText = [
    'txtspm - txts package manager',
    '',
    'Commands:',
    '  init                  Initialize project (README, metadata, .local-txtspm)',
    '  save                  Save project to ~/.txtspm/',
    '  import <name>         Import a project from ~/.txtspm/ into .local-txtspm/',
    '  delete <name>         Delete a project from ~/.txtspm/',
    '  list                  List saved projects',
    '  search <query>        Fuzzy search projects by name and metadata',
    '  update                Regenerate metadata and import all dependencies',
    '  help                  Show this help message',
    '  exit                  Exit txtspm'
  ];

  console.log(helpText.join('\n'));
}

// === MODULE EXPORTS ===

module.exports = {
  handleInit: handleInit,
  handleSave: handleSave,
  handleImport: handleImport,
  handleDelete: handleDelete,
  handleList: handleList,
  handleSearch: handleSearch,
  handleUpdate: handleUpdate,
  handleHelp: handleHelp,
  LOCAL_DIR_NAME: LOCAL_DIR_NAME
};
