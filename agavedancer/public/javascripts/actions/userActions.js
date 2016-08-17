'use strict';

import Reflux from 'reflux';

const UserActions=Reflux.createActions([
	'login',
	'logout',
	'showLoginBox',
	'hideLoginBox'
]);

module.exports = UserActions;
