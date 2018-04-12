'use strict';

import Reflux from 'reflux';
import axios from 'axios';
import _ from 'lodash';
import Q from 'q';
import UserActions from  '../actions/userActions.js';
import AppsActions from  '../actions/appsActions.js';
import JobsActions from  '../actions/jobsActions.js';
import DsActions from  '../actions/dsActions.js';
import WorkflowActions from  '../actions/workflowActions.js';

axios.defaults.withCredentials = true;

const UserStore=Reflux.createStore({
	listenables: UserActions,

	init: function() {
		this._resetState();
	},
	
	getInitialState: function() {
		return this.state;
	},

	complete: function() {
		this.trigger(this.state);
	},

	resetState: function() {
		this._resetState();
		this.complete();
	},

	_resetState: function() {
		this.state={
			showLoginBox: false,
			username: '',
			firstName: '',
			lastName: '',
			email: '',
			logged_in: false,
			error: ''
		};
	},

	resetUser: function() {
		this._resetState();
		AppsActions.resetState('welcome');
		JobsActions.resetState();
		WorkflowActions.resetState();
		DsActions.resetState();
		AppsActions.debouncedListApps();
	},

	setUser: function(reset) {
		let setting=_config.setting;
		let logged_in=this.state.logged_in;
		//Q(axios.get(setting.host_url + '/user', {
		Q(axios.get('/user', {
			headers: {'X-Requested-With': 'XMLHttpRequest'},
		}))
		.then(function(res) {
			if (res.data.error) {
				this.resetUser();
				//if (res.data.error.startsWith('InvalidCredentials')) {
				//	this.logout();
				//}
				console.log(res.data.error);
			} else if (res.data.data.logged_in) {
				this._updateUser(res.data.data);
				WorkflowActions.listWorkflow();
				JobsActions.listJob();
			} else {
				if (reset) {
					this.resetUser();
				}
			}
			let mode=setting.appsListMode || [''];
			mode.forEach((value) => AppsActions.listApps('', value));
			this.complete();
		}.bind(this))
		.catch(function(error) {
			console.log(error);
		})
		.done();
	},

	login: function(formData) {
		this._login(formData);
		this.complete();
	},

	_login: function(formData) {
		this.state.error='';
		this.complete();
		let setting=_config.setting;
		if (formData === undefined) {
			formData=new FormData();
		}
		Q(axios.post('/login', formData, {
			headers: {'X-Requested-With': 'XMLHttpRequest'},
			transformRequest: function(data) { return data; }
		}))
		.then(function(res) {
			if (res.data.error) {
				let show=this.state.showLoginBox;
				this._resetState();
				this.state.showLoginBox=show;
				this.state.error=res.data.error;
				this.complete();
			} else if (res.data.logged_in) {
				this.setUser(res.data);
				this.hideLoginBox();
			}
		}.bind(this))
		.catch(function(error) {
				console.log(error);
		})
		.done();
	},

	_updateUser: function(data) {
		let setting=_config.setting;
		_.assign(this.state, data);
		setting.archive_path.replace('__user__', data.username);
		_.forEach(setting.datastore, function(v, k) {
			if (v.path) {
				let path=v.path.replace('__user__', data.username);
				v.path=path;
			}
		});
	},

	logout: function() {
		this.resetUser(true);
		this._logout();
		this.complete();
	},

	_logout: function() {
		Q(axios.get('/logout', {
			headers: {'X-Requested-With': 'XMLHttpRequest'},
		}))
		.then(function(res) {
		}.bind(this))
		.catch(function(error) {
			console.log(error);
		})
		.done();
	},

	showLoginBox: function() {
		this.state.showLoginBox=true;
		this.complete();
	},

	hideLoginBox: function() {
		this.state.showLoginBox=false;
		this.state.error='';
		this.complete();
	}

});

module.exports = UserStore;
