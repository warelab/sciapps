'use strict';

import Reflux from 'reflux';
import axios from 'axios';
import _ from 'lodash';
import Q from 'q';
import AppsActions from  '../actions/appsActions.js';

const AppsStore=Reflux.createStore({
	listenables: AppsActions,

	init: function() {
		this.state={
			apps: [],
			appDetail: {}
		};
		this.appDetailCache={};
	},

	getInitialState: function() {
		return this.state;
	},

	complete: function() {
		this.trigger(this.state);
	},

	listApps: function() {
		if (this.state.apps.length) {
			this.complete();
		} else {
			axios.get('/assets/agaveAppsList.json')
			.then(function(res) {
				this.state.apps=res.data;
				this.complete();
			}.bind(this))
			.catch(function(res) {
					console.log(res);
			});
		}
	},

	showApp: function(appId) {
		if (_.has(this.appDetailCache, appId)) {
			this.state.appDetail=_.get(this.appDetailCache, appId);
			this.complete();
		} else {
			axios.get('/assets/' + appId + '.json')
			.then(function(res) {
				_.set(this.appDetailCache, appId, res.data);
				this.state.appDetail=res.data;
				this.complete();
			}.bind(this))
			.catch(function(res) {
				console.log(res);
			})
		}
	}
});

module.exports = AppsStore;
