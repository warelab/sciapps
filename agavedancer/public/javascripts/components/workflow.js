'use strict';

import React from 'react';

const Workflow=React.createClass({
	render: function() {
		return (
			<div className="welcome">
                        <div className="section">
			Automatic workflow chains individual apps together. The workflow constructed here not only reduces manual interactions with each individual app but also optimizes data transfer among intermediate steps. The inputs-outputs relationship among subsequent steps is built by running each app in the workflow once (see more details below).<br /><br />
                        A workflow can be built by following steps:<br />
                        1. Run each app used in the workflow at least once<br />
                        2. Whenever possible, feed the outputs from the right History column as input for subsequent steps<br />
                        3. Check whether outputs from each step are as expected; fix the error and repeat if not<br />
                        4. Follow this link to build a workflow<br />
                        <br />
                        Example workflows:<br />
                        1. GLM<br />
                        2. Annotation<br />
                        3. Variant calling<br />
                        4. Expression<br />
                        5. Methylation<br />
                        6. sRNA<br />
                        7. Chip-seq<br />
                        </div>
                        </div>

		);
	}
});

module.exports = Workflow;
