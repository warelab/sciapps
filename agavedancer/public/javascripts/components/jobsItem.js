'use strict';

import React from 'react';
import JobsActions from '../actions/jobsActions.js';
import {ListGroup, ListGroupItem, Button, ButtonToolbar, Panel} from 'react-bootstrap';

const JobsItem=React.createClass({
	getInitialState: function() {
		return {isOpen: false};
	},

	showJob: function() {
		JobsActions.showJob(this.props.data.id);
	},

	showJobOutputs: function() {
		if (! this.state.isOpen) {
			JobsActions.showJobOutputs(this.props.data.id);
		}
		this.setState({ isOpen: !this.state.isOpen });
	},

	resubmitJob: function() {
		JobsActions.resubmitJob(this.props.data.id);
	},

	render: function() {
		let displayName=this.props.index + ': ' + this.props.data.appId;
		let isSubmitting=undefined === this.props.data.id;
		let setting=this.props.setting;
		let outputs=this.props.outputs;
		let jobId=this.props.data.id;
		let outputsItemNodes='Loading ...';
		if (outputs && outputs.length) {
			outputsItemNodes=outputs.filter(function(item) {
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
					<Button key='outputs' disabled={isSubmitting} bsSize='xsmall' bsStyle='info' onClick={isSubmitting ? null : this.showJobOutputs} >Outputs</Button>
					<Button key='resubmit' disabled={isSubmitting} bsSize='xsmall' bsStyle='info' onClick={isSubmitting ? null : this.resubmitJob} >Resubmit</Button>
				</ButtonToolbar>
				<Panel collapsible expanded={this.state.isOpen}>
					<ListGroup>
						{outputsItemNodes}
					</ListGroup>
				</Panel>
			</ListGroupItem>
		);
	}
});

module.exports= JobsItem;
