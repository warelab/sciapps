'use strict';

import React from 'react';
import _ from 'lodash';
import {Panel, Button, Input} from 'react-bootstrap';
import AppsParam from './appsParam.js';
import AppsInput from './appsInput.js';
import AgaveWebActions from '../actions/agaveWebActions.js';

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
		AgaveWebActions.submitAgaveWebApps(formData);
		setTimeout(() => {
			this.setState({isSubmitting: false});
		}, 2000);
	},

	render: function() {
		let appDetail=this.props.appDetail;
		let settings=this.props.settings;
		let app_inputs='inputs';
		let app_params='params';
		let header='New job using application';
		let isSubmitting=this.state.isSubmitting;
		if (appDetail && undefined !== appDetail.name) {
			header+=' ' + appDetail.name + ':';
			let sortedInputs=sortByOrder(appDetail.inputs);
			app_inputs=sortedInputs.map(function(input) {
				return(<AppsInput data={input} settings={settings} />);
			});
			let sortedParams=sortByOrder(appDetail.parameters);
			app_params=sortedParams.map(function(param) {
				return(<AppsParam data={param} settings={settings} />);
			});
		}
		return (
			<Panel header={header}>
				<form ref='agaveWebAppForm'>
					<fieldset>
						<legend>Job options</legend>
						<Input type='text' id="jobName" name="jobName" label="Job name" placeholder="Create a job name" />
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
							<Input type='text' id='_email' name='_email' label="Email Address" placeholder="Enter an email address" />
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
