'use strict';

import React from 'react';

const Help=React.createClass({
	render: function() {
		return(
			<div className="welcome">
			<div className="section">
			<div>
				<b>SciApps</b> is a free, public, internet accessible platform for exploring public data, loading app form, public workflows and job histories, and building worklfows (with the loaded job histories). To execute any jobs or workflows, a CyVerse user account is needed.
			</div>
			<h5>1. Create a CyVerse Account</h5>
				<ul className="list">
					<li><a href="https://user.cyverse.org/register/">Register</a> for a CyVerse account</li>
					<li>In the email you receive when your account is newly created, click the link in the email to validate your email and begin using your account</li>
				</ul>
			<h5>2. Add SciApps service to your account</h5>
				<ul className="list">
					<li>Log in to <a href="http://user.cyverse.org/">CyVerse User Management portal</a></li>
					<li>Under <b>Apps & Services</b> tab, go to the <b>Available Services</b> section at the bottom</li>
					<li>Click <b>Request Access</b> for SciApps</li>
					<li>A folder named as <b>sci_data</b> is created under your root folder: /iplant/home/YOUR_USER_NAME/sci_data</li>
				</ul>
			<h5>3. Upload your data for SciApps</h5>
				<ul className="list">
					<li>Add your data to the <b>sci_data</b> folder for SciApps apps and workflows to access</li>
					<li>Follow <a href="http://www.cyverse.org/learning-center/manage-data">these tutorials</a> for data management</li>
				</ul>
			<h5>4. Build a workflow with Apps listed in the left panel</h5>
				<ul className="list">
					<li>Search,  or click on any Category, then App name, to bring up the App form</li>
						<ul className="list">
							<li>To build a new App, please follow the <a href="https://github.com/cyverse/cyverse-sdk" target="_blank">App Building Guide</a></li>
                        			</ul>
					<li>Fill the form for required inputs (from any sources below) and parameters</li>
						<ul className="list">
							<li><b>Choose File</b> from your computer (&lt; 1.9GB files)</li>
							<li><b>Enter a URL</b> (or paste in the URL field)</li>
							<li><b>Browse DataStore</b></li>
								<ul className="list">
									<li>CyVerse DataStore (under 'shared' or 'user', after login)</li>
									<li>SciApps DataStore (under 'public')</li>
								</ul>
							<li>Holding and dragging the results file URL from the right panel (History) to the URL field</li>
						</ul>
					<li>Submit Job, then job history will show up in the right panel</li>
					<li>Select at least 2 jobs from the right panel, then click on <b>Workflow</b> (from top menu), then <b>Build a workflow</b></li>
				</ul>
			<h5>5. More questions?</h5>
				<ul className="list">
					<li>Post in CyVerse's <a href="http://www.cyverse.org/learning-center/ask-cyverse">ASK forum</a></li>
				</ul>
			</div>
			</div>
		)
	}
});

module.exports = Help;
