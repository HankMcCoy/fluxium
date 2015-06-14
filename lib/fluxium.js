'use strict';

Object.defineProperty(exports, '__esModule', {
	value: true
});

function _interopRequireDefault(obj) { return obj && obj.__esModule ? obj : { 'default': obj }; }

function _toConsumableArray(arr) { if (Array.isArray(arr)) { for (var i = 0, arr2 = Array(arr.length); i < arr.length; i++) arr2[i] = arr[i]; return arr2; } else { return Array.from(arr); } }

var _invariant = require('invariant');

var _invariant2 = _interopRequireDefault(_invariant);

var _lodash = require('lodash');

var _lodash2 = _interopRequireDefault(_lodash);

var _nuclearJs = require('nuclear-js');

var _rx = require('rx');

var Fluxium = {
	Immutable: _nuclearJs.Immutable,
	create: function create(_ref) {
		var actionCreators = _ref.actionCreators;
		var stores = _ref.stores;
		var handleActionError = _ref.handleActionError;

		(0, _invariant2['default'])(handleActionError === undefined || typeof handleActionError === 'function', 'The `handleActionError` attribute must be either undefined or a ' + 'function. You provided: %s.', handleActionError);

		(0, _invariant2['default'])(_lodash2['default'].isPlainObject(actionCreators), 'The `actionCreators` attribute must be a plain JS object. You ' + 'provided: %s.', actionCreators);

		var reactor = new _nuclearJs.Reactor();

		function mapActionCreators(actionCreatorGroup) {
			return _lodash2['default'].mapValues(actionCreatorGroup, function (value, key) {
				(0, _invariant2['default'])(typeof value === 'function' || _lodash2['default'].isPlainObject(value), 'Children of the `actionCreators` attribute must be either a ' + 'function or a plain JS object. You provided a child at %s with a ' + 'type of %s', value, typeof value);

				if (typeof value === 'function') {
					return wrapActionCreator(value, key);
				} else if (_lodash2['default'].isPlainObject(value)) {
					return mapActionCreators(value);
				}
			});
		}

		function dispatch(actionType, payload) {
			(0, _invariant2['default'])(typeof actionType === 'string' && actionType.length, 'Action types dispatched must be non-empty strings. You provided: %s', actionType);

			(0, _invariant2['default'])(payload === undefined || _lodash2['default'].isPlainObject(payload), 'Action payloads must be plain JS objects. You provided: %s', payload);

			log.apply(undefined, _toConsumableArray(['Dispatching ' + actionType + '.'].concat(payload ? ['Payload:', payload] : [])));
			reactor.dispatch(actionType, payload);
		}

		function wrapActionCreator(actionCreator, name) {
			return function getAndDispatchActions(payload) {
				log.apply(undefined, _toConsumableArray(['Action creator called: ' + name + '.'].concat(payload ? ['Payload:', payload] : [])));

				var result = actionCreator(payload);

				if (typeof _lodash2['default'].get(result, 'subscribe') !== 'function') {
					result = typeof _lodash2['default'].get(result, 'then') === 'function' ? _rx.Observable.fromPromise(result) : _rx.Observable.just(result);
				}

				result.subscribe(function (action) {
					(0, _invariant2['default'])(_lodash2['default'].every(Object.keys(action), function (key) {
						return _lodash2['default'].includes(['type', 'payload'], key);
					}), 'The only valid attributes on an action are `type` and ' + '`payload`. You provided: %s.', JSON.stringify(Object.keys(action)));

					(0, _invariant2['default'])(typeof action.type === 'string' && action.type.length, 'Action types must be non-empty strings. You provided: %s.', action.type);

					(0, _invariant2['default'])(action.payload === undefined || _lodash2['default'].isPlainObject(action.payload), 'Action payloads must be undefined or plain JS objects. ' + 'You provided: %s.', action.payload);

					dispatch(action.type, action.payload);
				}, function (error) {
					var errorEvent = handleActionError(error);

					if (errorEvent) {
						dispatch(errorEvent.type, errorEvent.payload);
					}
				});
			};
		}

		reactor.registerStores(getStores(stores));

		return {
			mixin: reactor.ReactMixin,
			actions: mapActionCreators(actionCreators)
		};
	}
};

function getStores(stores) {
	(0, _invariant2['default'])(_lodash2['default'].isPlainObject(stores), 'The `stores` attribute must be a plain JS object. You provided: %s.', stores);

	return _lodash2['default'].mapValues(stores, function (store) {
		return createStore(store);
	});
}

function createStore(store) {
	(0, _invariant2['default'])(_lodash2['default'].isPlainObject(store), 'Each store must be a plain JS object.');

	(0, _invariant2['default'])(_lodash2['default'].isEqual(Object.keys(store), ['initialState', 'handlers']), 'The `stores` attribute requires exactly two attributes: initialState ' + 'and handlers. You provided: %s.', Object.keys(store));

	(0, _invariant2['default'])(_nuclearJs.Immutable.Map.isMap(store.initialState), 'Each store\'s `initialState` attribute must be an Immutable.js map.');

	(0, _invariant2['default'])(_lodash2['default'].isPlainObject(store.handlers) && _lodash2['default'].every(store.handlers, function (handler) {
		return typeof handler === 'function';
	}), 'Each store\'s `handlers` attribute must be a plain JS object mapping ' + 'action type strings to functions.');

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