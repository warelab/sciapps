'use strict';

import React from 'react';

const Help=React.createClass({
	render: function() {
		return(
			<div className="welcome">
			<div className="section">
			<div>
				<b>SciApps</b> is a free, public, internet accessible platform for building, running, and sharing scientific workflows. To get started, follow steps below or check the <a href="https://cyverse-sciapps-guide.readthedocs-hosted.com">SciApps platform guide</a>.
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
							<li><b>Choose File</b> from your computer (&lt; 10MB files)</li>
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
                        <h5>5. Why building/using SciApps workflow?</h5>
                                <ul className="list">
                                        <li>For convenience</li>
                                                <ul className="list">
                                                        <li>Submitting multiple analysis jobs simultaneously</li>
                                                        <li>Data relationships, metadata, and real time job status are available on the workflow diagram</li>
                                                        <li>Larger workflow can grow from existing workflows by chaining additional apps</li>
                                                        <li>Smaller workflow can be created from existing workflows by selecting less steps</li>
                                                </ul>
                                        <li>For performance</li>
                                                <ul className="list">
                                                        <li>Jobs are running in parallel (jobs in a workflow will be submitted to cluster once inputs are ready (or dependency is clear))</li>
                                                        <li>Intermediate results are kept close to cluster (avoid unnecessary cross sites data transfer)</li>
                                                </ul>
                                        <li>For reproducibility</li>
                                                <ul className="list">
                                                        <li>Workflow = pipeline + data (which means every re-run will create a new workflow)</li>
                                                        <li>Analysis of a workflow can be shared and completely reproduced with passing (and loading) a lightweight JSON file</li>
                                                </ul>
                                </ul>
			<h5>6. More questions?</h5>
				<ul className="list">
					<li>Post in CyVerse's <a href="http://www.cyverse.org/learning-center/ask-cyverse">ASK forum</a></li>
				</ul>
			</div>
			</div>
		)
	}
});

module.exports = Help;
