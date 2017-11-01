'use strict';

import React from 'react';
import Reflux from 'reflux';
import {Panel, Table} from 'react-bootstrap';
import JobsStore from '../stores/jobsStore.js';

const FilesInfo=React.createClass({
	mixins: [Reflux.connect(JobsStore, 'jobsStore')],

	render: function() {
		let jobsStore=this.state.jobsStore;
		let setting=_config.setting;
		let fileDetail=jobsStore.fileDetailCache[this.props.fileId];
		let markup=<div />;
		let tbody=[];
		let keys=['line_name', 'organism_name', 'organism_scientific_name', 'organism_taxon_id', 'file_type', 'file_format', 'file_description'];
		if (fileDetail.system !== undefined) {
			keys.forEach(function (key) {
				if (fileDetail[key] !== undefined) {
					let label=key.replace(/_/g, ' ');
					let labelSize=label.length * 11;
					tbody.push(
						<tr key={key}><th width={labelSize}>{label}:</th><td>{fileDetail[key]}</td></tr>
					);
				}
			});
			let jobOwner=fileDetail.path.replace(/\/.*/, '');
			let href=setting.output_url[fileDetail.system];
			href=href.replace(/__owner__/, jobOwner);
			href=href.replace(/__system__/, fileDetail.system);
			href=href.replace(/__path__/, fileDetail.path);
			tbody.push(<tr key={'source'}><th><a href={href} target="_blank">Link to File</a></th><td></td></tr>);
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
