'use strict';

import React from 'react';
import {Panel, Table} from 'react-bootstrap';

var AppsInfo=React.createClass({
	render: function() {
		let appDetail=this.props.appDetail;
		let header=appDetail.name + '(' + appDetail.version + '): ' + appDetail.longDescription; 
		let app_info='info';
		if (appDetail && undefined !== appDetail.name) {
			let inputsDetail=appDetail.inputs.map(function (inputItem) {
				let inputKey='app_info_' + inputItem.id;
				return (
					<tr key={inputKey}><th>{inputItem.details.label} ( {inputItem.details.argument}):</th><td>{inputItem.details.description}</td></tr>
				);
			});
			let paramsDetail=appDetail.parameters.map(function (paramItem) {
				let paramKey='app_info_' + paramItem.id;
				return (
					<tr key={paramKey}><th>{paramItem.details.label} ( {paramItem.details.argument}):</th><td>{paramItem.details.description}</td></tr>
				);
			});
			app_info=(
				<Table striped condensed hover>
					<tbody>
						{inputsDetail}
						{paramsDetail}
						<tr><th><a href={appDetail.helpURI} target="_blank">Source</a></th><td></td></tr>
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
