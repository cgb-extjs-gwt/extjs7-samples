Ext.define('Home.store.HomeStore', {
	extend : 'Ext.data.Store',
    model : 'Home.model.Data',
	constructor: function(cfg) {
        var me = this;
        cfg = cfg || {};
        me.callParent([Ext.apply({
            autoLoad: false,
            proxy : {
				url:  '/ctms/cf/home/appData.do',
				type : 'ajax',
				reader : {
					type : 'json',
					root: 'result.list'
				},
				extraParams : {
					depth : cfg.depth,
					key: cfg.key
				}
			}
        }, cfg)]);
    }
});