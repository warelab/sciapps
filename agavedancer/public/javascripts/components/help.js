'use strict';

import React from 'react';

const Help=React.createClass({
	render: function() {
		return(
			<div className="welcome">
			<div className="section">
			<div>
				<b>SciApps</b> is a free, public, internet accessible platform for building, running, and sharing scientific workflows. To get started, check the <a href="https://cyverse-sciapps-guide.readthedocs-hosted.com">SciApps platform guide</a>. For questions or suggestions, please contact support@SciApps.org.
			</div>
			</div>
			</div>
		)
	}
});

module.exports = Help;
