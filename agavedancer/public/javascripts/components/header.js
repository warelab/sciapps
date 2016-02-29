'use strict';

import React from 'react';
import {Navbar, Nav, NavItem} from 'react-bootstrap';
import AppsActions from '../actions/appsActions.js';

const Header=React.createClass({
	showWelcome : function() {
		AppsActions.hideApp();
	},

	render: function() {
		return (
			<Navbar className='header'>
				<Nav>
					<NavItem onClick={this.showWelcome}>SciApps</NavItem>
					<NavItem onClick={this.showWelcome}>Workflows</NavItem>
					<NavItem href='http://data.sciapps.org/data' target='_blank'>Data</NavItem>
					<NavItem href='http://ask.cyverse.org' target='_blank'>Help</NavItem>
				</Nav>
			</Navbar>
		);
	}
});

module.exports = Header;

