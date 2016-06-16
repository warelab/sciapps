'use strict';

import Reflux from 'reflux';

const DsActions=Reflux.createActions([
	'showDataStore',
	'hideDataStore',
	'setDataStoreItemTarget',
	'selectDataStoreItem',
	'clearDataStoreItem',
	'resetDsDetail'
]);

module.exports = DsActions;

