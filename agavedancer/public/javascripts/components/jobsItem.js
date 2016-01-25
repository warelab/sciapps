'use strict';

import React from 'react';
import AgaveWebActions from '../actions/agaveWebActions.js';
import {ListGroup, ListGroupItem, Button, ButtonToolbar, Panel} from 'react-bootstrap';

var JobsItem=React.createClass({
	getInitialState: function() {
		return {isOpen: false};
	},

	showJobDetail: function() {
		AgaveWebActions.showAgaveWebJobs(this.props.data.id);
	},

	showJobResults: function() {
		AgaveWebActions.showAgaveWebJobResults(this.props.data.id);
		this.setState({ isOpen: !this.state.isOpen });
	},

	render: function() {
		let displayName=this.props.index + ': ' + this.props.data.appId;
		let isSubmitting=undefined === this.props.data.id;
		let settings=this.props.settings;
		let results=this.props.results;
		let resultsItemNodes;
		if (results && results.length) {
			resultsItemNodes=results.map(function(result, index) {
				let href=settings.output_url + '/' + result.path;
				return (
					<ListGroupItem key={index}><a href={href} target='_blank'>{result.name}</a></ListGroupItem>
				);
			});
		}
		if (undefined === resultsItemNodes) {
			resultsItemNodes='No result yet'
		}

		return (
			<ListGroupItem>
				{displayName}
				<ButtonToolbar>
					<Button key='status' disabled={isSubmitting} bsSize='xsmall' bsStyle='info' onClick={isSubmitting ? null : this.showJobDetail} >Status</Button>
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

