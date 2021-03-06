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

  /*
  ### Description
  handle change datastore source
  */
	handleChangeSource: function(event) {
		DsActions.changeSource('__' + event.target.value + '__');
	},

  /*
  ### Description
  handle go to parent directory
  */
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
		let path='';
		let showDataStore=dsStore.showDataStore;
		let dsFileNodes='Loading ...';
		let targetPath=dsStore.dsItemPaths[dsStore.target];
		let dsBtnValue=targetPath ? 'Select and Close' : 'Close';
		let sourceButtons=setting.datastore_types.map(function(name) {
			let disabled=!(name === 'example' || user.authenticated);
			let isActive=type === '__' + name + '__';
			let showName=name.replace(/_+/g, ' ');
			return <Button key={name} onClick={disabled ? null : this.handleChangeSource} disabled={disabled} bsStyle={isActive ? 'primary' : 'default'} value={name}>{showName}</Button>
		}.bind(this));
		let goupButton=<Button key='goup' onClick={typeof dsDetail === 'undefined' || dsDetail.is_root ? null : this.handleGoup} >Go up</Button>;
		let refreshButton=<Button key='refresh' onClick={this.handleRefresh} >Refresh</Button>;
		let actionButtons=[goupButton, refreshButton];
		if (typeof dsDetail !== 'undefined' && dsDetail.list) {
			dsFileNodes=_.cloneDeep(dsDetail.list).sort(function (a,b) {
				if(type.includes('recent') && a.lastModified && b.lastModified) {
					return a.type.localeCompare(b.type) || (Date.parse(b.lastModified) - Date.parse(a.lastModified)) || a.name.localeCompare(b.name);
				} else {
					return a.type.localeCompare(b.type) || a.name.localeCompare(b.name);
				}
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
					<Modal.Title>Browse CyVerse Data Store</Modal.Title>
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
					<p>Note: SciApps can only access your private data in the '<b>sci_data</b>' folder. You can follow this <a href="https://cyverse-sciapps-guide.readthedocs-hosted.com/en/latest/step2.html" target="_blank">instruction</a> to create (if not yet done) the folder.</p>
				</Modal.Body>
				<Modal.Footer>
					<Button bsStyle='primary' onClick={this.hideDataStoreDetail}>{dsBtnValue}</Button>
				</Modal.Footer>
			</Modal>
		);
	}
});

module.exports = DsDetail;
