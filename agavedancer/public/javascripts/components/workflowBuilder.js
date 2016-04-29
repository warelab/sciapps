'use strict';

import React from 'react';
import Reflux from 'reflux';
import WorkflowStore from '../stores/workflowStore.js';
import WorkflowActions from '../actions/workflowActions.js';
import {Button, Panel} from 'react-bootstrap';
import WorkflowBuilderForm from './workflowBuilderForm.js';
import utilities from '../libs/utilities.js';

const WorkflowBuilder=React.createClass({
	mixins: [Reflux.connect(WorkflowStore, 'workflowStore')],

	getInitialState: function() {
		return { onBuild: false, wid: undefined };
	},

	render: function() {
		return (
			<div className="welcome">
			Automatic workflow chains individual apps together.<br />
			<WorkflowBuilderForm />
      </div>
		);
	}
});

module.exports = WorkflowBuilder;
