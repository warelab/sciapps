'use strict';

import React from 'react';
import {Panel, Table} from 'react-bootstrap';

var AppsInfo=React.createClass({
	render: function() {
		var appDetail=this.props.appDetail;
		var header="Details on application";
		var app_info='info';
		if (appDetail && undefined !== appDetail.name) {
			header+=" " + appDetail.name + ":";
			var inputsDetail=appDetail.inputs.map(function (inputItem) {
				return (
					<tr key={inputItem.id}><th>{inputItem.id}:</th><td>{inputItem.value.default}</td></tr>
				);
			});
			var paramsDetail=appDetail.parameters.map(function (paramItem) {
				return (
					<tr key={paramItem.id}><th>{paramItem.id}:</th><td>{paramItem.details.label}</td></tr>
				);
			});
			app_info=(
				<Table striped condensed hover>
					<tbody>
						<tr key='name'><th>Name:</th><td>{appDetail.name}</td></tr>
						<tr key='version'><th>Version:</th><td>{appDetail.version}</td></tr>
						<tr key='shortDescription'><th>Short Desc:</th><td>{appDetail.shortDescription}</td></tr>
						{inputsDetail}
						{paramsDetail}
					</tbody>
				</Table>
			);
		}
		return (
			<Panel header={header}>
				{app_info}
			</Panel>
		);
	}
});

module.exports = AppsInfo;
