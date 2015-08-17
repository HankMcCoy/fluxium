'use strict';

Object.defineProperty(exports, '__esModule', {
	value: true
});
exports['default'] = evaluate;

function _interopRequireDefault(obj) { return obj && obj.__esModule ? obj : { 'default': obj }; }

var _lodash = require('lodash');

var _lodash2 = _interopRequireDefault(_lodash);

function evaluate(_ref) {
	var getter = _ref.getter;
	var data = _ref.data;

	if (_lodash2['default'].every(getter, function (val) {
		return typeof val === 'string';
	})) {
		return data.getIn(getter);
	} else {
		var getters = _lodash2['default'].takeWhile(getter, function (val) {
			return _lodash2['default'].isArray(val);
		});
		var coalescer = _lodash2['default'].dropWhile(getter, function (val) {
			return _lodash2['default'].isArray(val);
		})[0];
		var values = getters.map(function (g) {
			return evaluate({
				data: data,
				getter: g
			});
		});

		return coalescer.apply(null, values);
	}
}

module.exports = exports['default'];