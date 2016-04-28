'use strict';

import React from 'react';
import Reflux from 'reflux';
import WorkflowStore from '../stores/workflowStore.js';
import WorkflowActions from '../actions/workflowActions.js';
import {Button, Panel} from 'react-bootstrap';
import utilities from '../libs/utilities.js';

const WorkflowBuilder=React.createClass({
	mixins: [Reflux.connect(WorkflowStore, 'workflowStore')],

	getInitialState: function() {
		return { onBuild: false, wid: undefined };
	},

	componentDidUpdate: function(prevProps, prevState) {
		let workflowStore=this.state.workflowStore;
		let wf=workflowStore.workflows[this.state.wid];
		if (this.state.onBuild && wf && wf.completed) {
			let wfObj={
				id:	wf.id,
				name: 'test_wf',
				steps: wf.steps
			};
			utilities.download('test.json', 'application/json;charset=utf-8', JSON.stringify(wfObj));
			this.setState({ onBuild: false, wid: undefined });
		}
	},

	testWorkflow: function() {
		let wid=utilities.uuid();
		let jobs=[
			'4853251334283718170-242ac113-0001-007',
			'688707076778028570-242ac113-0001-007',
			'4577730763006218726-242ac113-0001-007',
			'8186737218570424806-242ac113-0001-007'
		];
		this.setState({onBuild: true, wid: wid});
		WorkflowActions.buildWorkflow(wid, jobs);
	},

	render: function() {
		return (
			<div className="welcome">
			Automatic workflow chains individual apps together.<br />
			Build a test:<Button bsStyle="link" disabled={this.state.onBuild} onClick={this.testWorkflow}>HERE</Button>
      </div>
		);
	}
});

module.exports = WorkflowBuilder;
