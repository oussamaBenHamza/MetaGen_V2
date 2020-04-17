sap.ui.define([], function () {
	"use strict";

	var Module = {
		toggleTextonMouseOver: function (sId, sText) {
			var that = this;
			this.byId(sId).attachBrowserEvent("mouseover", function (oEvent) {
				that.byId(sId).setText(sText);
			});
			this.byId(sId).attachBrowserEvent("mouseout", function (oEvent) {
				that.byId(sId).setText("");
			});
		}
	};
	return Module;
});