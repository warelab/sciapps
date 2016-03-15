'use strict';

import React from 'react';
import JobsActions from '../actions/jobsActions.js';
import {ListGroup, ListGroupItem, Button, ButtonToolbar, Panel} from 'react-bootstrap';

var JobsItem=React.createClass({
	getInitialState: function() {
		return {isOpen: false};
	},

	showJob: function() {
		JobsActions.showJob(this.props.data.id);
	},

	showJobResults: function() {
		if (! this.state.isOpen) {
			JobsActions.showJobResults(this.props.data.id);
		}
		this.setState({ isOpen: !this.state.isOpen });
	},

	render: function() {
		let displayName=this.props.index + ': ' + this.props.data.appId;
		let isSubmitting=undefined === this.props.data.id;
		let setting=this.props.setting;
		let results=this.props.results;
		let jobId=this.props.data.id;
		let resultsItemNodes='Loading ...';
		if (results && results.length) {
			resultsItemNodes=results.filter(function(item) {
				return item.name.includes(jobId) ? false : true;
			}).map(function(result, index) {
				let href=setting.output_url + '/' + result.path;
				return (
					<ListGroupItem key={index}><a href={href} target='_blank'>{result.name}</a></ListGroupItem>
				);
			});
		}

		return (
			<ListGroupItem>
				{displayName}
				<ButtonToolbar>
					<Button key='status' disabled={isSubmitting} bsSize='xsmall' bsStyle='info' onClick={isSubmitting ? null : this.showJob} >Status</Button>
					<Button key='results' disabled={isSubmitting} bsSize='xsmall' bsStyle='info' onClick={isSubmitting ? null : this.showJobResults} >Results</Button>
				</ButtonToolbar>
				<Panel collapsible expanded={this.state.isOpen}>
					<ListGroup>
						{resultsItemNodes}
					</ListGroup>
				</Panel>
			</ListGroupItem>
		);
	}
});

module.exports= JobsItem;
