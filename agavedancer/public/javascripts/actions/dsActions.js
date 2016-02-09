'use strict';

import Reflux from 'reflux';

var DsActions=Reflux.createActions([
	'showDataStore',
	'hideDataStore',
	'setDataStoreItemTarget',
	'selectDataStoreItem',
	'clearDataStoreItem'
]);

module.exports = DsActions;

