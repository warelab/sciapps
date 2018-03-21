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
		AppsActions.debouncedListApps();
	},

	render: function() {
		let appsStore=this.state.appsStore;
		let apps=appsStore.apps;
		//let appGroup={Private: [], Public: []};
		let appGroup={};
		for (let app of apps) {
			for (let tag of app.tags) {
				if (! appGroup[tag]) {
					appGroup[tag]=[];
				}
				appGroup[tag].push(app);
			}
		}
		let privateApps=appGroup['Private'];
		delete appGroup['Private'];
		let tags=_.keys(appGroup).sort();
		if (privateApps.length) {
			tags.unshift('Private');
			appGroup['Private']=privateApps;
		}
		let appsPanel=tags.map(function (tag, index) {
			return <AppsPanel key={index} index={index} header={tag} apps={appGroup[tag]} expanded={appsStore.filtered}/>
		});
		return (
			<PanelGroup>
				{appsPanel}
			</PanelGroup>
		);
	}
});

module.exports= AppsGroup;
