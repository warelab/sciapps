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

	validateForm: function(formdata, required, upload_suffix) {
		upload_suffix=upload_suffix || '';
		let ret=required.every(function(n) {
			if (undefined !== formdata[n] && formdata[n].toString().length || undefined !== formdata[n + upload_suffix] && formdata[n + upload_suffix].toString().length) return true
		});
		return ret;
	},

	getValueOrder: function(o) { 
		return o.value.order 
	},

	truncate: function(string, length = 12) {
		let result=string.length > length ? string.substr(0,length-1).concat(" ...") : string;
		return result;
	}
};
