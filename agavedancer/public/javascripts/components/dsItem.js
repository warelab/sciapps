'use strict';

import React from 'react';
import DsActions from '../actions/dsActions.js';
import {ListGroupItem, Button, Tooltip, OverlayTrigger, Glyphicon} from 'react-bootstrap';

const DsItem=React.createClass({
	getInitialState: function() {
		return { clickTimer: undefined };
	},

  /*
  ### Description
  handle double click item; if item is a directory, open the directory, or select the item and set value to target input if it is a file 
  */
	handleDblClick: function(event) {
		let content=event.target.textContent;
		switch(this.props.data.type) {
			case 'dir':
				//DsActions.selectDataStoreItem();
				DsActions.showDataStore(content);
				break;
			case 'file':
				DsActions.selectDataStoreItem(content);
				break;
		}
	},

  /*
  ### Description
  handle single click item; select the item and set value to target input 
  */
	handleClick: function(event) {
		let content=event.target.textContent;
		switch(this.props.data.type) {
			case 'dir':
				DsActions.selectDataStoreItem(content.slice(0,-1));
				break;
			case 'file':
				DsActions.selectDataStoreItem(content);
				break;
		}
	},

  /*
  ### Description
  handle selection an itenm by single click or double click
  */
	handleSelect: function(event) {
		if (this.state.clickTimer) {
			clearTimeout(this.state.clickTimer);
			this.state.clickTimer=undefined;
			this.handleDblClick(event);
		} else {
			this.state.clickTimer=setTimeout(() => {
				this.state.clickTimer=undefined;
				this.handleClick(event);
			}, 250);
		}
	},

	handleCheck: function() {
		DsActions.selectDataStoreItem(this.props.data.name);
	},

	render: function() {
		let checkedGlyph=this.props.checked ? 'check' : 'unchecked';
		let data=this.props.data;
		let isFile=data.type === 'file';
		let typeGlyph=isFile ? 'file' : 'folder-close';
		let markup=(
			<ListGroupItem>
				<Button bsSize='medium' bsStyle='link' onClick={this.handleCheck} >
					<Glyphicon glyph={checkedGlyph} />
				</Button>
				<Glyphicon glyph={typeGlyph} />
				<Button bsStyle='link' onClick={this.handleDblClick}>
					{isFile ? data.name : data.name + '/'}
				</Button>
			</ListGroupItem>
		);
		return markup;
	}
});

module.exports = DsItem;
