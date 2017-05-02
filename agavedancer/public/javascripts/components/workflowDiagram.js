'use strict';

import React from 'react';
import Reflux from 'reflux';
import Q from 'q';
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
import utilities from '../libs/utilities.js';

const WorkflowDiagram=React.createClass({
	mixins: [Reflux.connect(WorkflowStore, 'workflowStore'), Reflux.connect(JobsStore, 'jobsStore'), Reflux.connect(AppsStore, 'appsStore')],

	getDefaultProps: function() {
		return {
			onSave: false,
			timeout: 10000 
		};
	},

	getInitialState: function() {
		return {
			activeNode: {}
		}
	},

	componentWillMount: function() {
		window.clickFileNode=function(id) {
			let func=this.clickFileNodeFuncMap(id);
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

	clickFileNodeFuncMap: function(id) {
		let func=function() {
			let file=this.state.jobsStore.fileDetailCache[id];
			if (file !== undefined) {
				this.state.activeNode={id: id, type: 'file'};
				WorkflowActions.showNode();
				console.log(file);
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
		if (s.length > 12)
			return (s.substr(0,11)).concat(" ...");
		else
			return s;
	},

	buildWorkflowDiagramDef: function(workflowStore, appsStore, jobsStore, workflowDirection) {
		let that=this;
		let setting=_config.setting;
		let jobs=jobsStore.workflow.jobs;
		let jobStatus=jobsStore.jobStatus;
		let def;
		let fileNode={};
		let diagramDefStmts=['graph LR'];
		if (workflowDirection > 0) {
			diagramDefStmts=['graph TD'];
		}
		if (workflowStore.workflowDetail) {
			let steps=workflowStore.workflowDetail.steps;
			steps.map(function(step, i) {
				let showAppId=step.appId.replace(/\-[\.\d]+$/, '');
				let appClass='PENDING';
				if (typeof jobs === 'object' && jobs[i] !== undefined && jobStatus[jobs[i]] !== undefined) {
					appClass=jobStatus[jobs[i]];
				}
				let appNodeId=(setting.wf_step_prefix + step.id).replace(/\W/g, '_').toLowerCase();
				diagramDefStmts.push(appNodeId + '[' + that.truncate(showAppId) + ']; class ' + appNodeId + ' appsNode' + appClass);
				diagramDefStmts.push('click ' + appNodeId + ' clickAppsNode');
				let appId=step.appId;
				let appDetail=appsStore.appDetailCache[appId];
				let jobDetail=step.jobId ? jobsStore.jobDetailCache[step.jobId] || _.find(jobsStore.jobDetailCache, 'id', step.jobId) : undefined;
				_.forEach(appDetail.outputs, function(v) {
					let value=v.value.default;
					let output_name=(jobDetail ? jobDetail.archiveSystem + '/' + jobDetail.archivePath + '/' : setting.wf_step_prefix + step.id + ':') + value;
					let url=output_name;
					output_name=output_name.replace(/\W/g, '_').toLowerCase();
					diagramDefStmts.push(output_name + '(' + that.truncate(value) + '); class ' + output_name + ' fileNode');
					if (jobDetail) {
						JobsActions.setFile(output_name, url);
						diagramDefStmts.push('click ' + output_name + ' clickFileNode');
					}
					diagramDefStmts.push(appNodeId + '-->' + output_name);
				});
				_.forEach(appDetail.inputs, function(v) {
					let value=v.value.default;
					let ic=step.inputs[v.id];
					if (_.isPlainObject(ic)) {
						let prevAppNodeId=(setting.wf_step_prefix + ic.step).replace(/\W/g, '_').toLowerCase();
						let prevJobId=steps[ic.step].jobId;
						let prevJobDetail=prevJobId ? jobsStore.jobDetailCache[prevJobId] || _.find(jobsStore.jobDetailCache, 'id', prevJobId) : undefined;
						let input_name=(prevJobDetail ? prevJobDetail.archiveSystem + '/' + prevJobDetail.archivePath + '/' : setting.wf_step_prefix + ic.step + ':') + ic.output_name;
						let url=input_name; 
						input_name=input_name.replace(/\W/g, '_').toLowerCase();
						//diagramDefStmts.push(value + '(' + that.truncate(ic.output_name) + '); class ' + value + ' fileNode');
						//if (prevJobDetail) {
							//diagramDefStmts.push('click ' + input_name + ' clickFileNode');
						//}
						//diagramDefStmts.push(prevAppNodeId + '-->' + input_name);
						diagramDefStmts.push(input_name + '-->' + appNodeId);
					} else if (ic) {
						value=_.last(ic.split('/'));
						let url=ic.replace('agave://', '');
						let input_name=url.replace(/\W/g, '_').toLowerCase();
						diagramDefStmts.push(input_name + '(' + that.truncate(value) + '); class ' + input_name + ' fileNode');
						diagramDefStmts.push('click ' + input_name + ' clickFileNode');
						diagramDefStmts.push(input_name + '-->' + appNodeId);
						JobsActions.setFile(input_name, url);
					}
				});
			});
			def=_.uniq(diagramDefStmts).join(';\n');
		}
		return def;
	},

	handleDownload: function() {
		let workflowStore=this.state.workflowStore;
		let wf=workflowStore.workflowDetail;
		utilities.download(wf.name + '.json', 'application/json;charset=utf-8', JSON.stringify(wf));
	},

	handleSave: function() {
		this.setState({onSave: true});
		let workflowStore=this.state.workflowStore;
		let wf=workflowStore.workflowDetail;
		WorkflowActions.saveWorkflow(wf);
		Q.delay(1500).then(function() {
			this.setState({onSave: false});
		}.bind(this));
	},

	render: function() {
		let showWorkflowDiagram=this.state.workflowStore.showWorkflowDiagram;
		let user=this.props.user;
		let setting=_config.setting;
		let jobsStore=this.state.jobsStore;
		let worflowStore=this.state.workflowStore;
		let workflow=jobsStore.workflow;
		let activeNode=this.state.activeNode;
		let fileId=jobsStore.fileId;
		let jobStatus=jobsStore.jobStatus;
		let markup=<div />;
		let body=<div />;
		let info=<div />;
		let nodeClass="modal-lg";
		let jobCount=0;
		let workflowDetail=this.state.workflowStore.workflowDetail;
		let workflowDirection=1;
		if (showWorkflowDiagram) {
			if (workflowDetail) {
				jobCount=workflowDetail.steps.length;
				if (jobCount < 7) {
					workflowDirection=0;
					switch (jobCount) {
						case 2:
							nodeClass="twoNodes";
							break;
						case 3:
							nodeClass="threeNodes";
							break;
						case 4:
							nodeClass="fourNodes";
							break;
						case 5:
							nodeClass="fiveNodes";
					}
				} else {
					switch (jobCount) {
						case 7:
							nodeClass="fiveNodes";
							break;
						case 8:
							nodeClass="fiveNodes";
							break;
						case 9:
							nodeClass="fiveNodes";
					}
				}
			}
			let workflowDiagramDef=this.buildWorkflowDiagramDef(this.state.workflowStore, this.state.appsStore, this.state.jobsStore, workflowDirection);
			body=<Mermaid diagramDef={workflowDiagramDef}/>;
			if (typeof workflow.jobs === 'object') {
				let unfinished=_.find(workflow.jobs, function(job) {
					return jobStatus[job] !== 'FINISHED';
				});
				if (unfinished) {
					setTimeout((wfId) => JobsActions.checkWorkflowJobStatus(wfId), this.props.timeout, workflow.id); 
				}
			}
			if (workflowDetail) {
				jobCount=workflowDetail.steps.length;
			}
		
			if (activeNode.id !== undefined) {
				if (activeNode.type === 'file') {
					info=<FilesInfo fileId={activeNode.id} />;
				} else if (activeNode.type === 'apps') {
					let id=activeNode.id.replace(setting.wf_step_prefix,'');
					let appId=this.state.workflowStore.workflowDetail.steps[id].appId;
					info=<AppsInfo appId={appId} detailed={true} />
				}
			}

			let saveBtnTxt=this.state.onSave ? 'Saving' : 'Save Workflow';
			if (workflowDetail && _.find(worflowStore.workflows, {workflow_id: workflowDetail.id})) {
				saveBtnTxt='Saved';
			}
			let saveBtn=user.logged_in ? <Button onClick={saveBtnTxt === 'Saved' ? null : this.handleSave} disabled={saveBtnTxt === 'Saved' || workflowDetail.name.length === 0}>{saveBtnTxt}</Button> : undefined;
			markup=(
				<Modal dialogClassName={nodeClass} show={showWorkflowDiagram} onHide={this.hideWorkflowDiagram}>
					<Modal.Header closeButton>
						<Modal.Title>Workflow Diagram</Modal.Title>
					</Modal.Header>
					<Modal.Body>
						{body}
						{info}
					</Modal.Body>
					<Modal.Footer>
						<Button onClick={this.handleDownload}>Download Workflow</Button>
						{saveBtn}
						<Button onClick={this.hideWorkflowDiagram}>Close</Button>
					</Modal.Footer>
				</Modal>
			);
		}
		return markup;
	}
});

module.exports= WorkflowDiagram;
