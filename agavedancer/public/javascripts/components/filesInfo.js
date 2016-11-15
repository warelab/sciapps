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
		if (fileDetail.system) {
			tbody=keys.map(function (key) {
				let label=key.replace(/_/g, ' ');
				return (
					<tr key={key}><th>{label}:</th><td>{fileDetail[key]}</td></tr>
				);
			});
			let fileName=fileDetail['path'].replace(/.*\// ,'');
			let link=fileDetail['system'] + '/' + fileDetail['path'];
			tbody.push(<tr key={'source'}><th>source:</th><td>{link}</td></tr>);
			markup=(
				<Table striped condensed hover>
					<tbody>
						{tbody}
					</tbody>
				</Table>
			);
		}
		return markup;
	}
});

module.exports = FilesInfo;
