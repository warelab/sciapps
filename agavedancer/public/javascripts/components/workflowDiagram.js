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
import FilesInfo from './filesInfo.js';
import AppsInfo from './appsInfo.js';

const WorkflowDiagram=React.createClass({
	mixins: [Reflux.connect(WorkflowStore, 'workflowStore'), Reflux.connect(JobsStore, 'jobsStore'), Reflux.connect(AppsStore, 'appsStore')],

	getDefaultProps: function() {
		return {
			timeout: 10000 
		};
	},

	getInitialState: function() {
		return {
			activeNode: {},
			setting: _config.setting
		}
	},

	componentWillMount: function() {
		window.clickInputFileNode=function(id) {
			let func=this.clickInputFileNodeFuncMap(id);
			if (typeof func === 'function') {
				func(id);
			} else {
				console.log(id);
			}
		}.bind(this);
		window.clickAppsNode=function(id) {
			let func=this.clickAppsNodeFuncMap(id);
			if (typeof func === 'function') {
				func(id);
			} else {
				console.log(id);
			}
		}.bind(this);
	},

	clickInputFileNodeFuncMap: function(id) {
		let func=function() {
			let input=this.state.jobsStore.inputs[id];
			if (input !== undefined) {
				this.state.activeNode={id: id, type: 'file'};
				WorkflowActions.showNode();
				console.log(input);
			}
			console.log(id);
		}.bind(this);
		return func;
	},

	clickAppsNodeFuncMap: function(id) {
		let func=function() {
			this.state.activeNode={id: id, type: 'apps'};
			WorkflowActions.showNode();
			console.log(id);
		}.bind(this);
		return func;
	},

	hideWorkflowDiagram: function() {
		this.state.activeNode={};
		WorkflowActions.hideWorkflowDiagram();
	},

	truncate: function(s) {
		if (s.length > 10)
			return (s.substr(0,8)).concat("...");
		else
			return s;
	},

	buildWorkflowDiagramDef: function(workflowStore, appsStore, jobsStore) {
		let that=this;
		let setting=this.state.setting;
		let jobs=jobsStore.workflow.jobs;
		let jobStatus=jobsStore.jobStatus;
		let def;
		if (workflowStore.workflowDetail) {
			let steps=workflowStore.workflowDetail.steps;
			let diagramDefStmts=['graph LR'];
			steps.map(function(step, i) {
				let showAppId=that.truncate(step.appId.replace(/\-[\.\d]+$/, ''));
				let appClass='PENDING';
				if (typeof jobs === 'object' && jobs[i] !== undefined && jobStatus[jobs[i]] !== undefined) {
					appClass=jobStatus[jobs[i]];
				}
				let appNodeId=(setting.wf_step_prefix + step.id).replace(/\W/g, '_').toLowerCase();
				diagramDefStmts.push(appNodeId + '[' + showAppId + ']; class ' + appNodeId + ' appsNode' + appClass);
				diagramDefStmts.push('click ' + appNodeId + ' clickAppsNode');
				let appId=step.appId;
				let appDetail=appsStore.appDetailCache[appId];
				_.forEach(appDetail.outputs, function(v) {
					let value=v.value.default;
					let value2=that.truncate(v.value.default);
					let output_name=(setting.wf_step_prefix + step.id + ':' + value).replace(/\W/g, '_').toLowerCase();
					diagramDefStmts.push(output_name + '(' + value2 + '); class ' + output_name + ' fileNode');
					//diagramDefStmts.push('click ' + output_name + ' clickFileNode');
					diagramDefStmts.push(appNodeId + '-->' + output_name);
				});
				_.forEach(appDetail.inputs, function(v) {
					let value=v.value.default;
					let ic=step.inputs[v.id];
					if (_.isPlainObject(ic)) {
						let prevAppNodeId=(setting.wf_step_prefix + ic.step).replace(/\W/g, '_').toLowerCase();
						value=(setting.wf_step_prefix + ic.step + ':' + ic.output_name).replace(/\W/g, '_').toLowerCase();
						let value2=that.truncate(ic.output_name);
						diagramDefStmts.push(value + '(' + value2 + '); class ' + value + ' fileNode');
						//diagramDefStmts.push('click ' + value + ' clickFileNode');
						diagramDefStmts.push(prevAppNodeId + '-->' + value);
						diagramDefStmts.push(value + '-->' + appNodeId);
					} else if (ic) {
						value=that.truncate(_.last(ic.split('/')));
						let input_name=value.replace(/\W/g, '_').toLowerCase();
						diagramDefStmts.push(input_name + '(' + value + '); class ' + input_name + ' fileNode');
						diagramDefStmts.push('click ' + input_name + ' clickInputFileNode');
						diagramDefStmts.push(input_name + '-->' + appNodeId);
						JobsActions.setWorkflowInputs(input_name, ic);
					}
				});
			});
			def=_.uniq(diagramDefStmts).join(';\n');
		}
		return def;
	},

	render: function() {
		let showWorkflowDiagram=this.state.workflowStore.showWorkflowDiagram;
		let setting=this.state.setting;
		let jobsStore=this.state.jobsStore;
		let worflowStore=this.state.workflowStore;
		let workflow=jobsStore.workflow;
		let activeNode=this.state.activeNode;
		let fileId=jobsStore.fileId;
		let jobStatus=jobsStore.jobStatus;
		let body=<div />;
		let info=<div />;
		if (showWorkflowDiagram) {
			let workflowDiagramDef=this.buildWorkflowDiagramDef(this.state.workflowStore, this.state.appsStore, this.state.jobsStore);
			body=<Mermaid diagramDef={workflowDiagramDef}/>;
			if (typeof workflow.jobs === 'object') {
				let unfinished=_.findIndex(workflow.jobs, function(j) {
					return jobStatus[j] !== 'FINISHED';
				});
				if (unfinished !== -1) {
					setTimeout((wfId) => JobsActions.checkWorkflowJobStatus(wfId), this.props.timeout, workflow.id); 
				}
			}
		}
		
		if (activeNode.id !== undefined) {
			if (activeNode.type === 'file') {
				info=<FilesInfo fileId={activeNode.id} />;
			} else if (activeNode.type === 'apps') {
				let id=activeNode.id.replace(setting.wf_step_prefix,'');
				let appId=this.state.workflowStore.workflowDetail.steps[id].appId;
				info=<AppsInfo appId={appId} />
			}
		}

		return (
			<Modal bsSize="large" show={showWorkflowDiagram} onHide={this.hideWorkflowDiagram}>
				<Modal.Header closeButton>
					<Modal.Title>Workflow Diagram</Modal.Title>
				</Modal.Header>
				<Modal.Body>
					{body}
					{info}
				</Modal.Body>
				<Modal.Footer>
					<Button onClick={this.hideWorkflowDiagram}>Close</Button>
				</Modal.Footer>
			</Modal>
		);
	}
});

module.exports= WorkflowDiagram;
