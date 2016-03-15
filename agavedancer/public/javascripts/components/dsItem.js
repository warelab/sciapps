'use strict';

import React from 'react';
import DsActions from '../actions/dsActions.js';
import {ListGroupItem, Button} from 'react-bootstrap';

const DsItem=React.createClass({
	getInitialState: function() {
		return { clickTimer: undefined };
	},

	handleDblClick: function(content) {
		switch(this.props.data.type) {
			case 'dir':
				DsActions.selectDataStoreItem();
				DsActions.showDataStore(content);
				break;
			case 'file':
				DsActions.selectDataStoreItem(content);
				break;
		}
	},

	handleClick: function(content) {
		switch(this.props.data.type) {
			case 'dir':
				DsActions.selectDataStoreItem(content.slice(0,-1));
				break;
			case 'file':
				DsActions.selectDataStoreItem(content);
				break;
		}
	},

	handleSelect: function(event) {
		let content=event.target.textContent;
		if (this.state.clickTimer) {
			clearTimeout(this.state.clickTimer);
			this.state.clickTimer=undefined;
			this.handleDblClick(content);
		} else {
			this.state.clickTimer=setTimeout(() => {
				this.state.clickTimer=undefined;
				this.handleClick(content);
			}, 250);
		}
	},

	render: function() {
		let data=this.props.data;
		let markup=<ListGroupItem onClick={this.handleSelect}>{data.type === 'dir' ? data.name + '/' : data.name}</ListGroupItem>
		return markup;
	}
});

module.exports = DsItem;
