import _ from 'lodash'
import { Observable } from 'rx'

const util = {
	makeObservable(value) {
		if (typeof _.get(value, 'subscribe') !== 'function') {
			value = typeof _.get(value, 'then') === 'function'
				? Observable.fromPromise(value)
				: Observable.just(value)
		}

		return value
	},
	toArray(value, callback) {
		util.makeObservable(value)
			.toArray()
			.subscribe(callback)
	}
}

export default util
