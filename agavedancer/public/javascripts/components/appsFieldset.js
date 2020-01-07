'use strict';

import React from 'react';
import Reflux from 'reflux';
import _ from 'lodash';
import {Panel, Button} from 'react-bootstrap';
import AppsParam from './appsParam.js';
import AppsInput from './appsInput.js';
import utilities from '../libs/utilities.js';

const AppsFieldset=React.createClass({

	render: function() {
		let appDetail=_.cloneDeep(this.props.appDetail);
		let index=this.props.index;
		let onValidate=this.props.onValidate;
		let app_inputs, app_params, header='Step ' + index + ': ' + appDetail.name + ' (version ' + appDetail.version + ')';
		if (appDetail && undefined !== appDetail.name) {
			if (appDetail.inputs && appDetail.inputs.length) {
				let sortedInputs=_.sortBy(appDetail.inputs, utilities.getValueOrder);
				app_inputs=sortedInputs.map(function(input) {
					return(<AppsInput key={appDetail.id + ':' + input.id} data={input} onValidate={onValidate} />);
				});
			}
			if (appDetail.parameters &&  appDetail.parameters.length) {
				let sortedParams=_.sortBy(appDetail.parameters, utilities.getValueOrder);
				app_params=sortedParams.map(function(param) {
					return(<AppsParam key={appDetail.id + ':' + param.id} data={param} onValidate={onValidate} />);
				});
			}
		}
		return (
			<Panel header={header}><fieldset>
				{app_inputs}
				{app_params}
			</fieldset></Panel>
		)
	}
});

module.exports = AppsFieldset;
