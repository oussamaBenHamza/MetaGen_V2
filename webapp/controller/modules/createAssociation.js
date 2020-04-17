sap.ui.define([], function () {
	"use strict";

	var Module = {
		createAssociation: function (oEvent) {
			var state = this.getView().getModel("onCreateAssEnabled").getProperty("/enabled");
			this.getView().getModel("onCreateAssEnabled").setProperty("/enabled", !state);
		}
	};
	return Module;
});