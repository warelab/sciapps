'use strict';

import React from 'react';
import Reflux from 'reflux';
import _ from 'lodash';
import {Navbar, Nav, NavItem, NavDropdown, MenuItem, Glyphicon, Input} from 'react-bootstrap';
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

	showDataWorkflows: function(e) {
    let dataItem=e.currentTarget.title;
    WorkflowActions.listWorkflow(dataItem);
		AppsActions.showPage('dataWorkflows');
		let title=dataItem.replace(/_+/gi, ' ');
		let url="/?page_id=dataWorkflows&data_item=" + dataItem;
		if (typeof (history.pushState) !== "undefined") {
			let obj = { Title: title, Url: url };
			history.pushState(obj, obj.Title, obj.Url);
		} else {
			alert("Browser does not support HTML5.");
		}
	},

	showUserWorkflows: function() {
    WorkflowActions.listWorkflow();
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

  handleToken: function() {
    let user=this.props.user;
    //this.refs.dialog.showAlert('Your API token is: ' + user.token);
    let input=<Input id='copy' name='copy' value={user.token} type='textarea' readOnly />
    let copyBtn={
	label: 'Copy to clipboard',
	className: 'btn-primary',
	func: () => {
		let dom=document.getElementById('copy');
		dom.select();
		document.execCommand('Copy');
		}
    };
    this.refs.dialog.show({
	title: 'Your SciApps API token',
	body: input,
	actions: [
		copyBtn,
		Dialog.OKAction()
	],
	bsSize: 'medium'
    });
  },

  handleSwagger: function() {
    let user=this.props.user;
		let setting=_config.setting;
    let swagger_link='/doc';
    window.open(swagger_link, '_blank');
  },

  handleJBrowse: function() {
    let setting=_config.setting;
    window.open(setting.toolsmenu_item.JBrowse, '_blank');
  },

	render: function() {
		let user=this.props.user;
		let setting=_config.setting;
		let userGreeting, userMenu, workflowMenu, dataMenu, toolsMenu;
		let workflowMenuItem=[
			<MenuItem key='showWorkflowBuilder' eventKey='showWorkflowBuilder' onSelect={this.showWorkflowBuilder}><Glyphicon glyph='wrench' /> Build a workflow</MenuItem>,
			<MenuItem key='showWorkflows' eventKey='showWorkflows' onSelect={this.showWorkflows}><Glyphicon glyph='th-list' /> Public workflows</MenuItem>
		];
    let dataMenuItem=[];
    if (setting.datamenu_item) {
      dataMenuItem=_.keys(setting.datamenu_item).map(function(item) {
        let text=item.replace(/_+/gi, ' ');
        return <MenuItem key={item} eventKey={item} onSelect={this.showDataWorkflows} title={item}><Glyphicon glyph='list-alt' /> {text}</MenuItem>
      }.bind(this));
    }
    let toolsMenuItem=[
      <MenuItem key='Jbrowse' eventKey='Jbrowse' onSelect={this.handleJBrowse}><Glyphicon glyph='globe' /> JBrowse</MenuItem>
    ];
		if (user.token) {
      userMenu=(
        <NavDropdown eventKey='user' title={<span><Glyphicon glyph="user" /> Hi, {user.firstName}!</span>} id="nav-dropdown-user">
          <MenuItem key='swagger' eventKey='swagger' onSelect={this.handleSwagger}><Glyphicon glyph='link' /> Open swagger-ui</MenuItem>
          <MenuItem key='token' eventKey='token' onSelect={this.handleToken}><Glyphicon glyph='record' /> Get API token</MenuItem>
          <MenuItem key='logout' eventKey='logout' onSelect={this.handleLogout}><Glyphicon glyph='log-out' /> Logout</MenuItem>
        </NavDropdown>
      )
			workflowMenuItem.push(
				<MenuItem key='workflowDivder' eventKey='workflowDivder' divider />,
				<MenuItem key='userWorkflows' eventKey='userWorkflows' onSelect={this.showUserWorkflows}><Glyphicon glyph='list-alt' /> My workflows</MenuItem>,
				<MenuItem key='userJobs' eventKey='userJobs' onSelect={this.showUserJobs}><Glyphicon glyph='list-alt' /> My jobs</MenuItem>
			);
		} else {
			userMenu=(<NavItem eventKey='login' pullRight onSelect={this.handleLogin}><Glyphicon glyph='log-in' /> Login</NavItem>);
		}
    dataMenu=(
			<NavDropdown eventKey='data' title={<span><Glyphicon glyph="hdd" /> Data</span>} id="nav-dropdown-data">
				{dataMenuItem}
			</NavDropdown>
    );
		workflowMenu=(
			<NavDropdown eventKey='workflows' title={<span><Glyphicon glyph="link" /> Workflow</span>} id="nav-dropdown-workflow">
				{workflowMenuItem}
			</NavDropdown>
		);
    toolsMenu=(
			<NavDropdown eventKey='tools' title={<span><Glyphicon glyph="wrench" /> Tools</span>} id="nav-dropdown-tools">
				{toolsMenuItem}
			</NavDropdown>
    );
		return (
			<div>
			<Navbar className="navbar">
				<Nav>
					<NavItem eventKey='welcome' onSelect={this.showWelcome}><Glyphicon glyph='home' /> Home</NavItem>
					{dataMenu}
					{workflowMenu}
          {toolsMenu}
					<NavItem eventKey='help' onSelect={this.showHelp}><Glyphicon glyph='question-sign' /> Help</NavItem>
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
