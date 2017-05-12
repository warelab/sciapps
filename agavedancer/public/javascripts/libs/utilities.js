'use strict';

import _ from 'lodash';

module.exports = {
	uuid: function() {
		return 'xxxxxxxx-xxxx-4xxx-yxxx-xxxxxxxxxxxx'.replace(/[xy]/g, function(c) {
			let r = Math.random()*16|0, v = c == 'x' ? r : (r&0x3|0x8);
			return v.toString(16);
		});
	},
	
	download: function(filename, type, content) {
		let pom = document.createElement('a');
		pom.setAttribute('href', 'data:' + type + ',' + encodeURIComponent(content));
		pom.setAttribute('download', filename);

		if (document.createEvent) {
			let event = document.createEvent('MouseEvents');
			event.initEvent('click', true, true);
			pom.dispatchEvent(event);
		} else {
			pom.click();
		}
	},

	readAsText: function(target, onload) {
		if (typeof window.FileReader !== 'function') {
			alert("The file API isn't supported on this browser.");
			return;
		}
		let file=target.files[0], fr=new FileReader();
		fr.onload=onload;
		if (file) {
			fr.readAsText(file);
		}
	},

	validateForm: function(form, required, upload_suffix) {
		upload_suffix=upload_suffix || '';
		let formdata={};
		for (let key of _.keys(form)) {
			if (form[key].name && form[key].value && form[key].name.toString().length && form[key].value.toString().length) formdata[form[key].name]=form[key].value;
		}
		let ret=required.every(function(n) {
			if (formdata[n] && formdata[n].toString().length || formdata[n + upload_suffix] && formdata[n + upload_suffix].toString().length) return true
		});
		return ret;
	},

	getValueOrder: function(o) { 
		return o.value.order 
	}
};
