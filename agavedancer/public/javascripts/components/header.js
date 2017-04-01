'use strict';

import React from 'react';
import Reflux from 'reflux';
import {Navbar, Nav, NavItem, NavDropdown, MenuItem, Glyphicon} from 'react-bootstrap';
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

	handleLogin: function(event) {
		if ('Login' === event.target.textContent) {
			UserActions.showLoginBox();
		} else {
			UserActions.logout();
		}
	},

	render: function() {
		let username=this.state.userStore.username;
		return (
			<Navbar className="navbar">
				<Nav>
					<NavItem eventKey='1' onClick={this.showWelcome}><Glyphicon glyph='home' /> SciApps</NavItem>
					<NavDropdown eventKey='2' title={<span><Glyphicon glyph="link" /> Workflows</span>} id="nav-dropdown">
						<MenuItem eventKey='2.1' onClick={this.showWorkflowBuilder}><Glyphicon glyph='wrench' /> Build a workflow</MenuItem>
						<MenuItem eventKey='2.2' onClick={this.showWorkflowRunner}><Glyphicon glyph='cloud-upload' /> Load a workflow</MenuItem>
						<MenuItem eventKey='2.3' onClick={this.showWorkflows}><Glyphicon glyph='th-list' /> Public workflows</MenuItem>
					</NavDropdown>
					<NavItem eventKey='3' href='http://data.sciapps.org' target='_blank'><Glyphicon glyph='th' /> Data</NavItem>
					<NavItem eventKey='4' href='http://ask.cyverse.org' target='_blank'><Glyphicon glyph='question-sign' /> Help</NavItem>
				</Nav>
			</Navbar>
		);
	}
});

module.exports = Header;

