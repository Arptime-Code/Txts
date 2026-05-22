var readline = require('readline');

// === CONSTANTS ===

var EXIT_COMMANDS = ['exit', 'quit', 'q'];
var REPL_PROMPT = '> ';

// === FUNCTIONS ===

function createRepl(commandHandler, options) {
  options = options || {};

  var prompt = options.prompt || REPL_PROMPT;
  var greeting = options.greeting || '';

  var rl = readline.createInterface({
    input: process.stdin,
    output: process.stdout,
    prompt: prompt
  });

  if (greeting) {
    console.log(greeting);
  }

  rl.prompt();

  rl.on('line', function(line) {
    var trimmed = line.trim();

    if (isExitCommand(trimmed)) {
      rl.close();
      return;
    }

    if (trimmed.length > 0) {
      try {
        commandHandler(trimmed);
      } catch (err) {
        console.error('Error: ' + err.message);
      }
    }

    rl.prompt();
  });

  rl.on('close', function() {
    console.log('');
    process.exit(0);
  });

  return rl;
}

function isExitCommand(input) {
  for (var i = 0; i < EXIT_COMMANDS.length; i++) {
    if (input.toLowerCase() === EXIT_COMMANDS[i]) {
      return true;
    }
  }

  return false;
}

// === MODULE EXPORTS ===

module.exports = {
  createRepl: createRepl
};
