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
import BaseInput from './baseInput.js';
import Dialog from 'react-bootstrap-dialog';

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
			direction: 0,
			label: 'Top Down',
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

	changeDirection: function() {
		let labels = ["Top Down", "Left Right"];
		this.setState({direction: this.state.direction ? 0 : 1, label: labels[this.state.direction ? 0 : 1]});
	},

	buildWorkflowDiagramDef: function(workflowStore, appsStore, jobsStore, workflowDirection) {
		let setting=_config.setting;
		let def;
		let fileNode={};
		let diagramDefStmts=['graph LR'];
		if (workflowDirection > 0) {
			diagramDefStmts=['graph TD'];
		}
		if (workflowStore.workflowDetail) {
			let steps=workflowStore.workflowDetail.steps;
			steps.forEach(function(step, i) {
				let appId=step.appId;
				let appDetail=appsStore.appDetailCache[appId];
				let jobDetail=step.jobId ? jobsStore.jobDetailCache[step.jobId] || _.find(jobsStore.jobDetailCache, 'id', step.jobId) : undefined;
				let showAppId=appId.replace(/\-[\.\d]+$/, '');
				let appClass='PENDING';
				let jobNum='';
				let jobOutputs=[];
				if (jobDetail) {
					jobNum=(_.findIndex(jobsStore.jobs, 'job_id', jobDetail.job_id)+1) + ': ';
					appClass=jobDetail.status;
					jobOutputs=jobsStore.jobOutputs[jobDetail.job_id];
				}
				if (_.includes(['RUNNING', 'CLEANING_UP', 'ARCHIVING', 'ARCHIVING_FINISHED'], appClass)) {
					appClass='RUNNING';
				}
				if (!_.includes(['RUNNING', 'FINISHED', 'FAILED'], appClass)) {
					appClass='PENDING';
				}
				let appNodeId=(setting.wf_step_prefix + step.id).replace(/\W/g, '_').toLowerCase();
				diagramDefStmts.push(appNodeId + '[' + jobNum + utilities.truncate(showAppId) + ']; class ' + appNodeId + ' appsNode' + appClass);
				diagramDefStmts.push('click ' + appNodeId + ' "' + appDetail.helpURI +'" "' + appDetail.longDescription + ' - click for documentation"');
				_.forEach(appDetail.outputs, function(v) {
					let value=v.id;
					let output_name, url, jobOwner;
					let output=_.find(jobOutputs, function(op) {
						return _.startsWith(op.name, value);
					});
					if (jobDetail) {
						jobOwner=jobDetail.owner;
						output_name=jobDetail.job_id;
						if (output && jobDetail.status === 'FINISHED') {
							if (jobDetail.archive) {
								url=[jobDetail.archiveSystem, jobDetail.archivePath, output.name].join('/');
							} else if (jobDetail.outputPath) {
								url=[setting.archive_system, jobDetail.outputPath.replace(jobOwner, setting.archive_path), value].join('/');
							}
						}
					} else {
						output_name=setting.wf_step_prefix + step.id + ':';
					}
					output_name=['file', output_name, value].join('_');
					output_name=output_name.replace(/\W/g, '_').toLowerCase();
					diagramDefStmts.push(output_name + '(' + utilities.truncate(output ? output.name : value) + '); class ' + output_name + ' fileNode');
					if (url) {
						//diagramDefStmts.push('click ' + output_name + ' clickFileNode');
						let splitUrl=url.match(/([^\/]+)\/(.*)/);
						let href=setting.output_url[splitUrl[1]];
						if (href) {
							href=href.replace(/__system__/, splitUrl[1]);
							href=href.replace(/\/__home__/, setting.datastore.__home__.home);
							href=href.replace(/__path__/, splitUrl[2]);
							diagramDefStmts.push('click ' + output_name + ' "' + href + '" "' + (output ? output.name : value) + ' - click to open"');
						} else {
							diagramDefStmts.push('click ' + output_name + ' clickFileNode "' + value + '"');
						}
					}
					diagramDefStmts.push(appNodeId + '-->' + output_name);
				});
				_.forEach(appDetail.inputs, function(v) {
					let value=v.value.default;
					let inputs=step.inputs[v.id] || [];
					if (! _.isArray(inputs)) {
						inputs=[inputs];
					}
					inputs.forEach(function(ic) {
						if (_.isPlainObject(ic)) {
							let prevAppNodeId=(setting.wf_step_prefix + ic.step).replace(/\W/g, '_').toLowerCase();
							let prevJobId=steps[ic.step].jobId;
							let prevJobDetail=prevJobId ? jobsStore.jobDetailCache[prevJobId] || _.find(jobsStore.jobDetailCache, 'id', prevJobId) : undefined;
							let input_name=prevJobDetail ? prevJobDetail.job_id : setting.wf_step_prefix + ic.step + ':';
							input_name=['file', input_name, ic.output_name].join('_');
							input_name=input_name.replace(/\W/g, '_').toLowerCase();
							diagramDefStmts.push(input_name + '-->' + appNodeId);
						} else if (ic) {
							value=_.last(ic.split('/'));
							let url=ic.replace('agave://', '');
							let input_name=url.replace(/\W/g, '_').toLowerCase();
							diagramDefStmts.push(input_name + '(' + utilities.truncate(value) + '); class ' + input_name + ' fileNode');
							let reg=new RegExp('agave://data.iplantcollaborative.org/(.+)', 'i');
							let found=ic.match(reg);
							let href;
							if (found && found[1]) {
								href=setting.output_url["data.iplantcollaborative.org"];
								href=href.replace(/\/__home__/, setting.archive_home);
								href=href.replace(/__path__/, found[1]);
							} else {
								href=ic;
							}
							diagramDefStmts.push('click ' + input_name + ' "' + href + '" "' + value + ' - click to open"');
							diagramDefStmts.push(input_name + '-->' + appNodeId);
						}
					});
				});
				diagramDefStmts.length;
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
		let workflowStore=this.state.workflowStore;
		let wf=workflowStore.workflowDetail;
		let nameInputData={
			name: 'workflowName',
			label: '*Workflow Name',
			required: true,
			value: wf.name,
			type: 'text'
		};
		let descInputData={
			name: 'workflowDesc',
			label: 'Workflow Description',
			value: wf.description,
			type: 'text'
		};
		let body=(
			<div>
				<BaseInput data={nameInputData} onValidate={true} ref={(input) => {this.nameInput=input;}}/>
				<BaseInput data={descInputData} ref={(input) => {this.descInput=input;}}/>
			</div>
		);
		this.refs.dialog.show({
			body: body,
			actions: [
				Dialog.CancelAction(),
				Dialog.Action(
					'Submit',
					() => {
						if (this.nameInput.state.value) {
							wf.name=this.nameInput.state.value;
						}
						if (this.descInput.state.value) {
							wf.description=this.descInput.state.value;
						}
						WorkflowActions.saveWorkflow(wf);
						this.setState({onSave: true});
						Q.delay(1000).then(function() {
							this.setState({onSave: false});
						}.bind(this));
					},
					'btn-primary'
				)
			]
		});
	},

	render: function() {
		let user=this.props.user;
		let setting=_config.setting;
		let appsStore=this.state.appsStore;
		let jobsStore=this.state.jobsStore;
		let workflowStore=this.state.workflowStore;
		let showWorkflowDiagram=workflowStore.showWorkflowDiagram;
		let activeNode=this.state.activeNode;
		let fileId=jobsStore.fileId;

		let markup=<div />;
		let body=<div />;
		let info=<div />;
		let nodeClass="modal-lg";
		let workflowDetail=workflowStore.workflowDetail;
		let workflowDirection=this.state.direction;
		if (showWorkflowDiagram) {
			if (workflowDetail) {
				workflowDetail.steps.forEach(function(step) {
					let jobDetail=step.jobId ? jobsStore.jobDetailCache[step.jobId] || _.find(jobsStore.jobDetailCache, 'id', step.jobId) : undefined;
				});
				let stepDepth=_.reduce(workflowDetail.steps, function(depth, step) {
					let prev=_.map(step.inputs, function(input) {
						let inp=_.isArray(input) ? input : [input];
						let inp_depth=inp.map(function(i) {
							return _.isPlainObject(i) ? depth[i.step] : 0;
						});
						return _.max(inp_depth);
					});
					depth.push(_.max(prev)+1);
					return depth;
				},[]);
				let maxStepDepth=_.max(stepDepth);
				if (maxStepDepth < 6) {
					switch (maxStepDepth) {
						case 1:
							nodeClass="oneNode";
							break;
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
				}
			}
			let workflowDiagramDef=this.buildWorkflowDiagramDef(workflowStore, appsStore, jobsStore, workflowDirection);
			body=<Mermaid diagramDef={workflowDiagramDef}/>;
		
			if (activeNode.id !== undefined) {
				if (activeNode.type === 'file') {
					info=<FilesInfo fileId={activeNode.id} />;
				} else if (activeNode.type === 'apps') {
					let id=activeNode.id.replace(setting.wf_step_prefix,'');
					let appId=workflowStore.workflowDetail.steps[id].appId;
					//let jobId=workflowStore.workflowDetail.steps[id].jobId;
					let appDetail=appsStore.appDetailCache[appId];
					//let jobDetail=jobId !== undefined ? _.find(this.state.jobsStore.jobDetailCache, 'id', jobId) : undefined;
					//info=<AppsInfo appDetail={appDetail} jobDetail={jobDetail} detailed={true} />
					info=<AppsInfo appDetail={appDetail} />
				}
			}

			let saveBtnTxt=this.state.onSave ? 'Saving' : 'Save Workflow';
			//if (workflowDetail && _.find(workflowStore.workflows, 'workflow_id', workflowDetail.id)) {
			//	saveBtnTxt='Saved';
			//}
			//let saveBtn=user.logged_in ? <Button onClick={saveBtnTxt === 'Saved' ? null : this.handleSave} disabled={saveBtnTxt === 'Saved'} bsStyle={saveBtnTxt === 'Saved' ? null : 'primary'}>{saveBtnTxt}</Button> : undefined;
			let saveBtn=user.logged_in ? <Button onClick={this.handleSave} bsStyle={'primary'}>{saveBtnTxt}</Button> : undefined;
			markup=(
				<div>
				<Modal dialogClassName={nodeClass} show={showWorkflowDiagram} onHide={this.hideWorkflowDiagram}>
					<Modal.Header closeButton>
						<Modal.Title>Workflow Diagram: {workflowDetail.name}</Modal.Title>
					</Modal.Header>
					<Modal.Body>
						{body}
						{info}
					</Modal.Body>
					<Modal.Footer>
						{saveBtn}
						<Button onClick={this.changeDirection}>{this.state.label}</Button>
						<Button onClick={this.hideWorkflowDiagram}>Close</Button>
					</Modal.Footer>
				</Modal>
				<Dialog ref='dialog' />
				</div>
			);
		}
		return markup;
	}
});

module.exports= WorkflowDiagram;
