'use strict';

import React from 'react';
import {Navbar, Nav, NavItem} from 'react-bootstrap';
import AppsActions from '../actions/appsActions.js';

const Header=React.createClass({
	showWelcome : function() {
		AppsActions.hideApp();
		var title="Scientific Apps";
  		var url="/";
  		if (typeof (history.pushState) != "undefined") {
  		        var obj = { Title: title, Url: url };
  	        	history.pushState(obj, obj.Title, obj.Url);
  		    } else {
          		alert("Browser does not support HTML5.");
      		}
	},

	render: function() {
		return (
			<Navbar className='header'>
				<Nav>
					<NavItem onClick={this.showWelcome}>SciApps</NavItem>
					<NavItem onClick={this.showWelcome}>Workflows</NavItem>
					<NavItem href='http://data.sciapps.org' target='_blank'>Data</NavItem>
					<NavItem href='http://ask.cyverse.org' target='_blank'>Help</NavItem>
				</Nav>
			</Navbar>
		);
	}
});

module.exports = Header;

