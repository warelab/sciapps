'use strict';

import React from 'react';
import AppsActions from '../actions/appsActions.js';
import {ListGroupItem} from 'react-bootstrap';

const AppsItem=React.createClass({

	showApp: function() {
		AppsActions.showApp(this.props.data.id);
		var title=this.props.data.id;
		var urlbase="?app_id=";
		var url=urlbase.concat(title);
		if (typeof (history.pushState) != "undefined") {
		        var obj = { Title: title, Url: url };
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
