'use strict';

import React from 'react';
import {Navbar, Nav, NavItem} from 'react-bootstrap';
import AppsActions from '../actions/appsActions.js';

const Header=React.createClass({
	showWelcome: function() {
		AppsActions.showPage('welcome');
		let title="Scientific Apps";
		let url="/";
		if (typeof (history.pushState) != "undefined") {
			let obj = { Title: title, Url: url };
			history.pushState(obj, obj.Title, obj.Url);
		} else {
			alert("Browser does not support HTML5.");
		}
	},

	showWorkflow: function() {
		AppsActions.showPage('workflow');
	},

	render: function() {
		return (
			<Navbar className="navbar">
				<Nav>
					<NavItem onClick={this.showWelcome}>SciApps</NavItem>
					<NavItem onClick={this.showWorkflow}>Workflows</NavItem>
					<NavItem href='http://data.sciapps.org' target='_blank'>Data</NavItem>
					<NavItem href='http://ask.cyverse.org' target='_blank'>Help</NavItem>
				</Nav>
			</Navbar>
		);
	}
});

module.exports = Header;

