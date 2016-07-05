'use strict';

import React from 'react';
import Reflux from 'reflux';
import DsActions from '../actions/dsActions.js';
import DsStore from '../stores/dsStore.js';
import _ from 'lodash';
import {Modal, ListGroup, ListGroupItem, Button} from 'react-bootstrap';
import DsItem from './dsItem.js';

const DsDetail=React.createClass({
	mixins: [Reflux.connect(DsStore, 'dsStore')],

	hideDataStoreDetail: function() {
		DsActions.hideDataStore();
	},

	render: function() {
		let dsStore=this.state.dsStore;
		let dsDetail=dsStore.dsDetail;
		let showDataStore=dsStore.showDataStore;
		let dsFileNodes='Loading ...';
		let targetPath=dsStore.dsItemPaths[dsStore.target];
		let dsBtnValue=targetPath ? 'Select and Close' : 'Close';
		if (dsDetail.list && dsDetail.list.length) {
			dsFileNodes=dsDetail.list.sort(function (a,b) {
				return a.type.localeCompare(b.type) || a.name.localeCompare(b.name); 
			}).map(function(dsItem) {
				return (
					<DsItem key={dsItem.name} data={dsItem} />
				);
			});
		}
		return (
			<Modal show={showDataStore} onHide={this.hideDataStoreDetail}>
				<Modal.Header closeButton>
					<Modal.Title>Listing contents for path: {'/' + dsDetail.path}</Modal.Title>
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

module.exports = DsDetail;
