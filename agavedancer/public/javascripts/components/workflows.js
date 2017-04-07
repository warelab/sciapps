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
		let title="Running Scientific Workflows";
		let url="/?page_id=workflowRunner";
		if (typeof (history.pushState) !== "undefined") {
			let obj = { Title: title, Url: url };
			history.pushState(obj, obj.Title, obj.Url);
		} else {
			alert("Browser does not support HTML5.");
		}
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
				</ul><br />
				<h5>Why building/using SciApps workflow</h5>
				SciApps workflows are built on top of Agave API to leverage distributed compute and storage systems on the cloud. The backend is designed to provide convenience, increase performance, and ensure reproducibility.
				<ul className="list">
					<li>For convenience</li>
						<ul className="list">
							<li>Submitting multiple analysis jobs simultaneously</li>
							<li>Data relationships, metadata, and real time job status are available on the workflow diagram</li> 
							<li>Larger workflow can grow from existing workflows by chaining additional apps</li>
							<li>Smaller workflow can be created from existing workflows by selecting less steps</li>
						</ul>
					<li>For performance</li>
						<ul className="list">
							<li>Jobs are running in parallel (jobs in a workflow will be submitted to cluster once inputs are ready (or dependency is clear))</li>
							<li>Intermediate results are kept close to cluster (avoid unnecessary cross sites data transfer)</li>
						</ul>
					<li>For reproducibility</li>
						<ul className="list">
							<li>Workflow = pipeline + data (which means every re-run will create a new workflow)</li>
							<li>Analysis of a workflow can be shared and completely reproduced with passing (and loading) a lightweight JSON file</li>
						</ul>
				</ul>
			</div>
		</div>
		);
	}
});

module.exports = Workflows;
