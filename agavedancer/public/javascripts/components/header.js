'use strict';

import React from 'react';
import {Navbar, Nav, NavItem, NavDropdown, MenuItem} from 'react-bootstrap';
import AppsActions from '../actions/appsActions.js';
import WorkflowActions from '../actions/workflowActions.js';

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
		WorkflowActions.hideWorkflow();
		AppsActions.showPage('workflowRunner');
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
		let title="Example Workflows";
		let url="/?page_id=workflows";
		if (typeof (history.pushState) !== "undefined") {
			let obj = { Title: title, Url: url };
			history.pushState(obj, obj.Title, obj.Url);
		} else {
			alert("Browser does not support HTML5.");
		}
	},

	render: function() {
		return (
			<Navbar className="navbar">
				<Nav>
					<NavItem eventKey='1' onClick={this.showWelcome}>SciApps</NavItem>
					<NavDropdown eventKey='2' title="Workflows" id="nav-dropdown">
						<MenuItem eventKey='2.1' onClick={this.showWorkflowBuilder}>Build a workflow</MenuItem>
						<MenuItem eventKey='2.2' onClick={this.showWorkflowRunner}>Load a workflow</MenuItem>
						<MenuItem eventKey='2.3' onClick={this.showWorkflows}>Example workflows</MenuItem>
					</NavDropdown>
					<NavItem eventKey='3' href='http://data.sciapps.org' target='_blank'>Data</NavItem>
					<NavItem eventKey='4' href='http://ask.cyverse.org' target='_blank'>Help</NavItem>
				</Nav>
			</Navbar>
		);
	}
});

module.exports = Header;

