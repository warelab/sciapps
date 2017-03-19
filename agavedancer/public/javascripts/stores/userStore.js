'use strict';

import Reflux from 'reflux';
import axios from 'axios';
import _ from 'lodash';
import Q from 'q';
import UserActions from  '../actions/userActions.js';

const UserStore=Reflux.createStore({
	listenables: UserActions,

	init: function() {
		this.state={
			showLoginBox: false,
			username: '',
			logged_in: false,
			token_expiration_at: undefined,
			error: ''
		};
	},
	
	getInitialState: function() {
		return this.state;
	},

	complete: function() {
		this.trigger(this.state);
	},

	checkLogin: function() {
		let result=this.state.logged_in && this.state.token_expiration_at > (Date.now() + 60e3);
		if (! result) {
			this._reset();
			this.complete();
		}
		return result;
	},

	_reset: function() {
		this.state.username='';
		this.state.logged_in=false;
		this.state.token_expiration_at=undefined;
	},

	login: function(formData) {
		this.state.error='';
		this.complete();
		let setting=_config.setting;
		if (formData === undefined) {
			formData=new FormData();
		}
		Q(axios.post(setting.host_url + '/login', formData, {
			headers: {'X-Requested-With': 'XMLHttpRequest'},
			transformRequest: function(data) { return data; }
		}))
		.then(function(res) {
			if (res.data.error) {
				this.state.error=res.data.error;
				this.complete();
			} else if (res.data.logged_in) {
				this._updateUser(res.data);
				this.hideLoginBox();
			}
		}.bind(this))
		.done();
	},

	_updateUser: function(data) {
		let setting=_config.setting;
		this.state.error='';
		this.state.username=data.username;
		this.state.logged_in=data.logged_in;
		this.state.token_expiration_at=data.token_expiration_at;
		let path=setting.datastore['__user__'].path.replace('__user__', data.username);
		setting.datastore['__user__'].path=path;
	},

	logout: function() {
		let setting=_config.setting;
		this._reset();
		Q(axios.get(setting.host_url + '/logout', {
			headers: {'X-Requested-With': 'XMLHttpRequest'},
		})).done();
		this.hideLoginBox();
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
