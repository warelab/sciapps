'use strict';

import React from 'react';
import Reflux from 'reflux';
import WorkflowStore from '../stores/workflowStore.js';
import WorkflowActions from '../actions/workflowActions.js';
import AppsActions from '../actions/appsActions.js';
import {Panel, Input, Button} from 'react-bootstrap';
import utilities from '../libs/utilities.js';

const WorkflowLoader=React.createClass({
	mixins: [Reflux.connect(WorkflowStore, 'workflowStore')],
	
	getInitialState: function() {
		return {
			fileValue: '',
			textValue: ''
		};
	},

	handleFileValueChange: function(event) {
		this.setState({fileValue: event.target.value});
		utilities.readAsText(event.target, function(e) {
			WorkflowActions.setRemoteWorkflow(e.target.result, 'json');
		}.bind(this));
	},

	handleTextValueChange: function(event) {
		this.setState({textValue: event.target.value});
		WorkflowActions.setRemoteWorkflow(event.target.value, 'url');
	},

	handleSubmit: function() {
		WorkflowActions.loadRemoteWorkflow();
		AppsActions.showPage('workflowRunner');
	},

	render: function() {
		let workflowStore=this.state.workflowStore;
		let showWorkflowLoadBox=workflowStore.showWorkflowLoadBox;
		let fileprops={
			type: 'file',
			value: this.state.fileValue,
			label: 'Upload a workflow json file saved on your computer',
			onChange: this.handleFileValueChange
		};
		let textprops={
			type: 'text',
			value: this.state.textValue,
			label: 'or using an url',
			onChange: this.handleTextValueChange
		};
		let header="Load a workflow json file";
		let markup=(
			<Panel header={header}>
				<Input {...fileprops} />
				<Input {...textprops} />
				<Button bsStyle='primary' onClick={this.handleSubmit}>Load Workflow</Button>;
			</Panel>
		);
		return markup;
	}
});

module.exports = WorkflowLoader;
