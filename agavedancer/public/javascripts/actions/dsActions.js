'use strict';

import Reflux from 'reflux';

var DsActions=Reflux.createActions([
	'showDataStore',
	'hideDataStore',
	'setDataStoreItemTarget',
	'selectDataStoreItem',
	'clearDataStoreItem',
	'resetDsDetail'
]);

module.exports = DsActions;

