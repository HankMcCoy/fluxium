import invariant from 'invariant'
import isPlainObject from 'lodash/lang/isPlainObject'
import { Reactor, Immutable } from 'nuclear-js'
import ignoreNewlines from 'ignore-newlines'
import wrapIntents from './wrapIntents'
import wrapStores from './wrapStores'
import evaluate from './evaluate'

const Fluxium = {
	Immutable,
	evaluate,
	create({ intents, stores, handleError }) {
		invariant(
			handleError === undefined || typeof handleError === 'function',
			ignoreNewlines `The 'handleError' attribute must be either undefined or a
				function. You provided: %s.`,
			handleError
		)

		invariant(
			isPlainObject(intents),
			ignoreNewlines `The 'intents' attribute must be a plain JS object. You
				provided: %s.`,
			intents
		)

		const reactor = new Reactor()

		reactor.registerStores(wrapStores(stores))

		return {
			mixin: reactor.ReactMixin,
			intents: wrapIntents({ intents, reactor, handleError }),
			observe: reactor.observe.bind(reactor),
			evaluate: reactor.evaluate.bind(reactor),
			getDebugState: () => reactor.state.toJS()
		}
	},
}

export default Fluxium
