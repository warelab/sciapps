'use strict';

import Reflux from 'reflux';

const UserActions=Reflux.createActions([
	'login',
	'logout',
	'checkLogin',
	'showLoginBox',
	'hideLoginBox'
]);

module.exports = UserActions;
