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

	hideJob: function() {
		JobsActions.hideJob();
	},

	render: function() {
		let jobsStore=this.state.jobsStore;
		let setting=_config.setting;
		let job_id=jobsStore.showJobId;
		let job=jobsStore.jobDetailCache[job_id];
		let outputs=jobsStore.jobOutputs[job_id];
		let showJob=jobsStore.showJob;
		let markup=<div />;
		//let output_link;
		if (job) {
			let output_link, href;
			if (outputs) {
				if (job.archivePath) {
					href=setting.output_url[job.archiveSystem];
					href=href.replace(/__system__/, job.archiveSystem);
					href=href.replace(/__path__/, job.archivePath);
				} else if (job.outputPath) {
					href=setting.output_url[setting.archive_system];
					href=href.replace(/__system__/, setting.archive_system);
					let archivePath=job.outputPath.replace('/', '/sci_data/results/');
					href=href.replace(/__path__/, archivePath);
				}
				href=href.replace(/__owner__/, job.owner);
				href=href.replace(/\/__home__/, setting.datastore.__home__.home);
				output_link=(<a href={href} target='_blank'>Link to the output folder</a>);
			}
			let job_info=(
				<Table striped condensed hover>
					<tbody>
						<tr key='job_info_id'><th>ID:</th><td>{job.id}</td></tr>
						<tr key='job_info_name'><th>Name:</th><td>{job.name}</td></tr>
						<tr key='jobs_info_status'><th>Status:</th><td>{job.status}</td></tr>
						<tr key='job_info_submitTime'><th>Submitted on:</th><td>{job.submitTime ? toLocaleString(job.submitTime) : ''}</td></tr>
						<tr key='job_info_startTime'><th>Started on:</th><td>{job.startTime ? toLocaleString(job.startTime) : ''}</td></tr>
						<tr key='job_info_endTime'><th>Finished on:</th><td>{job.endTime ? toLocaleString(job.endTime) : ''}</td></tr>
						<tr key='job_info_output'><th>Outputs:</th><td>{output_link}</td></tr>
					</tbody>
				</Table>
			);
			markup=(
				<Modal show={showJob} onHide={this.hideJob}>
					<Modal.Header closeButton>
						<Modal.Title>Details on {job.name}</Modal.Title>
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

		return markup;
	}
});

module.exports= JobsDetail;
