'use strict';

import React from 'react';
import Reflux from 'reflux';
import _ from 'lodash';
import AppsStore from '../stores/appsStore.js';
import AppsActions from '../actions/appsActions.js';
import AppsPanel from './appsPanel.js';
import {PanelGroup} from 'react-bootstrap';

const AppsGroup=React.createClass({
	mixins: [Reflux.connect(AppsStore, 'appsStore')],

	componentDidMount: function() {
		AppsActions.listApps();
	},

	render: function() {
		let appsStore=this.state.appsStore;
		let apps=appsStore.apps;
		let appGroup={};
		for (let app of apps) {
			for (let tag of app.tags) {
				if (! _.has(appGroup, tag)) {
					_.set(appGroup, tag, []);
				}
				_.get(appGroup, tag).push(app);
			}
		}
		let appsPanel=_.keys(appGroup).sort().map(function (tag, index) {
			return <AppsPanel key={index} index={index} header={tag} apps={_.get(appGroup, tag)} expanded={appsStore.filtered}/>
		});
		return (
			<PanelGroup>
				{appsPanel}
			</PanelGroup>
		);
	}
});

module.exports= AppsGroup;
