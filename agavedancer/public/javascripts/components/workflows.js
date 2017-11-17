'use strict';

import React from 'react';
import Reflux from 'reflux';
import {Button, Modal} from 'react-bootstrap';
import AppsActions from '../actions/appsActions.js';
import WorkflowActions from '../actions/workflowActions.js';

const Workflows=React.createClass({

	showWorkflowRunner: function(event) {
		AppsActions.showPage('workflowRunner');
		WorkflowActions.showWorkflow(event.target.textContent);
		//let title="Running Scientific Workflows";
		//let url="/?page_id=workflowRunner";
		//if (typeof (history.pushState) !== "undefined") {
		//	let obj = { Title: title, Url: url };
		//	history.pushState(obj, obj.Title, obj.Url);
		//} else {
		//	alert("Browser does not support HTML5.");
		//}
	},

	render: function() {
		return (
			<div className="welcome">
				<div className="section">
				<h5>Public workflows</h5>
				Click on any workflow below will load both the pipeline (main panel) and data (History panel). Workflow diagram can be shown from the bottom of the main panel.
				<ul className="list">
					<li><a href="#" onClick={this.showWorkflowRunner}>Association</a></li>
					<li><a href="#" onClick={this.showWorkflowRunner}>Annotation</a></li>
					<li><a href="#" onClick={this.showWorkflowRunner}>Assembly</a></li>
				</ul>
			</div>
		</div>
		);
	}
});

module.exports = Workflows;
