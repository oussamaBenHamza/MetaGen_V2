sap.ui.define([], function () {
	"use strict";

	var Module = {
		toggleTextonMouseOver: function (sId, sText) {
			var that = this;
			this.byId(sId).attachBrowserEvent("mouseover", function (oEvent) {
				that.byId(sId).setText(sText);
				that.byId(sId).addStyleClass("textSlide");
			});
			this.byId(sId).attachBrowserEvent("mouseout", function (oEvent) {
				
				that.byId(sId).setText("");
				that.byId(sId).removeStyleClass("textSlide");
				// that.byId(sId).removeStyleClass("animation");
			});
		},
		onToggleText: function (oEvent) {
			if (oEvent.getSource().getSelectedKey() === "Yes") {
				this.rendering.toggleTextonMouseOver.apply(this, ["checkBt", "Check"]);
				this.rendering.toggleTextonMouseOver.apply(this, ["generateBt", "Generate"]);
				this.rendering.toggleTextonMouseOver.apply(this, ["saveBt", "Save"]);
			} else if (oEvent.getSource().getSelectedKey() === "No") {
				this.rendering.toggleTextonMouseOver.apply(this, ["checkBt", ""]);
				this.rendering.toggleTextonMouseOver.apply(this, ["generateBt", ""]);
				this.rendering.toggleTextonMouseOver.apply(this, ["saveBt", ""]);
			}
		}
	};
	return Module;
});