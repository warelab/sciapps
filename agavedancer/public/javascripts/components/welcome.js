'use strict';

import React from 'react';

const Welcome=React.createClass({
	render: function() {
		return(
			<div className="welcome">
			<div className="section">
			<b>SciApps</b> is a web-based platform for executing scientific applications. The web interface of the application is powered by the Agave API of the <a href="http://www.cyverse.org" target="_blank">CyVerse</a> project. To wrap your application with the Agave API, please consult the <a href="https://github.com/iPlantCollaborativeOpenSource/iplant-agave-sdk" target="_blank">Agave app development guide</a>.
				<br /><br />
			You can run any apps listed on the left column by following steps:<br />
			</div>
			<div className="section">
			1. Click on the app name to bring up the app interface form<br />
			2. Fill the form for required inputs<br />
			<ul className="list">
			<li>Upload from your computer</li>
			<li>An URL</li>
			<li>From our data store</li>
			<li>Hold and drag the results file (in the right column) to the URL field</li>
			</ul>
			</div>
			<div className="section">
			3. Fill the form for required parameters<br />
			4. Fill your email address to get notification on job completion (recommended)<br />
			5. "Submit Job", job status and results show up in the right column (lost if refresh/close your browser)<br />
			</div>
			<br />
			<div id="myimages">
                        <a href="http://cyverse.org" target="_blank"><img className="mylogo"src="http://www.maizecode.org/cyverse.png" hspace="10" align="middle" /></a>
&nbsp;&nbsp;&nbsp;&nbsp;
			<a href="http://cshl.edu" target="_blank"><img classNmae="mylogo" src="http://www.maizecode.org/cshl.png" hspace="10" align="middle" /></a>
			</div>
			<br />
			<div>
			This platform is utilizing infrastructure provided by the CyVerse project at Cold Spring Harbor laboratory, with support from the <a href="http://nsf.gov" target="_blank">National Science Foundation</a>. 
			</div>
			</div>
		)
	}
});

module.exports = Welcome;
