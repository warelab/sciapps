'use strict';

import React from 'react';
import Reflux from 'reflux';
import DsActions from '../actions/dsActions.js';
import DsStore from '../stores/dsStore.js';
import _ from 'lodash';
import {Modal, ListGroup, ListGroupItem, ButtonToolbar, ButtonGroup, Button, Panel} from 'react-bootstrap';
import DsItem from './dsItem.js';

const DsDetail=React.createClass({
	mixins: [Reflux.connect(DsStore, 'dsStore')],

	hideDataStoreDetail: function() {
		DsActions.hideDataStore();
	},

	handleChangeSource: function(event) {
		DsActions.changeSource('__' + event.target.textContent + '__');
	},

	handleGoup: function() {
		DsActions.showDataStore('..');
	},

	handleRefresh: function() {
		DsActions.refreshDataStore();
	},

	render: function() {
		let user=this.props.user;
		let setting=_config.setting;
		let dsStore=this.state.dsStore;
		let type=dsStore.type;
		let dsSetting=setting.datastore[type];
		let dsDetail=dsStore.dsDetail;
		let showDataStore=dsStore.showDataStore;
		let dsFileNodes='Loading ...';
		let targetPath=dsStore.dsItemPaths[dsStore.target];
		let dsBtnValue=targetPath ? 'Select and Close' : 'Close';
		let sourceButtons=setting.datastore_types.map(function(name) {
			let disabled=!(name === 'exampleData' || user.logged_in);
			let isActive=type === '__' + name + '__';
			return <Button key={name} onClick={disabled ? null : this.handleChangeSource} disabled={disabled} bsStyle={isActive ? 'primary' : 'default'}>{name}</Button>
		}.bind(this));
		let goupButton=<Button key='goup' onClick={dsDetail.is_root ? null : this.handleGoup} >Go up</Button>;
		let refreshButton=<Button key='refresh' onClick={this.handleRefresh} >Refresh</Button>;
		let actionButtons=[goupButton, refreshButton];
		let path;
		if (dsDetail.list) {
			dsFileNodes=_.cloneDeep(dsDetail.list).sort(function (a,b) {
				return a.type.localeCompare(b.type) || a.name.localeCompare(b.name); 
			}).map(function(dsItem) {
				let isChecked=targetPath && targetPath.type === type && targetPath.path === dsDetail.path && targetPath.name === dsItem.name;
				return (
					<DsItem key={dsItem.name} data={dsItem} checked={isChecked} />
				);
			});
			//path=[dsSetting.system, dsSetting.path, dsDetail.path].join('/');
			path=[dsSetting.path, dsDetail.path].join('/');
		}
		return (
			<Modal show={showDataStore} onHide={this.hideDataStoreDetail}>
				<Modal.Header closeButton>
					<Modal.Title>Browse Datastore</Modal.Title>
				</Modal.Header>
				<Modal.Body>
					<ButtonToolbar>
						<ButtonGroup>
							{sourceButtons}
						</ButtonGroup>
						<ButtonGroup>
							{actionButtons}
						</ButtonGroup>
					</ButtonToolbar>
					<Panel header={path}><ListGroup>
						{dsFileNodes}
					</ListGroup></Panel>
				</Modal.Body>
				<Modal.Footer>
					<Button bsStyle='primary' onClick={this.hideDataStoreDetail}>{dsBtnValue}</Button>
				</Modal.Footer>
			</Modal>
		);
	}
});

module.exports = DsDetail;
