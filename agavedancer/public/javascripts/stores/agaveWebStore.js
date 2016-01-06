'use strict';

import Reflux from 'reflux';
import axios from 'axios';
import _ from 'lodash';
import AgaveWebActions from  '../actions/agaveWebActions.js';

var AgaveWebStore = Reflux.createStore({
	listenables: AgaveWebActions,

	init: function() {
		this.state={
			settings: {},
			apps: [],
			appDetail: {},
			jobs: [],
			jobDetail: {_showModal: false}
		};
	},
	
	getInitialState: function() {
		return this.state;
	},

	setupAgaveWebApps: function() {
		axios.get('/settings', {
			headers: {'X-Requested-With': 'XMLHttpRequest'},
		})
		.then(function(res) {
			this.state.settings=res.data;
			this.trigger(this.state);
		}.bind(this))
		.catch(function(res) {
		});
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
	},

	submitAgaveWebApps: function(formData) {
		axios.post('/job/new/' + this.state.appDetail.id , formData, {
			headers: {'X-Requested-With': 'XMLHttpRequest'},
			transformRequest: function(data) { return data; }
		})
		.then(function(res) {
			this.state.jobs.push(res.data);
			//console.log(this.state.jobs);
			this.trigger(this.state);
		}.bind(this))
		.catch(function(res) {
		})
	},

	showAgaveWebJobs: function(jobId) {
		axios.get('/job/' + jobId, {
			headers: {'X-Requested-With': 'XMLHttpRequest'},
		})
		.then(function(res) {
			this.state.jobDetail=_.assign(res.data, {_showModal: true});
			//console.log(this.state.jobDetail);
			this.trigger(this.state);
		}.bind(this))
		.catch(function(res) {
		})
	},

	hideAgaveWebJobs: function() {
		this.state.jobDetail._showModal=false;
		this.trigger(this.state);
	}
});

module.exports = AgaveWebStore;
