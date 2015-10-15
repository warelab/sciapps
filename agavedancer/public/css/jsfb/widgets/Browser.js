/**
 * Displays file/directory details.
 */
jsfb.widgets.FileDetailPanel = Ext.extend(Ext.Panel, {
    constructor: function(config) {
        var self = this;

        if (!config.data) {
            // A file object to render must be specified.
            throw new Error('Attribute: "data" not specified.');
        }

        // HTML to render within panel 
        var props = [
            {label: 'File', attr: 'name'},
            {label: 'Path', attr: 'path'},
            {label: 'Owner', attr: 'owner'},
            {label: 'Modified', attr: 'modified'},
            {label: 'Permissions', attr: 'permissions'},
            {label: 'Size', attr: 'size'},
            {label: 'File Type', attr: 'type'},
            {label: 'Mime Type', attr: 'mimeType'},
            {label: 'Download', attr: 'download'}
        ];

        var html = '<table class="dl"><tbody>';
        Ext.each(props, function(item) {
            if (config.data.hasOwnProperty(item.attr) && config.data[item.attr]) {
                html += '<tr><th>' + item.label + ':</th><td>{' +
                    item.attr + '}</td></tr>';
            }
        });
        html += '</tbody></table>';
        var tpl = new Ext.Template(html);

        defaults = {
            border: false,
            frame: false,
            height: 320,
            layout: 'fit',
            html: tpl.apply(config.data),
            bbar: [
               {
                   xtype: 'button',
                   text: 'Rename',
                   disabled: config.data.writable? false:true,
                   icon: 'jsfb/resources/images/document-rename.png',
                   listeners: {
                       render: function(item, e) {
                           new Ext.ToolTip({
                               target: item.el,
                               title: 'Rename ' + config.data.type +'.'
                           });
                       },
                       click: function(item, e) {
                           // Show rename file window.
                           var win = new Ext.Window({
                               renderTo: self.el,
                               title: 'Rename',
                               width: 300,
                               padding: 10,
                               resizable: false,
                               layout: 'form',
                               items: [
                                   {
                                       xtype: 'form',
                                       ref: 'renameForm',
                                       unstyled: true,
                                       padding: 5,
                                       items: [
                                           {
                                               xtype: 'textfield',
                                               width: 150,
                                               fieldLabel: 'Name',
                                               name: 'name',
                                               value: config.data.name,
                                               allowBlank: false
                                           }
                                       ]
                                   }
                               ],
                               bbar: [
                                  {
                                      xtype: 'button',
                                      text: 'Rename',
                                      icon: 'jsfb/resources/images/document-rename.png',
                                      handler: function() {
                                          var form = win.renameForm.getForm();
                                          if (form.isValid()) {
                                              self.fireEvent('renamepath', self, form.getFieldValues().name, self.data);
                                              win.close();
                                          }
                                      }
                                  },
                                  '&nbsp;',
                                  {
                                      xtype: 'button',
                                      text: 'Cancel',
                                      icon: 'jsfb/resources/images/close.png',
                                      handler: function() {
                                          win.close();
                                      }
                                  }
                               ]
                           });
                           win.show();
                       }
                   }
               },
               '&nbsp;',
               {
                   xtype: 'button',
                   text: 'Delete',
                   icon: 'jsfb/resources/images/document--minus.png',
                   disabled: config.data.writable? false:true,
                   listeners: {
                       render: function(item, e) {
                           new Ext.ToolTip({
                               target: item.el,
                               title: 'Delete ' + config.data.type +'.'
                           });
                       },
                       click: function(item, e) {
                           // Show delete file window.
                           var win = new Ext.Window({
                               renderTo: self.el,
                               title: 'Delete ' + config.data.path + '?',
                               width: 300,
                               padding: 10,
                               resizable: false,
                               html: 'Permanently delete ' + config.data.name +
                                   (config.data.type === 'dir'? ' and all children':'') + '?',
                               bbar: [
                                  {
                                      xtype: 'button',
                                      text: 'Cancel',
                                      icon: 'jsfb/resources/images/check.png',
                                      handler: function() {
                                          win.close();
                                      }
                                  },
                                  '&nbsp;',
                                  {
                                      xtype: 'button',
                                      text: 'Delete',
                                      icon: 'jsfb/resources/images/close.png',
                                      handler: function() {
                                          self.fireEvent('removepath', self, self.data);
                                          win.close();
                                      }
                                  },
                               ]
                           });
                           win.show();
                       }
                   }
               }
            ]
        };

        // init instance
        Ext.apply(defaults, config);
        Ext.apply(this, defaults);
        jsfb.widgets.FileDetailPanel.superclass.constructor.apply(this, arguments);

        // set custom events
        self.addEvents('renamepath', 'removepath');
    }

});

/**
 * Displays individual directories and files.
 */
jsfb.widgets.FileGrid = Ext.extend(Ext.grid.GridPanel, {
    constructor: function(config) {
        var self = this;
        
        // set defaults
        var defaults = {
            viewConfig: {forceFit: true},
            frame: false,
            border: false,
            autoExpandColumn: 'name',
            autoHeight: false,
            columnLines: true,
            stripeRows: true,
            showHidden: false,
            cls: 'file-grid',
            tbar: {
                style: 'padding-left: 5px',
                items: []
            },
			/*fbar: {
				style: 'padding-left: 5px; text-align:center',
                items: [{
					id: 'butonel',
					xtype: 'button',
					text: 'xyz',
				}]
			},*/
            bbar: {
                style: 'padding-left: 5px',
                items: [
                    '<span class="label">Filter By:</span>&nbsp;',
                    {
                        id: 'fileFilterInput',
                        xtype: 'textfield',
                        value: config && config.filter? config.filter:undefined,
                        enableKeyEvents: true,
                        listeners: {
                            render: function(item, e) {
                                new Ext.ToolTip({
                                    target: item.el,
                                    title: 'Filter files by name.'
                                });
                            },
                            keydown: function(item, e) {
                                // Wait before filtering
                                var delay = 500;
                                
                                // Avoid calling filter multiple
                                // times for a single entry.
                                var token = {};
                                
                                self.filterFunc = setTimeout(function() {
                                    if (token.filterFunc === self.filterFunc) {
                                        self.filterData();
                                    }
                                }, delay);
                                token.filterFunc = self.filterFunc;
                            }
                        }
                    },
                    '&nbsp;&nbsp;',
                    {
                        xtype: 'button',
                        ref: 'goToParentBtn',
                        icon: jsfb.resource_prefix + 'images/folder-horizontal--arrow-90.png',
                        listeners: {
                            render: function(item, e) {
                                new Ext.ToolTip({
                                    target: item.el,
                                    title: 'Go to parent directory.'
                                });
                            },
                            click: function(item, e) {
                                var parts = self.getPathAsArray();
                                var path = '/' + parts.slice(1, parts.length - 1).join('/');
                                self.fireEvent('pathchange', self, path);
                            }
                        }
                    },
                    {
                        xtype: 'button',
                        ref: 'reloadBtn',
                        icon: jsfb.resource_prefix + 'images/folder-horizontal--arrow-315.png',
                        listeners: {
                            render: function(item, e) {
                                new Ext.ToolTip({
                                    target: item.el,
                                    title: 'Refresh content.'
                                });
                            },
                            click: function(item, e) {
                                self.fireEvent('pathchange', self, self.path);
                            }
                        }
                    },
                    {
                        xtype: 'button',
                        ref: 'makeDirBtn',
                        icon: jsfb.resource_prefix + 'images/folder-horizontal--plus.png',
                        listeners: {
                            render: function(item, e) {
                                new Ext.ToolTip({
                                    target: item.el,
                                    title: 'Create new directory.'
                                });
                            },
                            click: function(item, e) {
                                // Show create directory window.
                                var win = new Ext.Window({
                                    renderTo: self.el,
                                    title: 'New Directory',
                                    width: 300,
                                    padding: 10,
                                    resizable: false,
                                    layout: 'form',
                                    items: [
                                        {
                                            xtype: 'form',
                                            ref: 'makeDirForm',
                                            unstyled: true,
                                            padding: 5,
                                            items: [
                                                {
                                                    xtype: 'textfield',
                                                    width: 150,
                                                    fieldLabel: 'Name',
                                                    name: 'name',
                                                    allowBlank: false
                                                }
                                            ]
                                        }
                                    ],
                                    bbar: [
                                       {
                                           xtype: 'button',
                                           text: 'Create',
                                           icon: jsfb.resource_prefix + 'images/folder-horizontal--plus.png',
                                           handler: function() {
                                               var form = win.makeDirForm.getForm();
                                               if (form.isValid()) {
                                                   self.fireEvent('makedir', self, form.getFieldValues().name);
                                                   win.close();
                                               }
                                           }
                                       },
                                       '&nbsp;',
                                       {
                                           xtype: 'button',
                                           text: 'Cancel',
                                           icon: jsfb.resource_prefix + 'images/close.png',
                                           handler: function() {
                                               win.close();
                                           }
                                       }
                                    ]
                                });
                                win.show();
                            }
                        }
                    },
                    {
                        xtype: 'button',
                        ref: 'uploadBtn',
                        icon: jsfb.resource_prefix + 'images/document--plus.png',
                        listeners: {
                            render: function(item, e) {
                                new Ext.ToolTip({
                                    target: item.el,
                                    title: 'Upload file.'
                                });
                            },
                            click: function(item, e) {
                                // Show upload file window.
                                var win = new Ext.Window({
                                    renderTo: self.el,
                                    title: 'Upload File',
                                    width: 300,
                                    padding: 10,
                                    resizable: false,
                                    layout: 'form',
                                    items: [
                                        {
                                            xtype: 'form',
                                            ref: 'uploadForm',
                                            fileUpload: true,
                                            unstyled: true,
                                            padding: 5,
                                            html: 'Not Implemented yet!',
                                            /*items: [
                                                {
                                                    xtype: 'fileuploadfield',
                                                    width: 150,
                                                    fieldLabel: 'File',
                                                    name: 'file',
                                                    allowBlank: false
                                                }
                                            ]*/
                                        }
                                    ],
                                    bbar: [
                                       {
                                           xtype: 'button',
                                           text: 'Upload',
                                           icon: jsfb.resource_prefix + 'images/document--plus.png',
                                           handler: function() {
                                               var form = win.uploadForm.getForm();
                                               if (form.isValid()) {
                                                   self.fireEvent('upload', self, form);
                                                   win.close();
                                               }
                                           }
                                       },
                                       '&nbsp;',
                                       {
                                           xtype: 'button',
                                           text: 'Cancel',
                                           icon: jsfb.resource_prefix + 'images/close.png',
                                           handler: function() {
                                               win.close();
                                           }
                                       }
                                    ]
                                });
                                win.show();
                            }
 
                        }
                    }
                ]
            }
        };
        Ext.apply(defaults, config);
        
        if (!defaults.store) {
            defaults.store = new Ext.data.JsonStore({
                storeId: 'dirListing',
                autoDestroy: true,
                root: 'files',
                idProperty: 'path',
                fields: [
                    'name',
                    'path',
                    {
                        name: 'lastModified',
                        type: 'date',
                        dateFormat: 'time'
                    },
                    'length',
                    'owner',
                    'permissions',
                    'mimetype',
                    'modified',
                    'size',
                    'type',
                    'writable'
                ]
            });
        };
        
        if (!defaults.colModel) {
            defaults.colModel = new Ext.grid.ColumnModel({
                defaults: {sortable: true},
                columns: [
                    {
                        id: 'name',
                        header: 'Filename',
                        dataIndex: 'name',
                        renderer: function(val, metadata, item) {
                            // Add icon and link
                            var icon = self.getIcon(item.data);
                            var style = 'background-image: url(' + jsfb.resource_prefix + 'images/' + icon + ');'
                            return '<div class="filename" style="' + style + '">' + val + '</div>';
                        }
                    },
                    {
                        header: 'Status',
                        dataIndex: 'permissions',
                        width: 20,
                        renderer: function(val, metadata, item) {
                            return self.getFileStatus(item.data);
                        }
                    },
                    {
                        header: 'Size',
                        dataIndex: 'size',
                        width: 35,
                    },
                    {
                        header: 'Modified',
                        dataIndex: 'modified',
                        width: 75
                    }
                ]
            });
        }
        
        // init instance
        Ext.apply(this, defaults);
        jsfb.widgets.FileGrid.superclass.constructor.apply(this, arguments);
        
        this.on('rowdblclick', function(grid, rowIdx, e) {
            var record = self.getStore().getAt(rowIdx);
            if (record.data.type === 'dir') {
                self.fireEvent('pathchange', self, record.data.path);
            } else {
                self.setData(record.data.path, record.data);
            }
        });
		
		this.on('rowclick', function(grid, rowIdx, e) {
            var record = self.getStore().getAt(rowIdx);
            if (record.data.type === 'dir') {
                //self.fireEvent('pathchange', self, record.data.path);
            } else {
                //self.setData(record.data.path, record.data);
            }
			//console.info('clicked on ' + record.data.path);
			//show_select_btn(record.data);
        });
        
        // set custom events
        this.addEvents('pathchange', 'makedir', 'renamepath', 'removepath', 'upload');
    },
    
    /* Get the current path as an array. */
    getPathAsArray: function() {
        return this.path.split('/');
    },
    
    /* Set data being presented in the browser. */
    setData: function(path, data) {
        // Display file data
        this.path = path;
        this.data = data;
        this.updateLocation();
        
        if (Ext.isArray(data)) {
            this.filterData();
            this.disableControls(data);
        } else {
            this.fileDetails();
        }
    },

    /* Determine which controls should be enabled/disabled. */
    disableControls: function(data) {
        var bb = this.getBottomToolbar();
        if (data && data[0] && data[0].writable) {
            bb.makeDirBtn.enable();
            bb.uploadBtn.enable();
        } else {
            bb.makeDirBtn.disable();
            bb.uploadBtn.disable();
        }

        if (data && this.getPathAsArray().length > 1) {
            bb.goToParentBtn.enable();
        } else {
            bb.goToParentBtn.disable();
        }
    },
    
    /* Update the location bar. */
    updateLocation: function(path) {
        var self = this;
        
        // Remove all existing path buttons
        var tb = this.getTopToolbar();
        tb.removeAll();
        
		var hasRoot = false;
        // Add new path buttons.
        var parts = this.getPathAsArray();
        Ext.each(parts, function(item, idx) {
            if (item === '') {
				if (hasRoot)
					return;
                item = '/';
				hasRoot = true;
            }
            
            if (item.length > 15) {
                // Use ellipsis to reduce label length
                item = item.substr(0, 9) + '...' + item.substr(item.length - 3, 3);
            }
            
            var path = parts.slice(0, idx + 1).join('/');
            tb.add({
                xtype: 'button',
                text: item,
                minWidth: 20,
                listeners: {
                    render: function(item, e) {
                        new Ext.ToolTip({
                            target: item.el,
                            title: 'Go to: ' + path
                        });
                    },
                    click: function(item, e) {
                        self.fireEvent('pathchange', self, path);
                    }
                }
            });
            
            tb.add('&nbsp;');
        });
    },
    
    /* Display filtered data in grid. */
    filterData: function() {
        var self = this;
        var patterns = Ext.get('fileFilterInput').getValue().split(/,|\s/);
        
        var regex;
        if (patterns) {
            var cleanPatterns = [];
            Ext.each(patterns, function(item) {
                item = item.replace('.', '\\.');
                item = item.replace(/^\s+|\s+$/g, '');
                cleanPatterns.push(item);
            });
            
            regex = new RegExp(cleanPatterns.join('|'), 'i');
        }
        
        var filtered = [];
        Ext.each(this.data, function(item) {
            if (!item) {
                return;
            }
            
            if ((!this.showHidden) && item.name.indexOf('.') === 0) {
                return;
            }
            
            if (regex && (!regex.test(item.name))) {
                return;
            }
            
            filtered.push(item);
        });

        this.store.loadData({files: filtered});
    },
    
    /* Return a file name to use as a file's icon. */
    getIcon: function(item) {
        var icon;
        if (item.type === 'dir') {
            icon = this.getDirIcon(item);
        } else if (item.type === 'file') {
            icon = this.getFileIcon(item);
        } else {
            icon = 'document.png';
        }
        
        return icon;
    },
    
    /* Return a file name to use as a directory's icon. */
    getDirIcon: function(item) {
        return 'folder-horizontal.png';
    },
    
    /* Return a file name to use as a file's icon. */
    getFileIcon: function(item) {
        var iconMap = {
            'fasta': 'document-dna.png',
            'fa': 'document-dna.png',
            'fastq': 'document-dna.png',
            'fq': 'document-dna.png',
            'txt': 'document-text.png',
            'rtf': 'document-text.png',
            'csv': 'document-table.png',
            'xls': 'document-excel-table.png',
            'doc': 'document-word-text.png',
            'ppt': 'document-powerpoint.png',
            'pdf': 'document-pdf.png',
            'html': 'document-xaml.png',
            'xml': 'document-code.png',
            'png': 'image.png',
            'gif': 'image.png',
            'tiff': 'image.png',
            'jpg': 'image.png',
            'jpeg': 'image.png'
        }
        
        var parts = item.name.split('.');
        if (parts.length) {
            var ext = parts[parts.length - 1];
            if (iconMap.hasOwnProperty(ext)) {
                return iconMap[ext];
            }
        }
        
        return 'document.png';
    },
    
    /* Return an html snipprt to represent the current status. */
    getFileStatus: function(item) {
        var html = '<div class="file-status">';
        
        // Permission icon
        if (item.writable) {
            html += '<div style="background-image: url(' + jsfb.resource_prefix + 'images/lock-unlock.png);"></div>';
        } else {
            html += '<div style="background-image: url(' + jsfb.resource_prefix + 'images/lock.png);"></div>';
        }
        
        // Sharing icon
        //html += '<div style="background-image: url(../resources/images/users.png);"></div>';
        
        // Info icon
        var infoClick = "var fb = Ext.getCmp('" + this.id + "'); fb.pathDetails('" +
            item.path + "'); return false;";
        html += '<a onclick="' + infoClick + '"><div style="background-image: url(' + jsfb.resource_prefix + 'images/information-frame.png);"></div></a>';
        
        html += '</div>';
        return html;
    },
    
    /* Display file details in browser window by specifying file path. */
    pathDetails: function(path) {
        for (var i = 0; i < this.data.length; i++) {
            var item = this.data[i];
            if (item.path === path) {
                this.setData(item.path, item);
                break;
            }
        }
    },
    
    /* Display file details in browser window. */
    fileDetails: function() {
        var self = this;

        // Hide grid
        var gridContainer = Ext.query('.x-panel-body', this.el.dom)[0];
        gridContainer.innerHTML = '';
       
        // Render details 
        var fileDetails = new jsfb.widgets.FileDetailPanel({
            renderTo: gridContainer,
            data: this.data,
            listeners: {
                renamepath: function(src, name, data) { 
                    self.fireEvent('renamepath', self, name, data);
                },
                removepath: function(src, data) {
                    self.fireEvent('removepath', self, data);
                }
            }
        });

        // Disable directory controls.
        this.disableControls();
    }
});


/**
 * This container is the parent for all other widgets.
 */
jsfb.widgets.Browser = Ext.extend(Ext.Panel, {
    constructor: function(config) {
        // set defaults
        var defaults = {
            title: '',
            height: 400,
            width: 600,
            url: '',
            path: '/',
            layout: 'fit',
            resource_prefix: '/static/galaxy_irods/jsfb/resources/'
        }
        Ext.apply(defaults, config);
        
        if (!defaults.fileAdapter) {
            defaults.fileAdapter = new jsfb.data.ApiRestAdapter();
            //defaults.fileAdapter = new jsfb.data.RestAdapter();
            //defaults.fileAdapter = new jsfb.data.TestAdapter();
        }

        if (!defaults.dataFormatter) {
            defaults.dataFormatter = new jsfb.data.DataFormatter();
        }
        
        // init instance.
        Ext.apply(this, defaults);
        jsfb.widgets.Browser.superclass.constructor.apply(this, arguments);

        // Path to find resources.
        jsfb.resource_prefix = defaults.resource_prefix;
        
        // show login screen
        //this.logout();
		
		var config = this.getApiCallConfig(function(data) {
                self.loggedIn = true;
                //self.setData(data);
				//console.info(data);
				console.debug(this.setData);
				console.debug(self.setData);
            });
            
        //defaults.fileAdapter.login(config);
		this.changePath(config.path);
    },
    
    /* Displays a message in the browser area. */
    showMessage: function(params) {
        var defaults = {
            msg: '',
            cls: '',
            showClose: true,
            timeout: 7000
        };
        Ext.apply(defaults, params);
        
        // Get container div
        if (!this.msgContainer) {
            var panelHeader = Ext.query('.x-panel-body', this.el.dom)[0];
            this.msgContainer = Ext.DomHelper.append(panelHeader, {
                tag: 'div',
                cls: 'message-container'
            });
        }
        
        // Add message
        var cls = 'message ' + defaults.cls;
        var message = Ext.DomHelper.append(this.msgContainer, {
            tag: 'div',
            cls: cls,
            children: [
                {
                    tag: 'span',
                    cls: 'message-text',
                    html: defaults.msg
                }
            ]
        });
        var msg = Ext.get(message);
        msg.close = function() {
            this.remove();
        }
        
        if (defaults.showClose) {
            var closeBtn = Ext.DomHelper.append(message, {
                tag: 'div',
                cls: 'message-close'
            });
            
            Ext.get(closeBtn).on('click', function() {
                msg.close();
            });
        };
        
        if (defaults.timeout) {
            setTimeout(function() {msg.close()}, defaults.timeout);
        }
        
        return msg;
    },
    
    /* Display an error message to users. */
    showError: function(msg) {
        this.showMessage({
            msg: msg? msg:'System Error',
            cls: 'error'
        });
    },
    
    /* Display a loading message to users. */
    showLoading: function(msg) {
        var panelBody = Ext.query('.x-panel-body', this.el.dom)[0];
        Ext.DomHelper.append(panelBody, {
            tag: 'div',
            cls: 'busy'
        });
        
        this.showMessage({
            msg: msg? msg:'Waiting...',
            cls: 'load',
            showClose: false,
            timeout: 0
        });
    },
    
    /* Hide loading message. */
    hideLoading: function() {
        var busy = Ext.query('.busy', this.el.dom);
        if (busy.length) {
            Ext.get(busy[0]).remove();
        }
        
        var msg = Ext.query('.load', this.el.dom);
        if (msg.length) {
            Ext.get(msg[0]).close();
        }
    },
    
    /* Get generic config object for passing to API. */
    getApiConfig: function() {
        return {
            user: this.user,
            password: this.password,
            url: this.url,
            path: this.path
        };
    },
    
    /* Get generic config object with success callback for passing to API. */
    getApiCallConfig: function(callback) {
        var self = this;
        var config = this.getApiConfig();
        Ext.apply(config, {
            success: function() {
                callback.apply(this, arguments);
                self.hideLoading();
            },
            failure: function(msg) {
                self.hideLoading();
                self.showError(msg);
            }
        });
        
        return config;
    },
    
    /* Login to the API. */
    login: function() {
        var self = this;
        var config = this.getApiCallConfig(function(data) {
            self.loggedIn = true;
            self.setData(data);
        });
        
        this.showLoading();
        //this.fileAdapter.login(config);
		this.changePath(config.path);
    },
    
    /* Logout of the API. */
    logout: function() {
        var self = this;
        
        // Logout from API
        if (this.loggedIn) {
            var config = this.getApiCallConfig(function(data) {
                self.loggedIn = false;
                self.setData(data);
            });
            
            this.showLoading();
            this.fileAdapter.logout(config);
        }
        
        // Init login screen
        if (!this.loginWidget) {
            this.removeAll();
            this.loginWidget = this.add({
                layout: 'ux.center',
                border: false,
                items: [{
                    xtype: 'jsfblogin',
                    user: this.user,
                    password: this.password,
                    url: this.url,
                    path: this.path,
                    listeners: {
                        login: function(src, params) {
                            Ext.apply(self, params);
                            self.login();
                        }
                    }
                }]
            });
        } else {
            if (this.items.indexOf(this.loginWidget) < 0) {
                this.removeAll();
                this.add(this.loginWidget);
            }
        }
        this.doLayout();
    },
    
    /* Change path. */
    changePath: function(path) {
        var self = this;
        this.path = path;
        //console.log('Changed Path: ' + this.path);
        
        var config = this.getApiCallConfig(function(data) {
            //console.log('Got Data!');
            //console.log(data);
            self.setData(data);
        });
        
        this.showLoading();
        this.fileAdapter.list(config);
		
		// XXX very ugly
		try {
			if (this.input_id) {
				Ext.get('fselected_' + this.input_id).hide();
			}
			else {
				Ext.get('fselected').hide();
			}
		} catch (e) {};
    },
    
    /* Create a new directory. */
    makeDir: function(name) {
        var self = this;
        
        var config = this.getApiCallConfig(function() {
            // Refresh content
            self.changePath(self.path);
        });
        config.name = name;
        
        this.showLoading();
        this.fileAdapter.makeDir(config);
    },
    
    /* Rename a path. */
    renamePath: function(name, item) {
        var self = this;
        var oldName = item.name;
        
        var config = this.getApiCallConfig(function() {
            if (Ext.isArray(self.data)) {
                self.changePath(self.path);
            } else {
                var re = new RegExp(oldName+ '$');
                var path = item.path.replace(re, name);
                self.changePath(path);
            }
        });
        config.item = item;
        config.name = name;
        
        this.showLoading();
        this.fileAdapter.renamePath(config);
    },
    
    /* Delete a path. */
    deletePath: function(item) {
        var self = this;
        
        var config = this.getApiCallConfig(function() {
            self.changePath(self.path);
        });
        config.item = item
        
        this.showLoading();
        this.fileAdapter.deletePath(config);
    },

    /* Upload a file to the current directory. */
    upload: function(form) {
        var self = this;

        var config = this.getApiCallConfig(function() {
            self.changePath(self.path);
        });
        config.form = form

        this.showLoading();
        this.fileAdapter.upload(config);
    },

    /* Update directory listing data. */
    setData: function(data) {
        var self = this;
        
        // init file browser
        if (!this.fileGrid) {
            this.removeAll();
            this.fileGrid = this.add({
                ref: 'fileGrid',
                xtype: 'jsfbfilegrid',
                border: false,
                listeners: {
                    pathchange: function(src, path) {
                        self.changePath(path);
                    },
                    makedir: function(src, name) {
                        self.makeDir(name);
                    },
                    renamepath: function(src, name, item) {
                        self.renamePath(name, item);
                    },
                    removepath: function(src, item) {
                        self.deletePath(item);
                    },
                    upload: function(form) {
                        self.upload(form);
                    }
                }
            });
            
            // Listen for item selection!!
            this.fileGrid.getSelectionModel().on('rowselect', function(row, idx, rowData) {
                if (self.callback) {
                    var config = self.getApiConfig();
                    Ext.apply(config, rowData.data);
                    self.callback.call(self, config);
                }
            });
        } else {
            if (this.items.indexOf(this.fileGrid) < 0) {
                this.add(this.fileGrid);
            }
        }
        
        // render and set data
        this.doLayout();

        if (Ext.isArray(data)) {
            Ext.each(data, function(item) {
                self.dataFormatter.format(item);
            });
        } else {
            this.dataFormatter.format(data);
        }
        this.fileGrid.setData(this.path, data);
        
        // Force grid re-render!
        this.fileGrid.getView().render();
        this.fileGrid.getView().refresh();
    }
});

Ext.reg('jsfbfiledetailpanel', jsfb.widgets.FileDetailPanel);
Ext.reg('jsfbfilegrid', jsfb.widgets.FileGrid);
Ext.reg('jsfbbrowser', jsfb.widgets.Browser);
