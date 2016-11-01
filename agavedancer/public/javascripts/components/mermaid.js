'use strict';

import React from 'react';
import ReactDOM from "react-dom";
import {mermaidAPI} from 'mermaid';

const Mermaid=React.createClass({
	getDefaultProps: function() {
		return {
			name: 'mermaid'
		};
	},

	getInitialState: function() {
		return {
			def: '',
			html: 'Loading diagram...'
		};
	},

	componentDidMount: function() {
		this.renderDiagram(this.props.name, this.props.diagramDef);
	},

	componentWillReceiveProps: function(nextProps) {
		this.renderDiagram(nextProps.name, nextProps.diagramDef);
	},

	renderDiagram: function(name, diagramDef) {
		let element=ReactDOM.findDOMNode(this);
		if (diagramDef !== this.state.def) {
			element.innerHTML=null;
			mermaidAPI.render(name, diagramDef, function(svg, bindFunctions) {
				element.innerHTML=svg;
				bindFunctions(element);
			}.bind(this));
		}
	},

	render: function() {
		return (
			<div className="mermaid" />
		);
	}
});

module.exports = Mermaid;
