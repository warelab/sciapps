'use strict';

import React from 'react';
import Reflux from 'reflux';
import AppsStore from '../stores/appsStore.js';
import JobsStore from '../stores/jobsStore.js';
import {Panel, Table} from 'react-bootstrap';

const AppsInfo=React.createClass({
	mixins: [Reflux.connect(AppsStore, 'appsStore'), Reflux.connect(JobsStore, 'jobsStore')],

	render: function() {
		let appDetail=this.state.appsStore.appDetailCache[this.props.appId];
		let app_info, jobDetail;
		let header=appDetail.name + '(' + appDetail.version + '): ' + appDetail.longDescription + ' <a href="' + appDetail.helpURI + '" target="_blank">Source</a>'; 
		if (appDetail && undefined !== appDetail.name) {
			if (this.props.jobId !== undefined) {
				jobDetail==this.state.JobsStore.jobDetailCache[this.props.jobId];
			}
			let inputsDetail=appDetail.inputs.map(function (inputItem) {
				let inputKey='app_info_' + inputItem.id;
				let jobInputValue=jobDetail ? <td>jobDetail.inputs[inputItem.id]</td> : undefined;
				return (
					<tr key={inputKey}><th>{inputItem.details.label}:</th><td>{inputItem.details.description}</td>{jobInputValue}</tr>
				);
			});
			let paramsDetail=appDetail.parameters.map(function (paramItem) {
				let paramKey='app_info_' + paramItem.id;
				let jobParamValue=jobDetail ? <td>jobDetail.parameters[paramItem.id]</td> : undefined;
				return (
					<tr key={paramKey}><th>{paramItem.details.label}:</th><td>{paramItem.details.description}</td>{jobParamValue}</tr>
				);
			});
			app_info=(
				<Table striped condensed hover>
					<tbody>
						{this.props.detailed ? inputsDetail : null}
						{this.props.detailed ? paramsDetail : null}
						<tr><th>{appDetail.name}({appDetail.version}): {appDetail.longDescription} (<a href={appDetail.helpURI} target="_blank">source</a>)</th><td></td></tr>
					</tbody>
				</Table>
			);
		}
		header='More information';
		app_info=(
			<div>{appDetail.name}: {appDetail.longDescription} (<a href={appDetail.helpURI} target="_blank">Source</a>)</div>
		);
		return (
			<Panel header={header}>
				{app_info}
			</Panel>
		);
	}
});

module.exports = AppsInfo;
