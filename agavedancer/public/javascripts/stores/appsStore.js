'use strict';

import Reflux from 'reflux';
import axios from 'axios';
import _ from 'lodash';
import Q from 'q';
import AppsActions from  '../actions/appsActions.js';
import JobsActions from  '../actions/jobsActions.js';
import DsActions from  '../actions/dsActions.js';

axios.defaults.withCredentials = true;

const AppsStore=Reflux.createStore({
	listenables: AppsActions,

	init: function() {
		this._resetState();
		this.debouncedListApps=_.debounce((searhString) => { this.listApps(searhString) }, 200);
	},

	getInitialState: function() {
		return this.state;
	},

	complete: function() {
		this.trigger(this.state);
	},

	resetState: function(pageId) {
		this._resetState(pageId);
		this.complete();
	},

	_resetState: function(pageId) {
		this.state={
			filtered: false,
			searchString: '',
			apps: [],
			appDetail: {},
			pageId: pageId || '',
			appDetailCache: {},
			appsCache: [],
			wid: {}
		};
	},

	listApps: function(searchString) {
		this.state.searchString=searchString;
		this._listApps();
	},

	_listApps: function() {
		let apps=this.state.appsCache;
		let setting=_config.setting;
		let appPromise;
		if (apps.length) {
			appPromise=Q(apps);
		} else {
			//appPromise=Q(axios.get(setting.host_url + '/apps', {
			appPromise=Q(axios.get('/apps', {
				headers: {'X-Requested-With': 'XMLHttpRequest'},
			}))
			.then(function(res) {
				if (res.data.error) {
					return;
				}
				this.state.appsCache=res.data;
				return res.data;
			}.bind(this));
		}
		appPromise.then(function(appsList) {
			if (appsList) {
				this.state.apps=appsList;
				this.filterApps();
				this.complete();
			}
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
		let funcs=appIds.map(function(appId) {
			return function() {
				return this.setApp(appId).then(function(app) {
					return app;
				}.bind(this));
			}.bind(this);
		}.bind(this));

		funcs.reduce(Q.when, Q(1)).then(function() {
			if (wid !== undefined) {
				this.state.wid[wid]=true;
				this.complete();
			}
		}.bind(this));
	},

	resetWorkflowApps: function(wid) {
		delete this.state.wid[wid];
	},

	setApp: function(appId) {
		let appDetail=this.state.appDetailCache[appId];
		let setting= _config.setting;
		let appPromise;
		if (appDetail) {
			appPromise=Q(appDetail);
		} else {
			//appPromise=Q(axios.get(setting.host_url + '/apps/' + appId, {
			appPromise=Q(axios.get('/apps/' + appId, {
				headers: {'X-Requested-With': 'XMLHttpRequest'}
			}))
			.then(function(res) {
				if (res.data.error) {
					return;
				}
				this.state.appDetailCache[appId]=res.data;
				return res.data;
			}.bind(this))
			.catch(function(error) {
				console.log(error);
			});
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
			this.state.appDetailCache[appId]=appDetail;
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
