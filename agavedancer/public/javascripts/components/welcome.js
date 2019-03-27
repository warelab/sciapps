'use strict';

import React from 'react';

const Welcome=React.createClass({
	render: function() {
		return(
			<div className="welcome">
				<div className="section">
					<b>SciApps</b> is a cloud-based platform for building, executing, & sharing scientific applications (Apps) and workflows, powered by CyVerse Data Store, Stampede2 cluster of Texas Advanced Computing Center, and a federated system at Cold Spring Harbor Laboratory. 
					<br /><br />
					<center><iframe width="560" height="315" src="https://www.youtube.com/embed/tUhl7obrsEI?rel=0&showinfo=0" frameborder="0" allow="accelerometer; autoplay; encrypted-media; gyroscope; picture-in-picture" allowfullscreen></iframe></center>
                                        <br /><br />
					<center><iframe width="560" height="315" src="https://www.youtube.com/embed/aMsLOqo18fs?rel=0&showinfo=0" frameborder="0" allow="accelerometer; autoplay; encrypted-media; gyroscope; picture-in-picture" allowfullscreen></iframe></center>
					<br />
					<div>
						The SciApps platform is supported by <a href="http://nsf.gov" target="_blank">National Science Foundation</a> (DBI-1265383, IOS-1445025), <a href="https://www.ars.usda.gov/">USDA</a> (1907-21000-030-00D), and in part by  <a href="https://cshl.edu">Cold Spring Harbor Laboratory</a>. 
					</div>
					<br /><br />
					<div id="myimages">
                        			<a href="https://cyverse.org" target="_blank"><img className="mylogo" height="60" src="cyverse.gif" hspace="10" align="middle" /></a>
						&nbsp;&nbsp;&nbsp;&nbsp;
                                                <a href="https://www.tacc.utexas.edu/" target="_blank"><img className="mylogo" height="50" src="tacc.gif" hspace="10" align="middle" /></a>
                                                &nbsp;&nbsp;&nbsp;&nbsp;
                        			<a href="https://nsf.gov" target="_blank"><img classNmae="mylogo" height="70" src="nsf.gif" hspace="10" align="middle" /></a>
                        			&nbsp;&nbsp;&nbsp;&nbsp;
                                                <a href="https://www.ars.usda.gov/" target="_blank"><img classNmae="mylogo" height="60" src="usda.gif" hspace="10" align="middle" /></a>
                                                &nbsp;&nbsp;&nbsp;&nbsp;
                                                <a href="https://cshl.edu" target="_blank"><img classNmae="mylogo" height="60" src="cshl.gif" hspace="10" align="middle" /></a>
					</div>
				</div>
			</div>
		)
	}
});

module.exports = Welcome;
