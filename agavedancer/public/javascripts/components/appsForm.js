'use strict';

import React from 'react';
import _ from 'lodash';
import {Panel, ButtonInput} from 'react-bootstrap';
import AppsParam from './appsParam.js';
import AppsInput from './appsInput.js';


function sortByOrder(unsorted) {
	return _.sortBy(unsorted, function(item) {
		return item.value.order;
	});
}

var AppsForm=React.createClass({
	render: function() {
		var appDetail=this.props.appDetail;
		var app_inputs='form';
		var app_params='form';
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
				<form>
					<fieldset>
						<legend>Inputs</legend>
						{app_inputs}
					</fieldset>
					<fieldset>
						<legend>Parameters</legend>
						{app_params}
					</fieldset>
					<ButtonInput type='submit' value='Submit' />
				</form>
			</Panel>
		);
	}
});

module.exports = AppsForm;
