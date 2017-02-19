'use strict';

import React from 'react';

const Welcome=React.createClass({
	render: function() {
		return(
			<div className="welcome">
			<div className="section">
			<b>SciApps</b> is the web front-end of a federated CyVerse system at Cold Spring Harbor Laboratory, and a web-based platform for building, executing, & sharing scientific applications (Apps) and workflows, and supporting metadata management. 
				<br /><br />
			To build a workflow with Apps listed in the left panel, please follow steps below:<br />
			</div>
			<div className="section">
			<ul className="list">
			<li>Search,  or click on any Category then App name to bring up the App form</li>
			<ul className="list">
			<li>To add a new App, please follow the <a href="https://github.com/cyverse/cyverse-sdk" target="_blank">App Building Guide</a></li>
                        </ul>
			<li>Fill the form for required inputs (from any sources listed below) and parameters</li>
			<ul className="list">
			<li>Uploading from your computer</li>
			<li>A URL</li>
			<li>CyVerse Data Store</li>
			<li>Holding and dragging the results file URL from the right panel (History) to the URL field</li>
			</ul>
			<li>Submit Job, and job history will show up in the right panel</li>
			<li>Select at least 2 jobs in the History panel to build an automated workflow</li>
			</ul>
			</div>
			<br />
			<div id="myimages">
                        <a href="http://cyverse.org" target="_blank"><img className="mylogo"src="http://www.sciapps.org/cyverse.png" hspace="10" align="middle" /></a>
&nbsp;&nbsp;&nbsp;&nbsp;
			<a href="http://cshl.edu" target="_blank"><img classNmae="mylogo" src="http://www.sciapps.org/cshl.png" hspace="10" align="middle" /></a>
			</div>
			<br />
			<div>
			This platform is built by the CyVerse team at Cold Spring Harbor Laboratory, supported by <a href="http://nsf.gov" target="_blank">National Science Foundation</a>. 
			</div>
			</div>
		)
	}
});

module.exports = Welcome;
