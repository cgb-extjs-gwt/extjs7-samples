Ext.define('Ext.ux.form.field.MultipleFileField', {
    extend: 'Ext.form.field.File',
    alias:['widget.multifilefield',
           'widget.multiplefilefield',
           'widget.multifile'],
    /**
     * Override to add a "multiple" attribute.
     */
    onRender: function() {
        this.callParent(arguments);

        this.fileInputEl.set({
            multiple: 'multiple'
        });
    }
});
Ext.define('MyApp.view.MyGrid', {
    extend: 'Ext.panel.Panel',
    alias: ['widget.filepanel','fileuploadpanel'],
    requires:[
        'Ext.ux.form.field.MultipleFileField',
        'Ext.ux.form.FileDrop',
        'Ext.ux.IFrame'
    ],
    layout:'card',
    autoLoadStore: true,
    maxFileSize:10485760, // 10Mb
    listUrl: '/file/getFileList', // your MVC path to get file list
    listParams:{},
    uploadUrl: '/file/upload', // your MVC path upload files
    uploadParams:{},
    downloadUrl: '/file/download', // your MVC path to download the file
    downloadParams:{},
    deleteUrl: '/file/delete', // your MVC path to delete the file
    deleteParams:{},
    /**
     * initialising the components
     */
    initComponent: function(){
        var me = this;
        // Create the datastore if available
        if(!Ext.isDefined(me.store)){
            me.store = Ext.create('Ext.data.Store', {
                autoLoad:me.autoLoadStore,
                fields:[
                    'name',
                    'size',
                    'type',
                    {name:'lastModifiedDate', type:'date', dateFormat:'Y-m-d H:i:s'},
                    'iconCls',
                    {name:'new_window', type:'bool'}
                ],
                proxy:{
                    type:'ajax',
                    url:me.listUrl,
                    extraParams: me.listParams || undefined,
                    reader:{
                        type:'json',
                        root:'data'
                    },
                    listeners:{exception:Ext.onException }
                }
            });
        };
        // the temporary store to handle file uploading
        me.progressStore = Ext.create('Ext.data.Store', {
            fields:[
                'name',
                'size',
                'type',
                {name:'lastModifiedDate', type:'date', dateFormat:'Y-m-d H:i:s'},
                {name: 'progress', type:'int'}
            ],
        });
        // create a tool bar
        if(me.bbar !== false){
            me.bbar = [{
                           xtype:'tbtext',
                           text:'Drap and drop your files to the grid'
                       },'->',{
                           xtype:'multifile',
                           buttonOnly:true,
                           allowBlank:true,
                           submitValue:false,
                           buttonConfig:{
                               text:'Add attachments',
                               iconCls:'icon-add'
                           },
                           listeners:{
                               render:function(){
                                   var el = this.getEl(),
                                       field = this;
                                   el.dom.onchange = function(e){
                                       me.checkFileUpload(e.target.files);
                                   };
                               }
                           }
                       }];
        };
        // default config
        var config = {
            defaults:{
                xtype:'grid',
                enableColumnHide:false,
                enableColumnMove:false,
                plugins:[{
                             ptype: 'filedrop',
                             readType:'DataURL'
                         }]
            },
            tools: [{
                        type: 'refresh',
                        handler: function(){
                            me.store.load();
                        }
                    }],
            items:[{
                       store:me.store,
                       columns:[{
                                    header:'Files',
                                    flex:1,
                                    dataIndex:'name',
                                    renderer:function(value, metaData, record){
                                        var exportMode=false;
                                        if(Ext.isDefined(metaData)
                                            && Ext.isDefined(metaData.exportMode)){
                                            exportMode=metaData.exportMode
                                        };
                                        if(exportMode){
                                            return value;
                                        }else{
                                            var lastModifiedDate = record.get('lastModifiedDate');
                                            var date = Ext.util.Format.date(lastModifiedDate, "d/m/Y g:i a");
                                            return '<div class="' + record.get('iconCls') +'" style="background-position: center left!important; padding: 0 15px 0 25px;">'+
                                                '<b style="display: block;" title="'+value+'">'+value+'</b>'+
                                                '<span style="font-size: 80%;">Size: '+record.get('size')+', Last Modified: '+ date +'</span></div>';
                                        };
                                    }
                                },{
                                    xtype: 'actioncolumn',
                                    cls: 'x-icon-column-header x-action-disk-column-header', // define your css icon here
                                    width: 24,
                                    icon: '/public/images/ext/silk/arrow_down.png', // change your icon path here
                                    iconCls: 'x-hidden',
                                    tooltip: 'Download selected file',
                                    menuDisabled: true,
                                    sortable: false,
                                    handler: function(gridView, rowIndex, colIndex, item, e, record) {
                                        gridView.select(record);
                                        var params = Ext.applyIf({fileName:record.get('name')},me.downloadParams),
                                            queryStr = Ext.Object.toQueryString(params),
                                            url = me.downloadUrl + '/?' + queryStr;
                                        if(record.get('new_window') === true){
                                            me.showDownloadWindow(url,record);
                                        }else{
                                            window.location=url;
                                        };
                                    }
                                },{
                                    xtype: 'actioncolumn',
                                    cls: 'x-icon-column-header x-action-delete-column-header', // define your css icon here
                                    width: 24,
                                    icon: '/public/images/ext/silk/delete.png',
                                    iconCls: 'x-hidden',
                                    tooltip: 'Delete selected file',
                                    menuDisabled: true,
                                    sortable: false,
                                    handler: function(gridView, rowIndex, colIndex, item, e, record) {
                                        gridView.select(record);
                                        var params = Ext.applyIf({fileName:record.get('name')},me.deleteParams);
                                        Ext.Ajax.request({
                                            url: me.deleteUrl,
                                            params: params,
                                            success: function(response){
                                                me.store.load();
                                            }
                                        });
                                    }
                                }],
                       listeners:{
                           itemmouseenter: function(view, list, node, rowIndex, e){
                               var icons = Ext.DomQuery.select('.x-action-col-icon', node);
                               Ext.each(icons, function(icon){
                                   Ext.get(icon).removeCls('x-hidden');
                               });
                           },
                           itemmouseleave: function(view, list, node, rowIndex, e){
                               var icons = Ext.DomQuery.select('.x-action-col-icon', node);
                               Ext.each(icons, function(icon){
                                   Ext.get(icon).addCls('x-hidden');
                               });
                           },
                           loadstart : function(cmp, e, file) {
                               me.checkFileUpload([file]);
                           }
                       }
                   },{
                       store: me.progressStore,
                       viewConfig:{
                           markDirty:false
                       },
                       columns:[{
                                    header:'Files',
                                    dataIndex:'name',
                                    flex:1
                                },{
                                    header:'Progress',
                                    dataIndex:'progress',
                                    align:'center',
                                    width:90,
                                    renderer: function (value, meta, record) {
                                        var color = (value < 100) ? 'red' : 'green';
                                        return Ext.String.format('<b style="color: {0};">{1}%</b>', color, value);
                                    }
                                }],
                       listeners:{
                           loadstart : function(cmp, e, file) {
                               me.checkFileUpload([file]);
                           }
                       }
                   }]
        };
        // appy to this config
        Ext.applyIf(me, config);
        // apply to the initialConfig
        Ext.applyIf(me.initialConfig, config);
        // call the arguments
        me.callParent(arguments);
        // init the settings
        me.on('render',me.onPanelRender,me);
        // assign title prefix
        me.titlePrefix = me.title || 'Attachments';
    },
    // init store events when render
    onPanelRender:function(){
        var me = this;
        if(me.store){
            // create grid value to the store for future use
            me.store.grid = me.items[0];
            // change title when load
            me.store.on('load',function(){
                var count = me.store.count();
                if(count > 0){
                    me.setTitle(me.titlePrefix + ' (' + count + ')');
                }else{
                    me.setTitle(me.titlePrefix);
                };
            });
        };

        if(me.progressStore){
            // if new file is uploading, then show progress panel
            me.progressStore.on('add',function(){
                me.getLayout().setActiveItem(1);
            });

            me.progressStore.on('remove',function(){
                var count = me.progressStore.count();
                if(count == 0){
                    me.getLayout().setActiveItem(0);
                };
            });
        };
    },
    // when user uses filefield
    checkFileUpload:function(files){
        var me = this,
            invalidList = [];

        Ext.each(files, function(file){
            if(file.size > me.maxFileSize){
                invalidList.push(file);
            };
        });

        if(invalidList.length > 0){
            var msg = '<ul>';
            Ext.each(invalidList, function(file){
                msg += '<li>' + file.name + '</li>';
            });

            msg += '</ul>';
            var pl = invalidList.length > 1;
            msg += Ext.String.format('{0} file{1} exceed{2} file upload limit. Please try again!!', invalidList.length, (pl ? 's': ''), (pl ? '': 's'));

            Ext.Msg.show({
                title:'Exceed file upload limit',
                msg: msg,
                buttons: Ext.Msg.OK,
                icon: Ext.Msg.WARNING
            });

            return false;
        };

        // check the current file list
        if(me.store.count() > 0){
            Ext.each(files, function(file){
                if(me.store.findExact('name',file.name) !== -1){
                    invalidList.push(file);
                };
            });


            if(invalidList.length > 0){
                var msg = '<ul>';
                Ext.each(invalidList, function(file){
                    msg += '<li>' + file.name + '</li>';
                });

                msg += '</ul>';
                var pl = invalidList.length > 1;
                msg += Ext.String.format('{0} file{1} already exist{2}.Please try again!!', invalidList.length, (pl ? 's': ''), (pl ? '': 's'));

                Ext.Msg.show({
                    title:'File exists',
                    msg: msg,
                    buttons: Ext.Msg.OK,
                    icon: Ext.Msg.WARNING
                });

                return false;
            };
        };

        // check the current uploading list
        if(me.progressStore.count() > 0){
            Ext.each(files, function(file){
                if(me.progressStore.findExact('name',file.name) !== -1){
                    invalidList.push(file);
                };
            });

            if(invalidList.length > 0){
                var msg = '<ul>';
                Ext.each(invalidList, function(file){
                    msg += '<li>' + file.name + '</li>';
                });

                msg += '</ul>';
                var pl = invalidList.length > 1;
                msg += Ext.String.format('{0} file{1} exist{2} in uploading list. Please try again!!', invalidList.length, (pl ? 's': ''), (pl ? '': 's'));

                Ext.Msg.show({
                    title:'File exists',
                    msg: msg,
                    buttons: Ext.Msg.OK,
                    icon: Ext.Msg.WARNING
                });

                return false;
            };
        };

        return me.prepareFileUpload(files);
    },
    // prepare file upload
    prepareFileUpload:function(files){
        var me = this;
        Ext.each(files, function(file){
            // create a file model
            var f = Ext.applyIf({progress:'0%'},file);
            // add to upload store
            var records = me.progressStore.add(f);
            // start uploading file
            me.uploadFile(file, records[0]);
        });
        // show the progress grid
        me.getLayout().setActiveItem(1);

        return true;
    },
    // set global params
    setGlobalParams:function(params, load){
        this.listParams = this.uploadParams = this.downloadParams = this.deleteParams = params;
        // assign params to store proxy
        var proxy = this.store.getProxy();
        proxy.extraParams = params;
        // load the store to display files
        if(load && load == true){
            this.store.load();
        };
    },
    // upload the files
    uploadFile:function(file, record){
        if(!Ext.isEmpty(file)){
            var me = this;
            // create http request object
            var xhr = XMLHttpRequest ? new XMLHttpRequest() : new ActiveXObject('Microsoft.XMLHttp');
            // hook progress
            xhr.upload.addEventListener("progress", function(e){
                if (e.lengthComputable) {
                    var current = e.position || e.loaded,
                        total = e.totalSize || e.total;
                    var percent = Math.round((current / total) * 100);
                    // if we have record
                    if(record){
                        record.set('progress', percent);
                    };
                };
            }, false);

            // when upload is completed
            xhr.upload.addEventListener("loadend", function(e){
                // if we have record
                if(record){
                    Ext.defer(function(){
                        me.progressStore.remove(record);
                    },1500);
                };
            }, false);

            // check return event
            xhr.onreadystatechange=function() {
                if(xhr.readyState==4) {
                    if(xhr.status==200){
                        var result = Ext.decode(xhr.responseText, true);
                        if (result && result.success) {
                            me.store.load();
                        }else{
                            Ext.Msg.show({
                                title:'Error',
                                msg: result.message || 'Unknown Error',
                                buttons: Ext.Msg.OK,
                                icon: Ext.Msg.ERROR
                            });
                        };
                    };
                };
            };

            // void open(DOMString method, DOMString url, boolean async);
            xhr.open('put', me.uploadUrl, true);
            xhr.setRequestHeader("Content-Type", "application/octet-stream");
            xhr.setRequestHeader("X-File-Name", file.name || file.fileName);
            xhr.setRequestHeader("X-File-Size", file.size || file.fileSize);
            xhr.setRequestHeader("X-File-Type", file.type);
            var params = Ext.encode(me.uploadParams);
            xhr.setRequestHeader("X-File-Params", params);
            xhr.setRequestHeader("X-Requested-With", 'XMLHttpRequest');

            if ('getAsBinary' in file){
                xhr.sendAsBinary(file.getAsBinary());
            }else{
                xhr.send(file);
            };
        };
    },
    // show download window
    showDownloadWindow: function(url, record){
        var me = this;
        if(!me.win){
            me.win = Ext.create('Ext.Window', {
                layout: 'fit',
                iconCls:record.get('iconCls'),
                title: record.get('name'),
                modal:true,
                width:800,
                height:600,
                border: false,
                maximizable:true,
                closeAction:'hide',
                items: {
                    xtype:'uxiframe'
                },
                listeners:{
                    beforeshow:function(){
                        Ext.suspendLayouts();
                        this.setSize(document.body.clientWidth*0.5,document.body.clientHeight*0.8);
                        Ext.resumeLayouts(true);
                    }
                }
            });
        };

        if(!me.iframe){
            me.iframe = me.win.down('uxiframe');
        };
        // set icon on the window
        me.win.setIconCls(record.get('iconCls'))
        // set title of the window
        me.win.setTitle(record.get('name'));
        // show the window
        me.win.show();
        // load the content
        me.iframe.load(url);
    }
});