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
			showDataStore: false,
			target: undefined,
			dsDetail: {},
			dsItemPaths: {}
		};
		this.dsDetailCache={};
	},

	getInitialState: function() {
		return this.state;
	},

	complete: function() {
		this.trigger(this.state);
	},

	showDataStore: function(path) {
		if (! path) {
			path=this.state.dsDetail.root ? this.state.dsDetail.root : '';
		} else if ('../' === path) {
			path=this.state.dsDetail.path.replace(/[^\/]+\/$/, '');
		} else {
			path=this.state.dsDetail.path + path;
		}

		let cachedPath=_.get(this.dsDetailCache, path);
		if (cachedPath) {
			this.state.dsDetail.path=path;
			this.state.dsDetail.list=cachedPath;
		}
		if (! this.state.showDataStore || cachedPath) {
			this.state.showDataStore=true;
			this.complete();
		}
		if (! cachedPath) {
			if (path.endsWith('/')) {
				path=path.slice(0,-1);
			}
			axios.get('/browse/' + path, {
				headers: {'X-Requested-With': 'XMLHttpRequest'},
			})
			.then(function(res) {
				let dsDetail=res.data;
				if (dsDetail.list[0].name === '.') {
					dsDetail.list.shift();
				}
				if (dsDetail.root !== dsDetail.path) {
					dsDetail.list.unshift({name: '..', type: 'dir'});
				}
				this.state.dsDetail=dsDetail;
				_.set(this.dsDetailCache, dsDetail.path, dsDetail.list);
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
		let path=item ? this.state.dsDetail.path + item : undefined;
		_.set(this.state.dsItemPaths, this.state.target, path);
		this.complete();
	},

	clearDataStoreItem: function(target) {
		if (target) {
			delete this.state.dsItemPaths[target];
		} else {
			this.state.dsItemPaths={};
		}
		this.complete();
	}

});

module.exports = DsStore;
