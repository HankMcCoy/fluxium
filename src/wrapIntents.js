import ignoreNewlines from 'ignore-newlines'
import invariant from 'invariant'
import mapValues from 'lodash/object/mapValues'
import isPlainObject from 'lodash/lang/isPlainObject'
import every from 'lodash/collection/every'
import includes from 'lodash/collection/includes'
import log from './log'

export default function wrapIntents({ intents, reactor, handleError }) {
	return mapValues(intents, (value, key) => {
		invariant(
			typeof value === 'function' || isPlainObject(value),
			ignoreNewlines `Children of the 'intents' attribute must be either a
				function or a plain JS object. You provided a child at %s with a
				type of %s`,
			value,
			typeof value
		)

		if (typeof value === 'function') {
			return wrapIntent({ reactor, handleError, intent: value, name: key })
		}
		else if (isPlainObject(value)) {
			return wrapIntents({ reactor, handleError, intents: value })
		}
	})
}

function wrapIntent({ intent, name, reactor, handleError }) {
	const evaluate = reactor.evaluate.bind(reactor)

	return function getAndDispatchActions(payload) {
		log(...[`Intent called: ${name}.`]
			.concat(payload ? ['Payload:', payload] : []))

		var result = intent(payload, evaluate)

		invariant(
			typeof result.subscribe === 'function',
			'Intents must return Rx.Observables of actions. You returned: $s',
			result
		)

		result
			.filter(action => !!action)
			.subscribeOn(Rx.Scheduler.timeout)
			.subscribe(
				action => {
					const actionKeys = Object.keys(action)
					const { type, payload } = action

					invariant(
						every(actionKeys, key => includes(['type', 'payload'], key)),
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
						action.payload === undefined || isPlainObject(action.payload),
						ignoreNewlines `Action payloads must be undefined or plain JS
							objects. You provided: %s.`,
						action.payload
					)

					dispatch({ reactor, type, payload })
				},
				error => {
					const errorEvent = handleError(error)

					if (errorEvent) {
						const { type, payload } = errorEvent

						dispatch({ reactor, type, payload })
					}
				}
			)
	}
}

function dispatch({ reactor, type, payload }) {
	invariant(
		typeof type === 'string' && type.length,
		'Action types dispatched must be non-empty strings. You provided: %s',
		type
	)

	invariant(
		payload === undefined || isPlainObject(payload),
		'Action payloads must be plain JS objects. You provided: %s',
		payload
	)

	log(...[`Dispatching ${type}.`]
		.concat(payload ? ['Payload:', payload] : []))

	reactor.dispatch(type, payload)
}


