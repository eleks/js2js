'use strict';

var OP = require('OptionParser');
var Compiler = require('./compiler.js');

var optionParser = new OP.OptionParser();

var VERBOSE = false;
var FORCE = false;
var DECOMPILE = false;

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
optionParser.addOption('f', 'force', 'Overwrite existing output files')
			.action(function() {
				FORCE = true;
});
optionParser.addOption('d', 'decompile', 'Decompile php2php-powered PHP back to original PHP.')
            .action(function() {
                DECOMPILE = true;
});

printGreeting();

optionParser.parse();

var options = optionParser.getopt();

if (!options.i || !options.o) {
	console.log('Please specify input and output parameters.');
	printHelp();
	process.exit(1);
}

var compiler = new Compiler.Js2JsCompiler(console.log, VERBOSE, FORCE);
var result = !DECOMPILE
    ? compiler.compile(options.i, options.o)
    : compiler.decompile(options.i, options.o);

if (result.ok) {
	console.log('Done!');
} else {
	console.log('ERROR: ' + result.status);
	process.exit(1);
}

function printHelp() {
	console.log('Parameters usage:');
	console.log(optionParser.help());
}

function printGreeting() {
	console.log('Welcome to php2php compiler.');
}
