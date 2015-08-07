'use strict';

Object.defineProperty(exports, '__esModule', {
	value: true
});
exports['default'] = makeObservable;

function _interopRequireDefault(obj) { return obj && obj.__esModule ? obj : { 'default': obj }; }

var _rx = require('rx');

var _rx2 = _interopRequireDefault(_rx);

var _lodash = require('lodash');

var _lodash2 = _interopRequireDefault(_lodash);

function makeObservable(value) {
	if (typeof _lodash2['default'].get(value, 'subscribe') !== 'function') {
		value = typeof _lodash2['default'].get(value, 'then') === 'function' ? _rx2['default'].Observable.fromPromise(value) : _rx2['default'].Observable.just(value);
	}

	return value;
}

module.exports = exports['default'];