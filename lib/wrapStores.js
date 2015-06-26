'use strict';

Object.defineProperty(exports, '__esModule', {
	value: true
});
exports['default'] = wrapStores;

function _interopRequireDefault(obj) { return obj && obj.__esModule ? obj : { 'default': obj }; }

function _taggedTemplateLiteral(strings, raw) { return Object.freeze(Object.defineProperties(strings, { raw: { value: Object.freeze(raw) } })); }

var _ignoreNewlines = require('ignore-newlines');

var _ignoreNewlines2 = _interopRequireDefault(_ignoreNewlines);

var _invariant = require('invariant');

var _invariant2 = _interopRequireDefault(_invariant);

var _lodashLangIsPlainObject = require('lodash/lang/isPlainObject');

var _lodashLangIsPlainObject2 = _interopRequireDefault(_lodashLangIsPlainObject);

var _lodashObjectMapValues = require('lodash/object/mapValues');

var _lodashObjectMapValues2 = _interopRequireDefault(_lodashObjectMapValues);

var _lodashCollectionEvery = require('lodash/collection/every');

var _lodashCollectionEvery2 = _interopRequireDefault(_lodashCollectionEvery);

var _lodashLangIsEqual = require('lodash/lang/isEqual');

var _lodashLangIsEqual2 = _interopRequireDefault(_lodashLangIsEqual);

var _nuclearJs = require('nuclear-js');

function wrapStores(stores) {
	(0, _invariant2['default'])((0, _lodashLangIsPlainObject2['default'])(stores), 'The `stores` attribute must be a plain JS object. You provided: %s.', stores);

	return (0, _lodashObjectMapValues2['default'])(stores, function (store) {
		return wrapStore(store);
	});
}

function wrapStore(store) {
	(0, _invariant2['default'])((0, _lodashLangIsPlainObject2['default'])(store), 'Each store must be a plain JS object.');

	(0, _invariant2['default'])((0, _lodashLangIsEqual2['default'])(Object.keys(store), ['initialState', 'handlers']), (0, _ignoreNewlines2['default'])(_taggedTemplateLiteral(['The \'stores\' attribute requires exactly two attributes:\n\t\t\t\'initialState\' and \'handlers\'. You provided: %s.'], ['The \'stores\' attribute requires exactly two attributes:\n\t\t\t\'initialState\' and \'handlers\'. You provided: %s.'])), Object.keys(store));

	(0, _invariant2['default'])(_nuclearJs.Immutable.Map.isMap(store.initialState), 'Each store\'s `initialState` attribute must be an Immutable.js map.');

	(0, _invariant2['default'])((0, _lodashLangIsPlainObject2['default'])(store.handlers) && (0, _lodashCollectionEvery2['default'])(store.handlers, function (handler) {
		return typeof handler === 'function';
	}), (0, _ignoreNewlines2['default'])(_taggedTemplateLiteral(['Each store\'s \'handlers\' attribute must be a plain JS\n\t\t\tobject mapping action type strings to functions.'], ['Each store\\\'s \'handlers\' attribute must be a plain JS\n\t\t\tobject mapping action type strings to functions.'])));

	return new _nuclearJs.Store({
		getInitialState: function getInitialState() {
			return store.initialState;
		},
		initialize: function initialize() {
			var _this = this;

			Object.keys(store.handlers).forEach(function (actionType) {
				_this.on(actionType, store.handlers[actionType]);
			});
		}
	});
}
module.exports = exports['default'];