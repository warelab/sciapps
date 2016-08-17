'use strict';

import React from 'react';
import Reflux from 'reflux';
import {Modal, Button} from 'react-bootstrap';
import BaseInput from './baseInput.js';
import UserStore from '../stores/userStore.js';
import UserActions from  '../actions/userActions.js';

const UserLoginBox=React.createClass({
	mixins: [Reflux.connect(UserStore, 'userStore')],

	hideLoginBox: function() {
		UserActions.hideLoginBox();
	},

	handleLogin: function() {
		let u=this.refs.username.state.value;
		let p=this.refs.password.state.value;
		UserActions.login(u, p);
	},

	render: function() {
		let showLoginBox=this.state.userStore.showLoginBox;
		let usernameInput={
			type: 'text',
			name: 'username',
			label: 'Username'
		};
		let passwordInput={
			type: 'password',
			name: 'password',
			label: 'Password'
		};
		return(
			<Modal show={showLoginBox} onHide={this.hideLoginBox}>
				<Modal.Header closeButton>
					<Modal.Title>User Login</Modal.Title>
				</Modal.Header>
				<Modal.Body>
					<BaseInput ref="username" data={usernameInput} />
					<BaseInput ref="password" data={passwordInput} />
				</Modal.Body>
				<Modal.Footer>
					<Button bsStyle='primary' onClick={this.handleLogin}>Login</Button>
				</Modal.Footer>
			</Modal>
		);
	}
});

module.exports = UserLoginBox;
