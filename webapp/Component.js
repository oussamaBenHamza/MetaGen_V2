sap.ui.define([
	"sap/ui/core/UIComponent",
	"sap/ui/Device",
	"metaGen/obh/MetaGen/model/models"
], function (UIComponent, Device, models) {
	"use strict";

	return UIComponent.extend("metaGen.obh.MetaGen.Component", {

		metadata: {
			manifest: "json"
		},

		/**
		 * The component is initialized by UI5 automatically during the startup of the app and calls the init method once.
		 * @public
		 * @override
		 */
		init: function () {
			// call the base component's init function
			UIComponent.prototype.init.apply(this, arguments);

			var entityModel = new sap.ui.model.json.JSONModel({
				propertyName: ""
			});
			this.setModel("entityModel", entityModel);

			// enable routing
			this.getRouter().initialize();

			var oProjectModel = new sap.ui.model.json.JSONModel({
				projectName: "Z"
			});
			this.setModel(oProjectModel,"oDataService");

			// set the device model
			this.setModel(models.createDeviceModel(), "device");
		},
		getAllEntities : function(){
			return this.getView().byId("Tree").getModel().getData()[0].nodes[0].nodes;
		}
	});
});