'use strict';

import React from 'react';
//import AgaveWebActions from '../actions/agaveWebActions.js';
import {Panel, Table} from 'react-bootstrap';

var AppsDetail=React.createClass({

	render: function() {
		var appDetail=this.props.appDetail;
		var app_form, app_info;
		app_form='analysis';
		app_info='info';
		if (appDetail && undefined !== appDetail.name) {
			var inputsDetail=appDetail.inputs.map(function (inputItem) {
				return (
					<tr key={inputItem.id}><th>{inputItem.id}</th><td>{inputItem.value.default}</td></tr>
				);
			});
			var paramsDetail=appDetail.parameters.map(function (paramItem) {
				return (
					<tr key={paramItem.id}><th>{paramItem.id}</th><td>{paramItem.details.label}</td></tr>
				);
			});
			app_info=(
				<Table striped condensed hover>
					<tbody>
						<tr key='name'><th>Name</th><td>{appDetail.name}</td></tr>
						<tr key='version'><th>Version</th><td>{appDetail.version}</td></tr>
						<tr key='shortDescription'><th>Short Desc</th><td>{appDetail.shortDescription}</td></tr>
						{inputsDetail}
						{paramsDetail}
					</tbody>
				</Table>
			);
		}
		return (
			<div>
				<Panel header='Analysis'>
					{app_form}
				</Panel>
				<Panel header='Information'>
					{app_info}
				</Panel>
			</div>
		);
	}
});

module.exports = AppsDetail;
