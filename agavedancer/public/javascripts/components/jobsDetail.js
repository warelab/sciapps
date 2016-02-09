'use strict';

import React from 'react';
import Reflux from 'reflux';
import _ from 'lodash';
import JobsActions from '../actions/jobsActions.js';
import JobsStore from '../stores/jobsStore.js';
import SettingsStore from '../stores/settingsStore.js';
import {Modal, Table, Button} from 'react-bootstrap';

function toLocaleString(date) {
	return (new Date(date).toLocaleString());
}

const JobsDetail=React.createClass({
	mixins: [Reflux.connect(JobsStore, 'jobsStore'), Reflux.connect(SettingsStore, 'settingsStore')],
	
	hideJob: function() {
		JobsActions.hideJob();
	},

	render: function() {
		let jobsStore=this.state.jobsStore;
		let settings=this.state.settingsStore.settings;
		let jobDetail=jobsStore.jobDetail;
		let showJob=jobsStore.showJob;
		let output_link;
		if (jobDetail.status && _.includes(['FINISHED','FAILED'], jobDetail.status)) {
			let link_url=settings.output_url + '/' + jobDetail.archivePath;
			output_link=(<a href={link_url} target='_blank'>{link_url}</a>);
		}
		let job_info=(
			<Table striped condensed hover>
				<tbody>
						<tr key='job_info_name'><th>Name:</th><td>{jobDetail.name}</td></tr>
						<tr key='jobs_info_status'><th>Status:</th><td>{jobDetail.status}</td></tr>
						<tr key='job_info_submitTime'><th>Submitted on:</th><td>{toLocaleString(jobDetail.submitTime)}</td></tr>
						<tr key='job_info_startTime'><th>Started on:</th><td>{toLocaleString(jobDetail.startTime)}</td></tr>
						<tr key='job_info_endTime'><th>Finished on:</th><td>{toLocaleString(jobDetail.endTime)}</td></tr>
						<tr key='job_info_results'><th>Results:</th><td>{output_link}</td></tr>
				</tbody>
			</Table>
		);

		return (
			<Modal show={showJob} onHide={this.hideJob}>
				<Modal.Header>
					<Modal.Title>Details on job {jobDetail.name}</Modal.Title>
				</Modal.Header>
				<Modal.Body>
					{job_info}
				</Modal.Body>
				<Modal.Footer>
					<Button onClick={this.hideJob}>Close</Button>
				</Modal.Footer>
			</Modal>
		);
	}
});

module.exports= JobsDetail;
