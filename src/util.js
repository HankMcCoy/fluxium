import Rx from 'rx'
import _ from 'lodash'

export default function makeObservable(value) {		
	if (typeof _.get(value, 'subscribe') !== 'function') {		
		value = typeof _.get(value, 'then') === 'function' ? Rx.Observable.fromPromise(value) : Rx.Observable.just(value);		
	}

	return value;		
}
