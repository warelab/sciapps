'use strict';

import React from 'react';
import DsActions from '../actions/dsActions.js';
import {ListGroupItem, Button} from 'react-bootstrap';

const DsItem=React.createClass({
	handleDir: function(event) {
		DsActions.selectDataStoreItem(undefined);
		DsActions.showDataStore(event.target.textContent);
	},

	handleFile: function(event) {
		DsActions.selectDataStoreItem(event.target.textContent);
	},

	render: function() {
		let data=this.props.data;
		let markup, props;
		switch(data.type) {
			case 'dir':
				props={
					onClick: this.handleDir
				};
				break;
			case 'file':
				props={
					onClick: this.handleFile
				};
				break;
		}
		markup=<ListGroupItem {...props}>{data.type === 'dir' ? data.name + '/' : data.name}</ListGroupItem>
		return markup;
	}
});

module.exports = DsItem;
