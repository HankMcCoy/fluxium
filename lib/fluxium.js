'use strict';

Object.defineProperty(exports, '__esModule', {
	value: true
});

function _interopRequireDefault(obj) { return obj && obj.__esModule ? obj : { 'default': obj }; }

function _toConsumableArray(arr) { if (Array.isArray(arr)) { for (var i = 0, arr2 = Array(arr.length); i < arr.length; i++) arr2[i] = arr[i]; return arr2; } else { return Array.from(arr); } }

function _taggedTemplateLiteral(strings, raw) { return Object.freeze(Object.defineProperties(strings, { raw: { value: Object.freeze(raw) } })); }

var _invariant = require('invariant');

var _invariant2 = _interopRequireDefault(_invariant);

var _lodash = require('lodash');

var _lodash2 = _interopRequireDefault(_lodash);

var _nuclearJs = require('nuclear-js');

var _rx = require('rx');

var _rx2 = _interopRequireDefault(_rx);

var _ignoreNewlines = require('ignore-newlines');

var _ignoreNewlines2 = _interopRequireDefault(_ignoreNewlines);

var Observable = _rx2['default'].Observable;

var Fluxium = {
	Immutable: _nuclearJs.Immutable,
	Rx: _rx2['default'],
	create: function create(_ref) {
		var intents = _ref.intents;
		var stores = _ref.stores;
		var handleError = _ref.handleError;

		(0, _invariant2['default'])(handleError === undefined || typeof handleError === 'function', (0, _ignoreNewlines2['default'])(_taggedTemplateLiteral(['The \'handleError\' attribute must be either undefined or a\n\t\t\t\tfunction. You provided: %s.'], ['The \'handleError\' attribute must be either undefined or a\n\t\t\t\tfunction. You provided: %s.'])), handleError);

		(0, _invariant2['default'])(_lodash2['default'].isPlainObject(intents), (0, _ignoreNewlines2['default'])(_taggedTemplateLiteral(['The \'intents\' attribute must be a plain JS object. You\n\t\t\t\tprovided: %s.'], ['The \'intents\' attribute must be a plain JS object. You\n\t\t\t\tprovided: %s.'])), intents);

		var reactor = new _nuclearJs.Reactor();

		reactor.registerStores(getStores(stores));

		return {
			mixin: reactor.ReactMixin,
			intents: mapIntents({ intents: intents, reactor: reactor }),
			observe: reactor.observe.bind(reactor),
			evaluate: reactor.evaluate.bind(reactor)
		};
	}
};

function mapIntents(_ref2) {
	var intents = _ref2.intents;
	var reactor = _ref2.reactor;

	return _lodash2['default'].mapValues(intents, function (value, key) {
		(0, _invariant2['default'])(typeof value === 'function' || _lodash2['default'].isPlainObject(value), (0, _ignoreNewlines2['default'])(_taggedTemplateLiteral(['Children of the \'intents\' attribute must be either a\n\t\t\t\tfunction or a plain JS object. You provided a child at %s with a\n\t\t\t\ttype of %s'], ['Children of the \'intents\' attribute must be either a\n\t\t\t\tfunction or a plain JS object. You provided a child at %s with a\n\t\t\t\ttype of %s'])), value, typeof value);

		if (typeof value === 'function') {
			return wrapIntent({ reactor: reactor, intent: value, name: key });
		} else if (_lodash2['default'].isPlainObject(value)) {
			return mapIntents({ reactor: reactor, intents: value });
		}
	});
}

function wrapIntent(_ref3) {
	var intent = _ref3.intent;
	var name = _ref3.name;
	var reactor = _ref3.reactor;

	var evaluate = reactor.evaluate.bind(reactor);

	return function getAndDispatchActions(payload) {
		log.apply(undefined, _toConsumableArray(['Intent called: ' + name + '.'].concat(payload ? ['Payload:', payload] : [])));

		var result = intent(payload, evaluate);

		(0, _invariant2['default'])(typeof result.subscribe === 'function', 'Intents must return Rx.Observables of actions. You returned: $s', result);

		result.subscribe(function (action) {
			var actionKeys = Object.keys(action);
			var type = action.type;
			var payload = action.payload;

			(0, _invariant2['default'])(_lodash2['default'].every(actionKeys, function (key) {
				return _lodash2['default'].includes(['type', 'payload'], key);
			}), (0, _ignoreNewlines2['default'])(_taggedTemplateLiteral(['The only valid attributes on an action are \'type\'\n\t\t\t\t\t\tand \'payload\'. You provided: %s.'], ['The only valid attributes on an action are \'type\'\n\t\t\t\t\t\tand \'payload\'. You provided: %s.'])), JSON.stringify(Object.keys(action)));

			(0, _invariant2['default'])(typeof action.type === 'string' && action.type.length, 'Action types must be non-empty strings. You provided: %s.', action.type);

			(0, _invariant2['default'])(action.payload === undefined || _lodash2['default'].isPlainObject(action.payload), (0, _ignoreNewlines2['default'])(_taggedTemplateLiteral(['Action payloads must be undefined or plain JS\n\t\t\t\t\tobjects. You provided: %s.'], ['Action payloads must be undefined or plain JS\n\t\t\t\t\tobjects. You provided: %s.'])), action.payload);

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

function dispatch(_ref4) {
	var reactor = _ref4.reactor;
	var type = _ref4.type;
	var payload = _ref4.payload;

	(0, _invariant2['default'])(typeof type === 'string' && type.length, 'Action types dispatched must be non-empty strings. You provided: %s', type);

	(0, _invariant2['default'])(payload === undefined || _lodash2['default'].isPlainObject(payload), 'Action payloads must be plain JS objects. You provided: %s', payload);

	log.apply(undefined, _toConsumableArray(['Dispatching ' + type + '.'].concat(payload ? ['Payload:', payload] : [])));

	reactor.dispatch(type, payload);
}

function getStores(stores) {
	(0, _invariant2['default'])(_lodash2['default'].isPlainObject(stores), 'The `stores` attribute must be a plain JS object. You provided: %s.', stores);

	return _lodash2['default'].mapValues(stores, function (store) {
		return createStore(store);
	});
}

function createStore(store) {
	(0, _invariant2['default'])(_lodash2['default'].isPlainObject(store), 'Each store must be a plain JS object.');

	(0, _invariant2['default'])(_lodash2['default'].isEqual(Object.keys(store), ['initialState', 'handlers']), (0, _ignoreNewlines2['default'])(_taggedTemplateLiteral(['The \'stores\' attribute requires exactly two attributes:\n\t\t\t\'initialState\' and \'handlers\'. You provided: %s.'], ['The \'stores\' attribute requires exactly two attributes:\n\t\t\t\'initialState\' and \'handlers\'. You provided: %s.'])), Object.keys(store));

	(0, _invariant2['default'])(_nuclearJs.Immutable.Map.isMap(store.initialState), 'Each store\'s `initialState` attribute must be an Immutable.js map.');

	(0, _invariant2['default'])(_lodash2['default'].isPlainObject(store.handlers) && _lodash2['default'].every(store.handlers, function (handler) {
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

var log = process.env.NODE_ENV === 'debug' ? function () {
	for (var _len = arguments.length, args = Array(_len), _key = 0; _key < _len; _key++) {
		args[_key] = arguments[_key];
	}

	return console.log.apply(console, args);
} : function () {};

exports['default'] = Fluxium;
module.exports = exports['default'];