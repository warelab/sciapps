'use strict';

import React from 'react';

const Workflow=React.createClass({
	render: function() {
		return (
			<div className="welcome">
                        <div className="section">
			Automatic workflow chains individual apps together. The workflow avoids manual submission of each individual job, reduces data transfer among intermediate steps, and further optimizes computation through advanced workflow engines. The inputs-outputs relationship among subsequent steps is automatically captured after running each app in the workflow once (by following step 2 below).<br /><br />
                        The workflow is built by following steps:<br />
			<ol className="list">
                        <li>Run each app used in the workflow at least once</li>
                        <li>Whenever possible, feed the outputs from the right History column as input for subsequent steps</li>
                        <li>Check whether outputs from each step are as expected; fix the error and repeat step 1 and 2 if not</li>
                        <li>Follow this link to build a workflow</li>
                        </ol><br />
                        Example workflows:<br />
			<ul className="list">
                        <li>GLM</li>
                        <li>Annotation</li>
                        <li>Variant calling</li>
                        <li>Expression</li>
                        <li>Methylation</li>
                        <li>sRNA</li>
                        <li>Chip-seq</li>
			</ul>
                        </div>
                        </div>

		);
	}
});

module.exports = Workflow;
