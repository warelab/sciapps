'use strict';

import React from 'react';
import AgaveWebActions from '../actions/agaveWebActions.js';
import {Modal, ListGroup, ListGroupItem, Button} from 'react-bootstrap';
import DSItem from './dsItem.js';

const DSDetail=React.createClass({
	hideDataStoreDetail: function() {
		AgaveWebActions.hideAgaveWebDataStore();
	},

	render: function() {
		let dsDetail=this.props.dsDetail;
		let settings=this.props.settings;
		let showDataStoreModal=settings._showDataStoreModal;
		let dsFileNodes;
		if (dsDetail.list && dsDetail.list.length) {
			dsFileNodes=dsDetail.list.filter(function(dsItem) {
				return dsItem.name !== '.';
			}).map(function(dsItem) {
				return (
					<DSItem key={dsItem.name} data={dsItem} settings={settings} />
				);
			});
		}
		return (
			<Modal show={showDataStoreModal} onHide={this.hideDataStoreDetail}>
				<Modal.Header>
					<Modal.Title>Listing contents for path: {dsDetail.path}</Modal.Title>
				</Modal.Header>
				<Modal.Body>
					<ListGroup>
						{dsFileNodes}
					</ListGroup>
				</Modal.Body>
				<Modal.Footer>
					<Button disabled onClick={this.chooseDSFile}>Choose</Button>
					<Button onClick={this.hideDataStoreDetail}>Close</Button>
				</Modal.Footer>
			</Modal>
		);
	}
});

module.exports = DSDetail;
