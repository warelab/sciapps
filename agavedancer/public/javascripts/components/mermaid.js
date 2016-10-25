'use strict';

import React from 'react';
import ReactDOM from "react-dom";
import {mermaidAPI} from 'mermaid';

mermaidAPI.initialize({
	cloneCssStyles: true,
	flowchart: {
		useMaxWidth: true,
		htmlLabels: true
	}
});

const Mermaid=React.createClass({
	getDefaultProps: function() {
		return {
			name: 'mermaid'
		};
	},

	getInitialState: function() {
		return {
			html: 'Loading diagram...'
		};
	},

	componentDidMount: function() {
		this.renderDiagram(this.props.name, this.props.diagramDef);
	},

	componentWillUnmount: function() {
		this.setState({html: 'Loading diagram...'});
	},

	componentWillReceiveProps: function(nextProps) {
		this.renderDiagram(nextProps.name, nextProps.diagramDef);
	},

	renderDiagram: function(name, diagramDef) {
		//let svg=mermaidAPI.render(name, diagramDef, (svg) => {
			//let w = window.open('', 'Workflow_Diagram');
			//w.document.head.innerHTML='<link rel="stylesheet" type="text/css" href="' + window.location.origin + '/styles/mermaid.css" />';
			//w.document.body.innerHTML = svg;
			//this.setState({html:svg});	
		//});
		mermaidAPI.render(name, diagramDef, function(svg) {
			this.setState({html:svg});
		}.bind(this));
	},

	render: function() {
		return (
			<div className="mermaid" dangerouslySetInnerHTML={{__html: this.state.html}}></div>
		);
	}
});

module.exports = Mermaid;
