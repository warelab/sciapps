'use strict';

import React from 'react';
import AppsActions from '../actions/appsActions.js';
import DsActions from '../actions/dsActions.js';
import {ListGroupItem} from 'react-bootstrap';

const AppsItem=React.createClass({

  /*
  ### Description
  loading apps form in main panel
  */
	showApp: function() {
		AppsActions.showApp(this.props.data.id, 'default');
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
				{this.props.data.id}
			</ListGroupItem>
		);
	}
});

module.exports= AppsItem;
