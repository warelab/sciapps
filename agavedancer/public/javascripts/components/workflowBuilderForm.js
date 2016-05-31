'use strict';

import React from 'react';
import Reflux from 'reflux';
import JobsStore from '../stores/jobsStore.js';
import WorkflowStore from '../stores/workflowStore.js';
import WorkflowActions from '../actions/workflowActions.js';
import BaseInput from './baseInput.js';
import _ from 'lodash';
import {Button, ButtonToolbar, Panel} from 'react-bootstrap';
import utilities from '../libs/utilities.js';

const WorkflowBuilderForm=React.createClass({
	mixins: [Reflux.connect(JobsStore, 'jobsStore'), Reflux.connect(WorkflowStore, 'workflowStore')],

	getInitialState: function() {
		return {
			total: 3,
			selects: [],
			setting: _config.setting,
			onSubmit: false,
			onValidate: false
		}
	},

	componentDidUpdate: function(prevProps, prevState) {
		let workflowStore=this.state.workflowStore;
		let wf=workflowStore.workflows[this.state.wid];
		if (this.state.onSubmit && wf && wf.completed) {
			let wfObj={
				id:	wf.id,
				name: 'test_wf',
				steps: wf.steps
			};
			utilities.download('test.json', 'application/json;charset=utf-8', JSON.stringify(wfObj));
			this.setState({ onSubmit: false, wid: undefined });
		}
	},

	componentWillUnmount: function() {
		this.setState({selects: []});
	},

	formName: 'workflowBuilderForm',

	handleSubmit: function() {
		let wid=utilities.uuid();
		let form=this.refs[this.formName];
		let jobIds=[];
		for (let key of _.keys(form)) {
			if (form[key].name && form[key].value && form[key].name.toString().length && form[key].value.toString().length) jobIds[form[key].name]=form[key].value;
		}
		this.setState({onSubmit: true, wid: wid});
		WorkflowActions.buildWorkflow(wid, jobIds);
	},

	handleAddSteps: function() {
		let total=this.state.total + 3;
		this.setState({total: total});
	},

	buildSelectOptions: function(jobs) {
		let options=jobs.map(function(o, i) {
			return {
				optionValue: o.job_id,
				optionChild: i + ': ' + o.appId
			};
		});
		options.unshift({optionValue: '', optionChild: 'Select a job'});
		return options;
	},

	render: function() {
		let jobsStore=this.state.jobsStore;
		let onSubmit=this.state.onSubmit;
		if (this.state.total > this.state.selects.length) {
			let options=this.buildSelectOptions(jobsStore.jobs);
			for (let i=this.state.selects.length; i < this.state.total; i++) {
				let props={
					name: i,
					type: 'select',
					label: 'Workflow Step ' + i
				};
				this.state.selects.push(<BaseInput key={i} data={props} options={options} isSelect={true} />);
			}
		}

		let markup=(
			<form ref={this.formName} >
				{this.state.selects}
				<ButtonToolbar>
					<Button
						bsStyle='primary'
						disabled={onSubmit}
						onClick={onSubmit ? null : this.handleSubmit}>
						{onSubmit ? 'Building...' : 'Build Workflow'}
					</Button>
					<Button
						bsStyle='primary'
						disabled={onSubmit}
						onClick={onSubmit ? null : this.handleAddSteps}>
						Add Steps
					</Button>
				</ButtonToolbar>
			</form>
		);
		return markup;
	}
});

module.exports = WorkflowBuilderForm;
