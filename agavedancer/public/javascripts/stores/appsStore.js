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
			filtered: false,
			searchString: '',
			apps: [],
			appDetail: {}
		};
		this.appsCache=[];
		this.appDetailCache={};
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
		if (this.appsCache.length) {
			this.state.apps=this.appsCache;
			this.filterApps();
			this.complete();
		} else {
			axios.get('/assets/agaveAppsList.json')
			.then(function(res) {
				this.appsCache=res.data;
				this.state.apps=this.appsCache;
				this.filterApps();
				this.complete();
			}.bind(this))
			.catch(function(res) {
					console.log(res);
			});
		}
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
	},

	hideApp: function() {
		this.state.appDetail={};
		this.complete();
	}

});

module.exports = AppsStore;
