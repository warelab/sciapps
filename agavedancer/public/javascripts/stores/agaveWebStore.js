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
			//	_submitCount: 0,
				_showJobModal: false, 
				_showDataStoreModal: false,
				_activeInput: ''
			},
			apps: [],
			appDetail: {},
			jobs: [],
			jobDetail: {},
			dsDetail: {},
			dsDetailCache: {},
			dsItems: {}
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
				console.log(res);
		});
	},

	listAgaveWebApps: function() {
		axios.get('/assets/agaveAppsList.json')
		.then(function(res) {
			this.state.apps=res.data;
			this.trigger(this.state);
		}.bind(this))
		.catch(function(res) {
				console.log(res);
		});
	},

	showAgaveWebApps: function(appId) {
		this.state.dsItems={};
		this.state.settings._activeInput='';

		//axios.get('/app/' + appId, {
		//	headers: {'X-Requested-With': 'XMLHttpRequest'},
		//})
		axios.get('/assets/' + appId + '.json')
		.then(function(res) {
			this.state.appDetail=res.data;
			this.trigger(this.state);
		}.bind(this))
		.catch(function(res) {
				console.log(res);
		})
	},

	submitAgaveWebApps: function(formData) {
		let submitNumber=this.state.jobs.length;
		this.state.jobs[submitNumber]={appId: this.state.appDetail.id};
		this.trigger(this.state);
		axios.post('/job/new/' + this.state.appDetail.id , formData, {
			headers: {'X-Requested-With': 'XMLHttpRequest'},
			transformRequest: function(data) { return data; }
		})
		.then(function(res) {
			//this.state.jobs.push(res.data);
			this.state.jobs[submitNumber]=res.data;
			this.trigger(this.state);
		}.bind(this))
		.catch(function(res) {
				console.log(res);
		})
	},

	showAgaveWebJobs: function(jobId) {
		this.state.settings._showJobModal=true;
		this.trigger(this.state);
		axios.get('/job/' + jobId, {
			headers: {'X-Requested-With': 'XMLHttpRequest'},
		})
		.then(function(res) {
			this.state.jobDetail=res.data;
			this.trigger(this.state);
		}.bind(this))
		.catch(function(res) {
				console.log(res);
		})
	},

	hideAgaveWebJobs: function() {
		this.state.settings._showJobModal=false;
		this.trigger(this.state);
	},

	showAgaveWebDataStore: function(path) {
		let cached=false;
		if (this.state.dsDetail.root && ! path) {
			path=this.state.dsDetail.root;
		}
		console.log(path);
		if ('../' === path) {
			path=this.state.dsDetail.path.replace(/[^\/]+\/$/, '');
		}
		let cachedPath=_.get(this.state.dsDetailCache, path);
		if (cachedPath) {
			this.state.dsDetail.path=path;
			this.state.dsDetail.list=cachedPath;
			cached=true;
		}
		this.state.settings._showDataStoreModal=true;
		this.trigger(this.state);
		if (! cached) {
			let oldPath=this.state.dsDetail.path;
			if (path && oldPath) {
				path=this.state.dsDetail.path + path;
			} else {
				path='';
			}
			if (path.endsWith('/')) {
				path=path.slice(0,-1);
			}
			axios.get('/browse/' + path, {
				headers: {'X-Requested-With': 'XMLHttpRequest'},
			})
			.then(function(res) {
				let dsDetail=res.data;
				if (dsDetail.list[0].name === '.') {
					dsDetail.list.shift();
				}
				if (dsDetail.root !== dsDetail.path) {
					dsDetail.list.unshift({name: '..', type: 'dir'});
				}
				this.state.dsDetail=dsDetail;
				_.set(this.state.dsDetailCache, dsDetail.path, dsDetail.list);
				this.trigger(this.state);
			}.bind(this))
			.catch(function(res) {
				console.log(res);
			})
		}
	},

	setAgaveWebDataStoreItemTarget: function(target) {
		this.state.settings._activeInput=target;
	},

	hideAgaveWebDataStore: function() {
		this.state.settings._showDataStoreModal=false;
		this.trigger(this.state);
	},

	selectAgaveWebDataStoreItem: function(item) {
		_.set(this.state.dsItems, this.state.settings._activeInput, this.state.settings.iplant_datastore + this.state.dsDetail.path + item);
		this.trigger(this.state);
	}
});

module.exports = AgaveWebStore;
