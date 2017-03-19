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
			type: '__public__',
			dsDetail: {},
			dsItemPaths: {}
		});
	},

	showDataStore: function(showPath) {
		let setting=_config.setting;
		let path=showPath, type=this.state.type;
		if (! path) {
			if (path === undefined) {
				path=this.state.dsDetail.path || '';
			}
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

		let cachedPath=_.get(this.state.dsDetailCache, [type, path]);
		if (cachedPath) {
			this.state.dsDetail=cachedPath;
		}
		if (! this.state.showDataStore || cachedPath) {
			this.state.showDataStore=true;
			this.complete();
		}
		if (! cachedPath) {
			let typePath=type + ':' + path;
			axios.get(setting.host_url + '/browse/' + typePath, {
				headers: {'X-Requested-With': 'XMLHttpRequest'},
			})
			.then(function(res) {
				if (res.data.error) {
					return;
				}
				for (let dsDetail of res.data) {
					let filtered=dsDetail.list.filter(function(item) {
						return ! item.name.startsWith('.');
					});
					dsDetail.list=filtered;
					//if (! dsDetail.is_root) {
					//	dsDetail.list.unshift({name: '..', type: 'dir'});
					//}
					_.set(this.state.dsDetailCache, [type, dsDetail.path], dsDetail);
				}
				this.state.dsDetail=_.get(this.state.dsDetailCache, [type, path]);
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
		let setting=_config.setting;
		this.state.dsItemPaths[this.state.target]=item ? {type: this.state.type, path: this.state.dsDetail.path, name: item} : undefined;
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

	changeSource: function(source) {
		this.state.type=source;
		this.showDataStore('');
	},

	resetDsDetail: function() {
		this.resetState();
	}

});

module.exports = DsStore;
