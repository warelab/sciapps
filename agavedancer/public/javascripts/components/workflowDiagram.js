'use strict';

import React from 'react';
import Reflux from 'reflux';
import _ from 'lodash';
import WorkflowStore from '../stores/workflowStore.js';
import WorkflowActions from '../actions/workflowActions.js';
import {Modal, Button} from 'react-bootstrap';
import Mermaid from './mermaid.js';

const WorkflowDiagram=React.createClass({
	mixins: [Reflux.connect(WorkflowStore, 'workflowStore')],

	hideWorkflowDiagram: function() {
		WorkflowActions.hideWorkflowDiagram();
	},

	render: function() {
		let workflowStore=this.state.workflowStore;
		let workflowDiagramDef=workflowStore.workflowDiagramDef;
		let showWorkflowDiagram=workflowDiagramDef ? true : false;

		return (
			<Modal bsSize="large" show={showWorkflowDiagram} onHide={this.hideWorkflowDiagram}>
				<Modal.Header closeButton>
					<Modal.Title>Workflow Diagram</Modal.Title>
				</Modal.Header>
				<Modal.Body>
					<Mermaid diagramDef={workflowDiagramDef}/>
				</Modal.Body>
				<Modal.Footer>
					<Button onClick={this.hideWorkflowDiagram}>Close</Button>
				</Modal.Footer>
			</Modal>
		);
	}
});

module.exports= WorkflowDiagram;
