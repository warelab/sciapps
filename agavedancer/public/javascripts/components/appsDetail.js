'use strict';

import React from 'react';
import {Panel, Table, Jumbotron} from 'react-bootstrap';
import AppsInfo from './appsInfo.js';
import AppsForm from './appsForm.js';

var AppsDetail=React.createClass({
	render: function() {
		var appDetail=this.props.appDetail;
		var markup;
		if (appDetail && undefined !== appDetail.name) {
			markup=(
				<div>
					<AppsForm appDetail={appDetail} />
					<AppsInfo appDetail={appDetail} />
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
