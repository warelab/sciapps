'use strict';

import React from 'react';
import {Panel, Table, Jumbotron} from 'react-bootstrap';
import AppsInfo from './appsInfo.js';
import AppsForm from './appsForm.js';

const AppsDetail=React.createClass({
	render: function() {
		let appDetail=this.props.appDetail, settings=this.props.settings, dsItems=this.props.dsItems;
		let markup;
		if (appDetail && undefined !== appDetail.name) {
			markup=(
				<div>
					<AppsForm appDetail={appDetail} settings={settings} dsItems={dsItems} />
					<AppsInfo appDetail={appDetail} settings={settings} />
				</div>
			);
		} else {
			markup=(
				<Jumbotron><h1>Welcome!</h1></Jumbotron>
			);
		}
		return markup;
	}
});

module.exports = AppsDetail;
