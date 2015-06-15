'use strict';

Object.defineProperty(exports, '__esModule', {
	value: true
});

function _interopRequireDefault(obj) { return obj && obj.__esModule ? obj : { 'default': obj }; }

var _lodash = require('lodash');

var _lodash2 = _interopRequireDefault(_lodash);

var _rx = require('rx');

var util = {
	makeObservable: function makeObservable(value) {
		if (typeof _lodash2['default'].get(value, 'subscribe') !== 'function') {
			value = typeof _lodash2['default'].get(value, 'then') === 'function' ? _rx.Observable.fromPromise(value) : _rx.Observable.just(value);
		}

		return value;
	},
	toArray: function toArray(value, callback) {
		util.makeObservable(value).toArray().subscribe(callback);
	}
};

exports['default'] = util;
module.exports = exports['default'];