'use strict';

import React from 'react';
import {Panel, Table} from 'react-bootstrap';

var AppsInfo=React.createClass({
	render: function() {
		let appDetail=this.props.appDetail;
		let header='Details on application';
		let app_info='info';
		if (appDetail && undefined !== appDetail.name) {
			header+=' ' + appDetail.name + ':';
			let inputsDetail=appDetail.inputs.map(function (inputItem) {
				let inputKey='app_info_' + inputItem.id;
				return (
					<tr key={inputKey}><th>{inputItem.id}:</th><td>{inputItem.value.default}</td></tr>
				);
			});
			let paramsDetail=appDetail.parameters.map(function (paramItem) {
				let paramKey='app_info_' + paramItem.id;
				return (
					<tr key={paramKey}><th>{paramItem.id}:</th><td>{paramItem.details.label}</td></tr>
				);
			});
			app_info=(
				<Table striped condensed hover>
					<tbody>
						<tr key='app_info_name'><th>Name:</th><td>{appDetail.name}</td></tr>
						<tr key='app_info_version'><th>Version:</th><td>{appDetail.version}</td></tr>
						<tr key='app_info_shortDescription'><th>Short Desc:</th><td>{appDetail.shortDescription}</td></tr>
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
