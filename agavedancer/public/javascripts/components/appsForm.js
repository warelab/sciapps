'use strict';

import React from 'react';
import Reflux from 'reflux';
import _ from 'lodash';
import {Panel, Button} from 'react-bootstrap';
import BaseInput from './baseInput.js';
import AppsParam from './appsParam.js';
import AppsInput from './appsInput.js';
import JobsActions from '../actions/jobsActions.js';

function sortByOrder(unsorted) {
	return _.sortBy(unsorted, function(item) {
		return item.value.order;
	});
}

const AppsForm=React.createClass({
	getInitialState() {
		return { isSubmitting: false };
	},

	handleSubmit: function() {
		this.setState({isSubmitting: true});
		let formData=new FormData(this.refs.agaveWebAppForm);
		JobsActions.submitJob(this.props.appDetail.id, formData);
		setTimeout(() => {
			this.setState({isSubmitting: false});
		}, 1000);
	},

	render: function() {
		let appDetail=this.props.appDetail;
		let app_inputs='inputs';
		let app_params='params';
		let header='New job using application';
		let isSubmitting=this.state.isSubmitting;
		if (appDetail && undefined !== appDetail.name) {
			header+=' ' + appDetail.name + ':';
			let sortedInputs=sortByOrder(appDetail.inputs);
			app_inputs=sortedInputs.map(function(input) {
				return(<AppsInput key={input.id} data={input} />);
			});
			let sortedParams=sortByOrder(appDetail.parameters);
			app_params=sortedParams.map(function(param) {
				return(<AppsParam key={param.id} data={param} />);
			});
		}
		let jobNameInput={
			type: 'text',
			id: 'jobName',
			name: 'jobName', 
			label: 'Job name',
			placeholder: 'Create a job name',
			help: 'Optional job name'
		};
		let emailInput={
			type: 'email',
			id: '_email',
			name: '_email',
			label: 'Email Address',
			placeholder: 'Enter email',
			help: 'Optional Email for notification'
		};
		return (
			<Panel header={header}>
				<form ref='agaveWebAppForm'>
					<fieldset>
						<legend>Job options</legend>
						<BaseInput data={jobNameInput} isSubmitting={isSubmitting} />
					</fieldset>
					<fieldset>
						<legend>Inputs</legend>
						{app_inputs}
					</fieldset>
					<fieldset>
						<legend>Parameters</legend>
						{app_params}
					</fieldset>
					<fieldset>
						<legend>Notifications</legend>
						<BaseInput data={emailInput} isSubmitting={isSubmitting} />
					</fieldset>
					<Button
						bsStyle='primary'
						disabled={isSubmitting}
						onClick={isSubmitting ? null : this.handleSubmit}>
						{isSubmitting ? 'Submitting...' : 'Submit Job'}
					</Button>
				</form>
			</Panel>
		);
	}
});

module.exports = AppsForm;
