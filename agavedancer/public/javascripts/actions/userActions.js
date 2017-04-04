'use strict';

import Reflux from 'reflux';

const UserActions=Reflux.createActions([
	'login',
	'logout',
	'setUser',
	'showLoginBox',
	'hideLoginBox'
]);

module.exports = UserActions;
