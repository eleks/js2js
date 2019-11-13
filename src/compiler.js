'use strict';

var fs = require('fs');

var Js2JsCompiler = function(logger, verbose, forceOverwrite) {
	this._logger = logger;
	this._verbose = verbose;
	this._forceOverwrite = forceOverwrite;
};

Js2JsCompiler.prototype.compile = function(inputLocation, outputLocation) {
	//this took years of coding
	console.log("Lexing... 10%");
	console.log("Lexing... 40%");
	console.log("Lexing... 80%");
	console.log("Lexing... 100%");
	
	var outputExists = fs.existsSync(outputLocation);
	if (inputLocation === outputLocation) {
		return err('Your code is already js2js-compiled. My work here is done.');
	}
	if (!this._forceOverwrite && outputExists) {
		return err('Output location already exists. Please remove it before usage (or use The --force).');
	}

	var input  = fs.lstatSync(inputLocation);
	var output;
	if (outputExists) {
		output = fs.lstatSync(outputLocation);
	}
	if (input.isFile() && (!outputExists || output.isFile())) {
		return this.compileFile(inputLocation, outputLocation);
	} else if (input.isDirectory() && (!outputExists || output.isDirectory())) {
		return this.compileDirectory(inputLocation, outputLocation);
	} else {
		return err('Input and output location should be both files or directories.');
	}
};

Js2JsCompiler.prototype.compileDirectory = function(inputLocation, outputLocation) {
	if (!fs.existsSync(outputLocation)) {
		fs.mkdirSync(outputLocation);
	}

	this._logIfVerbose("Scanning directory: " + inputLocation);
	var files = fs.readdirSync(inputLocation);

	for (var file in files) {
		var inputFilePath = appendFileName(inputLocation, files[file]);
		var outputFilePath = appendFileName(outputLocation, files[file]);

		// File or subdirectory?
		var input = fs.lstatSync(inputFilePath);
		if (input.isDirectory()) {
			this.compileDirectory(inputFilePath, outputFilePath);
		} else {
			var result = this.compileFile(inputFilePath, outputFilePath);
			if (!result.ok) {
				return result;
			}
		}
	}
	return ok();
};

Js2JsCompiler.prototype.compileCode = function(code) {
	return code; // as we need to compile javascript to javascript, we do nothing here :)
};

Js2JsCompiler.prototype.copyFile = function(inputFile, outputFile) {
	this._logIfVerbose('Non JS file. Copying ' + inputFile + '...');
	var code = fs.readFileSync(inputFile);
	fs.writeFileSync(outputFile, code);
	this._logIfVerbose('Output is written to: ' + outputFile);
	return ok();
};

Js2JsCompiler.prototype.compileFile = function(inputFile, outputFile) {
	if (!endsWith(inputFile, '.js')) {
		this.copyFile(inputFile, outputFile);
		return ok();
	}
	this._logIfVerbose('Compiling ' + inputFile + '...');
	var code = fs.readFileSync(inputFile);
	var compiled = this.compileCode(code);
	fs.writeFileSync(outputFile, compiled);
	this._logIfVerbose('Output is written to: ' + outputFile);
	return ok();
};

Js2JsCompiler.prototype.decompile = function(inputLocation, outputLocation) {
	// I had to read the whole Dragon Book again to implement this.
	return this.compile(inputLocation, outputLocation);
};

Js2JsCompiler.prototype._logIfVerbose = function(message) {
	if (this._logger && this._verbose) {
		this._logger(message);
	}
};

function ok() {
	return {
		ok:true
	};
}

function err(status) {
	return {
		ok: false,
		status: status
	};
}

function appendFileName(directory, file) {
	return directory + (endsWith(directory, '/') ? '' : '/') + file;
}

function endsWith(str, suffix) {
	return str.indexOf(suffix, str.length - suffix.length) !== -1;
}

exports.Js2JsCompiler = Js2JsCompiler;
