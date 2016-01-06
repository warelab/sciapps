'use strict';

import React from 'react';
import JobsItem from './jobsItem.js';
import AgaveWebActions from '../actions/agaveWebActions.js';
import {ListGroup} from 'react-bootstrap';

var JobsList=React.createClass({

	componentDidMount: function() {
		AgaveWebActions.listAgaveWebJobs();
	},

	render: function() {
		let jobs, settings, jobsItemNodes;
		jobs=this.props.jobs;
		settings=this.props.settings;
		if (jobs && jobs.length) {
			jobsItemNodes = jobs.map(function (jobsItem) {
				return (
					<JobsItem key={jobsItem.id} data={jobsItem} settings={settings} />
				);
			});
		}

		return (
			<ListGroup>
				{jobsItemNodes}
			</ListGroup>
		);
	}
});

module.exports = JobsList;
