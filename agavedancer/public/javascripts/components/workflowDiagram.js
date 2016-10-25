'use strict';

import React from 'react';
import Reflux from 'reflux';
import _ from 'lodash';
import AppsStore from '../stores/appsStore.js';
import JobsStore from '../stores/jobsStore.js';
import WorkflowStore from '../stores/workflowStore.js';
import JobsActions from '../actions/jobsActions.js';
import WorkflowActions from '../actions/workflowActions.js';
import {Modal, Button} from 'react-bootstrap';
import Mermaid from './mermaid.js';

const WorkflowDiagram=React.createClass({
	mixins: [Reflux.connect(WorkflowStore, 'workflowStore'), Reflux.connect(JobsStore, 'jobsStore'), Reflux.connect(AppsStore, 'appsStore')],

	getInitialState: function() {
		return {
			setting: _config.setting
		}
	},

	hideWorkflowDiagram: function() {
		WorkflowActions.hideWorkflowDiagram();
	},

	buildWorkflowDiagramDef: function(workflowStore, appsStore, jobsStore) {
		let setting=this.state.setting;
		let jobs=jobsStore.workflow.jobs;
		let jobStatus=jobsStore.jobStatus;
		let def;
		if (workflowStore.workflowDetail) {
			let steps=workflowStore.workflowDetail.steps;
			let diagramDefStmts=['graph LR'];
			steps.map(function(step, i) {
				let showAppId=step.appId.replace(/\-[\.\d]+$/, '');
				let appClass=1;
				if (typeof jobs === 'object' && jobs[i] !== 'undefined' && jobStatus[jobs[i]] === 'FINISHED') {
					appClass=2;
				}
				diagramDefStmts.push(step.id + '[' + showAppId + ']; class ' + step.id + ' appsNode' + appClass);
				let appId=step.appId;
				let appDetail=appsStore.appDetailCache[appId];
				_.forEach(appDetail.outputs, function(v) {
					let value=v.value.default;
					let output_name=(setting.wf_step_prefix + step.id + ':' + value).toLowerCase();
					diagramDefStmts.push(output_name + '(' + value + '); class ' + output_name + ' fileNode');
					diagramDefStmts.push(step.id + '-->' + output_name);
				});
				_.forEach(appDetail.inputs, function(v) {
					let value=v.value.default;
					let ic=step.inputs[v.id];
					if (_.isPlainObject(ic)) {
						value=(setting.wf_step_prefix + ic.step + ':' + ic.output_name).toLowerCase();
						diagramDefStmts.push(value + '(' + ic.output_name + ')');
						diagramDefStmts.push("class " + value + " fileNode");
						diagramDefStmts.push(ic.step + '-->' + value);
						diagramDefStmts.push(value + '-->' + step.id);
						//diagramDefStmts.push( ic.step + '-->|' + ic.output_name + '|' + step.id)
					} else if (ic) {
						value=ic;
						let input_name=_.last(value.split('/'));
						diagramDefStmts.push(input_name + '(' + input_name + ')');
						diagramDefStmts.push("class " + input_name + " fileNode");
						diagramDefStmts.push(input_name + '-->' + step.id);
					}
				});
			});
			def=_.uniq(diagramDefStmts).join(';\n');
		}
		return def;
	},

	render: function() {
		let showWorkflowDiagram=this.state.workflowStore.showWorkflowDiagram;
		let jobs=this.state.jobsStore.workflow.jobs;
		let jobStatus=this.state.jobsStore.jobStatus;
		let body='';
		if (showWorkflowDiagram) {
			let workflowDiagramDef=this.buildWorkflowDiagramDef(this.state.workflowStore, this.state.appsStore, this.state.jobsStore);
			body=<Mermaid diagramDef={workflowDiagramDef}/>;
			if (typeof jobs === 'object') {
				let unfinished=_.findIndex(jobs, function(j) {
					return jobStatus[j] !== 'FINISHED';
				});
				if (unfinished !== -1) {
					setTimeout((jobs) => JobsActions.checkJobStatus(jobs), 10000, jobs); 
				}
			}
		}

		return (
			<Modal bsSize="large" show={showWorkflowDiagram} onHide={this.hideWorkflowDiagram}>
				<Modal.Header closeButton>
					<Modal.Title>Workflow Diagram</Modal.Title>
				</Modal.Header>
				<Modal.Body>
					{body}
				</Modal.Body>
				<Modal.Footer>
					<Button onClick={this.hideWorkflowDiagram}>Close</Button>
				</Modal.Footer>
			</Modal>
		);
	}
});

module.exports= WorkflowDiagram;
