Fluxium
=======

Summary
-------

A small wrapper around Nuclear JS, Fluxium allows you to write your actions and stores as plain JS objects. The action creators of Flux, which traditionally dispatch actions via a central dispatch method, are replaced with intents which return observable streams of actions which Fluxium takes care of dispatching.

Example
-------

Here is a deliberately simplistic example, showing how to use Fluxium.

```js
var fluxium = require('fluxium');
var React = require('react');
var Immutable = fluxium.Immutable;
var Observable = fluxium.Rx.Observable;

var flux = fluxium.create({
	intents: {
		showAlert: function(message) {
			return Observable.just({
				type: 'SHOW_ALERT',
				payload: { message: message }
			})
		},
		dismissAlert: function () {
			return Observable.just({
				type: 'DISMISS_ALERT'
			})
		}
	},
	stores: {
		alert: {
			initialState: Immutable.Map({
				message: undefined
			}),
			handlers: {
				SHOW_ALERT: function (state, payload) {
					return state.set('message', payload.message)
				},
				DISMISS_ALERT: function (state) {
					return state.set('message', undefined)
				}
			}
		}
	},
	handleError: function (error) {
		console.error(JSON.stringify(error))
	}
});

var getters = {
	message: ['alert', 'message']
};

var Alert = React.createClass({
	mixins: [flux.mixin],
	getDataBindings: function () {
		message: getters.message
	},
	render: function () {
		var message = this.state.message

		if (message) {
			<div>
				<p>{this.state.message}</p>
				<button onClick={dismissAlert}>x</button>
			</div>
		}
		else {
			<div>No message</div>
		}
	},
	dismissAlert: function () {
		flux.intents.dismissAlert()
	}
})
```
