'use strict';

import React from 'react';
import Reflux from 'reflux';
import {Navbar, Nav, NavItem, NavDropdown, MenuItem, Glyphicon} from 'react-bootstrap';
import UserLoginBox from './userLoginBox.js';
import AppsActions from '../actions/appsActions.js';
import WorkflowActions from '../actions/workflowActions.js';
import UserActions from  '../actions/userActions.js';
import Dialog from 'react-bootstrap-dialog';

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
	
	showHelp: function() {
		AppsActions.showPage('help');
		let title="Help";
		let url="/?page_id=help";
		if (typeof (history.pushState) != "undefined") {
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

	showWorkflowLoader: function() {
		AppsActions.showPage('workflowLoader');
		let title="Loading Scientific Workflows";
		let url="/?page_id=workflowLoader";
		if (typeof (history.pushState) !== "undefined") {
			let obj = { Title: title, Url: url };
			history.pushState(obj, obj.Title, obj.Url);
		} else {
			alert("Browser does not support HTML5.");
		}
	},

	showWorkflowRunner: function() {
		AppsActions.showPage('workflowRunner');
		WorkflowActions.showWorkflowLoadBox();
		//let title="Running Scientific Workflows";
		//let url="/?page_id=workflowRunner";
		//if (typeof (history.pushState) !== "undefined") {
		//	let obj = { Title: title, Url: url };
		//	history.pushState(obj, obj.Title, obj.Url);
		//} else {
		//	alert("Browser does not support HTML5.");
		//}
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
		let title="My Workflows";
		let url="/?page_id=userWorkflows";
		if (typeof (history.pushState) !== "undefined") {
			let obj = { Title: title, Url: url };
			history.pushState(obj, obj.Title, obj.Url);
		} else {
			alert("Browser does not support HTML5.");
		}
	},

	showUserJobs: function() {
		AppsActions.showPage('userJobs');
		let title="My Jobs";
		let url="/?page_id=userJobs";
		if (typeof (history.pushState) !== "undefined") {
			let obj = { Title: title, Url: url };
			history.pushState(obj, obj.Title, obj.Url);
		} else {
			alert("Browser does not support HTML5.");
		}
	},

	handleLogin: function() {
		window.location = '/login';
		//UserActions.showLoginBox();
	},

	handleLogout: function() {
		this.refs.dialog.show({
 			body: 'History panel will be cleared. You can reload jobs to History from "My jobs"',
 			actions: [
 				Dialog.CancelAction(),
 				Dialog.Action(
					'Logout',
					() => {
						UserActions.logout();
						window.location = '/logout';
 					},
					'btn-danger'
				)
 			]
 		});
	},

	render: function() {
		let user=this.props.user;
		let userGreeting, userMenu, workflowMenu;
		let workflowMenuItem=[
			<MenuItem key='showWorkflowBuilder' eventKey='showWorkflowBuilder' onSelect={this.showWorkflowBuilder}><Glyphicon glyph='wrench' /> Build a workflow</MenuItem>,
			<MenuItem key='showWorkflows' eventKey='showWorkflows' onSelect={this.showWorkflows}><Glyphicon glyph='th-list' /> Public workflows</MenuItem>
		];
		if (user.logged_in) {
			userGreeting=<NavItem eventKey='greeting'><Glyphicon glyph='user' /> Hi, {user.username}!</NavItem>;
			userMenu=<NavItem eventKey='logout' pullRight onSelect={this.handleLogout}>Logout <Glyphicon glyph='log-out' /></NavItem>;
			workflowMenuItem.push(
				<MenuItem key='workflowDivder' eventKey='workflowDivder' divider />,
				<MenuItem key='userWorkflows' eventKey='userWorkflows' onSelect={this.showUserWorkflows}><Glyphicon glyph='list-alt' /> My workflows</MenuItem>,
				<MenuItem key='userJobs' eventKey='userJobs' onSelect={this.showUserJobs}><Glyphicon glyph='list-alt' /> My jobs</MenuItem>
			);
		} else {
			userMenu=(<NavItem eventKey='login' pullRight onSelect={this.handleLogin}>Login <Glyphicon glyph='log-in' /></NavItem>);
		}
		workflowMenu=(
			<NavDropdown eventKey='workflows' title={<span><Glyphicon glyph="link" /> Workflow</span>} id="nav-dropdown">
				{workflowMenuItem}
			</NavDropdown>
		);
		return (
			<div>
			<Navbar className="navbar">
				<Nav>
					<NavItem eventKey='welcome' onSelect={this.showWelcome}><Glyphicon glyph='home' /> Home</NavItem>
					{workflowMenu}
					<NavItem eventKey='help' onSelect={this.showHelp}><Glyphicon glyph='question-sign' /> Help</NavItem>
					{userGreeting}
					{userMenu}
				</Nav>
			</Navbar>
			<UserLoginBox />
			<Dialog ref='dialog' />
			</div>
		);
	}
});

module.exports = Header;
