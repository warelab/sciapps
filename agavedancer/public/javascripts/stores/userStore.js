'use strict';

import Reflux from 'reflux';
import UserActions from  '../actions/userActions.js';

const UserStore=Reflux.createStore({
	listenables: UserActions,

	init: function() {
		this.state={
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

	login: function(u, p) {
		this.state.username=u;
		this.hideLoginBox();
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
