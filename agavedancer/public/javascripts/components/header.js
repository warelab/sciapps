'use strict';

import React from 'react';
import Reflux from 'reflux';
import {Navbar, Nav, NavItem, NavDropdown, MenuItem} from 'react-bootstrap';
import UserLoginBox from './userLoginBox.js';
import AppsActions from '../actions/appsActions.js';
import WorkflowActions from '../actions/workflowActions.js';
import UserActions from  '../actions/userActions.js';

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

	showUserWorkflows: function() {
		AppsActions.showPage('userWorkflows');
	},

	handleLogin: function() {
		//UserActions.showLoginBox();
		//UserActions.login();
		window.location = '/login';
	},

	handleLogout: function() {
		UserActions.logout();
		window.location = '/logout';
	},

	render: function() {
		let user=this.props.user;
		let userGreeting, userMenu, workflowMenu;
		let workflowMenuItem=[
			<MenuItem key='showWorkflowBuilder' eventKey='showWorkflowBuilder' disabled={!user.logged_in} onSelect={this.showWorkflowBuilder}>Build a workflow</MenuItem>,
			<MenuItem key='showWorkflowRunner' eventKey='showWorkflowRunner' disabled={!user.logged_in} onSelect={this.showWorkflowRunner}>Load a workflow</MenuItem>,
			<MenuItem key='showWorkflows' eventKey='showWorkflows' disabled={!user.logged_in} onSelect={this.showWorkflows}>Public workflows</MenuItem>
		];
		if (user.logged_in) {
			userGreeting=<NavItem eventKey='greeting'>Hi, {user.firstName}!</NavItem>;
			userMenu=<NavItem eventKey='logout' pullRight onSelect={this.handleLogout}>Logout</NavItem>;
			//userMenu=(
			//	<NavDropdown eventKey='user' title={'Login as: ' + user.username} id="user-dropdown">
			//		<MenuItem eventKey='logout' onSelect={this.handleLogout}>Logout</MenuItem>
			//	</NavDropdown>
			//);

			workflowMenuItem.push(
				<MenuItem key='workflowDivder' eventKey='workflowDivder' divider />,
				<MenuItem key='userWorkflows' eventKey='userWorkflows' onSelect={this.showUserWorkflows}>My Workflows</MenuItem>
			);
		} else {
			userMenu=(<NavItem eventKey='login' pullRight onSelect={this.handleLogin}>Login</NavItem>);
		}
		workflowMenu=(
			<NavDropdown eventKey='workflows' title="Workflows" id="nav-dropdown">
				{workflowMenuItem}
			</NavDropdown>
		);
		return (
			<Navbar className="navbar">
				<Nav>
					<NavItem eventKey='welcome' onSelect={this.showWelcome}>SciApps</NavItem>
					{workflowMenu}
					<NavItem eventKey='data' href='http://data.sciapps.org' target='_blank'>Data</NavItem>
					<NavItem eventKey='help' href='http://ask.cyverse.org' target='_blank'>Help</NavItem>
					{userGreeting}
					{userMenu}
				</Nav>
			</Navbar>
		);
	}
});

module.exports = Header;

