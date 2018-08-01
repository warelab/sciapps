'use strict';

import React from 'react';
import _ from 'lodash';
import JobsActions from '../actions/jobsActions.js';
import JobOutputsDetail from './jobOutputsDetail.js';
import {ListGroup, ListGroupItem, Button, ButtonToolbar, Tooltip, OverlayTrigger, Panel, Glyphicon} from 'react-bootstrap';

const JobsItem=React.createClass({
	getInitialState: function() {
		return {isOpen: false, checked: false, showJobOutputsDetail: false};
	},

	componentWillReceiveProps: function(nextProps) {
		let checked=nextProps.checked;
		this.setState({ checked: checked });
	},

	showJob: function() {
		if (this.props.job.job_id) {
			JobsActions.showJob(this.props.job.job_id);
		}
	},

	showJobOutputs: function() {
		if (! this.state.isOpen && this.props.job.job_id) {
			JobsActions.setJobOutputs(this.props.job.job_id);
		}
		this.setState({ isOpen: !this.state.isOpen });
	},

	resubmitJob: function() {
		if (this.props.job.job_id) {
			JobsActions.resubmitJob(this.props.job.job_id);
		}
	},

	showJobOutputsDetail: function() {
		if (! this.state.showJobOutputsDetail) {
			JobsActions.stageJobOutputs(this.props.job.job_id);
			this.setState({ showJobOutputsDetail: true });
		}
	},

	hideJobOutputsDetail: function() {
		if (this.state.showJobOutputsDetail) {
			this.setState({ showJobOutputsDetail: false });
		}
	},

	handleCheck: function() {
		let checked=!this.state.checked;
		if (checked) {
			JobsActions.addWorkflowBuilderJobIndex(this.props.index);
		} else {
			JobsActions.removeWorkflowBuilderJobIndex(this.props.index);
		}
	},

	render: function() {
		let app=this.props.app;
		let job=this.props.job
		let outputs=this.props.outputs;
		let staged=this.props.staged;
		let setting=_config.setting;
		let appId=job.appId;
		let jobId=job.job_id;
		let displayName=(this.props.index + 1) + ': ';
		if (jobId === undefined) {
			//displayName=displayName + ' (Submitting) ';
		} else if (jobId === 0) {
			displayName=displayName + '(Failed) ';
		}
		displayName=displayName + appId;
		let isSubmitting=undefined === jobId;
		let isFailed=0 === jobId;
		//let enableCheck=this.props.enableCheck;
		let enableCheck=true;
		//let outputsItemNodes='Loading ...';
		let checkedGlyph=this.state.checked ? 'check' : 'unchecked';
		let tooltipvis = (<Tooltip id="tooltipvis">Visualize Outputs</Tooltip>);
		let tooltipout = (<Tooltip id="tooltipout">Display Outputs</Tooltip>);
		let tooltipsta = (<Tooltip id="tooltipsta">Job Status</Tooltip>);
		let tooltipres = (<Tooltip id="tooltipres">Relaunch Job</Tooltip>);
		let addedornot=this.state.checked ? 'Click to Remove' : 'Add to Workflow';
		let tooltipadd = (<Tooltip id="tooltipadd">{addedornot}</Tooltip>);
		let outputsItemNodes='Loading ...';
		let jobOutputsDetail;
		//if (app && (job.archivePath || job.outputPath)) {
		if (outputs && (job.archivePath || job.outputPath)) {
			jobOutputsDetail=(
				<JobOutputsDetail job={job} outputs={outputs} show={this.state.showJobOutputsDetail} hide={this.hideJobOutputsDetail} displayName={displayName} staged={staged}/>
			);
			outputsItemNodes=outputs.map(function(o, i) {
				let oname=o.name;
				let href;
				if (job.archivePath) {
					href=setting.output_url[job.archiveSystem];
					href=href.replace(/__system__/, job.archiveSystem);
					href=href.replace(/__path__/, (job.archivePath + '/' + oname));
				} else if (job.outputPath) {
					href=setting.output_url[setting.archive_system];
					href=href.replace(/__system__/, setting.archive_system);
					let archivePath=job.outputPath.replace('/', '/sci_data/results/');
					href=href.replace(/__path__/, (archivePath + '/' + oname));
				}
				href=href.replace(/__owner__/, job.owner);
				href=href.replace(/\/__home__/, setting.datastore.__home__.home);
				let linkBtn, visualBtn;
				linkBtn=<a href={href} target='_blank'>{oname}</a>
				if (staged && _.includes(staged.list, oname)) {
					let visualhref=setting.output_url[staged.system];
					visualhref=visualhref.replace(/__path__/, staged.path + '/' + oname);
					visualBtn=<Button key='visual' bsSize='small' bsStyle='info' href={visualhref} target='_blank'><Glyphicon glyph='play-circle' /></Button>
				}

				return (
					<ListGroupItem key={i}>
						{linkBtn}
					</ListGroupItem>
				);
			});
		}

		let markup=(
			<ListGroupItem>
				<ButtonToolbar>
					<OverlayTrigger placement="bottom" overlay={tooltipout}>
						<Button key='outputs' bsSize='medium' bsStyle='link' disabled={isSubmitting || isFailed} onClick={isSubmitting || isFailed ? null : this.showJobOutputs} >{displayName}</Button>
					</OverlayTrigger>
					<OverlayTrigger placement="bottom" overlay={tooltipvis}>
			    	<Button key='visual' bsSize='medium' bsStyle='link' disabled={! jobOutputsDetail} onClick={! jobOutputsDetail ? null : this.showJobOutputsDetail} ><Glyphicon glyph='eye-open' /></Button>
					</OverlayTrigger>
					<OverlayTrigger placement="bottom" overlay={tooltipres}>
			    	<Button key='resubmit' bsSize='medium' bsStyle='link' disabled={isSubmitting || isFailed || ! job.id} onClick={isSubmitting || isFailed || !job.id? null : this.resubmitJob} ><Glyphicon glyph='repeat' /></Button>
					</OverlayTrigger>
					<OverlayTrigger placement="bottom" overlay={tooltipsta}>
						<Button key='status' bsSize='medium' bsStyle='link' disabled={isSubmitting || isFailed} onClick={isSubmitting || isFailed ? null : this.showJob} ><Glyphicon glyph='info-sign' /></Button>
					</OverlayTrigger>
          <OverlayTrigger placement="bottom" overlay={tooltipadd}>
						<Button key='check' bsSize='medium' bsStyle='link' disabled={!enableCheck || isSubmitting || isFailed || ! job.id} onClick={isSubmitting || isFailed || ! job.id ? null : this.handleCheck} ><Glyphicon glyph={checkedGlyph} /></Button>
					</OverlayTrigger>
			  </ButtonToolbar>
				<Panel collapsible expanded={this.state.isOpen}>
					<ListGroup>
						{outputsItemNodes}
					</ListGroup>
				</Panel>
				{jobOutputsDetail}
			</ListGroupItem>
		);
		return markup;
	}
});

module.exports= JobsItem;
