const log = process.env.NODE_ENV === 'debug'
	? (...args) => console.log(...args)
	: () => {}

export default log
