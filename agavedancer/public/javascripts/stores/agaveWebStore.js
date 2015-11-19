'use strict';

import Reflux from 'reflux';
import axios from 'axios';
import AgaveWebActions from  '../actions/agaveWebActions.js';

var AgaveWebStore = Reflux.createStore({
	listenables: AgaveWebActions,

	init: function() {
		this.state={
			apps: [],
			appDetail: {},
			jobs: []
		};
	},
	
	getInitialState: function() {
		return this.state;
	},

	listAgaveWebApps: function() {
		axios.get('/assets/agaveAppsList.json')
		.then(function(res) {
			this.state.apps=res.data;
			this.trigger(this.state);
		}.bind(this))
		.catch(function(res) {
		});
	},

	showAgaveWebApps: function(appId) {
		axios.get('/app/' + appId, {
			headers: {'X-Requested-With': 'XMLHttpRequest'},
		})
		.then(function(res) {
			this.state.appDetail=res.data;
			this.trigger(this.state);
		}.bind(this))
		.catch(function(res) {
		})
	}
});

module.exports = AgaveWebStore;
