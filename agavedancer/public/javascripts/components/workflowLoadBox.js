'use strict';

import React from 'react';
import Reflux from 'reflux';
import WorkflowStore from '../stores/workflowStore.js';
import WorkflowActions from '../actions/workflowActions.js';
import {Input, Button} from 'react-bootstrap';
import utilities from '../libs/utilities.js';

const WorkflowLoadBox=React.createClass({
	getInitialState: function() {
		return {
			value: ''
		};
	},

	handleValueChange: function(event) {
		this.setState({value: event.target.value});
		utilities.readAsText(event.target, function(e) {
			WorkflowActions.setWorkflowSteps(JSON.parse(e.target.result));
		}.bind(this));
	},

	render: function() {
		let props={
			type: 'file',
			value: this.state.value,
			className: 'wf-load-box',
			label: 'Upload a workflow json file saved on your computer',
			onChange: this.handleValueChange
		}
		let markup=(
			<Input {...props} />
		);
		return markup;
	}
});

module.exports = WorkflowLoadBox;
