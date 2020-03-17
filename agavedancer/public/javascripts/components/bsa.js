'use strict';

import React from 'react';

const BSA=React.createClass({
	render: function() {
		return(
		<div className="welcome">
			<div className="section">
			  <h3>The BSA-Seq workflow</h3>
			  <p>The workflow identifies causal mutations from the resequencing data of a segregated F2 population. The workflow starts with alignment of raw reads using Bowtie2 and calling SNPs using bcftools. SNPs are filtered by the EMS mutation type (G to A or C to T), read depth, background, and minimum allele frequency. SnpEff is then used to annotate the filtered SNPs. Annotated SNPs are passed to SIFT4G for predicting amino acid substitution effects. Finally, results from all three steps are combined for visualization using the app, bsa_viewer. A detailed tutorial is available <a href="https://learning.cyverse.org/projects/SciApps%20Guide/en/latest/bsa.html"  target="_blank">here</a>.</p>
			  <p>The output of the bsa_viewer app can be interactively visualized via an integrated Shiny app. Use can also estimate the segregation probability along each chromosome. The probability is estimated by the deviation of each SNP from the 0.5 SNP ratio, assuming that SNPs near the causal mutation are likely linked to it. Note that this workflow assumes that the causal mutation is recessive where the F1 plants have the wild-type phenotype and the segregation ratio between mutant-type and wild-type phenotypes is 1:3 in the F2 plants. Then all mutant-type F2 plants (around 20) are pooled together for sequencing.</p>
			  <p>You can load the BSA-Seq workflow with the example data from <b>Workflow --> Public workflows</b>. The graphical diagram of the workflow is shown below.</p>
                        </div>
                        <div id="myimages">
				<img className="mylogo" height="796" src="bsa.gif" hspace="10" align="middle" />
			</div>
			<div>
			  <br /><br />
			  <h3>Citation</h3>
			  <p>Wang, L., Lu, Z., Van Buren, P., & Ware, D. (2018). SciApps: a cloud-based platform for reproducible bioinformatics workflows. Bioinformatics, 34(22), 3917-3920.</p>
			</div>
		</div>
		)
	}
});

module.exports = BSA;
