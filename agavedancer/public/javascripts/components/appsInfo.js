'use strict';

import React from 'react';
import Reflux from 'reflux';
import {Panel, Table} from 'react-bootstrap';

const AppsInfo=React.createClass({
	render: function() {
		let appDetail=this.props.appDetail;
		let jobDetail=this.props.jobDetail;
		let detailed=this.props.detailed;
		let markup=<div />;
		let app_info;
		let header;
		if (appDetail && undefined !== appDetail.name) {
			if (detailed) {
				//header=appDetail.name + '(' + appDetail.version + '): ' + appDetail.longDescription + ' <a href="' + appDetail.helpURI + '" target="_blank">Source</a>'; 
				header=<span>{appDetail.name + '(' + appDetail.version + '): ' + appDetail.longDescription} (<a href={appDetail.helpURI} target='_blank'>source</a>)</span>; 
				let inputsDetail=appDetail.inputs.map(function (inputItem) {
					let inputKey='app_info_' + inputItem.id;
					let jobInputValue=jobDetail ? <td className='col-xs-4'>{jobDetail.inputs[inputItem.id]}</td> : undefined;
					return (
						<tr key={inputKey}><th className='col-xs-2'>{inputItem.details.label}:</th><td className='col-xs-4'>{inputItem.details.description}</td>{jobInputValue}</tr>
					);
				});
				let paramsDetail=appDetail.parameters.map(function (paramItem) {
					let paramKey='app_info_' + paramItem.id;
					let jobParamValue=jobDetail ? <td className='col-xs-4'>{jobDetail.parameters[paramItem.id]}</td> : undefined;
					return (
						<tr key={paramKey}><th className='col-xs-2'>{paramItem.details.label}:</th><td className='col-xs-4'>{paramItem.details.description}</td>{jobParamValue}</tr>
					);
				});
				app_info=(
					<Table striped condensed hover>
						<tbody>
							{inputsDetail}
							{paramsDetail}
							<tr><th>{appDetail.name}({appDetail.version}): {appDetail.longDescription} (<a href={appDetail.helpURI} target='_blank'>source</a>)</th><td></td></tr>
						</tbody>
					</Table>
				);
			} else {
				header='App information (' + appDetail.name + ' ' + appDetail.version + ')';
				app_info=(
					<div>{appDetail.name}: {appDetail.longDescription} (<a href={appDetail.helpURI} target="_blank">Source</a>)</div>
				);
			}
			markup=(
				<Panel header={header}>
					{app_info}
				</Panel>
			);
		}
		return markup;
	}
});

module.exports = AppsInfo;
