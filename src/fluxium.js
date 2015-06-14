import invariant from 'invariant'
import _ from 'lodash'
import { Reactor, Store, Immutable } from 'nuclear-js'
import { Observable } from 'rx'

const Fluxium = {
	Immutable,
	create({ actionCreators, stores, handleActionError }) {
		invariant(
			handleActionError === undefined || typeof handleActionError === 'function',
			'The `handleActionError` attribute must be either undefined or a ' +
				'function. You provided: %s.',
			handleActionError
		)

		invariant(
			_.isPlainObject(actionCreators),
			'The `actionCreators` attribute must be a plain JS object. You ' +
				'provided: %s.',
			actionCreators
		)

		const reactor = new Reactor()

		function mapActionCreators(actionCreatorGroup) {
			return _.mapValues(actionCreatorGroup, (value, key) => {
				invariant(
					typeof value === 'function' || _.isPlainObject(value),
					'Children of the `actionCreators` attribute must be either a ' +
						'function or a plain JS object. You provided a child at %s with a ' +
						'type of %s',
					value,
					typeof value
				)

				if (typeof value === 'function') {
					return wrapActionCreator(value, key)
				}
				else if (_.isPlainObject(value)) {
					return mapActionCreators(value)
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

		function wrapActionCreator(actionCreator, name) {
			return function getAndDispatchActions(payload) {
				log(...[`Action creator called: ${name}.`]
					.concat(payload ? ['Payload:', payload] : []))

				var result = actionCreator(payload)

				if (typeof _.get(result, 'subscribe') !== 'function') {
					result = typeof _.get(result, 'then') === 'function'
						? Observable.fromPromise(result)
						: Observable.just(result)
				}

				result.subscribe(
					action => {
						invariant(
							_.every(Object.keys(action), key =>
								_.includes(['type', 'payload'], key)),
							'The only valid attributes on an action are `type` and ' +
								'`payload`. You provided: %s.',
							JSON.stringify(Object.keys(action))
						)

						invariant(
							typeof action.type === 'string' && action.type.length,
							'Action types must be non-empty strings. You provided: %s.',
							action.type
						)

						invariant(
							action.payload === undefined || _.isPlainObject(action.payload),
							'Action payloads must be undefined or plain JS objects. ' +
								'You provided: %s.',
							action.payload
						)

						dispatch(action.type, action.payload)
					},
					error => {
						var errorEvent = handleActionError(error)

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
			actions: mapActionCreators(actionCreators)
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
		'The `stores` attribute requires exactly two attributes: initialState ' +
			'and handlers. You provided: %s.',
		Object.keys(store)
	)

	invariant(
		Immutable.Map.isMap(store.initialState),
		'Each store\'s `initialState` attribute must be an Immutable.js map.'
	)

	invariant(
		_.isPlainObject(store.handlers) &&
			_.every(store.handlers, handler => typeof handler === 'function'),
		'Each store\'s `handlers` attribute must be a plain JS object mapping ' +
			'action type strings to functions.'
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
