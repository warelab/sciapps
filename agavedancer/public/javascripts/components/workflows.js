'use strict';

import React from 'react';
import Reflux from 'reflux';
import {Button, Modal} from 'react-bootstrap';
import AppsActions from '../actions/appsActions.js';
import WorkflowActions from '../actions/workflowActions.js';

const Workflows=React.createClass({

	showWorkflowRunner: function(event) {
		AppsActions.showPage('workflowRunner');
		WorkflowActions.showWorkflow(event.target.value);
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
				Automatic workflow chains individual apps together. The workflow avoids manual submission of each individual job, reduces data transfer among intermediate steps, and further optimizes computation through advanced workflow engines. The inputs-outputs relationship among subsequent steps is captured by following step 2 (described below).<br /><br />
				The workflow is built by following steps:<br />
				<ol className="list">
					<li>Run each app used in the workflow at least once</li>
					<li>Whenever possible, feed the outputs from the right column (History panel) as input for subsequent steps</li>
					<li>Check whether outputs from each step are as expected; fix errors and repeat step 1 and 2 if not</li>
				</ol>
				<br />
				Example workflows:<br />
				<ul className="list">
					<li><Button value="Gwas" bsStyle="link" bsSize="large" onClick={this.showWorkflowRunner}>Gwas</Button></li>
					<li><Button value="Annotation" bsStyle="link" bsSize="large" onClick={this.showWorkflowRunner}>Annotation</Button></li>
					<li>Variant calling</li>
					<li>Expression</li>
					<li>Methylation</li>
					<li>sRNA</li>
					<li>Chip-seq</li>
				</ul>
			</div>
		</div>
		);
	}
});

module.exports = Workflows;
