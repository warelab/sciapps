'use strict';

import React from 'react';
import _ from 'lodash';
import {Panel, ButtonInput, Input} from 'react-bootstrap';
import AppsParam from './appsParam.js';
import AppsInput from './appsInput.js';
import AgaveWebActions from '../actions/agaveWebActions.js';

function sortByOrder(unsorted) {
	return _.sortBy(unsorted, function(item) {
		return item.value.order;
	});
}

var AppsForm=React.createClass({

	handleSubmit: function() {
		let formData=new FormData(this.refs.agaveWebAppForm);
		AgaveWebActions.submitAgaveWebApps(formData);
	},

	render: function() {
		var appDetail=this.props.appDetail;
		var app_inputs='inputs';
		var app_params='params';
		var header='New job using application';
		if (appDetail && undefined !== appDetail.name) {
			header+=' ' + appDetail.name + ':';
			let sortedInputs=sortByOrder(appDetail.inputs);
			app_inputs=sortedInputs.map(function(input) {
				return(<AppsInput data={input} />);
			});
			let sortedParams=sortByOrder(appDetail.parameters);
			app_params=sortedParams.map(function(param) {
				return(<AppsParam data={param} />);
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
					<ButtonInput value='Submit' onClick={this.handleSubmit} />
				</form>
			</Panel>
		);
	}
});

module.exports = AppsForm;
