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
			reload: '',
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
		let promise=this._listApps();
		promise.then(function() {
			this.complete();
		}.bind(this));
	},

	_listApps: function() {
		let setting=_config.setting;
		let appPromise;
		appPromise=Q(axios.get('/apps', {
			headers: {'X-Requested-With': 'XMLHttpRequest'},
		}))
		.then(function(res) {
			if (res.data.error) {
				console.log(res.data.error);
				return;
			} else {
				let data=res.data.data || res.data;
				this.state.appsCache=data;
				return data;
			}
		}.bind(this));
		return appPromise.then(function(appsList) {
			if (appsList) {
				this.state.apps=appsList;
				this.filterApps();
				return appsList;
			}
		}.bind(this))
		.catch(function(error) {
			console.log(error);
		});
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
		let promise=this.setApps(appIds);
		promise.then(function() {
			if (wid !== undefined) {
				this.state.wid[wid]=true;
				this.complete();
			}
		}.bind(this));
	},

	setApps: function(appIds) {
		let funcs=appIds.map(function(appId) {
			return function() {
				return this._setApp(appId).then(function(app) {
					return app;
				}.bind(this));
			}.bind(this);
		}.bind(this));

		let promise=funcs.reduce(Q.when, Q(1)).then(function() {
			this.complete();
		}.bind(this));
		return promise;
	},

	resetWorkflowApps: function(wid) {
		delete this.state.wid[wid];
	},

	setApp: function(appId) {
		let appPromise=this._setApp(appId)
		.then(function(app) {
			this.complete();
		}.bind(this));
		return appPromise;
	},

	_setApp: function(appId) {
		let appDetail=this.state.appDetailCache[appId];
		let setting= _config.setting;
		let appPromise;
		if (appDetail) {
			appPromise=Q(appDetail);
		} else {
			appPromise=Q(axios.get('/apps/' + appId, {
				headers: {'X-Requested-With': 'XMLHttpRequest'}
			}))
			.then(function(res) {
				if (res.data.error) {
					console.log(res.data.error);
					return;
				} else {
					let data=res.data.data || res.data;
					this.state.appDetailCache[appId]=data;
					return data;
				}
			}.bind(this))
			.catch(function(error) {
				console.log(error);
			});
		}
		return appPromise;
	},

	showAppByJob: function(jobDetail) {
		if (jobDetail.appId) {
			this._setReload('resubmit');
			this._showApp(jobDetail.appId, jobDetail);
		}
	},

	showApp: function(appId, mode) {
		this._setReload(mode);
		this._showApp(appId);
	},

	_showApp: function(appId, jobDetail) {
		let appPromise=this._setApp(appId);
		appPromise.then(function(appDetail) {
			if (jobDetail) {
				appDetail._jobDetail=jobDetail;
			}
			this.state.pageId='appsDeail';
			this.state.appDetail=appDetail;
			this.complete();
		}.bind(this))
		.catch(function(error) {
			console.log(error);
		})
		.done();
	},

	hideApp: function() {
		this._hideApp();
		this.complete();
	},

	_hideApp: function() {
		if (this.state.appDetail.id) {
			this.state.appDetail={};
		}
	},

	setReload: function(value) {
		if (value !== this.state.reload) {
			this._setReload(value);
			this.complete();
		}
	},

	_setReload: function(value) {
		this.state.reload=value;
	},

	showPage: function(pageId) {
		if (pageId !== this.state.pageId) {
			this.state.pageId=pageId;
			this._hideApp();
			this.complete();
		}
	}
});

module.exports = AppsStore;
