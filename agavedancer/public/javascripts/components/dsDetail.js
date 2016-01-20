'use strict';

import React from 'react';
import AgaveWebActions from '../actions/agaveWebActions.js';
import _ from 'lodash';
import {Modal, ListGroup, ListGroupItem, Button} from 'react-bootstrap';
import DSItem from './dsItem.js';

const DSDetail=React.createClass({
	hideDataStoreDetail: function() {
		AgaveWebActions.hideAgaveWebDataStore();
	},

	render: function() {
		let dsDetail=this.props.dsDetail, settings=this.props.settings;
		let showDataStoreModal=settings._showDataStoreModal;
		let dsFileNodes;
		let dsItemUrl=_.get(this.props.dsItems, settings._activeInput);
		let dsBtnValue=dsItemUrl ? "Select and close" : "Close";
		if (dsDetail.list && dsDetail.list.length) {
			dsFileNodes=dsDetail.list.map(function(dsItem) {
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
					<Button bsStyle='primary' onClick={this.hideDataStoreDetail}>{dsBtnValue}</Button>
				</Modal.Footer>
			</Modal>
		);
	}
});

module.exports = DSDetail;
