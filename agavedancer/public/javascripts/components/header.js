'use strict';

import React from 'react';
import Reflux from 'reflux';
import {Navbar, Nav, NavItem, NavDropdown, MenuItem} from 'react-bootstrap';
import UserLoginBox from './userLoginBox.js';
import AppsActions from '../actions/appsActions.js';
import WorkflowActions from '../actions/workflowActions.js';
import UserStore from '../stores/userStore.js';
import UserActions from  '../actions/userActions.js';

const Header=React.createClass({
	mixins: [Reflux.connect(UserStore, 'userStore')],

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

	showWorkflows: function() {
		AppsActions.showPage('workflows');
		let title="Scientific Workflows";
		let url="/?page_id=workflows";
		if (typeof (history.pushState) !== "undefined") {
			let obj = { Title: title, Url: url };
			history.pushState(obj, obj.Title, obj.Url);
		} else {
			alert("Browser does not support HTML5.");
		}
	},

	showWorkflowBuilder: function() {
		AppsActions.showPage('workflowBuilder');
		let title="Building Scientific Workflows";
		let url="/?page_id=workflowBuilder";
		if (typeof (history.pushState) !== "undefined") {
			let obj = { Title: title, Url: url };
			history.pushState(obj, obj.Title, obj.Url);
		} else {
			alert("Browser does not support HTML5.");
		}
	},

	showWorkflowRunner: function() {
		//WorkflowActions.hideWorkflow();
		AppsActions.showPage('workflowRunner');
		WorkflowActions.showWorkflowLoadBox();
		let title="Running Scientific Workflows";
		let url="/?page_id=workflowRunner";
		if (typeof (history.pushState) !== "undefined") {
			let obj = { Title: title, Url: url };
			history.pushState(obj, obj.Title, obj.Url);
		} else {
			alert("Browser does not support HTML5.");
		}
	},

	showWorkflows: function() {
		AppsActions.showPage('workflows');
		let title="Public Workflows";
		let url="/?page_id=workflows";
		if (typeof (history.pushState) !== "undefined") {
			let obj = { Title: title, Url: url };
			history.pushState(obj, obj.Title, obj.Url);
		} else {
			alert("Browser does not support HTML5.");
		}
	},

	handleLogin: function() {
		UserActions.showLoginBox();
	},

	handleLogout: function() {
		UserActions.logout();
	},

	render: function() {
		let user=this.props.user;
		let userMenu;
		if (user.logged_in) {
			userMenu=(
				<NavDropdown eventKey='user' title={'Login as: ' + user.username} id="user-dropdown">
					<MenuItem eventKey='logout' onSelect={this.handleLogout}>Logout</MenuItem>
				</NavDropdown>
			);
		} else {
			userMenu=(<NavItem eventKey='login' pullRight onSelect={this.handleLogin}>Login</NavItem>);
		}
		return (
			<Navbar className="navbar">
				<Nav>
					<NavItem eventKey='welcome' onSelect={this.showWelcome}>SciApps</NavItem>
					<NavDropdown eventKey='Workflows' title="Workflows" id="nav-dropdown">
						<MenuItem eventKey='showWorkflowBuilder' disabled={!user.logged_in} onSelect={this.showWorkflowBuilder}>Build a workflow</MenuItem>
						<MenuItem eventKey='showWorkflowRunner' disabled={!user.logged_in} onSelect={this.showWorkflowRunner}>Load a workflow</MenuItem>
						<MenuItem eventKey='showWorkflows' disabled={!user.logged_in} onSelect={this.showWorkflows}>Public workflows</MenuItem>
					</NavDropdown>
					<NavItem eventKey='data' href='http://data.sciapps.org' target='_blank'>Data</NavItem>
					<NavItem eventKey='help' href='http://ask.cyverse.org' target='_blank'>Help</NavItem>
					{userMenu}
				</Nav>
			</Navbar>
		);
	}
});

module.exports = Header;

