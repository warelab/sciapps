'use strict';

import React from 'react';
import Reflux from 'reflux';
import _ from 'lodash';
import JobsActions from '../actions/jobsActions.js';
import JobsStore from '../stores/jobsStore.js';
import {Modal, Table, Button} from 'react-bootstrap';

function toLocaleString(date) {
	return (new Date(date).toLocaleString());
}

const JobsDetail=React.createClass({
	mixins: [Reflux.connect(JobsStore, 'jobsStore')],

	getInitialState: function() {
		return { setting: _config.setting };
	},
	
	hideJob: function() {
		JobsActions.hideJob();
	},

	render: function() {
		let jobsStore=this.state.jobsStore;
		let setting=this.state.setting;
		let jobDetail=jobsStore.jobDetail;
		let showJob=jobsStore.showJob;
		let output_link;
		if (jobDetail.status && _.includes(['FINISHED','FAILED'], jobDetail.status)) {
			let link_url=setting.output_url + '/' + jobDetail.archivePath;
			output_link=(<a href={link_url} target='_blank'>{link_url}</a>);
		}
		let job_info=(
			<Table striped condensed hover>
				<tbody>
						<tr key='job_info_id'><th>ID:</th><td>{jobDetail.id}</td></tr>
						<tr key='job_info_name'><th>Name:</th><td>{jobDetail.name}</td></tr>
						<tr key='jobs_info_status'><th>Status:</th><td>{jobDetail.status}</td></tr>
						<tr key='job_info_submitTime'><th>Submitted on:</th><td>{jobDetail.submitTime ? toLocaleString(jobDetail.submitTime) : ''}</td></tr>
						<tr key='job_info_startTime'><th>Started on:</th><td>{jobDetail.startTime ? toLocaleString(jobDetail.startTime) : ''}</td></tr>
						<tr key='job_info_endTime'><th>Finished on:</th><td>{jobDetail.endTime ? toLocaleString(jobDetail.endTime) : ''}</td></tr>
						<tr key='job_info_results'><th>Results:</th><td>{output_link}</td></tr>
				</tbody>
			</Table>
		);

		return (
			<Modal show={showJob} onHide={this.hideJob}>
				<Modal.Header>
					<Modal.Title>Details on {jobDetail.name}</Modal.Title>
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
