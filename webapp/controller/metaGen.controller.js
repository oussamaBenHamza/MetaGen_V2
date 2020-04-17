sap.ui.define([
	"sap/ui/core/mvc/Controller"
], function (Controller) {
	"use strict";

	return Controller.extend("metaGen.obh.MetaGen.controller.metaGen", {
		onInit: function () {

		},
		onCreat : function(oEvent){
			// this.getOwnerComponent().getRouter().navTo("Create");
			this.getOwnerComponent().getRouter().navTo("CreateEntities");
		},
		onUpdate : function(oEvent){
			
		}
	});
});