'use strict';

import React from 'react';
import _ from 'lodash';
import {Panel, Input} from 'react-bootstrap';
import AppsParam from './appsParam.js';

function sortByOrder(unsorted) {
	return _.sortBy(unsorted, function(item) {
		return item.value.order;
	});
}

var AppsForm=React.createClass({
	buildAppsInputs: function(inputs) {
	},
	buildAppsParams: function(params) {
		var sortedParams=sortByOrder(params);
		for (param in sortedParams) {
		}
	},
	buildAppsForm: function(appDetail) {
	},
	render: function() {
		var appDetail=this.props.appDetail;
		var app_form='form';
		var header="New job using application";
		if (appDetail && undefined !== appDetail.name) {
			header+=" " + appDetail.name + ":";
		}
		var app_form=(
			<Panel header={header}>
				{app_form}
			</Panel>
		);
		return app_form;
	}
});

module.exports = AppsForm;

