'use strict';

Object.defineProperty(exports, '__esModule', {
	value: true
});
exports['default'] = wrapIntents;

function _interopRequireDefault(obj) { return obj && obj.__esModule ? obj : { 'default': obj }; }

function _toConsumableArray(arr) { if (Array.isArray(arr)) { for (var i = 0, arr2 = Array(arr.length); i < arr.length; i++) arr2[i] = arr[i]; return arr2; } else { return Array.from(arr); } }

function _taggedTemplateLiteral(strings, raw) { return Object.freeze(Object.defineProperties(strings, { raw: { value: Object.freeze(raw) } })); }

var _ignoreNewlines = require('ignore-newlines');

var _ignoreNewlines2 = _interopRequireDefault(_ignoreNewlines);

var _invariant = require('invariant');

var _invariant2 = _interopRequireDefault(_invariant);

var _lodashObjectMapValues = require('lodash/object/mapValues');

var _lodashObjectMapValues2 = _interopRequireDefault(_lodashObjectMapValues);

var _lodashLangIsPlainObject = require('lodash/lang/isPlainObject');

var _lodashLangIsPlainObject2 = _interopRequireDefault(_lodashLangIsPlainObject);

var _lodashCollectionEvery = require('lodash/collection/every');

var _lodashCollectionEvery2 = _interopRequireDefault(_lodashCollectionEvery);

var _lodashCollectionIncludes = require('lodash/collection/includes');

var _lodashCollectionIncludes2 = _interopRequireDefault(_lodashCollectionIncludes);

var _util = require('./util');

var _util2 = _interopRequireDefault(_util);

var _log = require('./log');

var _log2 = _interopRequireDefault(_log);

function wrapIntents(_ref) {
	var intents = _ref.intents;
	var reactor = _ref.reactor;
	var handleError = _ref.handleError;

	return (0, _lodashObjectMapValues2['default'])(intents, function (value, key) {
		(0, _invariant2['default'])(typeof value === 'function' || (0, _lodashLangIsPlainObject2['default'])(value), (0, _ignoreNewlines2['default'])(_taggedTemplateLiteral(['Children of the \'intents\' attribute must be either a\n\t\t\t\tfunction or a plain JS object. You provided a child at %s with a\n\t\t\t\ttype of %s'], ['Children of the \'intents\' attribute must be either a\n\t\t\t\tfunction or a plain JS object. You provided a child at %s with a\n\t\t\t\ttype of %s'])), value, typeof value);

		if (typeof value === 'function') {
			return wrapIntent({ reactor: reactor, handleError: handleError, intent: value, name: key });
		} else if ((0, _lodashLangIsPlainObject2['default'])(value)) {
			return wrapIntents({ reactor: reactor, handleError: handleError, intents: value });
		}
	});
}

function wrapIntent(_ref2) {
	var intent = _ref2.intent;
	var name = _ref2.name;
	var reactor = _ref2.reactor;
	var handleError = _ref2.handleError;

	var evaluate = reactor.evaluate.bind(reactor);

	return function getAndDispatchActions(payload) {
		_log2['default'].apply(undefined, _toConsumableArray(['Intent called: ' + name + '.'].concat(payload ? ['Payload:', payload] : [])));

		var result = (0, _util2['default'])(intent(payload, evaluate));

		(0, _invariant2['default'])(typeof result.subscribe === 'function', 'Intents must return Rx.Observables of actions. You returned: $s', result);

		result.filter(function (action) {
			return !!action;
		}).subscribe(function (action) {
			var actionKeys = Object.keys(action);
			var type = action.type;
			var payload = action.payload;

			(0, _invariant2['default'])((0, _lodashCollectionEvery2['default'])(actionKeys, function (key) {
				return (0, _lodashCollectionIncludes2['default'])(['type', 'payload'], key);
			}), (0, _ignoreNewlines2['default'])(_taggedTemplateLiteral(['The only valid attributes on an action are \'type\'\n\t\t\t\t\t\t\tand \'payload\'. You provided: %s.'], ['The only valid attributes on an action are \'type\'\n\t\t\t\t\t\t\tand \'payload\'. You provided: %s.'])), JSON.stringify(Object.keys(action)));

			(0, _invariant2['default'])(typeof action.type === 'string' && action.type.length, 'Action types must be non-empty strings. You provided: %s.', action.type);

			(0, _invariant2['default'])(action.payload === undefined || (0, _lodashLangIsPlainObject2['default'])(action.payload), (0, _ignoreNewlines2['default'])(_taggedTemplateLiteral(['Action payloads must be undefined or plain JS\n\t\t\t\t\t\t\tobjects. You provided: %s.'], ['Action payloads must be undefined or plain JS\n\t\t\t\t\t\t\tobjects. You provided: %s.'])), action.payload);

			dispatch({ reactor: reactor, type: type, payload: payload });
		}, function (error) {
			var errorEvent = handleError(error);

			if (errorEvent) {
				var type = errorEvent.type;
				var _payload = errorEvent.payload;

				dispatch({ reactor: reactor, type: type, payload: _payload });
			}
		});
	};
}

function dispatch(_ref3) {
	var reactor = _ref3.reactor;
	var type = _ref3.type;
	var payload = _ref3.payload;

	(0, _invariant2['default'])(typeof type === 'string' && type.length, 'Action types dispatched must be non-empty strings. You provided: %s', type);

	(0, _invariant2['default'])(payload === undefined || (0, _lodashLangIsPlainObject2['default'])(payload), 'Action payloads must be plain JS objects. You provided: %s', payload);

	_log2['default'].apply(undefined, _toConsumableArray(['Dispatching ' + type + '.'].concat(payload ? ['Payload:', payload] : [])));

	reactor.dispatch(type, payload);
}
module.exports = exports['default'];