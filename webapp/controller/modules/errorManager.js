sap.ui.define([
	"sap/m/Button",
	"sap/ui/model/json/JSONModel"
], function (JSONModel, Button) {
	"use strict";

	var Module = {

		createErrosPopOver: function (oModel) {
			var oMessageTemplate = new sap.m.MessageItem({
				type: "{type}",
				title: "{title}",
				description: "{description}",
				subtitle: "{subtitle}",
				counter: "{counter}",
				markupDescription: "{markupDescription}"
			});

			var aMockMessages = [];

			// var oModel = new JSONModel(),
			var that = this;

			oModel.setData(aMockMessages);
			var oBackButton = new sap.m.Button({
				icon: sap.ui.core.IconPool.getIconURI("nav-back"),
				visible: false,
				press: function () {
					that.oMessageView.navigateBack();
					this.setVisible(false);
				}
			});
			this.oMessageView = new sap.m.MessageView({
				showDetailsPageHeader: false,
				itemSelect: function () {
					oBackButton.setVisible(true);
				},
				items: {
					path: "/",
					template: oMessageTemplate
				}
			});
			this.oMessageView.setModel(oModel);
			var oCloseButton = new Button({
					text: "Close",
					press: function () {
						that._oPopover.close();
					}
				}),
				oPopoverFooter = new sap.m.Bar({
					contentRight: oCloseButton
				}),
				oPopoverBar = new sap.m.Bar({
					contentLeft: [oBackButton],
					contentMiddle: [
						new sap.ui.core.Icon({
							color: "#bb0000",
							src: "sap-icon://message-error"
						}),
						new sap.m.Text({
							text: "Console"
						})
					]
				});

			this._oPopover = new sap.m.Popover({
				customHeader: oPopoverBar,
				contentWidth: "440px",
				contentHeight: "440px",
				verticalScrolling: false,
				modal: true,
				content: [this.oMessageView],
				footer: oPopoverFooter
			});
		},
		handleEntitesErros : function(aEntitiesErros){
			
		}
	};
	return Module;
});