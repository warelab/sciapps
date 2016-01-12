'use strict';

import React from 'react';
import AgaveWebActions from '../actions/agaveWebActions.js';
import {Modal, Table, Button} from 'react-bootstrap';

function toLocaleString(date) {
	return (new Date(date).toLocaleString());
}

var JobsDetail=React.createClass({
	hideJobDetail: function() {
		AgaveWebActions.hideAgaveWebJobs();
	},

	render: function() {
		let settings=this.props.settings;
		let jobDetail=this.props.jobDetail;
		let showJobModal=settings._showJobModal;
		let output_link;
		if ('FINISHED' === jobDetail.status || 'FAILED' === jobDetail.status) {
			let link_url=settings.output_url + '/' + jobDetail.archivePath;
			output_link=(<a href={link_url} target='_blank'>{link_url}</a>);
		}
		let job_info=(
			<Table striped condensed hover>
				<tbody>
						<tr key='job_info_name'><th>Name:</th><td>{jobDetail.name}</td></tr>
						<tr key='jobs_info_status'><th>Status:</th><td>{jobDetail.status}</td></tr>
						<tr key='job_info_message'><th>Message:</th><td>{jobDetail.message}</td></tr>
						<tr key='job_info_submitTime'><th>Submitted on:</th><td>{toLocaleString(jobDetail.submitTime)}</td></tr>
						<tr key='job_info_startTime'><th>Started on:</th><td>{toLocaleString(jobDetail.startTime)}</td></tr>
						<tr key='job_info_endTime'><th>Finished on:</th><td>{toLocaleString(jobDetail.endTime)}</td></tr>
						<tr key='job_info_results'><th>Results:</th><td>{output_link}</td></tr>
				</tbody>
			</Table>
		);

		return (
			<Modal show={showJobModal} onHide={this.hideJobDetail}>
				<Modal.Header>
					<Modal.Title>Details on job {jobDetail.name}</Modal.Title>
				</Modal.Header>
				<Modal.Body>
					{job_info}
				</Modal.Body>
				<Modal.Footer>
					<Button onClick={this.hideJobDetail}>Close</Button>
				</Modal.Footer>
			</Modal>
		);
	}

});

module.exports= JobsDetail;
