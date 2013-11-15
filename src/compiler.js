'use strict';

var fs = require('fs');

var Js2JsCompiler = function(logger, verbose) {
	this._logger = logger;
	this._verbose = verbose;
};

Js2JsCompiler.prototype.compile = function(inputLocation, outputLocation, options) {
	var input = fs.lstatSync(inputLocation);
	if(!options.force && fs.existsSync(outputLocation)) {
		return err('Output location already exists. Please remove it before compilation.');
	}
	if(input.isFile()) {
		return this.compileFile(inputLocation, outputLocation);
	}
	else if(input.isDirectory()) {
		return this.compileDirectory(inputLocation, outputLocation);
	}
	else {
		return err('Input and output location should be both files or directories.');
	}
};

Js2JsCompiler.prototype.compileDirectory = function(inputLocation, outputLocation) {
	fs.mkdirSync(outputLocation);
	var files = fs.readdirSync(inputLocation);
	this._logIfVerbose("Scanning directory: " + inputLocation);
	for(var file in files) {
		var input = fs.lstatSync(appendFileName(inputLocation, files[file]));
		if(input.isDirectory()) { // subdir
			this.compileDirectory(appendFileName(inputLocation, files[file]), appendFileName(outputLocation, files[file]));
		}
		else {
			var result = this.compileFile(appendFileName(inputLocation, files[file]), appendFileName(outputLocation, files[file]));
			if(!result.ok) {
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
	if(!endsWith(inputFile, '.js')) {
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

Js2JsCompiler.prototype._logIfVerbose = function(message) {
	if(this._logger && this._verbose) {
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
