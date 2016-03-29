'use strict';

import React from 'react';
import AppsList from './appsList.js';
import {Panel} from 'react-bootstrap';

const AppsPanel=React.createClass({
	render: function() {
		let markup=(
			<Panel collapsible header={this.props.header} eventKey={this.props.index} expanded={this.props.expanded || undefined} ><AppsList apps={this.props.apps} /></Panel>
		);
		return markup;
	}
});

module.exports = AppsPanel;
