import invariant from 'invariant'
import _ from 'lodash'
import { Reactor, Store, Immutable } from 'nuclear-js'
import Rx from 'rx'
import ignoreNewlines from 'ignore-newlines'

const { Observable } = Rx

const Fluxium = {
	Immutable,
	Rx,
	create({ intents, stores, handleError }) {
		invariant(
			handleError === undefined || typeof handleError === 'function',
			ignoreNewlines `The 'handleError' attribute must be either undefined or a
				function. You provided: %s.`,
			handleError
		)

		invariant(
			_.isPlainObject(intents),
			ignoreNewlines `The 'intents' attribute must be a plain JS object. You
				provided: %s.`,
			intents
		)

		const reactor = new Reactor()

		function mapIntents(intentGroup) {
			return _.mapValues(intentGroup, (value, key) => {
				invariant(
					typeof value === 'function' || _.isPlainObject(value),
					ignoreNewlines `Children of the 'intents' attribute must be either a
						function or a plain JS object. You provided a child at %s with a
						type of %s`,
					value,
					typeof value
				)

				if (typeof value === 'function') {
					return wrapIntent(value, key)
				}
				else if (_.isPlainObject(value)) {
					return mapIntents(value)
				}
			})
		}

		function dispatch(actionType, payload) {
			invariant(
				typeof actionType === 'string' && actionType.length,
				'Action types dispatched must be non-empty strings. You provided: %s',
				actionType
			)

			invariant(
				payload === undefined || _.isPlainObject(payload),
				'Action payloads must be plain JS objects. You provided: %s',
				payload
			)

			log(...[`Dispatching ${actionType}.`]
				.concat(payload ? ['Payload:', payload] : []))
			reactor.dispatch(actionType, payload)
		}

		function wrapIntent(intent, name) {
			return function getAndDispatchActions(payload) {
				log(...[`Intent called: ${name}.`]
					.concat(payload ? ['Payload:', payload] : []))

				var result = intent(payload)

				invariant(
					typeof result.subscribe === 'function',
					'Intents must return Rx.Observables of actions. You returned: $s',
					result
				)

				result.subscribe(
					action => {
						invariant(
							_.every(Object.keys(action), key =>
								_.includes(['type', 'payload'], key)),
							ignoreNewlines `The only valid attributes on an action are 'type'
								and 'payload'. You provided: %s.`,
							JSON.stringify(Object.keys(action))
						)

						invariant(
							typeof action.type === 'string' && action.type.length,
							'Action types must be non-empty strings. You provided: %s.',
							action.type
						)

						invariant(
							action.payload === undefined || _.isPlainObject(action.payload),
							ignoreNewlines `Action payloads must be undefined or plain JS
								objects. You provided: %s.`,
							action.payload
						)

						dispatch(action.type, action.payload)
					},
					error => {
						var errorEvent = handleError(error)

						if (errorEvent) {
							dispatch(errorEvent.type, errorEvent.payload)
						}
					}
				)
			}
		}

		reactor.registerStores(getStores(stores))

		return {
			mixin: reactor.ReactMixin,
			intents: mapIntents(intents),
			observe: reactor.observe.bind(reactor),
			evaluate: reactor.evaluate.bind(reactor)
		}
	}
}

function getStores(stores) {
	invariant(
		_.isPlainObject(stores),
		'The `stores` attribute must be a plain JS object. You provided: %s.',
		stores
	)

	return _.mapValues(stores, store => createStore(store))
}

function createStore(store) {
	invariant(
		_.isPlainObject(store),
		'Each store must be a plain JS object.'
	)

	invariant(
		_.isEqual(Object.keys(store), ['initialState', 'handlers']),
		ignoreNewlines `The 'stores' attribute requires exactly two attributes:
			'initialState' and 'handlers'. You provided: %s.`,
		Object.keys(store)
	)

	invariant(
		Immutable.Map.isMap(store.initialState),
		'Each store\'s `initialState` attribute must be an Immutable.js map.'
	)

	invariant(
		_.isPlainObject(store.handlers) &&
			_.every(store.handlers, handler => typeof handler === 'function'),
		ignoreNewlines `Each store\'s 'handlers' attribute must be a plain JS
			object mapping action type strings to functions.`
	)

	return new Store({
		getInitialState: () => store.initialState,
		initialize() {
			Object.keys(store.handlers).forEach(actionType => {
				this.on(actionType, store.handlers[actionType])
			})
		}
	})
}

const log = process.env.NODE_ENV === 'debug'
	? (...args) => console.log(...args)
	: () => {}

export default Fluxium
