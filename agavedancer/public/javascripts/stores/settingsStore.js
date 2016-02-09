'use strict';

import Reflux from 'reflux';
import axios from 'axios';
import _ from 'lodash';
import Q from 'q';
import SettingsActions from  '../actions/settingsActions.js';

const SettingsStore=Reflux.createStore({
	listenables: SettingsActions,

	init: function() {
		this.state={
			settings: undefined
		};
	},

	getInitialState: function() {
		return this.state;
	},

	complete: function() {
		this.trigger(this.state);
	},

	getSettings: function() {
		if (! this.state.settings) {
			axios.get('/settings', {
				headers: {'X-Requested-With': 'XMLHttpRequest'},
			})
			.then(function(res) {
				this.state.settings=res.data;
				this.complete();
			}.bind(this))
			.catch(function(res) {
				console.log(res);
			});
		}
	}
});

module.exports = SettingsStore;
