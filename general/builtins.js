// === CONSTANTS ===

var TXTS_LIBRARY_NAME = 'txts';
var OUTPUT_VARIABLE_NAME = 'OUTPUT';
var CLEAR_VARIABLE_NAME = 'CLEAR';

// === FUNCTIONS ===

function createBuiltinVariables() {
  var result = {};
  result[TXTS_LIBRARY_NAME] = {};
  result[TXTS_LIBRARY_NAME][OUTPUT_VARIABLE_NAME] = '';
  result[TXTS_LIBRARY_NAME][CLEAR_VARIABLE_NAME] = '';
  return result;
}

// === MODULE EXPORTS ===

module.exports = {
  TXTS_LIBRARY_NAME: TXTS_LIBRARY_NAME,
  OUTPUT_VARIABLE_NAME: OUTPUT_VARIABLE_NAME,
  CLEAR_VARIABLE_NAME: CLEAR_VARIABLE_NAME,
  createBuiltinVariables: createBuiltinVariables
};
