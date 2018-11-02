'use strict';

import React from 'react';
import Reflux from 'reflux';
import {Alert} from 'react-bootstrap';

const Warning=React.createClass({

	render: function() {
		let setting=_config.setting;
		let warning=<div />;
		if (setting.site_warning_content) {
			warning=<Alert bsStyle='warning'>{setting.site_warning_content}</Alert>;
		}
		return warning;
	}
});

module.exports = Warning;
