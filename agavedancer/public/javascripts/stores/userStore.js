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
			setting: _config.setting,
			showLoginBox: false,
			username: ''
		};
	},
	
	getInitialState: function() {
		return this.state;
	},

	complete: function() {
		this.trigger(this.state);
	},

	login: function(formData) {
		let setting=this.state.setting;
		Q(axios.post(setting.host_url + '/login', formData, {
			headers: {'X-Requested-With': 'XMLHttpRequest'},
			transformRequest: function(data) { return data; }
		}))
		.then(function(res) {
			if (res.data.username) {
				this.state.username=res.data.username;
				this.hideLoginBox();
			}
		}.bind(this));
	},

	logout: function() {
		this.state.username='';
		this.hideLoginBox();
	},

	showLoginBox: function() {
		this.state.showLoginBox=true;
		this.complete();
	},

	hideLoginBox: function() {
		this.state.showLoginBox=false;
		this.complete();
	}

});

module.exports = UserStore;
