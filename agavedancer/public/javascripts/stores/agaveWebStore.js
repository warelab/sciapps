'use strict';

import Reflux from 'reflux';
import axios from 'axios';
import _ from 'lodash';
import AgaveWebActions from  '../actions/agaveWebActions.js';

var AgaveWebStore = Reflux.createStore({
	listenables: AgaveWebActions,

	init: function() {
		this.state={
			settings: {
				_submitCount: 0,
				_showJobModal: false, 
				_showDataStoreModal: false
			},
			apps: [],
			appDetail: {},
			jobs: [],
			jobDetail: {},
			dsDetail: [],
			dsItem: null
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
			this.state.settings=_.assign(this.state.settings, res.data);
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
		//axios.get('/app/' + appId, {
		//	headers: {'X-Requested-With': 'XMLHttpRequest'},
		//})
		axios.get('/assets/' + appId + '.json')
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
			console.log(res.data);
			res.data.submitNumber=this.state.settings._submitCount++;
			this.state.jobs.push(res.data);
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
			this.state.jobDetail=res.data;
			this.state.settings._showJobModal=true;
			this.trigger(this.state);
		}.bind(this))
		.catch(function(res) {
		})
	},

	hideAgaveWebJobs: function() {
		this.state.settings._showJobModal=false;
		this.trigger(this.state);
	},

	showAgaveWebDataStore: function(path) {
		path=path || '';
		axios.get('/browse/' + path, {
			headers: {'X-Requested-With': 'XMLHttpRequest'},
		})
		.then(function(res) {
			console.log(res.data);
			this.state.dsDetail=res.data;
			this.state.dsItem=null;
			this.state.settings._showDataStoreModal=true;
			this.trigger(this.state);
		}.bind(this))
		.catch(function(res) {
		})
	},

	hideAgaveWebDataStore: function() {
		this.state.settings._showDataStoreModal=false;
		this.trigger(this.state);
	}
});

module.exports = AgaveWebStore;
