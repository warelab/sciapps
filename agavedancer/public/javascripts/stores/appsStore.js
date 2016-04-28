'use strict';

import Reflux from 'reflux';
import axios from 'axios';
import _ from 'lodash';
import Q from 'q';
import AppsActions from  '../actions/appsActions.js';
import JobsActions from  '../actions/jobsActions.js';

const AppsStore=Reflux.createStore({
	listenables: AppsActions,

	init: function() {
		this.state={
			filtered: false,
			searchString: '',
			apps: [],
			appDetail: {},
			pageId: '',
			appDetailCache: {},
			appsCache: [],
			wid: {}
		};
		let func=function() {
			this._listApps();
		}.bind(this);
		this._debouncedListApps=_.debounce(func, 200);
	},

	getInitialState: function() {
		return this.state;
	},

	complete: function() {
		this.trigger(this.state);
	},

	debouncedListApps: function(searchString) {
		this.state.searchString=searchString;
		this._debouncedListApps();
	},

	listApps: function(searchString) {
		this.state.searchString=searchString;
		this._listApps();
	},

	_listApps: function() {
		let apps=this.state.appsCache;
		let appPromise;
		if (apps.length) {
			appPromise=Q(apps);
		} else {
			appPromise=Q(axios.get('/assets/agaveAppsList.json'))
			.then(function(res) {
				this.state.appsCache=res.data;
				return res.data;
			}.bind(this));
		}
		appPromise.then(function(appsList) {
			this.state.apps=appsList;
			this.filterApps();
			this.complete();
		}.bind(this))
		.catch(function(error) {
			console.log(error);
		})
		.done();
	},

	filterApps: function() {
		let searchString=this.state.searchString;
		let matched;
		let apps=this.state.apps;
		if (searchString && searchString.length) {
			let regex=new RegExp(searchString, 'i');
			matched=apps.filter(function(app) {
				return regex.test(app.name);
			});
		}
		if (matched && matched.length) {
			this.state.apps=matched;
			this.state.filtered=true;
		} else {
			this.state.filtered=false;
		}
	},

	setWorkflowApps: function(appIds, wid) {
		Q.all(appIds.map(this.setApp)).done(function(apps) {
			if (wid !== undefined) {
				this.state.wid[wid]=true;
			}
			this.complete();
		}.bind(this));
	},

	resetWorkflowApps: function(wid) {
		delete this.state.wid[wid];
	},

	setApp: function(appId) {
		let appDetail=this.state.appDetailCache[appId];
		let appPromise;
		if (appDetail) {
			appPromise=Q(appDetail);
		} else {
			appPromise=Q(axios.get('/assets/' + appId + '.json'))
			.then(function(res) {
				this.state.appDetailCache[appId]=res.data;
				return res.data;
			}.bind(this));
		}
		return appPromise;
	},

	showAppByJob: function(jobsStore) {
		if (jobsStore.resubmit && jobsStore.jobDetail.appId) {
			this._showApp(jobsStore.jobDetail.appId);
		}
	},

	showApp: function(appId) {
		JobsActions.resetResubmit();
		this._showApp(appId);
	},

	_showApp: function(appId) {
		let appPromise=this.setApp(appId);
		appPromise.then(function(appDetail) {
			this.state.appDetail=appDetail;
			this.complete();
		}.bind(this))
		.catch(function(error) {
			console.log(error);
		})
		.done();
	},

	hideApp: function() {
		this.state.appDetail={};
		this.complete();
	},

	showPage: function(pageId) {
		this.state.pageId=pageId;
		this.hideApp();
	}
});

module.exports = AppsStore;
