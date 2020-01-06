'use strict';

import React from 'react';
import ReactDom from 'react-dom'; 
import Reflux from 'reflux';
import _ from 'lodash';
import WorkflowActions from '../actions/workflowActions.js';
import WorkflowStore from '../stores/workflowStore.js';
import {Modal, Table, Button} from 'react-bootstrap';

const WorkflowMetadataDetail=React.createClass({
	mixins: [Reflux.connect(WorkflowStore, 'workflowStore')],

	hideWorkflowMetadata: function() {
		WorkflowActions.hideWorkflowMetadata();
	},

	render: function() {
		let workflowStore=this.state.workflowStore;
		let setting=_config.setting;
		let showWorkflowMetadata=workflowStore.showWorkflowMetadata;
		let workflowDetail=workflowStore.workflowDetail;
		let markup=<div />;

		if (showWorkflowMetadata) {
      let metadata=workflowDetail ? workflowStore.metadata[workflowDetail.workflow_id] : undefined;
      delete metadata.metadata_id;
      if (metadata) {
        let row=[];
        _.keys(metadata).sort(function(a, b) {
          a=a.toLowerCase();
          b=b.toLowerCase();
          if (a < b) {
            return -1;
          } else if (a > b) {
            return 1;
          } else {
            return 0;
          }
        }
        ).forEach(function(k) {
          row.push(<tr key={k}><th>{k}</th><td>{metadata[k]}</td></tr>);
        });

        let body=(
          <Table striped condensed hover>
            <tbody>{row}</tbody>
          </Table>
        );
			  markup=(
				  <Modal show={showWorkflowMetadata} onHide={this.hideWorkflowMetadata}>
					  <Modal.Header closeButton>
						  <Modal.Title>Metadata</Modal.Title>
					  </Modal.Header>
					  <Modal.Body>
						  {body}
					  </Modal.Body>
					  <Modal.Footer>
						  <Button onClick={this.hideWorkflowMetadata}>Close</Button>
					  </Modal.Footer>
				  </Modal>
			  );
      }
		}

		return markup;
	}
});

module.exports = WorkflowMetadataDetail;
