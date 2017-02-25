'use strict';

import React from 'react';
import Reflux from 'reflux';
import {Panel, Table} from 'react-bootstrap';
import JobsStore from '../stores/jobsStore.js';

const FilesInfo=React.createClass({
	mixins: [Reflux.connect(JobsStore, 'jobsStore')],
	
	render: function() {
		let jobsStore=this.state.jobsStore;
		let fileDetail=jobsStore.inputs[this.props.fileId];
		let markup=<div />;
		let tbody
		let keys=['line_name', 'organism_name', 'organism_scientific_name', 'organism_taxon_id'];
		if (fileDetail.system !== undefined) {
			tbody=keys.map(function (key) {
				let label=key.replace(/_/g, ' ');
				let labelSize=label.length * 11;
				return (
					<tr key={key}><th width={labelSize}>{label}:</th><td>{fileDetail[key]}</td></tr>
				);
			});
			let fileName=fileDetail['path'].replace(/.*\// ,'');
			let link='http://' + fileDetail['system'] + '/example_data/' + fileDetail['path'];
			tbody.push(<tr key={'source'}><th><a href={link} target="_blank">Link to File</a></th><td></td></tr>);
			markup=(
				<Table striped condensed hover>
					<tbody>
						{tbody}
					</tbody>
				</Table>
			);
		}
		let header='File information (' + fileDetail['path'].replace(/.*\// ,'') + ')';
		return (
			<Panel header={header}>
				{markup}
			</Panel>
		);
	}
});

module.exports = FilesInfo;
