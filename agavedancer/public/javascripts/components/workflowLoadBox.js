'use strict';

import React from 'react';
import Reflux from 'reflux';
import WorkflowStore from '../stores/workflowStore.js';
import WorkflowActions from '../actions/workflowActions.js';
import {Modal, Input, Button} from 'react-bootstrap';
import utilities from '../libs/utilities.js';

const WorkflowLoadBox=React.createClass({
	mixins: [Reflux.connect(WorkflowStore, 'workflowStore')],
	
	getInitialState: function() {
		return {
			value: ''
		};
	},

	hideWorkflowLoadBox: function() {
		WorkflowActions.hideWorkflowLoadBox();
	},

	handleValueChange: function(event) {
		this.setState({value: event.target.value});
		utilities.readAsText(event.target, function(e) {
			WorkflowActions.setWorkflowSteps(JSON.parse(e.target.result));
		}.bind(this));
		this.hideWorkflowLoadBox();
	},

	render: function() {
		let workflowStore=this.state.workflowStore;
		let showWorkflowLoadBox=workflowStore.showWorkflowLoadBox;
		let props={
			type: 'file',
			value: this.state.value,
			className: 'wf-load-box',
			label: 'Upload a workflow json file saved on your computer',
			onChange: this.handleValueChange
		}
		let markup=(
			<Modal show={showWorkflowLoadBox} onHide={this.hideWorkflowLoadBox}>
				<Modal.Body>
					<Input {...props} />
				</Modal.Body>
				<Modal.Footer>
					<Button onClick={this.hideWorkflowLoadBox}>Close</Button>
				</Modal.Footer>
			</Modal>
		);
		return markup;
	}
});

module.exports = WorkflowLoadBox;
