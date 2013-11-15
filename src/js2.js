'use strict';

var OP = require('OptionParser');
var Compiler = require('./compiler.js');

var optionParser = new OP.OptionParser();

var VERBOSE = false;
var FORCE = false;

optionParser.addOption('o', 'output', 'Output location', 'input').argument('INPUT');
optionParser.addOption('i', 'input', 'Input location', 'output').argument('OUTPUT');
optionParser.addOption('v', 'verbose', 'Toggle verbose output')
			.action(function() {
				VERBOSE = true;
});
optionParser.addOption('h', 'help', 'Help')
			.action(function() {
				printHelp();
				process.exit(1);
});
optionParser.addOption('f', 'force', 'overwrite exitsing file')
      .action(function() {
        FORCE = true;
});

printGreeting();

optionParser.parse();

var options = optionParser.getopt();

if(!options.i || !options.o) {
	console.log('Please specify input and output parameters.');
	printHelp();
	process.exit(1);
}

var compiler = new Compiler.Js2JsCompiler(console.log, VERBOSE);

var result = compiler.compile(options.i, options.o, { force: FORCE });

if(result.ok) {
	console.log('Done!');
}
else {
	console.log('ERROR: ' + result.status);
	process.exit(1);
}

function printHelp() {
	console.log('Parameters usage:');
	console.log(optionParser.help());
}

function printGreeting() {
	console.log('Welcome to js2js compiler.');
}
