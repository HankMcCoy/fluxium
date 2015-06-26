import ignoreNewlines from 'ignore-newlines'
import invariant from 'invariant'
import isPlainObject from 'lodash/lang/isPlainObject'
import mapValues from 'lodash/object/mapValues'
import every from 'lodash/collection/every'
import isEqual from 'lodash/lang/isEqual'
import { Store, Immutable } from 'nuclear-js'

export default function wrapStores(stores) {
	invariant(
		isPlainObject(stores),
		'The `stores` attribute must be a plain JS object. You provided: %s.',
		stores
	)

	return mapValues(stores, store => wrapStore(store))
}

function wrapStore(store) {
	invariant(
		isPlainObject(store),
		'Each store must be a plain JS object.'
	)

	invariant(
		isEqual(Object.keys(store), ['initialState', 'handlers']),
		ignoreNewlines `The 'stores' attribute requires exactly two attributes:
			'initialState' and 'handlers'. You provided: %s.`,
		Object.keys(store)
	)

	invariant(
		Immutable.Map.isMap(store.initialState),
		'Each store\'s `initialState` attribute must be an Immutable.js map.'
	)

	invariant(
		isPlainObject(store.handlers) &&
			every(store.handlers, handler => typeof handler === 'function'),
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

