'use strict';

import React from 'react';
import JobsItem from './jobsItem.js';
import AgaveWebActions from '../actions/agaveWebActions.js';
import _ from 'lodash';
import {ListGroup} from 'react-bootstrap';

var JobsList=React.createClass({

	componentDidMount: function() {
		AgaveWebActions.listAgaveWebJobs();
	},

	render: function() {
		let jobs, settings, resultsCache, jobsItemNodes;
		jobs=this.props.jobs;
		settings=this.props.settings;
		resultsCache=this.props.resultsCache;
		if (jobs && jobs.length) {
			jobsItemNodes = jobs.map(function (jobsItem, index) {
				let results=_.get(resultsCache, jobsItem.id);
				return (
					<JobsItem key={index} data={jobsItem} settings={settings} results={results} index={index} />
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
