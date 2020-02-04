/*
 * File: app/view/preference/DashboardSetVprt.js
 *
 * This file was generated by Sencha Architect version 3.0.2.
 * http://www.sencha.com/products/architect/
 *
 * This file requires use of the Ext JS 4.2.x library, under independent license.
 * License of Sencha Architect does not include license for Ext JS 4.2.x. For more
 * details see http://www.sencha.com/license or contact license@sencha.com.
 *
 * This file will be auto-generated each and everytime you save your project.
 *
 * Do NOT hand edit this file.
 */

Ext.define('Dashboard.view.preference.DashboardSetVprt', {
    extend: 'Ext.container.Viewport',
    alias : 'widget.dbvpt',
	requires : [ 'Ext.toolbar.Toolbar',
	 			'Dashboard.view.preference.DashboardSetToolbar',
	 			'Dashboard.view.preference.PortletGroup', 'Ext.panel.Panel',
	 			'Ext.portal.PortalPanel', 'Ext.portal.PortalColumn',
	 			'Ext.portal.ChartPortlet', 'Dashboard.view.common.DataSet',
	 			'Dashboard.view.preference.SetRightTabPanel'],

    padding: '15 10 15 10',
    layout: 'border',

    initComponent: function() {
		var me = this;
		Ext.state.Manager.setProvider(Ext.create('Ext.state.CookieProvider'));
        Ext.applyIf(me, {
            items: [
                {
					region: 'west',
					xtype : 'panel',
					width: 300,
					title: 'Portlet List',
					animCollapse: true,
					split: true,
					collapsible: true,
					border : true,
//					collapsed : true,
					layout: {
						type: 'accordion',
						animate: true
					},
					listeners : {
						 beforerender : function(){
				        	var store = Ext.create('Ext.data.Store', {
				        		autoLoad: true,
				        		proxy : {
				        			type : 'memory',
				        			reader : {
				        				type : 'array'
				        			}
				        		},
				        		fields : ['cd','cdnm','description'],
				        		data : Dashboard.view.common.DataSet.portletGroups
				        	});
				        	store.each(function(record){
				        		me.down('[region=west]').add({
				        			xtype : 'portletgroup',
				        			bodyCls  : 'left-group',
				        			border : true,
				        			title :  record.get('cdnm'),
				        			type : record.get('cd')
				        		});
				        	});
				        }
					}
				},
				{
					xtype: 'container',
					region: 'center',
					itemId : 'centerContainer',
					layout: 'border',
					items: [ {
						xtype : 'container',
						layout : 'border',
//						margin : '15 5 15 15',
						width : 315,
						region : 'west',

						items: [{
							xtype : 'component',
							region : 'north',
							html : '<div class="dashP01Head"><ul><li class="current"><a href="#" title="">Study</a></li></ul></div>',
							height: 27
						},{
							xtype : 'portalpanel',
							region : 'center',
							cls : 'dashP01',
							items: [{
								xtype : 'portalcolumn',
//								autoScroll: true,
								margin : '5 5 5 0',
								itemId : 'db-left',
                                defaults: {
                                    anchors: '100% 100%'
                                }
							}]
						}]
					},
					{
						region : 'center',
						xtype : 'setrighttabpanel'
					}]
				}
            ]
        });

        me.callParent(arguments);
    },

    beforeRender: function () {
    	var me = this;
    	var store = Ext.create('Ext.data.Store', {
    		autoLoad: true,
    		proxy : {
    			type : 'memory',
    			reader : {
    				type : 'array'
    			}
    		},
    		fields : ['classId','className','title','height','positionItemId', 'columnWidth','type','args'],
    		data : Dashboard.view.common.DataSet.dbData
    	});
    	store.each(function(record){
            console.log('vvv', me.down('[itemId='+record.get('positionItemId')+']'))
    		me.down('[itemId='+record.get('positionItemId')+']').add({
    			xtype : 'portlet',
    			classId : record.get('classId'),
				title : record.get('title'),
				type : record.get('type'),
    			portletClsName: record.get('className'),
				items: Ext.create(record.get('className'), {
//					height : record.get('height'),
					args: record.get('args')
				})
    		});
    	});
		this.callParent(arguments);

	},

    onSave: function(classId) {
    	Ext.getBody().mask('저장 중입니다 ....')
    	console.log('classId', classId)
    	var columns = Ext.ComponentQuery.query('portalcolumn[itemId=db-left],[itemId=db-tab1-left],[itemId=db-tab1-right],[itemId=db-tab2-left],[itemId=db-tab2-right]');
		Ext.each(columns, function(portalcolumn, idx){
			portalcolumn.items.each(function(portlet, i){
				if(classId != portlet.classId){
					console.log('저장할 정보..');
					console.log('배치위치:', portalcolumn.itemId);
					console.log('배치순서:', i);
					console.log('클래스명:', portlet.portletClsName, i);
					console.log('클래스ID:', portlet.classId, i);

				}
			});

		});

		Ext.Function.defer(function(){
			Ext.getBody().unmask();
//			Ext.Msg.confirm('저장완료', '저장이 완료되었습니다. 데시보드로 이동하여 확인하시겠습니까?', function(btn){
//				if(btn == 'yes')
//					location.href = "/ctms/ctms/cf/preference/dashboardSetPreview.do";
//			});
		}, 100);
    }

});