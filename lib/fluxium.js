'use strict';

Object.defineProperty(exports, '__esModule', {
	value: true
});

function _interopRequireDefault(obj) { return obj && obj.__esModule ? obj : { 'default': obj }; }

function _taggedTemplateLiteral(strings, raw) { return Object.freeze(Object.defineProperties(strings, { raw: { value: Object.freeze(raw) } })); }

var _invariant = require('invariant');

var _invariant2 = _interopRequireDefault(_invariant);

var _lodashLangIsPlainObject = require('lodash/lang/isPlainObject');

var _lodashLangIsPlainObject2 = _interopRequireDefault(_lodashLangIsPlainObject);

var _nuclearJs = require('nuclear-js');

var _ignoreNewlines = require('ignore-newlines');

var _ignoreNewlines2 = _interopRequireDefault(_ignoreNewlines);

var _wrapIntents = require('./wrapIntents');

var _wrapIntents2 = _interopRequireDefault(_wrapIntents);

var _wrapStores = require('./wrapStores');

var _wrapStores2 = _interopRequireDefault(_wrapStores);

var _evaluate = require('./evaluate');

var _evaluate2 = _interopRequireDefault(_evaluate);

var Fluxium = {
	Immutable: _nuclearJs.Immutable,
	evaluate: _evaluate2['default'],
	create: function create(_ref) {
		var intents = _ref.intents;
		var stores = _ref.stores;
		var handleError = _ref.handleError;

		(0, _invariant2['default'])(handleError === undefined || typeof handleError === 'function', (0, _ignoreNewlines2['default'])(_taggedTemplateLiteral(['The \'handleError\' attribute must be either undefined or a\n\t\t\t\tfunction. You provided: %s.'], ['The \'handleError\' attribute must be either undefined or a\n\t\t\t\tfunction. You provided: %s.'])), handleError);

		(0, _invariant2['default'])((0, _lodashLangIsPlainObject2['default'])(intents), (0, _ignoreNewlines2['default'])(_taggedTemplateLiteral(['The \'intents\' attribute must be a plain JS object. You\n\t\t\t\tprovided: %s.'], ['The \'intents\' attribute must be a plain JS object. You\n\t\t\t\tprovided: %s.'])), intents);

		var reactor = new _nuclearJs.Reactor();

		reactor.registerStores((0, _wrapStores2['default'])(stores));

		return {
			mixin: reactor.ReactMixin,
			intents: (0, _wrapIntents2['default'])({ intents: intents, reactor: reactor, handleError: handleError }),
			observe: reactor.observe.bind(reactor),
			evaluate: reactor.evaluate.bind(reactor),
			getDebugState: function getDebugState() {
				return reactor.state.toJS();
			}
		};
	}
};

exports['default'] = Fluxium;
module.exports = exports['default'];