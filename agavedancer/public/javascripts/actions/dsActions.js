'use strict';

import Reflux from 'reflux';

const DsActions=Reflux.createActions([
	'refreshDataStore',
	'showDataStore',
	'hideDataStore',
	'setDataStoreItemTarget',
	'selectDataStoreItem',
	'clearDataStoreItem',
	'changeSource',
	'resetState',
	'resetDsDetail'
]);

module.exports = DsActions;

