var path = require('path');
var helpers = require('../../general/helpers');
var metadataModule = require('./metadata');

// === CONSTANTS ===

var TXTSPM_HOME_DIR_NAME = '.txtspm';

function getTxtspmHomePath() {
  return path.join(helpers.getHomeDir(), TXTSPM_HOME_DIR_NAME);
}

// === FUZZY SEARCH ===

function fuzzySearch(query, names, metadataList) {
  var results = [];
  var lowerQuery = query.toLowerCase();
  var seenNames = {};

  var nameResults = searchNames(lowerQuery, names);

  for (var i = 0; i < nameResults.length; i++) {
    var nameResult = nameResults[i];

    if (!seenNames[nameResult.name]) {
      seenNames[nameResult.name] = true;
      results.push(nameResult);
    }
  }

  var metadataResults = searchMetadata(lowerQuery, metadataList);

  for (var j = 0; j < metadataResults.length; j++) {
    var metaResult = metadataResults[j];

    if (!seenNames[metaResult.name]) {
      seenNames[metaResult.name] = true;
      results.push(metaResult);
    }
  }

  results.sort(function(a, b) {
    return b.score - a.score;
  });

  return results;
}

function searchNames(query, names) {
  var results = [];

  for (var i = 0; i < names.length; i++) {
    var name = names[i];
    var score = simpleFuzzyMatch(query, name.toLowerCase());

    if (score > 0) {
      results.push({
        name: name,
        score: score,
        matchedField: 'name'
      });
    }
  }

  return results;
}

function searchMetadata(query, metadataList) {
  var results = [];

  for (var i = 0; i < metadataList.length; i++) {
    var metadata = metadataList[i];
    var bestScore = 0;
    var matchedField = '';

    var titleScore = simpleFuzzyMatch(query, (metadata.Title || '').toLowerCase());
    if (titleScore > bestScore) {
      bestScore = titleScore;
      matchedField = 'title';
    }

    var descScore = simpleFuzzyMatch(query, (metadata.Description || '').toLowerCase());
    if (descScore > bestScore) {
      bestScore = descScore;
      matchedField = 'description';
    }

    if (Array.isArray(metadata.Keywords)) {
      for (var k = 0; k < metadata.Keywords.length; k++) {
        var kwScore = simpleFuzzyMatch(query, metadata.Keywords[k].toLowerCase());
        if (kwScore > bestScore) {
          bestScore = kwScore;
          matchedField = 'keyword';
        }
      }
    }

    if (bestScore > 0) {
      results.push({
        name: metadata.Title || 'unknown',
        score: bestScore,
        matchedField: matchedField
      });
    }
  }

  return results;
}

function simpleFuzzyMatch(query, text) {
  if (!query || !text) {
    return 0;
  }

  if (text === query) {
    return 100;
  }

  if (text.indexOf(query) !== -1) {
    return 80;
  }

  var queryIndex = 0;
  var textIndex = 0;
  var matches = 0;

  while (queryIndex < query.length && textIndex < text.length) {
    if (query[queryIndex] === text[textIndex]) {
      matches = matches + 1;
      queryIndex = queryIndex + 1;
    }

    textIndex = textIndex + 1;
  }

  if (queryIndex >= query.length) {
    return Math.round((matches / query.length) * 60);
  }

  return 0;
}

function searchAll(query) {
  var txtspmHomePath = getTxtspmHomePath();

  if (!helpers.fileExists(txtspmHomePath)) {
    return [];
  }

  var projectNames = helpers.readdirNames(txtspmHomePath);
  var metadataList = [];

  for (var i = 0; i < projectNames.length; i++) {
    var projectPath = path.join(txtspmHomePath, projectNames[i]);
    var metadata = metadataModule.readMetadata(projectPath);

    if (metadata) {
      metadataList.push(metadata);
    }
  }

  return fuzzySearch(query, projectNames, metadataList);
}

// === MODULE EXPORTS ===

module.exports = {
  fuzzySearch: fuzzySearch,
  searchNames: searchNames,
  searchMetadata: searchMetadata,
  searchAll: searchAll,
  simpleFuzzyMatch: simpleFuzzyMatch,
  TXTSPM_HOME_DIR_NAME: TXTSPM_HOME_DIR_NAME,
  getTxtspmHomePath: getTxtspmHomePath
};
