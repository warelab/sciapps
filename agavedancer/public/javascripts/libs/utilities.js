'use strict';

import _ from 'lodash';

module.exports = {
  /*
  ### Description
  generate uuid
  */
	uuid: function() {
		return 'xxxxxxxx-xxxx-4xxx-yxxx-xxxxxxxxxxxx'.replace(/[xy]/g, function(c) {
			let r = Math.random()*16|0, v = c == 'x' ? r : (r&0x3|0x8);
			return v.toString(16);
		});
	},
	
  /*
  ### Description
  prepare content as file download
  */
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

  /*
  ### Description
  read file text
  */
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

  /*
  ### Description
  validate form; check all required fields
  */
	validateForm: function(form, required, upload_suffix) {
		upload_suffix=upload_suffix || '';
		let formdata={};
		let ret=required.every(function(n) {
			for (let key of _.keys(form)) {
				if (form[key].name && form[key].value && form[key].name.toString().length && form[key].value.toString().length) formdata[form[key].name]=form[key].value;
			}
			if (undefined !== formdata[n] && formdata[n].toString().length || undefined !== formdata[n + upload_suffix] && formdata[n + upload_suffix].toString().length) return true
		});
		return ret;
	},

  /*
  ### Description
  get value's order
  */
	getValueOrder: function(o) { 
		return o.value.order 
	},

  /*
  ### Description
  truncate string to fixed length, default 12
  */
	truncate: function(string, length = 12) {
		let result=string.length > length ? string.substr(0,length-1).concat(" ...") : string;
		return result;
	},

  /*
  ### Description
  transform datetime
  */
  transformDateTime: function(datetime) {
    let result=datetime.substr(0, 19);
    let date = new Date(result.concat('.000Z'));
    return date.toLocaleString('en-GB');
  }
};
