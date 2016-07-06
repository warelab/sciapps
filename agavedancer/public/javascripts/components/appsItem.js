'use strict';

import React from 'react';
import AppsActions from '../actions/appsActions.js';
import DsActions from '../actions/dsActions.js';
import {ListGroupItem} from 'react-bootstrap';

const AppsItem=React.createClass({

	showApp: function() {
		AppsActions.hideApp();
		DsActions.clearDataStoreItem();
		AppsActions.showApp(this.props.data.id);
		let title=this.props.data.id;
		let urlbase="?app_id=";
		let url=urlbase.concat(title);
		if (typeof (history.pushState) !== "undefined") {
			let obj = { Title: title, Url: url };
	    history.pushState(obj, obj.Title, obj.Url);
		} else {
			alert("Browser does not support HTML5.");
		}
	},

	render: function() {
		return (
			<ListGroupItem onClick={this.showApp}>
				{this.props.data.name}
			</ListGroupItem>
		);
	}
});

module.exports= AppsItem;
