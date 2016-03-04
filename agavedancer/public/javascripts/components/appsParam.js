'use strict';

import React from 'react';
import _ from 'lodash';
import BaseInput from './baseInput.js';
import AppsBoolParam from './appsBoolParam.js';

const AppsParam=React.createClass({
	buildAgaveAppsSelectOption: function(option) {
		var optionChild, optionValue;
		if (_.isString(option)) {
			optionProps={value: option};
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
	buildAgaveAppsParam: function(param) {
		let options, isSelect=false;
		let props={
			key: param.id,
			name: param.id,
			value: param.value.default
		};
		if (! param.value.visible) {
			props.type='hidden';
		} else {
			props=_.assign(props, {
				label: param.details.label,
				//placeholder: param.value.default,
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
		let data=this.buildAgaveAppsParam(this.props.data), markup;
		if (data.data.type === 'checkbox') {
			markup=<AppsBoolParam {...data} />;
		} else {
			markup=<BaseInput {...data} />;
		}
		return markup;
	}
});

module.exports = AppsParam;
