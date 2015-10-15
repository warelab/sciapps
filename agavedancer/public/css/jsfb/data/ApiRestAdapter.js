/* Connects to REST server exposing iRods REST interface. */
jsfb.data.ApiRestAdapter = Ext.extend(Object, {
    /* Get a file path as a url. */
    pathAsUrl: function(path) {
        var parts = path.split('/');
        var urlParts = [];
        Ext.each(parts, function(part) {
            if (part) {
                urlParts.push(encodeURIComponent(part));
            }
        });
        
        return urlParts.join('/');
    },

    /* Handle an API failure. */
    failure: function(config, response, opts) {
        var msg = 'Error';
        try {
            var r = Ext.decode(response.responseText);
            msg = r.message;
        } catch(e) {}

        config.failure(msg);
    },

    /* Login to the data provider. */
    login: function(config) {
	/*
        var auth = 'Basic ' + 
            Ext.util.base64.encode(config.user + ':' + config.password);
        
        // Set auth header on all future requests.
        Ext.Ajax.defaultHeaders = {
            'Authorization': 'Basic ' + 
                Ext.util.base64.encode(config.user + ':' + config.password)
        };
	*/
        // Leave off cache buster string
        Ext.Ajax.disableCaching = false;

        this.list(config);
    },

    /* Logout. */
    logout: function(config) {
        // Delete auth header.
        delete Ext.Ajax.defaultHeaders['Authorization'];

        if (config.success) {
            config.success();
        }
    },

    /* List the contents of a directory. */
    list: function(config) {
        var self = this;
		
		if (config.path == '/' || config.path === '' ) {
			return config.success([
				{
					owner: 'shared',
					permissions: 'READ',
					name: 'shared',
					path: '/shared',
					type: 'dir',
					format: 'folder',
					lastModified: Date.now(),
				},
				{
					owner: 'shared',
					permissions: 'READ',
					name: config.user,
					path: '/' + config.user,
					type: 'dir',
					format: 'folder',
					lastModified: Date.now(),
				}
			]);
		}

        Ext.Ajax.request({
            //url: config.url + '/io-v1/io/list/' + this.pathAsUrl(config.path) + '/',
            url: config.url + '/xbrowse/' + this.pathAsUrl(config.path) + '/',
            success: function(response, opts) {
                var r = Ext.decode(response.responseText);
				//console.info('got my data..');
				//console.info(r);
                config.success(r);
            },
            failure:  function(response, opts) {
                self.failure(config, response, opts);
            }
        });
    },

    /* Create a new directory. */
    makeDir: function(config) {
        var self = this;
		
		return;

        Ext.Ajax.request({
            url: config.url + '/io-v1/io/' + this.pathAsUrl(config.path) + '/',
            params: {dirName: config.name, action: 'mkdir'},
            method: 'PUT',
            success: function(response, opts) {
                config.success();
            },
            failure:  function(response, opts) {
                self.failure(config, response, opts);
            }
        });
    },

    /* Rename a path. */
    renamePath: function(config) {
        var self = this;

		return;
		
        Ext.Ajax.request({
            url: config.url + '/io-v1/io/' + this.pathAsUrl(config.path) + '/',
            params: {newName: config.name, action: 'rename'},
            method: 'PUT',
            success: function(response, opts) {
                config.success();
            },
            failure:  function(response, opts) {
                self.failure(config, response, opts);
            }
        });
    },

    /* Delete a path. */
    deletePath: function(config) {
        var self = this;

		return;
        Ext.Ajax.request({
            url: config.url + '/io-v1/io/' + this.pathAsUrl(config.item.path) + '/',
            method: 'DELETE',
            success: function(response, opts) {
                config.success();
            },
            failure:  function(response, opts) {
                self.failure(config, response, opts);
            }
        });
    },

    /* Upload a file to the current directory. */
    upload: function(config) {
        // Can't upload via XmlHttpRequest,
        // Can't set auth headers via some other 
        console.log('not supported yet!');
    }
});


/* Formats data to be displayed in a FileGrid. */
jsfb.data.DataFormatter = Ext.extend(Object, {

    /* Return string that describes a file's size. */
    getFileSize: function(item) {

        var val = item.length;

        if (false) {
            return
        } else if (val > 1099511627776) {
            return (val / 1099511627776).toFixed(1) + ' TB';
        } else if (val > 1073741824) {
            return (val / 1073741824).toFixed(1) + ' GB';
        } else if (val > 104857) {
            return (val / 104857).toFixed(1) + ' MB';
        } else if (val > 0) {
            return (val / 1024).toFixed(1) + ' KB';
        } else {
            if (item.type === 'dir') {
                return '--';
            } else {
                return 'empty';
            }
        }
    },

    /* Format special fields. */
    format: function(data) {
        data.size = this.getFileSize(data);
        data.modified = new Date(data.lastModified).format('M d Y h:m a');
		
		//console.info(data);

        // REST API data misspelling
        if (data.permisssion) {
            data.permissions = data.permisssion;
        }

        // Short-cut to determine if user has write access
        var writes = ['own', 'all', 'write'];
        if (data.permissions && writes.indexOf(data.permissions.toLowerCase()) > -1) {
            data.writable = true;
        } else {
            data.writable = false;
        }
    },
});
