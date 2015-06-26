'use strict';

Object.defineProperty(exports, '__esModule', {
	value: true
});
var log = process.env.NODE_ENV === 'debug' ? function () {
	return console.log.apply(console, arguments);
} : function () {};

exports['default'] = log;
module.exports = exports['default'];