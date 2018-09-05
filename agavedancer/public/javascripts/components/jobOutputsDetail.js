'use strict';

import React from 'react';
import ReactDom from 'react-dom'; 
import Reflux from 'reflux';
import _ from 'lodash';
import JobsActions from '../actions/jobsActions.js';
import Dialog from 'react-bootstrap-dialog';
import {BootstrapTable, TableHeaderColumn} from 'react-bootstrap-table';
import {Modal, ButtonToolbar, ButtonGroup, Button, Panel, Tooltip, Glyphicon, Input} from 'react-bootstrap';

const JobOutpusDetail=React.createClass({
	getInitialState: function() {
		return {isStage: false};
	},

	handleShare: function(e) {
		let table=this.refs.table;
		let setting=_config.setting;
		let idx=table.store.getSelectedRowKeys()[0];
		if (idx !== undefined) {
			let job=this.props.job;
			let outputs=this.props.outputs;
			let name=outputs[idx].name;
			let url=[setting.anon_prefix, setting.archive_home.replace('/', ''), job.archivePath, name].join('/');
			let input=<Input id='copy' name='copy' value={url} type='textarea' readOnly />
			let copyBtn={
				label: 'Copy to clipboard',
				className: 'btn-primary',
				func: () => {
					let dom=document.getElementById('copy');
					dom.select();
					document.execCommand('Copy');
				}
			};
			this.refs.dialog.show({
				title: 'URL for genome (or web) browser',
				body: input,
				actions: [
					copyBtn,
					Dialog.OKAction()
				],
				bsSize: 'medium'
			});
		}
	},

	handleVisualize: function(e) {
		let table=this.refs.table;
		let setting=_config.setting;
		let idx=table.store.getSelectedRowKeys()[0];
		if (idx !== undefined) {
			let job=this.props.job;
			let staged=this.props.staged;
			let outputs=this.props.outputs;
			let name=outputs[idx].name;
			if (staged) {
				this.setState({isStage: true});
				let visualhref;
				staged.then(function(target) {
					this.setState({isStage: false});
					if ( _.includes(target.list, name)) {
						if (name.endsWith('.tgz')) {
							name=name.replace(/\.tgz$/, '');
						}
						visualhref=setting.output_url[target.system];
						visualhref=visualhref.replace(/__path__/, target.path + '/' + name);
					} else {
						visualhref=[setting.anon_prefix, setting.archive_home.replace('/', ''), job.archivePath, name].join('/');
					}
					window.open(visualhref, '_blank');
				}.bind(this));
			}
		}
	},

	createCustomButtonGroup: function(props) {
		let isStage=this.state.isStage;
		let tooltipload=<Tooltip id="tooltipload">Load</Tooltip>;
		let spinning=isStage ? <img src='/spinning_small.svg' /> : undefined;
		return (
			<div>
			<ButtonGroup>
				<Button key='share' bsStyle='info' onClick={this.handleShare}><Glyphicon glyph='link'/> URL</Button>
				<Button key='view' bsStyle='warning' disabled={isStage} onClick={isStage ? null : this.handleVisualize}><Glyphicon glyph='play-circle'/> Visualize</Button>
			</ButtonGroup>
			&nbsp;&nbsp;{spinning}
			</div>
		);
	},

	render: function() {
		let job=this.props.job;
		let outputs=this.props.outputs;
		let displayName=this.props.displayName;
		let setting=_config.setting;
		let selectRowProp={
			mode: 'radio'
		};
		let options={
			btnGroup: this.createCustomButtonGroup
		};
		let outputsTable=<div><img src='/spinning.svg' /> Loading ...</div>;
		let outputsData;
		if (outputs && (job.archivePath || job.outputPath)) {
			outputsData=outputs.map(function(o, i) {
				let oname=o.name;
				return {id: i, name: oname};
			});
			outputsTable=(
				<BootstrapTable ref='table' data={outputsData} striped={true} hover={true} selectRow={selectRowProp} options={options} tableHeaderClass={"col-hidden"}>
					<TableHeaderColumn isKey={true} dataField="id" hidden={true}>ID</TableHeaderColumn>
					<TableHeaderColumn dataField="name" dataAlign="left">Ouput Name</TableHeaderColumn>
				</BootstrapTable>
			);
		}

		return (
			<Modal show={this.props.show} onHide={this.props.hide} ref='modal' >
				<Modal.Header closeButton>
					<Modal.Title>Visualize or get URLs for genome (or web) browser</Modal.Title>
				</Modal.Header>
				<Modal.Body>
					<Panel header={displayName}>
						{outputsTable}
					</Panel>
					<Dialog ref='dialog' />
				</Modal.Body>
				<Modal.Footer>
					<Button bsStyle='primary' onClick={this.props.hide}>Close</Button>
				</Modal.Footer>
			</Modal>
		);
	}
});

module.exports = JobOutpusDetail;
