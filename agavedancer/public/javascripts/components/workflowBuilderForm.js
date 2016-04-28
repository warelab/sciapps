'use strict';

import React from 'react';
import Reflux from 'reflux';
import JobsStore from '../stores/jobsStore.js';
import WorkflowStore from '../stores/workflowStore.js';
import WorkflowActions from '../actions/workflowActions.js';

const WorkflowBuilderForm=React.createClass({
	mixins: [Reflux.connect(JobsStore, 'jobsStore'), Reflux.connect(WorkflowStore, 'workflowStore')],

	getInitialState: function() {
		return {
			setting: _config.setting,
			onSubmit: false,
			onValidate: false
		}
	},

	formName: 'workflowBuilderForm',

	handleSubmit: function() {
		let wid=utilities.uuid();
		let form=this.refs[this.formName];
		let jobIds=[];
		for (let key of _.keys(form)) {
			if (form[key].name && form[key].value && form[key].name.toString().length && form[key].value.toString().length) jobIds[form[key].name]=form[key].value;
		}
		WorkflowActions.buildWorkflow(wid, jobs);
	},

	render: function() {
		let jobsStore=this.state.jobsStore;
		let jobs;


		let markup=(
			<form ref={this.formName} >
				<Button
					bsStyle='primary'
					disabled={onSubmit}
					onClick={onSubmit ? null : this.handleSubmit}>
					{onSubmit ? 'Building...' : 'Build Workflow'}
				</Button>
			</form>
		);
		return markup;
	}
});

module.exports = WorkflowBuilderForm;
