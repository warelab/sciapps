'use strict';

import React from 'react';

const Welcome=React.createClass({
	render: function() {
		return(
			<div className="welcome">
			<div className="section">
			<b>SciApps</b> is a web-based platform for building, executing, & sharing scientific applications (apps) and workflows, and supporting metadata management. All apps supported by this platform are built with the <a href="https://agaveapi.co/" target="_blank">Agave API</a>. To build a new app with the Agave API, please consult the <a href="https://github.com/iPlantCollaborativeOpenSource/iplant-agave-sdk" target="_blank">Agave app development guide</a>.
				<br /><br />
			You can run any apps listed on the left column by following steps:<br />
			</div>
			<div className="section">
			1. Click on the app name to bring up the app interface form<br />
			2. Fill the form for required inputs<br />
			<ul className="list">
			<li>Uploading from your computer</li>
			<li>A URL</li>
			<li>CyVerse Data Store</li>
			<li>Holding and dragging the results file from the right column to the URL field</li>
			</ul>
			</div>
			<div className="section">
			3. Fill the form for required parameters<br />
			4. Fill your email address to get notification on job completion (recommended)<br />
			5. "Submit Job", job history will show up in the right column<br />
			</div>
			<br />
			<div id="myimages">
                        <a href="http://cyverse.org" target="_blank"><img className="mylogo"src="http://www.sciapps.org/cyverse.png" hspace="10" align="middle" /></a>
&nbsp;&nbsp;&nbsp;&nbsp;
			<a href="http://cshl.edu" target="_blank"><img classNmae="mylogo" src="http://www.sciapps.org/cshl.png" hspace="10" align="middle" /></a>
			</div>
			<br />
			<div>
			This platform is built by the <a href="http://cyverse.org" target="_blank">CyVerse</a> team at Cold Spring Harbor Laboratory, with support from the <a href="http://nsf.gov" target="_blank">National Science Foundation</a>. 
			</div>
			</div>
		)
	}
});

module.exports = Welcome;
