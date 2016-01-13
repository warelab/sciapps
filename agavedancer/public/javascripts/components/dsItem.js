'use strict';

import React from 'react';
import AgaveWebActions from '../actions/agaveWebActions.js';
import {ListGroupItem, Button} from 'react-bootstrap';

const DSItem=React.createClass({
	handleDir: function() {
	},

	handleFile: function() {
	},

	render: function() {
		let data=this.props.data;
		let setting=this.props.settings;
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

module.exports = DSItem;
