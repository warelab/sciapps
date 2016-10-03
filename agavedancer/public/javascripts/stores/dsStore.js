'use strict';

import Reflux from 'reflux';
import axios from 'axios';
import _ from 'lodash';
import Q from 'q';
import DsActions from  '../actions/dsActions.js';

const DsStore=Reflux.createStore({
	listenables: DsActions,

	init: function() {
		this.state={
			setting: _config.setting,
			dsDetailCache: {}
		};
		this.resetState();
	},

	getInitialState: function() {
		return this.state;
	},

	complete: function() {
		this.trigger(this.state);
	},

	resetState: function() {
		_.assign(this.state, {
			showDataStore: false,
			target: undefined,
			dsDetail: {},
			dsItemPaths: {}
		});
	},

	showDataStore: function(path) {
		let setting=this.state.setting;
		if (! path) {
			path=this.state.dsDetail.path || '';
		} else {
			if (path.endsWith('/')) {
				path=path.slice(0,-1);
			}
			if ('..' === path) {
				path=this.state.dsDetail.path.replace(/(\/|^)[^\/]+$/, '');
			} else {
				if (this.state.dsDetail.path) {
					path=this.state.dsDetail.path + '/' + path;
				}
			}
		}
		//if (! path.startsWith('/')) {
		//	path='/' + path;
		//}

		this.state.dsDetail.path=path;
		let cachedPath=this.state.dsDetailCache[path];
		if (cachedPath) {
			this.state.dsDetail.list=cachedPath;
		}
		if (! this.state.showDataStore || cachedPath) {
			this.state.showDataStore=true;
			this.complete();
		}
		if (! cachedPath) {
			axios.get(setting.host_url + '/browse/' + path, {
				headers: {'X-Requested-With': 'XMLHttpRequest'},
			})
			.then(function(res) {
				for (let dsDetail of res.data) {
					let filtered=dsDetail.list.filter(function(item) {
						return ! item.name.startsWith('.');
					});
					dsDetail.list=filtered;
					if (! dsDetail.is_root) {
						dsDetail.list.unshift({name: '..', type: 'dir'});
					}
					this.state.dsDetailCache[dsDetail.path]=dsDetail.list;
				}
				this.state.dsDetail.list=this.state.dsDetailCache[path];
				this.complete();
			}.bind(this))
			.catch(function(res) {
				console.log(res);
			})
		}
	},

	hideDataStore: function() {
		if (this.state.showDataStore) {
			this.state.showDataStore=false;
			this.complete();
		}
	},

	setDataStoreItemTarget: function(target) {
		this.state.target=target;
		this.clearDataStoreItem(target);
	},

	selectDataStoreItem: function(item) {
		let path=this.state.dsDetail.path ? this.state.dsDetail.path + '/' : '';
		path=item ? path + item : undefined;
		this.state.dsItemPaths[this.state.target]=path;
		this.complete();
	},

	clearDataStoreItem: function(target) {
		if (target) {
			delete this.state.dsItemPaths[target];
		} else {
			this.state.dsItemPaths={};
		}
		this.complete();
	},

	resetDsDetail: function() {
		this.resetState();
	}

});

module.exports = DsStore;
