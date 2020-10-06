'use strict';

import React from 'react';

const Help=React.createClass({
	render: function() {
		return(
			<div className="welcome">
			<div className="section">
			<div>
				<b>SciApps</b> is a free, public, internet accessible platform for building, running, and sharing scientific workflows. To get started, check the <a href="https://learning.cyverse.org/projects/sciapps_guide/en/latest/"  target="_blank">SciApps platform guide</a>. For questions or suggestions, please contact support@SciApps.org. For source code or local installation of SciApps, please consult the SciApps github page: https://github.com/warelab/sciapps.
			</div>
			<br />
			<br />	
			<div id="myimages">
				<h3>Citations</h3>
			</div>
                        <div id="myimages">
                        </div>
			<div>
				<b>Platform:</b> Wang, L., Lu, Z., Van Buren, P., & Ware, D. (2018). SciApps: a cloud-based platform for reproducible bioinformatics workflows. Bioinformatics, 34(22), 3917-3920 <br/>
				<b>MaizeCODE:</b> Wang L., Lu Z., delaBastide M., et al (2020) Management, Analyses, and Distribution of the MaizeCODE Data on the Cloud. Frontiers in Plant Science, 11:289 <br/>
				<b>BSAseq:</b> Wang L., Lu Z., Regulski M., et al (2020) BSAseq: an interactive and integrated web-based workflow for identification of causal mutations in bulked F2 populations. Bioinformatics. https://doi.org/10.1093/bioinformatics/btaa709
			</div>
			</div>
			</div>
		)
	}
});

module.exports = Help;
