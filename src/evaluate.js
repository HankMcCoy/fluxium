import _ from 'lodash'

export default function evaluate({ getter, data }) {
	if (_.every(getter, val => typeof val === 'string')) {
		return data.getIn(getter)
	}
	else {
		const getters = _.takeWhile(getter, val => _.isArray(val))
		const coalescer = _.dropWhile(getter, val => _.isArray(val))[0]
		const values = getters.map(g => evaluate({
			data,
			getter: g,
		}))

		return coalescer.apply(null, values)
	}
}
