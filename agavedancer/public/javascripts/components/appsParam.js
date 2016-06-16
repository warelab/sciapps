'use strict';

import React from 'react';
import _ from 'lodash';
import BaseInput from './baseInput.js';
import AppsBoolParam from './appsBoolParam.js';

const AppsParam=React.createClass({
	buildAgaveAppsSelectOption: function(option) {
		let optionChild, optionValue;
		if (_.isString(option)) {
			optionValue=option;
			optionChild=option;
		} else {
			option=_.flatten(_.pairs(option));
			optionValue=option[0];
			optionChild=option[1];
		}
		return {
			optionValue: optionValue,
			optionChild: optionChild
		};
	},

	buildAgaveAppsParam: function(param, useResubmit, resubmitValue) {
		let options, isSelect=false;
		let props={
			key: param.id,
			required: param.value.required,
			name: param.id,
			value: useResubmit ? resubmitValue : param.value.default
		};
		if (! param.value.visible) {
			props.type='hidden';
		} else {
			let prefix=param.value.required ? '*' : '';
			props=_.assign(props, {
				//placeholder: param.value.default,
				label: prefix + param.details.label
			});
			let addProps;
			switch (param.value.type) {
				case 'bool':
				case 'boolean':
				case 'flag':
					addProps={
						type: 'checkbox',
						checked: param.value.default
					};
					break;
				case 'enumeration':
					addProps={
						type: 'select'
					};
					isSelect=true;
					break;
				case 'number':
				case 'string':
					addProps={
						type: 'text'
					};
					break;
				default:
			}
			props=_.assign(props, addProps);
			if (isSelect) {
				options=param.value.enum_values.map(this.buildAgaveAppsSelectOption);
			}
		}
		return {
			data: props,
			isSelect: isSelect,
			options: options
		};
	},
	render: function() {
		let data=this.buildAgaveAppsParam(this.props.data, this.props.useResubmit, this.props.resubmitValue), markup;
		if (data.data.type === 'checkbox') {
			markup=<AppsBoolParam {...data} onValidate={this.props.onValidate} />;
		} else {
			markup=<BaseInput {...data} onValidate={this.props.onValidate} />;
		}
		return markup;
	}
});

module.exports = AppsParam;
